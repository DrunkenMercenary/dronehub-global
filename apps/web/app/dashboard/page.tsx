import { getOperatorFeed } from "@/app/actions/job"
import { getOperatorProposals } from "@/app/actions/proposal"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { JobCard } from "@/components/operator/JobCard"
import {
    LayoutDashboard,
    Briefcase,
    FileText,
    Settings,
    Search,
    Bell,
    CheckCircle,
    Clock,
    ShieldCheck,
    Users,
    Building,
    User
} from "lucide-react"
import { getOperatorProfile } from "@/app/actions/operator"

export const dynamic = 'force-dynamic'

export default async function OperatorDashboard() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        redirect("/login")
    }

    // Role-Based Redirection
    if (session.user.role === "ADMIN") {
        redirect("/admin")
    }

    if (session.user.role === "CLIENT") {
        redirect("/client/dashboard")
    }

    const jobs = await getOperatorFeed(session.user.email)
    const proposals = await getOperatorProposals(session.user.email)
    const profile = await getOperatorProfile(session.user.email)

    const stats = [
        { label: "Active Proposals", value: proposals.filter(p => p.status === "PENDING").length.toString(), icon: FileText, color: "text-[#17ad96]" },
        { label: "Missions Awarded", value: proposals.filter(p => p.status === "ACCEPTED").length.toString(), icon: CheckCircle, color: "text-blue-400" },
        { label: "Compliance Status", value: "Verified", icon: ShieldCheck, color: "text-[#17ad96]" },
        { label: (profile as any)?.type === "COMPANY" ? "Fleet Size" : "Pilot Rank", value: (profile as any)?.type === "COMPANY" ? ((profile as any).fleetSize || 1).toString() : "Ace", icon: (profile as any)?.type === "COMPANY" ? Users : User, color: "text-purple-400" },
    ]

    return (
        <div className="min-h-screen bg-[#0a0d11] text-white">
            {/* Dashboard Sidebar/Header Placeholder for layout spacing */}
            <div className="container px-4 md:px-6 py-12 md:py-16">

                {/* Profile Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17ad96]/10 border border-[#17ad96]/20">
                            {(profile as any)?.type === "COMPANY" ? (
                                <Building className="w-3.5 h-3.5 text-[#17ad96]" />
                            ) : (
                                <User className="w-3.5 h-3.5 text-[#17ad96]" />
                            )}
                            <span className="text-[10px] font-bold text-[#17ad96] uppercase tracking-[0.2em]">
                                {(profile as any)?.type === "COMPANY" ? "Licensed Carrier" : "Independent Pilot"}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                                {(profile as any)?.companyName || profile?.name || session.user.name}
                            </h1>
                            {(profile as any)?.companyName && (
                                <p className="text-gray-500 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                                    <User className="w-4 h-4" /> Lead Pilot: {profile?.name}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
                    {stats.map((stat, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-[#12171e] border border-white/5 space-y-2">
                            <div className="flex justify-between items-start">
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Live Status</span>
                            </div>
                            <div className="text-3xl font-black">{stat.value}</div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid gap-12 lg:grid-cols-3">
                    {/* Main Feed */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Available Missions</h2>
                                <p className="text-gray-500 text-sm font-medium">Opportunities matching your pilot profile.</p>
                            </div>
                            <Link href="/jobs">
                                <Button variant="outline" className="border-white/10 text-white hover:bg-[#17ad96] hover:text-[#0a0d11] hover:border-[#17ad96] font-bold rounded-xl">
                                    <Search className="mr-2 w-4 h-4" /> Browse All
                                </Button>
                            </Link>
                        </div>

                        <div className="grid gap-6">
                            {jobs.length === 0 ? (
                                <div className="p-16 rounded-2xl border border-dashed border-white/10 bg-[#12171e]/50 text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                                        <Briefcase className="w-8 h-8 text-gray-700" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white uppercase italic">Zero Missions Found</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto text-sm font-medium">
                                        New project briefings are arriving soon. Ensure your certifications are up to date to receive alerts.
                                    </p>
                                </div>
                            ) : (
                                jobs.map((job: any) => (
                                    <JobCard key={job.id} job={job} />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Quick Actions */}
                        <div className="p-8 rounded-2xl bg-[#12171e] border border-white/5 space-y-6">
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Command Center</h3>
                            <div className="grid gap-3">
                                {[
                                    { label: "Edit Pilot Profile", icon: LayoutDashboard, href: "/register/operator" },
                                    { label: "My Proposals", icon: FileText, href: "/dashboard/proposals" },
                                    { label: "Mission Notifications", icon: Bell, href: "#" },
                                    { label: "Account Settings", icon: Settings, href: "#" },
                                ].map((action, i) => (
                                    <Link key={i} href={action.href}>
                                        <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#17ad96]/10 transition-colors">
                                                <action.icon className="w-4 h-4 text-gray-400 group-hover:text-[#17ad96] transition-colors" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{action.label}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="p-8 rounded-2xl bg-[#12171e] border border-white/5 space-y-6">
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Recent Activity</h3>
                            <div className="space-y-6">
                                {proposals.length === 0 ? (
                                    <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">No activity yet. Submit your first proposal to get started.</p>
                                ) : (
                                    proposals.slice(0, 4).map((p: any) => (
                                        <div key={p.id} className="flex gap-4">
                                            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${p.status === "ACCEPTED" ? "bg-green-400" :
                                                    p.status === "REJECTED" ? "bg-red-400" :
                                                        "bg-[#17ad96]"
                                                }`} />
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-gray-300 leading-tight">
                                                    Proposal <span className={`${p.status === "ACCEPTED" ? "text-green-400" :
                                                            p.status === "REJECTED" ? "text-red-400" :
                                                                "text-[#17ad96]"
                                                        }`}>{p.status}</span> for Mission #{p.jobId?.slice(-6).toUpperCase()}
                                                </p>
                                                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                                                    {new Date(p.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
