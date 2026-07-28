
"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { notifyAdmins } from "@/lib/notify"
import { sessionEmail } from "@/lib/session"

const operatorSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().optional(),
    type: z.enum(["INDIVIDUAL", "COMPANY"]),
    companyName: z.string().optional(),
    fleetSize: z.coerce.number().min(1).optional(),
    description: z.string().optional(),
    services: z.array(z.string()).min(1, "Select at least one service"),
    radius: z.coerce.number().min(1, "Radius must be at least 1km"),
})

export type OperatorFormData = z.infer<typeof operatorSchema>

export async function onboardOperator(data: OperatorFormData) {
    const result = operatorSchema.safeParse(data)

    if (!result.success) {
        return { error: "Invalid form data" }
    }

    const { name, email, password, description, services, radius, type, companyName, fleetSize } = result.data

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
            include: { operatorProfile: true }
        })

        if (existingUser) {
            if (existingUser.password) {
                return { error: "User with this email already exists" }
            }
            if (existingUser.operatorProfile) {
                return { error: "Profile already exists. Please log in." }
            }

            // Update existing OAuth user
            await prisma.user.update({
                where: { email },
                data: {
                    role: "OPERATOR",
                    operatorProfile: {
                        create: {
                            name,
                            type,
                            companyName: type === "COMPANY" ? companyName : null,
                            fleetSize: type === "COMPANY" ? fleetSize : 1,
                            description,
                            services: services.join(','),
                            radius,
                            status: "PENDING"
                        }
                    }
                }
            })
            redirect("/register/success")
            return { success: true }
        }

        // Hash password
        if (!password) {
            return { error: "Password is required" }
        }
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create User and Operator Profile
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: "OPERATOR",
                operatorProfile: {
                    create: {
                        name,
                        type,
                        companyName: type === "COMPANY" ? companyName : null,
                        fleetSize: type === "COMPANY" ? fleetSize : 1,
                        description,
                        services: services.join(','),
                        radius,
                        status: "PENDING",
                    }
                }
            }
        })

        await notifyAdmins({
            type: "operator_signup",
            title: "New operator awaiting review",
            body: `${name} signed up and needs approval`,
            link: "/admin/operators",
        })

    } catch (error) {
        console.error("Onboarding error:", error)
        return { error: `Failed to create account: ${error instanceof Error ? error.message : String(error)}` }
    }

    redirect("/register/success")
}

export async function getOperatorProfile(_email?: string) {
    // Identity from session; the email argument is ignored so one operator
    // cannot load another operator's private profile record.
    const email = await sessionEmail()
    if (!email) return null
    return await prisma.operatorProfile.findFirst({
        where: { user: { email } },
    })
}
