import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { getOperatorProposals } from "@/app/actions/proposal"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Calendar, Briefcase, ChevronRight, FileText, MapPin, DollarSign } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function OperatorProposalsPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        redirect("/login")
    }

    const proposals = await getOperatorProposals(session.user.email)

    return (
        <div className="min-h-screen bg-[#0a0d11] py-16 md:py-24">
            <div className="container px-4 md:px-6">

                {/* Header Area */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17ad96]/10 border border-[#17ad96]/20">
                            <FileText className="w-3.5 h-3.5 text-[#17ad96]" />
                            <span className="text-[10px] font-bold text-[#17ad96] uppercase tracking-[0.2em]">Pilot Logbook</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">
                            Mission <span className="text-[#17ad96]">Proposals</span>
                        </h1>
                        <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-xl">
                            Track your active bids, history, and mission awards.
                        </p>
                    </div>
                </div>

                {/* Proposals List */}
                <div className="space-y-6">
                    {proposals.length === 0 ? (
                        <div className="p-20 text-center rounded-3xl border border-dashed border-white/10 bg-[#12171e]/50 space-y-6">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                                <FileText className="w-8 h-8 text-gray-800" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-400 uppercase italic">No Proposals Transmitted</h3>
                                <p className="text-gray-600 max-w-sm mx-auto text-sm font-medium">You haven't submitted any bids for open missions yet.</p>
                            </div>
                            <Link href="/jobs">
                                <Button className="bg-[#17ad96] text-[#0a0d11] font-bold hover:bg-[#159a85] transition-all">
                                    Browse Available Missions
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {proposals.map((proposal: any) => (
                                <Link key={proposal.id} href={`/jobs/${proposal.jobId}`} className="group">
                                    <div className="p-8 rounded-2xl bg-[#12171e] border border-white/5 hover:border-[#17ad96]/40 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
                                        <div className="space-y-4 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${proposal.status === "ACCEPTED"
                                                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                        : proposal.status === "REJECTED"
                                                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                                                            : "bg-[#17ad96]/20 text-[#17ad96] border-[#17ad96]/30"
                                                    }`}>
                                                    {proposal.status}
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-600 tracking-widest uppercase flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3" /> Submitted {new Date(proposal.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-black text-white group-hover:text-[#17ad96] transition-colors leading-none uppercase italic tracking-tighter">
                                                {proposal.job.title}
                                            </h3>
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-600 tracking-widest uppercase">
                                                <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-[#17ad96]" /> {proposal.job.location}</span>
                                                <span className="flex items-center gap-1.5"><Briefcase className="w-3 h-3 text-[#17ad96]" /> {proposal.job.category}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8 w-full md:w-auto relative z-10">
                                            <div className="flex-1 md:flex-none p-4 rounded-xl bg-black/40 border border-white/5 text-center min-w-[140px]">
                                                <div className="text-2xl font-black text-white leading-none flex items-center justify-center gap-1">
                                                    <DollarSign className="w-4 h-4 text-[#17ad96]" /> {Number(proposal.price).toLocaleString()}
                                                </div>
                                                <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1 text-center">Your Bid Amount</div>
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
