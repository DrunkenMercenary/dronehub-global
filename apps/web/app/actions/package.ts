"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { notify } from "@/lib/notify"
import { normaliseCategory } from "@/lib/categories"

const pkgSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    category: z.string().min(1, "Choose a category"),
    price: z.coerce.number().min(1, "Price must be at least 1"),
    deliveryDays: z.coerce.number().int().min(1, "Delivery must be at least 1 day"),
})

async function operatorProfile(email: string) {
    const u = await prisma.user.findUnique({ where: { email }, include: { operatorProfile: true } })
    return u?.operatorProfile
}

export async function getOperatorPackages(email: string) {
    const op = await operatorProfile(email)
    if (!op) return []
    const rows = await prisma.servicePackage.findMany({ where: { operatorId: op.id }, orderBy: { createdAt: "desc" } })
    return rows.map((p) => ({ ...p, price: Number(p.price) }))
}

export async function getPublicPackages(operatorId: string) {
    const rows = await prisma.servicePackage.findMany({ where: { operatorId, active: true }, orderBy: { price: "asc" } })
    return rows.map((p) => ({ ...p, price: Number(p.price) }))
}

export async function createPackage(data: z.infer<typeof pkgSchema>, email: string) {
    const parsed = pkgSchema.safeParse(data)
    if (!parsed.success) return { error: parsed.error.issues[0].message }
    const op = await operatorProfile(email)
    if (!op) return { error: "Operator profile not found" }
    await prisma.servicePackage.create({
        data: {
            operatorId: op.id,
            title: parsed.data.title,
            description: parsed.data.description,
            category: normaliseCategory(parsed.data.category),
            price: parsed.data.price,
            deliveryDays: parsed.data.deliveryDays,
        },
    })
    revalidatePath("/dashboard/packages")
    revalidatePath(`/operators/${op.id}`)
    return { success: true }
}

export async function updatePackage(id: string, data: z.infer<typeof pkgSchema>, email: string) {
    const parsed = pkgSchema.safeParse(data)
    if (!parsed.success) return { error: parsed.error.issues[0].message }
    const op = await operatorProfile(email)
    if (!op) return { error: "Operator profile not found" }
    const existing = await prisma.servicePackage.findUnique({ where: { id } })
    if (!existing || existing.operatorId !== op.id) return { error: "Not authorised" }
    await prisma.servicePackage.update({
        where: { id },
        data: {
            title: parsed.data.title,
            description: parsed.data.description,
            category: normaliseCategory(parsed.data.category),
            price: parsed.data.price,
            deliveryDays: parsed.data.deliveryDays,
        },
    })
    revalidatePath("/dashboard/packages")
    revalidatePath(`/operators/${op.id}`)
    return { success: true }
}

export async function togglePackageActive(id: string, email: string) {
    const op = await operatorProfile(email)
    if (!op) return { error: "Operator profile not found" }
    const existing = await prisma.servicePackage.findUnique({ where: { id } })
    if (!existing || existing.operatorId !== op.id) return { error: "Not authorised" }
    await prisma.servicePackage.update({ where: { id }, data: { active: !existing.active } })
    revalidatePath("/dashboard/packages")
    revalidatePath(`/operators/${op.id}`)
    return { success: true, active: !existing.active }
}

export async function deletePackage(id: string, email: string) {
    const op = await operatorProfile(email)
    if (!op) return { error: "Operator profile not found" }
    const existing = await prisma.servicePackage.findUnique({ where: { id } })
    if (!existing || existing.operatorId !== op.id) return { error: "Not authorised" }
    await prisma.servicePackage.delete({ where: { id } })
    revalidatePath("/dashboard/packages")
    revalidatePath(`/operators/${op.id}`)
    return { success: true }
}

// Direct order: creates an awarded job + accepted proposal, reusing the whole pipeline.
export async function orderPackage(packageId: string, email: string) {
    const u = await prisma.user.findUnique({ where: { email }, include: { clientProfile: true } })
    if (!u?.clientProfile) return { error: "Only clients can order. Please sign in as a client." }
    const pkg = await prisma.servicePackage.findUnique({
        where: { id: packageId },
        include: { operator: { select: { id: true, userId: true, name: true } } },
    })
    if (!pkg || !pkg.active) return { error: "This package is not available" }

    const job = await prisma.jobRequest.create({
        data: {
            clientId: u.clientProfile.id,
            title: pkg.title,
            description: pkg.description,
            category: pkg.category,
            location: "To be confirmed",
            status: "AWARDED",
            proposals: {
                create: {
                    operatorId: pkg.operatorId,
                    price: pkg.price,
                    message: `Direct order of package: ${pkg.title}`,
                    status: "ACCEPTED",
                },
            },
        },
    })

    await notify(pkg.operator.userId, {
        type: "order",
        title: "New order received",
        body: `${u.clientProfile.name} ordered "${pkg.title}"`,
        link: `/jobs/${job.id}`,
    })

    return { success: true, jobId: job.id }
}
