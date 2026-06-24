import { prisma } from "@/lib/prisma"

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
}

const selectFields = {
    id: true, name: true, type: true, companyName: true,
    description: true, services: true, radius: true, lat: true, lng: true,
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
        return operators.map((o) => {
            const g = byId.get(o.id)
            return {
                ...o,
                ratingAvg: g?._avg.rating ?? null,
                ratingCount: g?._count.rating ?? 0,
            }
        })
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
            ...op,
            jobsCompleted,
            ratingAvg: agg._avg.rating ?? null,
            ratingCount: agg._count.rating ?? 0,
        }
    } catch (e) {
        console.error("getPublicOperator error:", e)
        return null
    }
}
