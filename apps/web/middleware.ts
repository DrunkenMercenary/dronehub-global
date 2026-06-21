import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

// Routes that require authentication
const protectedRoutes = [
    "/dashboard",
    "/client/dashboard",
    "/admin",
    "/jobs/new",
]

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    })

    const { pathname } = request.nextUrl

    // Check if the current path starts with any protected route
    const isProtected = protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
    )

    if (isProtected && !token) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Admin-only routes
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/client/dashboard/:path*",
        "/admin/:path*",
        "/jobs/new",
    ],
}
