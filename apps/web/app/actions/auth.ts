"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

// Client Registration Schema
const clientRegisterSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

export type ClientRegisterData = z.infer<typeof clientRegisterSchema>

// Server Action: Register Client
export async function registerClient(data: ClientRegisterData) {
    const result = clientRegisterSchema.safeParse(data)

    if (!result.success) {
        return { error: "Invalid form data" }
    }

    const { name, email, password } = result.data

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return { error: "User with this email already exists" }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create User and Client Profile in a transaction
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: "CLIENT",
                clientProfile: {
                    create: {
                        name,
                    }
                }
            }
        })

    } catch (error) {
        console.error("Client registration error:", error)
        return { error: "Failed to create account" }
    }

    redirect("/register/success")
}

// Server Action: Login (verify credentials)
export async function verifyCredentials(email: string, password: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                clientProfile: true,
                operatorProfile: true,
            }
        })

        if (!user) {
            return null
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password)

        if (!isValidPassword) {
            return null
        }

        // Return user data without password
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.clientProfile?.name || user.operatorProfile?.name || "User",
        }
    } catch (error) {
        console.error("Login error:", error)
        return null
    }
}
