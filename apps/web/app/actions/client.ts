"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"

const clientSchema = z.object({
    name: z.string().min(2, "Name or Company must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function registerClient(data: z.infer<typeof clientSchema>) {
    try {
        const validated = clientSchema.parse(data)

        // Check if user exists
        const existing = await prisma.user.findUnique({
            where: { email: validated.email },
            include: { clientProfile: true }
        })

        if (existing) {
            if (existing.password) {
                return { error: "Email already registered with credentials." }
            }
            if (existing.clientProfile) {
                return { error: "Profile already exists. Please log in." }
            }

            // Update existing OAuth user
            await prisma.user.update({
                where: { email: validated.email },
                data: {
                    role: "CLIENT",
                    clientProfile: {
                        create: { name: validated.name }
                    }
                }
            })
            redirect("/register/success")
            return { success: true }
        }

        const hashedPassword = await bcrypt.hash(validated.password, 10)

        const user = await prisma.user.create({
            data: {
                email: validated.email,
                password: hashedPassword,
                role: "CLIENT",
                clientProfile: {
                    create: {
                        name: validated.name
                    }
                }
            }
        })

        if (user) {
            redirect("/register/success")
        }

        return { success: true }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: error.issues[0].message }
        }
        console.error("Register Client Error:", error)
        return { error: "Failed to establish command" }
    }
}
