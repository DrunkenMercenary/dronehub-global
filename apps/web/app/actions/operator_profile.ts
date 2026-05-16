"use server"

import { prisma } from "@/lib/prisma"

export async function getOperatorProfile(userEmail: string) {
    try {
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
