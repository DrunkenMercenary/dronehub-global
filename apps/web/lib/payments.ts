import { prisma } from "@/lib/prisma"
import { notify } from "@/lib/notify"

// Server-only fulfilment (NOT a server action - never callable from the client).
// Called by the Stripe webhook once a checkout session completes.
export async function fulfilPayment(jobId: string, paymentIntentId?: string | null) {
    const payment = await prisma.payment.findUnique({ where: { jobId } })
    if (!payment) return
    if (payment.status === "PAID") return

    await prisma.payment.update({
        where: { jobId },
        data: { status: "PAID", stripePaymentIntentId: paymentIntentId ?? payment.stripePaymentIntentId },
    })

    const job = await prisma.jobRequest.findUnique({
        where: { id: jobId },
        include: {
            client: { select: { userId: true, name: true } },
            proposals: { where: { status: "ACCEPTED" }, include: { operator: { select: { userId: true } } } },
        },
    })
    const operatorUserId = job?.proposals[0]?.operator.userId
    await notify(operatorUserId, {
        type: "payment",
        title: "Payment received",
        body: `Payment received for "${job?.title}"`,
        link: `/jobs/${jobId}`,
    })
    await notify(job?.client.userId, {
        type: "payment",
        title: "Payment confirmed",
        body: `Your payment for "${job?.title}" is confirmed`,
        link: `/jobs/${jobId}`,
    })
}
