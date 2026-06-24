import { prisma } from "@/lib/prisma"

type N = { type: string; title: string; body?: string | null; link?: string | null }

// Fire-and-forget: a notification failure must never break the parent action.
export async function notify(userId: string | null | undefined, n: N) {
    if (!userId) return
    try {
        await prisma.notification.create({
            data: { userId, type: n.type, title: n.title, body: n.body ?? null, link: n.link ?? null },
        })
    } catch (e) {
        console.error("notify error:", e)
    }
}

export async function notifyAdmins(n: N) {
    try {
        const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } })
        if (admins.length === 0) return
        await prisma.notification.createMany({
            data: admins.map((a) => ({ userId: a.id, type: n.type, title: n.title, body: n.body ?? null, link: n.link ?? null })),
        })
    } catch (e) {
        console.error("notifyAdmins error:", e)
    }
}
