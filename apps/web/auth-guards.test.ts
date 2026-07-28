/* Security regression test for the server-action auth hardening.
 *
 * Before the fix, server actions trusted an email / id passed in their
 * arguments to decide "who is calling". Since server actions are public POST
 * endpoints, that let any caller act as anyone (self-approve as admin, bid as
 * another operator, read another user's data, etc).
 *
 * After the fix, identity comes only from the signed-in session. In this test
 * harness there is no request, so there is no session: every guarded action
 * must therefore REFUSE to act, even when handed a perfectly valid email or id.
 * That is exactly the exploit path the audit found, so proving it is now denied
 * proves the class of bug is closed. We also assert the database was not
 * mutated, so we know the guard fires before the write, not after.
 */
import { prisma } from "@/lib/prisma"
import { updateOperatorStatus } from "@/app/actions/admin"
import { createProposal, awardProposal, getOperatorProposals } from "@/app/actions/proposal"
import { getClientJobs, getOperatorFeed, createJob } from "@/app/actions/job"
import { getNotifications } from "@/app/actions/notification"
import { changePassword } from "@/app/actions/account"
import { getOperatorDocuments } from "@/app/actions/document"

let pass = 0, fail = 0
function check(name: string, cond: boolean, detail = "") {
    if (cond) { pass++; console.log(`  PASS  ${name}`) }
    else { fail++; console.log(`  FAIL  ${name}  ${detail}`) }
}
async function act<T>(fn: () => Promise<T>): Promise<T | { _threw: string }> {
    try { return await fn() } catch (e: any) { return { _threw: String(e?.message || e) } }
}
function denied(r: any): boolean {
    // A guard "denied" if it returned an error, returned an empty list, returned
    // null, or threw. Anything that looks like success is a failure.
    if (r == null) return true
    if (Array.isArray(r)) return r.length === 0
    if (typeof r === "object") return "error" in r || "_threw" in r
    return false
}

async function main() {
    console.log("=== AUTH GUARD REGRESSION (no session => everything denied) ===")

    // Real seed rows: a PENDING operator, an approved operator, a client with jobs.
    const pending = await prisma.operatorProfile.findFirst({ where: { status: "PENDING" } })
    const approvedOp = await prisma.operatorProfile.findFirst({ where: { status: "APPROVED" } })
    const clientWithJobs = await prisma.clientProfile.findFirst({
        where: { jobs: { some: {} } },
        include: { user: true, jobs: true },
    })
    const openJob = await prisma.jobRequest.findFirst({ where: { status: "OPEN" } })

    check("seed present", !!pending && !!approvedOp && !!clientWithJobs && !!openJob)

    // 1. CRITICAL: cannot self-approve an operator without an admin session.
    const beforeStatus = pending!.status
    const r1 = await act(() => updateOperatorStatus(pending!.id, "APPROVED"))
    check("updateOperatorStatus denied without admin session", denied(r1), JSON.stringify(r1))
    const afterStatus = (await prisma.operatorProfile.findUnique({ where: { id: pending!.id } }))!.status
    check("operator status unchanged in DB (guard fired before write)", afterStatus === beforeStatus, `${beforeStatus} -> ${afterStatus}`)

    // 2. Cannot bid as an operator without a session.
    const propCountBefore = await prisma.proposal.count()
    const r2 = await act(() => createProposal({ jobId: openJob!.id, operatorId: approvedOp!.id, amount: 999, deliveryTime: "1 Day", coverLetter: "Injection attempt via operatorId." } as any))
    check("createProposal denied without session", denied(r2), JSON.stringify(r2))
    check("no proposal row created", (await prisma.proposal.count()) === propCountBefore)

    // 3. Cannot award a proposal without a session.
    const someProp = await prisma.proposal.findFirst()
    if (someProp) {
        const r3 = await act(() => awardProposal(someProp.id))
        check("awardProposal denied without session", denied(r3), JSON.stringify(r3))
    }

    // 4. Cannot read another client's jobs by passing their email.
    const r4 = await act(() => getClientJobs(clientWithJobs!.user.email!))
    check("getClientJobs leaks nothing without session", denied(r4), JSON.stringify(r4))

    // 5. Operator feed and proposals list leak nothing without a session.
    check("getOperatorFeed leaks nothing", denied(await act(() => getOperatorFeed("anyone@example.com"))))
    check("getOperatorProposals leaks nothing", denied(await act(() => getOperatorProposals("anyone@example.com"))))

    // 6. Notifications cannot be read for another user by email.
    check("getNotifications leaks nothing", denied(await act(() => getNotifications(clientWithJobs!.user.email!))))

    // 7. Cannot change another account's password by passing its email.
    check("changePassword denied without session", denied(await act(() => changePassword(clientWithJobs!.user.email!, "x", "newpassword"))))

    // 8. Sensitive operator documents (licence/insurance) are not returned to a
    //    non-owner. Portfolio images may be returned; assert no sensitive types leak.
    const docs = await act(() => getOperatorDocuments(approvedOp!.id)) as any[]
    const leakedSensitive = Array.isArray(docs) && docs.some((d) => d.type !== "PORTFOLIO")
    check("getOperatorDocuments does not leak licence/insurance to non-owner", !leakedSensitive, JSON.stringify(docs?.map?.((d: any) => d.type)))

    // 9. createJob refuses without a session.
    check("createJob denied without session", denied(await act(() => createJob({ title: "Ghost job", description: "Should never be created by an anon caller.", category: "inspection", location: "HK" } as any))))

    console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`)
    await prisma.$disconnect()
    process.exit(fail === 0 ? 0 : 1)
}
main().catch((e) => { console.error(e); process.exit(1) })
