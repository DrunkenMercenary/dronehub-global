"use server"

import { prisma } from "@/lib/prisma"
import { getStripe } from "@/lib/stripe"
import { sessionUser } from "@/lib/session"

export async function getJobPayment(jobId: string) {
    // Only the job's client or its awarded operator may see payment status.
    const actor = await sessionUser()
    if (!actor) return null
    const job = await prisma.jobRequest.findUnique({
        where: { id: jobId },
        include: { proposals: { where: { status: "ACCEPTED" }, select: { operatorId: true } } },
    })
    if (!job) return null
    const isClient = actor.clientProfile?.id === job.clientId
    const isAwardedOperator = !!actor.operatorProfile && job.proposals.some((p) => p.operatorId === actor.operatorProfile!.id)
    if (!isClient && !isAwardedOperator) return null

    const p = await prisma.payment.findUnique({ where: { jobId } })
    return p ? { ...p, amount: Number(p.amount) } : null
}

export async function createCheckoutSession(jobId: string, _clientEmail?: string) {
    const stripe = getStripe()
    if (!stripe) return { error: "Payments are not enabled yet" }

    const user = await sessionUser()
    if (!user?.clientProfile) return { error: "Only the client can pay for this job" }

    const job = await prisma.jobRequest.findUnique({
        where: { id: jobId },
        include: { proposals: { where: { status: "ACCEPTED" } } },
    })
    if (!job || job.clientId !== user.clientProfile.id) return { error: "Not authorised" }
    const accepted = job.proposals[0]
    if (!accepted) return { error: "No accepted proposal to pay for" }

    const amount = Number(accepted.price)
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

    try {
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: [{
                price_data: {
                    currency: "usd",
                    product_data: { name: job.title },
                    unit_amount: Math.round(amount * 100),
                },
                quantity: 1,
            }],
            success_url: `${appUrl}/jobs/${jobId}?paid=1`,
            cancel_url: `${appUrl}/jobs/${jobId}`,
            metadata: { jobId },
        })
        await prisma.payment.upsert({
            where: { jobId },
            update: { amount, status: "PENDING", stripeSessionId: session.id },
            create: { jobId, amount, currency: "usd", status: "PENDING", stripeSessionId: session.id },
        })
        return { url: session.url }
    } catch (e) {
        console.error("Stripe checkout error:", e)
        return { error: "Could not start checkout. Please try again." }
    }
}
