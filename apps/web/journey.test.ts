/* Simulated end-to-end journey test.
 * Drives the real server-action functions against a live Postgres and asserts
 * database state at each step. Covers both journeys:
 *   A = Operator   B = Client
 */
import { prisma } from "@/lib/prisma"
import { onboardOperator } from "@/app/actions/operator"
import { registerClient } from "@/app/actions/client"
import { createJob, getOperatorFeed, getClientJobs } from "@/app/actions/job"
import { createProposal, awardProposal, getOperatorProposals } from "@/app/actions/proposal"
import { getPendingOperators, updateOperatorStatus, getAdminStats } from "@/app/actions/admin"
import { getOrCreateThread, sendMessage, getMessages } from "@/app/actions/message"
import { addDocument } from "@/app/actions/document"

let pass = 0, fail = 0
function check(name: string, cond: boolean, detail = "") {
    if (cond) { pass++; console.log(`  PASS  ${name}`) }
    else { fail++; console.log(`  FAIL  ${name}  ${detail}`) }
}

// Server actions call redirect()/revalidatePath() which throw outside a request.
// The DB mutation always runs first, so we swallow those and assert state after.
async function act<T>(fn: () => Promise<T>): Promise<T | { _threw: string }> {
    try { return await fn() }
    catch (e: any) {
        const d = e?.digest || e?.message || String(e)
        return { _threw: String(d) }
    }
}

async function main() {
    const ts = Date.now()
    const opEmail = `op_${ts}@test.dev`
    const clEmail = `cl_${ts}@test.dev`

    console.log("\n=== JOURNEY A: OPERATOR ===")
    // 1. Onboard operator
    await act(() => onboardOperator({
        name: "Test Pilot", email: opEmail, password: "secret123",
        type: "INDIVIDUAL", services: ["inspection", "surveying"], radius: 60,
    } as any))
    const opUser = await prisma.user.findUnique({ where: { email: opEmail }, include: { operatorProfile: true } })
    check("operator user created", !!opUser, "no user")
    check("operator role set", opUser?.role === "OPERATOR", opUser?.role)
    check("operator profile PENDING", opUser?.operatorProfile?.status === "PENDING", opUser?.operatorProfile?.status)
    const opId = opUser!.operatorProfile!.id

    // 2. Appears in pending queue
    const pending = await getPendingOperators()
    check("operator in pending queue", pending.some((o: any) => o.id === opId))

    // 3. Cannot propose before approval (use seed job1 'inspection', OPEN)
    const seedJob = await prisma.jobRequest.findFirst({ where: { category: "inspection", status: "OPEN" } })
    check("seed inspection job exists & OPEN", !!seedJob, "missing seed job")
    if (seedJob) {
        const blocked = await act(() => createProposal({ jobId: seedJob.id, operatorId: opId, amount: 500, deliveryTime: "3 Days", coverLetter: "Pre-approval attempt" } as any)) as any
        check("proposal blocked pre-approval", blocked?.error?.includes("approved"), JSON.stringify(blocked))
    }

    // 4. Admin approves
    await updateOperatorStatus(opId, "APPROVED")
    const approved = await prisma.operatorProfile.findUnique({ where: { id: opId } })
    check("operator now APPROVED", approved?.status === "APPROVED", approved?.status)

    // 5. Feed shows matching open jobs (taxonomy cross-match)
    const feed = await getOperatorFeed(opEmail)
    check("approved operator feed non-empty", feed.length > 0, `len=${feed.length}`)
    check("feed only has matching categories", feed.every((j: any) => ["inspection", "surveying"].includes(j.category)),
        feed.map((j: any) => j.category).join(","))

    console.log("\n=== JOURNEY B: CLIENT ===")
    // 6. Register client
    await act(() => registerClient({ name: "Test Client Co", email: clEmail, password: "secret123" } as any))
    const clUser = await prisma.user.findUnique({ where: { email: clEmail }, include: { clientProfile: true } })
    check("client user created", !!clUser)
    check("client role set", clUser?.role === "CLIENT", clUser?.role)
    const clientProfileId = clUser!.clientProfile!.id

    // 7. Post a job (category id from the form taxonomy)
    await act(() => createJob({ title: "Bridge Inspection Survey", description: "Detailed structural inspection of a rail bridge span.", category: "inspection", location: "Brisbane, QLD", budget: 900 } as any, clEmail))
    const newJob = await prisma.jobRequest.findFirst({ where: { clientId: clientProfileId }, orderBy: { createdAt: "desc" } })
    check("client job created", !!newJob)
    check("job category normalised to id", newJob?.category === "inspection", newJob?.category)
    check("job status OPEN", newJob?.status === "OPEN", newJob?.status)

    // 8. Client dashboard lists the job
    const clientJobs = await getClientJobs(clEmail)
    check("client dashboard shows job", clientJobs.some((j: any) => j.id === newJob!.id))

    // 9. THE CROSS-MATCH BUG TEST: approved operator sees the brand-new client job
    const feed2 = await getOperatorFeed(opEmail)
    check("operator feed includes new client job (taxonomy match)", feed2.some((j: any) => j.id === newJob!.id),
        "new job not in feed -> taxonomy mismatch")

    // 10. Operator proposes on the new job.
    // NOTE: createProposal/awardProposal/sendMessage call revalidatePath(), which
    // only works inside a Next request. Out here it throws AFTER the DB write, so we
    // verify the real side effect by reading the row back from the database.
    await act(() => createProposal({ jobId: newJob!.id, operatorId: opId, amount: 750, deliveryTime: "5 Days", coverLetter: "Thermal + RTK mapping available." } as any))
    const createdProp = await prisma.proposal.findFirst({ where: { jobId: newJob!.id, operatorId: opId } })
    check("proposal created in DB", !!createdProp, "no proposal row")
    const proposalId = createdProp!.id

    // 11. Duplicate proposal rejected
    const dup = await act(() => createProposal({ jobId: newJob!.id, operatorId: opId, amount: 800, deliveryTime: "5 Days", coverLetter: "Second attempt." } as any)) as any
    check("duplicate proposal blocked", dup?.error?.includes("already"), JSON.stringify(dup))

    // 12. Operator proposals list reflects it
    const opProps = await getOperatorProposals(opEmail)
    check("operator proposals list includes it", opProps.some((p: any) => p.id === proposalId))

    console.log("\n=== AWARD + MESSAGING + UPLOAD ===")
    // 13. Client awards the proposal
    const award = await act(() => awardProposal(proposalId, clEmail)) as any
    check("award succeeded", award?.success === true, JSON.stringify(award))
    const awardedJob = await prisma.jobRequest.findUnique({ where: { id: newJob!.id } })
    check("job marked AWARDED", awardedJob?.status === "AWARDED", awardedJob?.status)
    const awardedProp = await prisma.proposal.findUnique({ where: { id: proposalId } })
    check("proposal marked ACCEPTED", awardedProp?.status === "ACCEPTED", awardedProp?.status)

    // 14. Unauthorised award attempt by a different client
    const otherClient = await prisma.user.findFirst({ where: { role: "CLIENT", email: { not: clEmail } } })
    if (otherClient) {
        const badAward = await act(() => awardProposal(proposalId, otherClient.email!)) as any
        check("award blocked for non-owner client", !!badAward?.error, JSON.stringify(badAward))
    }

    // 15. Messaging thread
    const thread = await getOrCreateThread(newJob!.id, clientProfileId, opId)
    check("thread created", !!thread)
    await act(() => sendMessage(thread!.id, clUser!.id, "Welcome aboard, when can you fly?"))
    await act(() => sendMessage(thread!.id, opUser!.id, "Weather permitting, Thursday AM."))
    const msgs = await getMessages(thread!.id)
    check("messages persisted in order", msgs.length === 2 && msgs[0].content.includes("Welcome"), `len=${msgs.length}`)

    // 16. Deliverable document record
    const doc = await act(() => addDocument({ url: "/api/files/test-key-deliverable.pdf", name: "final_assets.pdf", type: "DELIVERABLE", jobId: newJob!.id })) as any
    check("deliverable document saved", doc?.success === true, JSON.stringify(doc))
    const jobDocs = await prisma.document.findMany({ where: { jobId: newJob!.id } })
    check("document linked to job", jobDocs.length === 1, `len=${jobDocs.length}`)

    // 17. Admin stats sane
    const stats = await getAdminStats()
    check("admin stats counts populated", stats.users.total > 0 && stats.jobs.total > 0, JSON.stringify(stats))

    console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`)
    await prisma.$disconnect()
    process.exit(fail > 0 ? 1 : 0)
}

main().catch(async (e) => { console.error("HARNESS ERROR:", e); await prisma.$disconnect(); process.exit(2) })
