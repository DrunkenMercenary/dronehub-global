"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Schema for Job Creation
const jobSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    category: z.string().min(1, "Please select a category"),
    location: z.string().min(1, "Location is required"),
    budget: z.coerce.number().optional(),
})

export type JobFormData = z.infer<typeof jobSchema>

// Server Action: Create Job
export async function createJob(data: JobFormData, userEmail: string) {
    const result = jobSchema.safeParse(data)

    if (!result.success) {
        return { error: "Invalid form data" }
    }

    const { title, description, category, location } = result.data

    try {
        const user = await prisma.user.findUnique({
            where: { email: userEmail },
            include: { clientProfile: true }
        })

        if (!user || user.role !== "CLIENT" || !user.clientProfile) {
            return { error: "Client profile not found. Please register as a client." }
        }

        await prisma.jobRequest.create({
            data: {
                clientId: user.clientProfile.id,
                title,
                description,
                category,
                location,
            }
        })

        revalidatePath("/client/dashboard")

    } catch (error) {
        console.error("Create Job Error:", error)
        return { error: "Failed to post job" }
    }

    redirect("/client/dashboard")
}

// Server Action: Get Jobs for Operator Feed
export async function getOperatorFeed(operatorEmail: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email: operatorEmail },
            include: { operatorProfile: true }
        })

        if (!user || !user.operatorProfile) {
            return []
        }

        const services = user.operatorProfile.services.split(',')

        const jobs = await prisma.jobRequest.findMany({
            where: {
                status: "OPEN",
                ...(services.length > 0 ? {
                    category: {
                        in: services
                    }
                } : {}),
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                client: true
            }
        })

        return jobs
    } catch (error) {
        console.error("Get Feed Error:", error)
        return []
    }
}

// Server Action: Get Client's Jobs
export async function getClientJobs(clientEmail: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email: clientEmail },
            include: { clientProfile: true }
        })

        if (!user || !user.clientProfile) {
            return []
        }

        const jobs = await prisma.jobRequest.findMany({
            where: {
                clientId: user.clientProfile.id
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                _count: {
                    select: { proposals: true }
                }
            }
        })

        return jobs
    } catch (error) {
        console.error("Get Client Jobs Error:", error)
        return []
    }
}

// Server Action: Submit Proposal (from job.ts — kept for backward compat)
export async function submitProposal(jobId: string, price: number, message: string, operatorEmail: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email: operatorEmail },
            include: { operatorProfile: true }
        })

        if (!user || !user.operatorProfile) {
            return { error: "Operator profile not found" }
        }

        // Check if already applied
        const existing = await prisma.proposal.findFirst({
            where: {
                jobId,
                operatorId: user.operatorProfile.id
            }
        })

        if (existing) {
            return { error: "You have already submitted a proposal for this job" }
        }

        await prisma.proposal.create({
            data: {
                jobId,
                operatorId: user.operatorProfile.id,
                price: price,
                message,
                status: "PENDING"
            }
        })

        revalidatePath(`/jobs/${jobId}`)
        revalidatePath("/dashboard")
        return { success: true }

    } catch (error) {
        console.error("Submit Proposal Error:", error)
        return { error: "Failed to submit proposal" }
    }
}
