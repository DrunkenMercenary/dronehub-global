"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { notify } from "@/lib/notify"
import { sessionUser } from "@/lib/session"

export async function getOrCreateThread(jobId: string, clientId: string, operatorProfileId: string) {
    try {
        // Only a participant (the thread's client or operator) may open it.
        const actor = await sessionUser()
        if (!actor) return null
        const isParticipant =
            actor.clientProfile?.id === clientId ||
            actor.operatorProfile?.id === operatorProfileId
        if (!isParticipant) return null

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

export async function sendMessage(threadId: string, _senderId: string, content: string) {
    try {
        // Identity from session; the senderId argument is ignored. The sender
        // must be a participant of the thread.
        const actor = await sessionUser()
        if (!actor) return { error: "You must be signed in to send a message" }

        const thread = await prisma.thread.findUnique({
            where: { id: threadId },
            include: { client: { select: { userId: true } }, operator: { select: { userId: true } }, job: { select: { title: true } } },
        })
        if (!thread) return { error: "Conversation not found" }

        const isParticipant =
            thread.client.userId === actor.id || thread.operator.userId === actor.id
        if (!isParticipant) return { error: "You are not a participant in this conversation" }

        const senderId = actor.id
        const message = await prisma.message.create({
            data: {
                threadId,
                senderId,
                content
            }
        })

        {
            revalidatePath(`/jobs/${thread.jobId}`)
            const recipient = thread.client.userId === senderId ? thread.operator.userId : thread.client.userId
            await notify(recipient, {
                type: "message",
                title: "New message",
                body: `New message about "${thread.job.title}"`,
                link: `/jobs/${thread.jobId}`,
            })
        }

        return { success: true, message }
    } catch (error) {
        console.error("Send Message Error:", error)
        return { error: "Failed to send message" }
    }
}

export async function getMessages(threadId: string) {
    try {
        // Only a participant may read a conversation.
        const actor = await sessionUser()
        if (!actor) return []
        const thread = await prisma.thread.findUnique({
            where: { id: threadId },
            include: { client: { select: { userId: true } }, operator: { select: { userId: true } } },
        })
        if (!thread) return []
        if (thread.client.userId !== actor.id && thread.operator.userId !== actor.id) return []

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
