"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sessionUser } from "@/lib/session"

// Identity from session; any email argument is ignored so notifications can't
// be read for another user by passing their email.
async function userId(_email?: string) {
    const u = await sessionUser()
    return u?.id
}

export async function getNotifications(email?: string) {
    const id = await userId(email)
    if (!id) return []
    return prisma.notification.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 50 })
}

export async function getUnreadCount(email?: string) {
    const id = await userId(email)
    if (!id) return 0
    return prisma.notification.count({ where: { userId: id, read: false } })
}

export async function markAllRead(email?: string) {
    const id = await userId(email)
    if (!id) return { error: "Not found" }
    await prisma.notification.updateMany({ where: { userId: id, read: false }, data: { read: true } })
    revalidatePath("/notifications")
    return { success: true }
}
