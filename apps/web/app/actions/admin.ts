"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getAdminStats() {
    try {
        const [userCount, clientCount, operatorCount, jobCount, activeJobs, totalValue] = await Promise.all([
            prisma.user.count(),
            prisma.clientProfile.count(),
            prisma.operatorProfile.count(),
            prisma.jobRequest.count(),
            prisma.jobRequest.count({ where: { status: "OPEN" } }),
            prisma.proposal.aggregate({
                where: { status: "ACCEPTED" },
                _sum: { price: true }
            })
        ])

        return {
            users: { total: userCount, clients: clientCount, operators: operatorCount },
            jobs: { total: jobCount, open: activeJobs },
            volume: Number(totalValue._sum.price || 0)
        }
    } catch (error) {
        console.error("Admin Stats Error:", error)
        return {
            users: { total: 0, clients: 0, operators: 0 },
            jobs: { total: 0, open: 0 },
            volume: 0
        }
    }
}

export async function getPendingOperators() {
    try {
        const operators = await prisma.operatorProfile.findMany({
            where: { status: "PENDING" },
            include: {
                user: {
                    select: { email: true }
                }
            },
            orderBy: { id: 'desc' }
        })

        return operators
    } catch (error) {
        console.error("Fetch Pending Operators Error:", error)
        return []
    }
}

export async function updateOperatorStatus(operatorId: string, status: "APPROVED" | "REJECTED") {
    try {
        const updated = await prisma.operatorProfile.update({
            where: { id: operatorId },
            data: { status }
        })
        revalidatePath("/admin/operators")
        return { success: true, operator: updated }
    } catch (error) {
        console.error("Update Operator Error:", error)
        return { error: "Failed to update status" }
    }
}
