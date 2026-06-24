import { getOperatorFeed } from "@/app/actions/job"
import { getOperatorProposals } from "@/app/actions/proposal"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
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
import { getOperatorDocuments } from "@/app/actions/document"
import { FileCheck2, Package } from "lucide-react"

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
    const documents = profile ? await getOperatorDocuments(profile.id) : []
    const vstatus = (profile as any)?.status === "APPROVED"
        ? { label: "Verified", cls: "bg-green-500/20 text-green-400 border-green-500/30" }
        : (profile as any)?.status === "REJECTED"
            ? { label: "Not approved", cls: "bg-red-500/20 text-red-400 border-red-500/30" }
            : { label: "Pending review", cls: "bg-amber-500/20 text-amber-400 border-amber-500/30" }

    const stats = [
        { label: "Active Proposals", value: proposals.filter(p => p.status === "PENDING").length.toString(), icon: FileText, color: "text-[#FB7427]" },
        { label: "Jobs awarded", value: proposals.filter(p => p.status === "ACCEPTED").length.toString(), icon: CheckCircle, color: "text-[#5BC2E7]" },
        { label: "Verification", value: vstatus.label, icon: ShieldCheck, color: "text-[#5BC2E7]" },
        { label: (profile as any)?.type === "COMPANY" ? "Fleet Size" : "Pilot Rank", value: (profile as any)?.type === "COMPANY" ? ((profile as any).fleetSize || 1).toString() : "Ace", icon: (profile as any)?.type === "COMPANY" ? Users : User, color: "text-purple-400" },
    ]

    return (
        <div className="min-h-screen bg-[#0f1722] text-white">
            {/* Dashboard Sidebar/Header Placeholder for layout spacing */}
            <div className="container px-4 md:px-6 py-12 md:py-16">

                {/* Profile Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FB7427]/10 border border-[#FB7427]/20">
                            {(profile as any)?.type === "COMPANY" ? (
                                <Building className="w-3.5 h-3.5 text-[#FB7427]" />
                            ) : (
                                <User className="w-3.5 h-3.5 text-[#FB7427]" />
                            )}
                            <span className="text-[10px] font-bold text-[#FB7427] uppercase tracking-[0.2em]">
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
                        <div key={i} className="p-6 rounded-2xl bg-[#18222e] border border-white/5 space-y-2">
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
                                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Available jobs</h2>
                                <p className="text-gray-500 text-sm font-medium">Jobs matching your services.</p>
                            </div>
                            <Link href="/jobs">
                                <Button variant="outline" className="border-white/10 text-white hover:bg-[#FB7427] hover:text-[#0f1722] hover:border-[#FB7427] font-bold rounded-xl">
                                    <Search className="mr-2 w-4 h-4" /> Browse All
                                </Button>
                            </Link>
                        </div>

                        <div className="grid gap-6">
                            {jobs.length === 0 ? (
                                <div className="p-16 rounded-2xl border border-dashed border-white/10 bg-[#18222e]/50 text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                                        <Briefcase className="w-8 h-8 text-gray-700" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white uppercase italic">No jobs yet</h3>
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
                        {/* Verification */}
                        <div className="p-8 rounded-2xl bg-[#18222e] border border-white/5 space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Verification</h3>
                                <span className={`text-[9px] font-bold uppercase tracking-widest border px-2.5 py-1 rounded-full ${vstatus.cls}`}>{vstatus.label}</span>
                            </div>
                            <p className="text-sm text-gray-400">
                                {documents.length === 0
                                    ? "Upload your licence and insurance to get verified and listed publicly."
                                    : `${documents.length} document${documents.length === 1 ? "" : "s"} on file.`}
                            </p>
                            <Link href="/dashboard/documents">
                                <Button className="w-full bg-[#5BC2E7] hover:bg-[#3aa9d4] text-[#0f1722] font-bold rounded-xl">
                                    <FileCheck2 className="mr-2 w-4 h-4" /> Manage documents
                                </Button>
                            </Link>
                        </div>

                        {/* Quick Actions */}
                        <div className="p-8 rounded-2xl bg-[#18222e] border border-white/5 space-y-6">
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Quick actions</h3>
                            <div className="grid gap-3">
                                {[
                                    { label: "Edit profile", icon: LayoutDashboard, href: "/register/operator" },
                                    { label: "My Proposals", icon: FileText, href: "/dashboard/proposals" },
                                    { label: "Service packages", icon: Package, href: "/dashboard/packages" },
                                    { label: "Notifications", icon: Bell, href: "/notifications" },
                                    { label: "Documents", icon: FileCheck2, href: "/dashboard/documents" },
                                ].map((action, i) => (
                                    <Link key={i} href={action.href}>
                                        <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#FB7427]/10 transition-colors">
                                                <action.icon className="w-4 h-4 text-gray-400 group-hover:text-[#FB7427] transition-colors" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{action.label}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="p-8 rounded-2xl bg-[#18222e] border border-white/5 space-y-6">
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Recent Activity</h3>
                            <div className="space-y-6">
                                {proposals.length === 0 ? (
                                    <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">No activity yet. Submit your first proposal to get started.</p>
                                ) : (
                                    proposals.slice(0, 4).map((p: any) => (
                                        <div key={p.id} className="flex gap-4">
                                            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${p.status === "ACCEPTED" ? "bg-green-400" :
                                                    p.status === "REJECTED" ? "bg-red-400" :
                                                        "bg-amber-400"
                                                }`} />
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-gray-300 leading-tight">
                                                    Proposal <span className={`${p.status === "ACCEPTED" ? "text-green-400" :
                                                            p.status === "REJECTED" ? "text-red-400" :
                                                                "text-amber-400"
                                                        }`}>{p.status}</span> for Job #{p.jobId?.slice(-6).toUpperCase()}
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
