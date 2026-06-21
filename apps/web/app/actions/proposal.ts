"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const proposalSchema = z.object({
    jobId: z.string(),
    operatorId: z.string(),
    amount: z.coerce.number().min(1, "Amount must be at least 1"),
    deliveryTime: z.string().min(1, "Delivery time is required"),
    coverLetter: z.string().min(10, "Cover letter must be at least 10 characters"),
})

// Server Action: Create Proposal
export async function createProposal(data: z.infer<typeof proposalSchema>) {
    try {
        const validated = proposalSchema.parse(data)

        // Check if job exists and is open
        const job = await prisma.jobRequest.findUnique({
            where: { id: validated.jobId }
        })

        if (!job || job.status !== "OPEN") {
            return { error: "Job is no longer open for proposals" }
        }

        // Check if operator already applied
        const existing = await prisma.proposal.findFirst({
            where: {
                jobId: validated.jobId,
                operatorId: validated.operatorId
            }
        })

        if (existing) {
            return { error: "You have already submitted a proposal for this job" }
        }

        const proposal = await prisma.proposal.create({
            data: {
                jobId: validated.jobId,
                operatorId: validated.operatorId,
                price: validated.amount,
                message: validated.coverLetter,
                status: "PENDING"
            }
        })

        revalidatePath(`/jobs/${validated.jobId}`)
        return { success: true, id: proposal.id }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: error.issues[0].message }
        }
        console.error("Create Proposal Error:", error)
        return { error: "Failed to submit proposal" }
    }
}

// Server Action: Award Proposal
export async function awardProposal(proposalId: string, clientEmail: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email: clientEmail },
            include: { clientProfile: true }
        })

        if (!user || !user.clientProfile) {
            return { error: "Client profile not found" }
        }

        const proposal = await prisma.proposal.findUnique({
            where: { id: proposalId },
            include: {
                job: true,
                operator: true
            }
        })

        if (!proposal) {
            return { error: "Proposal not found" }
        }

        if (proposal.job.clientId !== user.clientProfile.id) {
            return { error: "You are not authorized to award this proposal" }
        }

        await prisma.$transaction([
            prisma.proposal.update({
                where: { id: proposalId },
                data: { status: "ACCEPTED" }
            }),
            prisma.jobRequest.update({
                where: { id: proposal.jobId },
                data: { status: "AWARDED" }
            }),
            prisma.proposal.updateMany({
                where: {
                    jobId: proposal.jobId,
                    id: { not: proposalId },
                    status: "PENDING"
                },
                data: { status: "REJECTED" }
            })
        ])

        revalidatePath(`/jobs/${proposal.jobId}`)
        revalidatePath("/client/dashboard")

        return { success: true }
    } catch (error) {
        console.error("Award Proposal Error:", error)
        return { error: "Failed to award proposal" }
    }
}

export async function getOperatorProposals(operatorEmail: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email: operatorEmail },
            include: { operatorProfile: true }
        })

        if (!user || !user.operatorProfile) {
            return []
        }

        const proposals = await prisma.proposal.findMany({
            where: {
                operatorId: user.operatorProfile.id
            },
            include: {
                job: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return proposals
    } catch (error) {
        console.error("Get Operator Proposals Error:", error)
        return []
    }
}
