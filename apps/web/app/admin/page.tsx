import { getAdminStats } from "@/app/actions/admin"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
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
            label: "Total Personnel",
            value: stats.users.total,
            sub: `${stats.users.operators} Pilots / ${stats.users.clients} COMMANDERS`,
            icon: Users,
            color: "text-[#17ad96]",
            bg: "bg-[#17ad96]/10"
        },
        {
            label: "Mission Volume",
            value: stats.jobs.total,
            sub: `${stats.jobs.open} ACTIVE SORTIES`,
            icon: Briefcase,
            color: "text-blue-400",
            bg: "bg-blue-400/10"
        },
        {
            label: "Platform Revenue",
            value: `$${stats.volume.toLocaleString()}`,
            sub: "GROSS TRANSMISSION VALUE",
            icon: DollarSign,
            color: "text-yellow-400",
            bg: "bg-yellow-400/10"
        }
    ]

    return (
        <div className="min-h-screen bg-[#0a0d11] py-16 md:py-24">
            <div className="container px-4 md:px-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17ad96]/10 border border-[#17ad96]/20">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#17ad96]" />
                            <span className="text-[10px] font-bold text-[#17ad96] uppercase tracking-[0.2em]">HQ Command</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">
                            Global <span className="text-[#17ad96]">Operations</span>
                        </h1>
                        <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-xl">
                            Real-time platform intelligence and mission control.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Link href="/admin/operators">
                            <Button className="bg-[#17ad96] hover:bg-[#159a85] text-[#0a0d11] font-black uppercase tracking-tighter h-12 px-8 rounded-xl flex items-center gap-2 group transition-all">
                                Review Queue <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid gap-6 md:grid-cols-3 mb-16">
                    {kpis.map((kpi, i) => (
                        <div key={i} className="p-8 rounded-2xl bg-[#12171e] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
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
                            <Activity className="w-5 h-5 text-[#17ad96]" />
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">System Pulse</h2>
                        </div>

                        <div className="p-1 rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Operation</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Intel</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[
                                        { op: "Node Connectivity", status: "Operational", intel: "99.9% Latency Opt" },
                                        { op: "S3 Burst Storage", status: "Nominal", intel: "1.2 TB / 5 TB Used" },
                                        { op: "Auth Encryptor", status: "Secure", intel: "AES-256 Validated" },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4 text-sm font-bold text-white uppercase italic tracking-tight">{row.op}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#17ad96]/10 text-[#17ad96] text-[9px] font-black uppercase tracking-widest border border-[#17ad96]/20">
                                                    <div className="w-1 h-1 rounded-full bg-[#17ad96] animate-pulse"></div>
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
                            <LayoutDashboard className="w-5 h-5 text-blue-400" />
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Quick Access</h2>
                        </div>

                        <div className="grid gap-4">
                            {[
                                { label: "Operator Verification", sub: "Clear the approval queue", href: "/admin/operators" },
                                { label: "Dispute Arbitration", sub: "Review flagged mission comms", href: "#" },
                                { label: "Platform Settings", sub: "Global environment config", href: "#" },
                            ].map((link, i) => (
                                <Link key={i} href={link.href} className="group">
                                    <div className="p-6 rounded-2xl bg-[#12171e] border border-white/5 group-hover:border-[#17ad96]/30 transition-all flex justify-between items-center">
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-white italic uppercase tracking-tight">{link.label}</p>
                                            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{link.sub}</p>
                                        </div>
                                        <ArrowUpRight className="w-5 h-5 text-gray-700 group-hover:text-[#17ad96] transition-colors" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
