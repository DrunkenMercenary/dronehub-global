"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { notify } from "@/lib/notify"

const reviewSchema = z.object({
    jobId: z.string(),
    rating: z.coerce.number().int().min(1, "Please choose a rating").max(5),
    comment: z.string().max(1000).optional(),
})

// Client marks an awarded job as completed (unlocks reviewing).
export async function completeJob(jobId: string, clientEmail: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email: clientEmail },
            include: { clientProfile: true },
        })
        if (!user?.clientProfile) return { error: "Client profile not found" }

        const job = await prisma.jobRequest.findUnique({ where: { id: jobId } })
        if (!job) return { error: "Job not found" }
        if (job.clientId !== user.clientProfile.id) return { error: "You are not authorised to update this job" }
        if (job.status !== "AWARDED") return { error: "Only awarded jobs can be marked complete" }

        await prisma.jobRequest.update({ where: { id: jobId }, data: { status: "COMPLETED" } })

        const accepted = await prisma.proposal.findFirst({
            where: { jobId, status: "ACCEPTED" },
            include: { operator: { select: { userId: true } } },
        })
        await notify(accepted?.operator.userId, {
            type: "completed",
            title: "Job marked complete",
            body: `The client marked "${job.title}" complete. You can be reviewed now.`,
            link: `/jobs/${jobId}`,
        })

        revalidatePath(`/jobs/${jobId}`)
        revalidatePath("/client/dashboard")
        return { success: true }
    } catch (e) {
        console.error("completeJob error:", e)
        return { error: "Failed to update job" }
    }
}

// Client leaves a review for the awarded operator on a completed job. One per job.
export async function createReview(data: z.infer<typeof reviewSchema>, clientEmail: string) {
    const parsed = reviewSchema.safeParse(data)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    try {
        const user = await prisma.user.findUnique({
            where: { email: clientEmail },
            include: { clientProfile: true },
        })
        if (!user?.clientProfile) return { error: "Client profile not found" }

        const job = await prisma.jobRequest.findUnique({
            where: { id: parsed.data.jobId },
            include: { proposals: true, review: true },
        })
        if (!job) return { error: "Job not found" }
        if (job.clientId !== user.clientProfile.id) return { error: "You can only review your own jobs" }
        if (job.status !== "COMPLETED") return { error: "You can review a job once it is marked complete" }
        if (job.review) return { error: "You have already reviewed this job" }

        const awarded = job.proposals.find((p) => p.status === "ACCEPTED")
        if (!awarded) return { error: "No awarded operator to review" }

        await prisma.review.create({
            data: {
                rating: parsed.data.rating,
                comment: parsed.data.comment || null,
                jobId: job.id,
                operatorId: awarded.operatorId,
                clientId: user.clientProfile.id,
            },
        })
        const op = await prisma.operatorProfile.findUnique({ where: { id: awarded.operatorId }, select: { userId: true } })
        await notify(op?.userId, {
            type: "review",
            title: `You received a ${parsed.data.rating}-star review`,
            body: parsed.data.comment || `Review on "${job.title}"`,
            link: `/operators/${awarded.operatorId}`,
        })

        revalidatePath(`/jobs/${job.id}`)
        revalidatePath(`/operators/${awarded.operatorId}`)
        revalidatePath("/operators")
        return { success: true }
    } catch (e) {
        console.error("createReview error:", e)
        return { error: "Failed to submit review" }
    }
}

export async function getOperatorReviews(operatorId: string) {
    try {
        return await prisma.review.findMany({
            where: { operatorId },
            include: { client: { select: { name: true } }, job: { select: { title: true } } },
            orderBy: { createdAt: "desc" },
        })
    } catch (e) {
        console.error("getOperatorReviews error:", e)
        return []
    }
}
