"use server"

import { prisma } from "@/lib/prisma"
import { sessionEmail } from "@/lib/session"

export async function getOperatorProfile(_userEmail?: string) {
    try {
        const userEmail = await sessionEmail()
        if (!userEmail) return null
        const user = await prisma.user.findUnique({
            where: { email: userEmail },
            include: { operatorProfile: true }
        })

        if (!user || !user.operatorProfile) {
            return null
        }

        return user.operatorProfile
    } catch (error) {
        console.error("Get Operator Profile Error:", error)
        return null
    }
}
