import { getAdminStats } from "@/app/actions/admin"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
    Users,
    Briefcase,
    DollarSign,
    ArrowUpRight,
    Activity,
    ShieldCheck,
    UserPlus,
    LayoutDashboard
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions)

    // Authorization Check: Only ADMIN role allowed
    if (!session?.user?.email || session.user.role !== "ADMIN") {
        redirect("/dashboard")
    }

    const stats = await getAdminStats()

    const kpis = [
        {
            label: "Total Users",
            value: stats.users.total,
            sub: `${stats.users.operators} operators / ${stats.users.clients} clients`,
            icon: Users,
            color: "text-[#5BC2E7]",
            bg: "bg-[#5BC2E7]/10"
        },
        {
            label: "Jobs Posted",
            value: stats.jobs.total,
            sub: `${stats.jobs.open} currently open`,
            icon: Briefcase,
            color: "text-[#FB7427]",
            bg: "bg-[#FB7427]/10"
        },
        {
            // This is the total value of awarded work passing through the
            // marketplace, not DroneHub revenue. There is no commission on
            // jobs, so labelling this "revenue" would be misleading.
            label: "Awarded Job Value",
            value: `$${stats.volume.toLocaleString()}`,
            sub: "Total value of awarded work",
            icon: DollarSign,
            color: "text-yellow-400",
            bg: "bg-yellow-400/10"
        }
    ]

    return (
        <div className="min-h-screen bg-[#0f1722] py-16 md:py-24">
            <div className="container px-4 md:px-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5BC2E7]/10 border border-[#5BC2E7]/20">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#5BC2E7]" />
                            <span className="text-[10px] font-bold text-[#5BC2E7] uppercase tracking-[0.2em]">Admin</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">
                            Platform <span className="text-[#5BC2E7]">Overview</span>
                        </h1>
                        <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-xl">
                            Approve operators and keep an eye on platform activity.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Link href="/admin/operators">
                            <Button className="bg-[#5BC2E7] hover:bg-[#3aa9d4] text-[#0f1722] font-black uppercase tracking-tighter h-12 px-8 rounded-xl flex items-center gap-2 group transition-all">
                                Review Queue <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid gap-6 md:grid-cols-3 mb-16">
                    {kpis.map((kpi, i) => (
                        <div key={i} className="p-8 rounded-2xl bg-[#18222e] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
                            <div className="relative z-10 flex justify-between items-start">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{kpi.label}</p>
                                    <div className="text-4xl font-black text-white tracking-tighter italic">{kpi.value}</div>
                                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{kpi.sub}</p>
                                </div>
                                <div className={`h-12 w-12 rounded-xl ${kpi.bg} flex items-center justify-center border border-white/5`}>
                                    <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    ))}
                </div>

                {/* Recent Activity / Quick Actions split */}
                <div className="grid gap-12 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center gap-4">
                            <Activity className="w-5 h-5 text-[#5BC2E7]" />
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Platform Activity</h2>
                        </div>

                        <div className="p-1 rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Metric</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Count</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Detail</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[
                                        { op: "Registered Operators", status: String(stats.users.operators), intel: "Includes pending approval" },
                                        { op: "Registered Clients", status: String(stats.users.clients), intel: "Accounts able to post jobs" },
                                        { op: "Open Jobs", status: String(stats.jobs.open), intel: `${stats.jobs.total} posted in total` },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4 text-sm font-bold text-white uppercase italic tracking-tight">{row.op}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#5BC2E7]/10 text-[#5BC2E7] text-[9px] font-black uppercase tracking-widest border border-[#5BC2E7]/20">
                                                    <div className="w-1 h-1 rounded-full bg-[#5BC2E7] animate-pulse"></div>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-widest">{row.intel}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <LayoutDashboard className="w-5 h-5 text-[#FB7427]" />
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Quick Access</h2>
                        </div>

                        <div className="grid gap-4">
                            {/* Only Operator Verification is built. The other two are
                                planned, so they are shown as disabled rather than as
                                links that go nowhere. */}
                            <Link href="/admin/operators" className="group">
                                <div className="p-6 rounded-2xl bg-[#18222e] border border-white/5 group-hover:border-[#5BC2E7]/30 transition-all flex justify-between items-center">
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-white italic uppercase tracking-tight">Operator Verification</p>
                                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Clear the approval queue</p>
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 text-gray-700 group-hover:text-[#5BC2E7] transition-colors" />
                                </div>
                            </Link>

                            {[
                                { label: "Dispute Resolution", sub: "Review reported jobs" },
                                { label: "Platform Settings", sub: "Configuration and defaults" },
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-[#18222e]/50 border border-white/5 flex justify-between items-center opacity-50 cursor-not-allowed">
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-gray-400 italic uppercase tracking-tight">{item.label}</p>
                                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{item.sub}</p>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-600 border border-white/10 rounded-full px-2 py-1">Coming soon</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
