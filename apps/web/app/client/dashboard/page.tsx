
import { getClientJobs } from "@/app/actions/job"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Calendar, FileText, Plus, ShieldCheck, Briefcase, ChevronRight, Zap } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function ClientDashboard() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        redirect("/login")
    }

    const jobs = await getClientJobs(session.user.email)

    // Calculate stats from real data
    const activeMissions = jobs.length
    const totalBids = jobs.reduce((acc, job: any) => acc + (job._count?.proposals || 0), 0)
    const awardedMissions = jobs.filter((j: any) => j.status === "AWARDED").length
    const openMissions = jobs.filter((j: any) => j.status === "OPEN").length

    return (
        <div className="min-h-screen bg-[#0a0d11] py-16 md:py-24">
            <div className="container px-4 md:px-6">

                {/* Header Area */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17ad96]/10 border border-[#17ad96]/20">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#17ad96]" />
                            <span className="text-[10px] font-bold text-[#17ad96] uppercase tracking-[0.2em]">Commander Center</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">
                            Active <span className="text-[#17ad96]">Operations</span>
                        </h1>
                        <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-xl">
                            Oversee your fleet, manage mission briefings, and analyze incoming pilot proposals.
                        </p>
                    </div>
                    <Link href="/jobs/new">
                        <Button className="bg-[#17ad96] hover:bg-[#159a85] text-[#0a0d11] font-black uppercase tracking-tighter h-14 px-8 rounded-xl shadow-xl shadow-[#17ad96]/10 transition-all active:scale-95 flex items-center gap-2">
                            <Plus className="w-5 h-5" /> Deploy New mission
                        </Button>
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="p-6 rounded-2xl bg-[#12171e] border border-white/5 space-y-1">
                        <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Active Missions</p>
                        <p className="text-3xl font-black text-white">{activeMissions}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[#12171e] border border-white/5 space-y-1">
                        <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Total Proposals</p>
                        <p className="text-3xl font-black text-[#17ad96]">{totalBids}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[#12171e] border border-white/5 space-y-1">
                        <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Awarded</p>
                        <p className="text-3xl font-black text-[#17ad96]">{awardedMissions}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[#12171e] border border-white/5 space-y-1">
                        <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Open Missions</p>
                        <p className="text-3xl font-black text-white">{openMissions}</p>
                    </div>
                </div>

                {/* Mission Feed */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-sm font-black text-gray-500 uppercase tracking-[0.4em]">Mission Log</h2>
                        <div className="flex-1 h-px bg-white/5"></div>
                    </div>

                    {jobs.length === 0 ? (
                        <div className="p-20 text-center rounded-3xl border border-dashed border-white/10 bg-[#12171e]/50 space-y-6">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                                <Zap className="w-8 h-8 text-gray-800" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-400 uppercase italic">No Active Operations Found</h3>
                                <p className="text-gray-600 max-w-sm mx-auto text-sm font-medium">Initialize your first drone operation to begin enlisting elite pilots.</p>
                            </div>
                            <Link href="/jobs/new">
                                <Button variant="outline" className="border-white/10 text-white font-bold hover:bg-[#17ad96] hover:text-[#0a0d11] transition-all">
                                    Create Mission Briefing
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {jobs.map((job: any) => (
                                <Link key={job.id} href={`/jobs/${job.id}`} className="group">
                                    <div className="p-8 rounded-2xl bg-[#12171e] border border-white/5 hover:border-[#17ad96]/40 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#17ad96]/5 blur-3xl rounded-full translate-x-16 -translate-y-16"></div>

                                        <div className="space-y-3 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${job.status === "OPEN"
                                                    ? "bg-[#17ad96]/20 text-[#17ad96] border-[#17ad96]/30"
                                                    : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                                    }`}>
                                                    {job.status}
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-600 tracking-widest uppercase flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3" /> {new Date(job.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-black text-white group-hover:text-[#17ad96] transition-colors leading-none uppercase italic tracking-tighter">
                                                {job.title}
                                            </h3>
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-600 tracking-widest uppercase">
                                                <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-[#17ad96]" /> {job.location}</span>
                                                <span className="flex items-center gap-1.5"><Briefcase className="w-3 h-3 text-[#17ad96]" /> {job.category}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8 w-full md:w-auto relative z-10">
                                            <div className="flex-1 md:flex-none p-4 rounded-xl bg-black/40 border border-white/5 text-center min-w-[120px]">
                                                <div className="text-2xl font-black text-white leading-none">{job._count?.proposals || 0}</div>
                                                <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">Incoming Bids</div>
                                            </div>
                                            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-white group-hover:bg-[#17ad96] group-hover:text-[#0a0d11] transition-all group-hover:translate-x-1">
                                                <ChevronRight className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
