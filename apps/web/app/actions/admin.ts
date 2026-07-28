"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { notify } from "@/lib/notify"
import { requireRole } from "@/lib/session"

export async function getAdminStats() {
    // Admin-only. Identity comes from the session, never from the caller.
    if (!(await requireRole("ADMIN"))) {
        return {
            users: { total: 0, clients: 0, operators: 0 },
            jobs: { total: 0, open: 0 },
            volume: 0,
        }
    }
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
    if (!(await requireRole("ADMIN"))) return []
    try {
        const operators = await prisma.operatorProfile.findMany({
            where: { status: "PENDING" },
            include: {
                user: { select: { email: true } },
                documents: true,
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
    // CRITICAL: only an admin may approve or reject operators. Without this,
    // any signed-in user could self-approve and gain the verified badge.
    if (!(await requireRole("ADMIN"))) {
        return { error: "Not authorised" }
    }
    try {
        const updated = await prisma.operatorProfile.update({
            where: { id: operatorId },
            data: { status }
        })
        await notify(updated.userId, {
            type: "approval",
            title: status === "APPROVED" ? "You're verified" : "Profile not approved",
            body: status === "APPROVED"
                ? "Your operator profile was approved. You now appear in the directory."
                : "Your operator profile was not approved. Please review your documents.",
            link: "/dashboard",
        })
        revalidatePath("/admin/operators")
        return { success: true, operator: updated }
    } catch (error) {
        console.error("Update Operator Error:", error)
        return { error: "Failed to update status" }
    }
}
