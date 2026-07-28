"use server"

import { prisma } from "@/lib/prisma"
import { getStripe } from "@/lib/stripe"
import { TIERS, normalisePlan, type Plan } from "@/lib/tiers"
import { sessionEmail } from "@/lib/session"

// Returns the operator's current plan for the signed-in user.
export async function getMyPlan(_email?: string): Promise<Plan> {
    const email = await sessionEmail()
    if (!email) return "FREE"
    const user = await prisma.user.findUnique({
        where: { email },
        include: { operatorProfile: { select: { plan: true } } },
    })
    return normalisePlan(user?.operatorProfile?.plan)
}

// Starts a recurring Stripe Checkout for the Pro plan.
// Dormant until STRIPE_SECRET_KEY and the Pro price id are configured, exactly
// like one-off Checkout. Until then it returns a friendly "not enabled" error.
export async function createSubscriptionCheckout(_operatorEmail?: string) {
    const stripe = getStripe()
    if (!stripe) return { error: "Subscriptions are not enabled yet" }

    const priceId = process.env[TIERS.PRO.stripePriceIdEnv ?? ""]
    if (!priceId) return { error: "Subscriptions are not enabled yet" }

    const email = await sessionEmail()
    if (!email) return { error: "You must be signed in" }
    const user = await prisma.user.findUnique({
        where: { email },
        include: { operatorProfile: true },
    })
    if (!user?.operatorProfile) return { error: "Only operators can subscribe" }

    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

    try {
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            line_items: [{ price: priceId, quantity: 1 }],
            customer_email: user.email ?? undefined,
            success_url: `${appUrl}/dashboard?upgraded=1`,
            cancel_url: `${appUrl}/pricing`,
            metadata: { operatorProfileId: user.operatorProfile.id, plan: "PRO" },
        })
        return { url: session.url }
    } catch (e) {
        console.error("Stripe subscription checkout error:", e)
        return { error: "Could not start checkout. Please try again." }
    }
}
