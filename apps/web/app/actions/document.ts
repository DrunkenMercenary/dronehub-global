"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { sessionUser } from "@/lib/session"

export async function addDocument(data: {
    url: string,
    name: string,
    type: string,
    operatorProfileId?: string,
    jobId?: string
}) {
    try {
        // Must be signed in. If attaching to an operator profile, it must be the
        // caller's own profile.
        const actor = await sessionUser()
        if (!actor) return { error: "You must be signed in" }
        if (data.operatorProfileId && actor.operatorProfile?.id !== data.operatorProfileId) {
            return { error: "You can only add documents to your own profile" }
        }

        const createData: Prisma.DocumentCreateInput = {
            url: data.url,
            name: data.name,
            type: data.type,
        }

        if (data.operatorProfileId) {
            createData.operator = { connect: { id: data.operatorProfileId } }
        }

        if (data.jobId) {
            createData.job = { connect: { id: data.jobId } }
        }

        const document = await prisma.document.create({
            data: createData
        })

        if (data.operatorProfileId) {
            revalidatePath("/dashboard")
        }
        if (data.jobId) {
            revalidatePath(`/jobs/${data.jobId}`)
        }

        return { success: true, document }
    } catch (error) {
        console.error("Add Document Error:", error)
        return { error: "Failed to save document record" }
    }
}

export async function getOperatorDocuments(operatorProfileId: string) {
    try {
        // Portfolio images are public. Sensitive documents (licence, insurance)
        // are only returned to the profile's owner or an admin, so passing
        // another operator's id cannot leak their verification papers.
        const actor = await sessionUser()
        const isOwner = actor?.operatorProfile?.id === operatorProfileId
        const isAdmin = actor?.role === "ADMIN"

        if (isOwner || isAdmin) {
            return await prisma.document.findMany({
                where: { operatorProfileId },
            })
        }

        return await prisma.document.findMany({
            where: { operatorProfileId, type: "PORTFOLIO" },
        })
    } catch (error) {
        console.error("Get Documents Error:", error)
        return []
    }
}
