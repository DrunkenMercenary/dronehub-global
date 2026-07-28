import "server-only"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Single source of truth for "who is calling this server action".
//
// Server actions compile to public POST endpoints, so identity must never be
// taken from arguments the caller sends. It is always derived here from the
// signed-in session. If there is no session, actions treat the caller as
// unauthenticated and refuse to act.

export type Actor = NonNullable<Awaited<ReturnType<typeof sessionUser>>>

// The authenticated email, or null if not signed in. Never throws: outside a
// request scope getServerSession can throw, and we want callers to treat that
// as "no session" rather than crash.
export async function sessionEmail(): Promise<string | null> {
    try {
        const session = await getServerSession(authOptions)
        return session?.user?.email ?? null
    } catch {
        return null
    }
}

// The full signed-in user with both profiles, or null if not signed in.
export async function sessionUser() {
    const email = await sessionEmail()
    if (!email) return null
    return prisma.user.findUnique({
        where: { email },
        include: { clientProfile: true, operatorProfile: true },
    })
}

// Require any signed-in user. Returns null when unauthenticated so the calling
// action can return its usual { error } shape.
export async function requireUser() {
    return sessionUser()
}

// Require a signed-in user holding a specific role.
export async function requireRole(role: "ADMIN" | "CLIENT" | "OPERATOR") {
    const user = await sessionUser()
    if (!user || user.role !== role) return null
    return user
}
