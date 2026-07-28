"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sessionUser } from "@/lib/session"

// Identity from session; any email argument is ignored.
async function clientId(_email?: string) {
    const u = await sessionUser()
    return u?.clientProfile?.id
}

export async function toggleSaved(operatorId: string, email?: string) {
    const cid = await clientId(email)
    if (!cid) return { error: "Only clients can save operators" }
    const existing = await prisma.savedOperator.findUnique({
        where: { clientId_operatorId: { clientId: cid, operatorId } },
    })
    if (existing) {
        await prisma.savedOperator.delete({ where: { id: existing.id } })
        revalidatePath("/operators")
        revalidatePath("/client/saved")
        return { success: true, saved: false }
    }
    await prisma.savedOperator.create({ data: { clientId: cid, operatorId } })
    revalidatePath("/operators")
    revalidatePath("/client/saved")
    return { success: true, saved: true }
}

export async function getSavedOperatorIds(email?: string): Promise<string[]> {
    const cid = await clientId(email)
    if (!cid) return []
    const rows = await prisma.savedOperator.findMany({ where: { clientId: cid }, select: { operatorId: true } })
    return rows.map((r) => r.operatorId)
}

export async function getSavedOperators(email?: string) {
    const cid = await clientId(email)
    if (!cid) return []
    const rows = await prisma.savedOperator.findMany({
        where: { clientId: cid },
        include: { operator: true },
        orderBy: { createdAt: "desc" },
    })
    return rows.map((r) => r.operator)
}
