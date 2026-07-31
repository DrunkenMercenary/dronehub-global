import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"

const providers: NextAuthOptions["providers"] = [
    CredentialsProvider({
        name: "Credentials",
        credentials: {
            email: { label: "Email", type: "text", placeholder: "user@example.com" },
            password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
                return null
            }
            try {
                const { verifyCredentials } = await import("@/app/actions/auth")
                const user = await verifyCredentials(credentials.email, credentials.password)
                if (!user) return null
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                }
            } catch (error) {
                console.error("Auth error:", error)
                return null
            }
        },
    }),
]

// Only enable Google when credentials are actually configured, so a misclick
// on an unconfigured provider cannot throw in production.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            // Let someone who already registered with an email and password sign
            // in with Google using that same address, instead of being blocked
            // with an "OAuthAccountNotLinked" error. NextAuth calls this
            // "dangerous" because a provider that does not verify email ownership
            // would allow account takeover. Google does verify ownership, so
            // linking on a matching Google address is safe here. Do not copy this
            // setting onto a provider that does not verify emails.
            allowDangerousEmailAccountLinking: true,
        })
    )
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers,
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as { role?: string }).role as string
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role
                session.user.id = token.id
            }
            return session
        },
    },
    pages: { signIn: "/login" },
}
