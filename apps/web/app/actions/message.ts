"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getOrCreateThread(jobId: string, clientId: string, operatorProfileId: string) {
    try {
        let thread = await prisma.thread.findFirst({
            where: {
                jobId,
                clientProfileId: clientId,
                operatorProfileId: operatorProfileId
            }
        })

        if (!thread) {
            thread = await prisma.thread.create({
                data: {
                    jobId,
                    clientProfileId: clientId,
                    operatorProfileId: operatorProfileId
                }
            })
        }

        return thread
    } catch (error) {
        console.error("Get/Create Thread Error:", error)
        return null
    }
}

export async function sendMessage(threadId: string, senderId: string, content: string) {
    try {
        const message = await prisma.message.create({
            data: {
                threadId,
                senderId,
                content
            }
        })

        // Revalidate relevant pages
        const thread = await prisma.thread.findUnique({
            where: { id: threadId }
        })
        if (thread) {
            revalidatePath(`/jobs/${thread.jobId}`)
        }

        return { success: true, message }
    } catch (error) {
        console.error("Send Message Error:", error)
        return { error: "Failed to send message" }
    }
}

export async function getMessages(threadId: string) {
    try {
        const messages = await prisma.message.findMany({
            where: { threadId },
            orderBy: { createdAt: "asc" },
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                        role: true
                    }
                }
            }
        })
        return messages
    } catch (error) {
        console.error("Get Messages Error:", error)
        return []
    }
}
