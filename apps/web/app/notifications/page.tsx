import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getNotifications, markAllRead } from "@/app/actions/notification"
import { Bell, FileText, Award, MessageSquare, Star, ShieldCheck, CheckCircle, UserPlus, Package, CreditCard } from "lucide-react"

export const dynamic = "force-dynamic"

const ICONS: Record<string, any> = {
    proposal: FileText, award: Award, message: MessageSquare, review: Star,
    approval: ShieldCheck, completed: CheckCircle, operator_signup: UserPlus, order: Package, payment: CreditCard,
}

export default async function NotificationsPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) redirect("/login")

    const notifications = await getNotifications(session.user.email)
    await markAllRead(session.user.email)

    return (
        <div className="min-h-screen bg-[#0f1722] py-16 md:py-24">
            <div className="container max-w-3xl px-4 md:px-6">
                <div className="flex items-center gap-3 mb-10">
                    <Bell className="w-6 h-6 text-[#5BC2E7]" />
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Notifications</h1>
                </div>

                {notifications.length === 0 ? (
                    <div className="p-16 rounded-2xl border border-dashed border-white/10 bg-[#18222e]/40 text-center space-y-3">
                        <p className="text-lg font-bold text-gray-400">You're all caught up</p>
                        <p className="text-sm text-gray-600">Notifications about proposals, messages, and reviews will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((n) => {
                            const Icon = ICONS[n.type] || Bell
                            const inner = (
                                <div className={`p-5 rounded-2xl border flex items-start gap-4 transition-all ${n.read ? "bg-[#18222e] border-white/5" : "bg-[#5BC2E7]/5 border-[#5BC2E7]/20"}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.read ? "bg-white/5 text-gray-400" : "bg-[#5BC2E7]/15 text-[#5BC2E7]"}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-white">{n.title}</p>
                                        {n.body && <p className="text-sm text-gray-400 mt-0.5">{n.body}</p>}
                                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            )
                            return n.link ? <Link key={n.id} href={n.link} className="block">{inner}</Link> : <div key={n.id}>{inner}</div>
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
