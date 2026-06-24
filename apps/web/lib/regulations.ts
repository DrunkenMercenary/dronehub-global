import { prisma } from "@/lib/prisma"

export type Regulation = {
    id: string
    country: string
    category: string
    title: string
    summary: string
    authority: string | null
    sourceUrl: string | null
}

export async function getRegulations(): Promise<Regulation[]> {
    try {
        return await prisma.regulation.findMany({
            orderBy: [{ country: "asc" }, { category: "asc" }],
            select: { id: true, country: true, category: true, title: true, summary: true, authority: true, sourceUrl: true },
        })
    } catch (e) {
        console.error("getRegulations error:", e)
        return []
    }
}
