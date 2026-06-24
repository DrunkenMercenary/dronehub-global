"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function getAccount(email: string) {
    const user = await prisma.user.findUnique({
        where: { email },
        include: { clientProfile: true, operatorProfile: true },
    })
    if (!user) return null
    return {
        email: user.email,
        role: user.role,
        name: user.clientProfile?.name || user.operatorProfile?.name || user.name || "",
        hasPassword: !!user.password,
    }
}

export async function updateDisplayName(email: string, name: string) {
    if (!name || name.trim().length < 2) return { error: "Name must be at least 2 characters" }
    const user = await prisma.user.findUnique({
        where: { email },
        include: { clientProfile: true, operatorProfile: true },
    })
    if (!user) return { error: "Account not found" }
    const clean = name.trim()
    if (user.clientProfile) await prisma.clientProfile.update({ where: { id: user.clientProfile.id }, data: { name: clean } })
    if (user.operatorProfile) await prisma.operatorProfile.update({ where: { id: user.operatorProfile.id }, data: { name: clean } })
    await prisma.user.update({ where: { id: user.id }, data: { name: clean } })
    revalidatePath("/account")
    return { success: true }
}

export async function changePassword(email: string, current: string, next: string) {
    if (!next || next.length < 6) return { error: "New password must be at least 6 characters" }
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.password) return { error: "Password change isn't available for this account" }
    const ok = await bcrypt.compare(current, user.password)
    if (!ok) return { error: "Current password is incorrect" }
    const hash = await bcrypt.hash(next, 10)
    await prisma.user.update({ where: { id: user.id }, data: { password: hash } })
    return { success: true }
}
