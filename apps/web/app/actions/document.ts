"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

export async function addDocument(data: {
    url: string,
    name: string,
    type: string,
    operatorProfileId?: string,
    jobId?: string
}) {
    try {
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
        return await prisma.document.findMany({
            where: {
                operatorProfileId: operatorProfileId
            }
        })
    } catch (error) {
        console.error("Get Documents Error:", error)
        return []
    }
}
