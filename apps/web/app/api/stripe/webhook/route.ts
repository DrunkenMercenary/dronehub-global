import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { fulfilPayment } from "@/lib/payments"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
    const stripe = getStripe()
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!stripe || !webhookSecret) {
        return NextResponse.json({ error: "Payments not enabled" }, { status: 400 })
    }

    const sig = req.headers.get("stripe-signature")
    if (!sig) return new NextResponse("Missing signature", { status: 400 })

    const body = await req.text()
    let event
    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (e) {
        console.error("Webhook signature verification failed:", e)
        return new NextResponse("Invalid signature", { status: 400 })
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as { metadata?: { jobId?: string }; payment_intent?: string }
        const jobId = session.metadata?.jobId
        if (jobId) {
            await fulfilPayment(jobId, session.payment_intent ? String(session.payment_intent) : null)
        }
    }

    return NextResponse.json({ received: true })
}
