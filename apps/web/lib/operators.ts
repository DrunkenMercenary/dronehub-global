import { prisma } from "@/lib/prisma"
import { canShowVerifiedBadge, rankWeight } from "@/lib/tiers"

export type PublicOperator = {
    id: string
    name: string
    type: string
    companyName: string | null
    description: string | null
    services: string
    radius: number | null
    lat: number | null
    lng: number | null
    ratingAvg: number | null
    ratingCount: number
    // Paid (Pro) + approved. Drives the verified badge and directory ranking.
    verified: boolean
}

const selectFields = {
    id: true, name: true, type: true, companyName: true,
    description: true, services: true, radius: true, lat: true, lng: true,
    status: true, plan: true,
}

// Strip internal gating fields (status/plan) and expose only `verified`.
function toPublic(
    o: { status: string; plan: string } & Record<string, unknown>,
    ratingAvg: number | null,
    ratingCount: number
): PublicOperator {
    const { status, plan, ...rest } = o
    return {
        ...(rest as Omit<PublicOperator, "ratingAvg" | "ratingCount" | "verified">),
        ratingAvg,
        ratingCount,
        verified: canShowVerifiedBadge({ status, plan }),
    }
}

export async function getApprovedOperators(): Promise<PublicOperator[]> {
    try {
        const operators = await prisma.operatorProfile.findMany({
            where: { status: "APPROVED" },
            select: selectFields,
            orderBy: { name: "asc" },
        })
        const grouped = await prisma.review.groupBy({
            by: ["operatorId"],
            _avg: { rating: true },
            _count: { rating: true },
        })
        const byId = new Map(grouped.map((g) => [g.operatorId, g]))
        const mapped = operators.map((o) => {
            const g = byId.get(o.id)
            return toPublic(o, g?._avg.rating ?? null, g?._count.rating ?? 0)
        })
        // Pro operators rank above Free; stable tie-break keeps name order.
        return mapped
            .map((o, i) => ({ o, i }))
            .sort((a, b) => {
                const w = rankWeight(b.o.verified ? "PRO" : "FREE") - rankWeight(a.o.verified ? "PRO" : "FREE")
                return w !== 0 ? w : a.i - b.i
            })
            .map(({ o }) => o)
    } catch (e) {
        console.error("getApprovedOperators error:", e)
        return []
    }
}

export async function getPublicOperator(
    id: string
): Promise<(PublicOperator & { jobsCompleted: number }) | null> {
    try {
        const op = await prisma.operatorProfile.findFirst({
            where: { id, status: "APPROVED" },
            select: selectFields,
        })
        if (!op) return null
        const [jobsCompleted, agg] = await Promise.all([
            prisma.proposal.count({ where: { operatorId: id, status: "ACCEPTED" } }),
            prisma.review.aggregate({
                where: { operatorId: id },
                _avg: { rating: true },
                _count: { rating: true },
            }),
        ])
        return {
            ...toPublic(op, agg._avg.rating ?? null, agg._count.rating ?? 0),
            jobsCompleted,
        }
    } catch (e) {
        console.error("getPublicOperator error:", e)
        return null
    }
}
