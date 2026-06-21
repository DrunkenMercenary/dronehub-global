import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import {
    MapPin,
    Calendar,
    User,
    ShieldCheck,
    Briefcase,
    Zap,
    ShieldAlert,
    FileDown,
    ArrowUpRight
} from "lucide-react"

import { ProposalForm } from "@/components/operator/ProposalForm"
import { AwardProposalClient } from "@/components/client/AwardProposalClient"
import { getOrCreateThread, getMessages } from "@/app/actions/message"
import { ChatThread } from "@/components/messaging/ChatThread"
import { FileUploader } from "@/components/shared/FileUploader"
import { addDocument } from "@/app/actions/document"

export const dynamic = 'force-dynamic'

async function getJobData(id: string) {
    try {
        const job = await prisma.jobRequest.findUnique({
            where: { id },
            include: {
                client: true,
                documents: true,
                proposals: {
                    include: {
                        operator: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })
        return job
    } catch (error) {
        console.error("DB Error in JobDetail:", error)
        return null
    }
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params
    const id = resolvedParams.id

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) redirect("/login")

    const job = await getJobData(id)
    if (!job) notFound()

    // Determine user role and profile in a resilient way
    let userRole = session.user.role || "CLIENT"
    let operatorProfileId = null
    let clientProfileId = null

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { operatorProfile: true, clientProfile: true }
        })
        if (user) {
            userRole = user.role
            operatorProfileId = user.operatorProfile?.id
            clientProfileId = user.clientProfile?.id
        }
    } catch (e) {
        console.error("Error fetching user profile:", e)
    }

    const isOperator = userRole === "OPERATOR"
    const isClient = clientProfileId === job.clientId
    const hasApplied = isOperator && (job.proposals || []).some((p: any) => p.operatorId === operatorProfileId)

    // Messaging Setup
    let thread = null
    let messages: any[] = []
    const awardedProposal = (job.proposals || []).find((p: any) => p.status === "ACCEPTED")
    const isAwardedOperator = isOperator && operatorProfileId === awardedProposal?.operatorId
    const canChat = (isClient && job.status === "AWARDED") || (isAwardedOperator && job.status === "AWARDED")

    if (canChat && awardedProposal) {
        thread = await getOrCreateThread(job.id, job.clientId, awardedProposal.operatorId)
        if (thread) {
            messages = await getMessages(thread.id)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0d11] py-16 md:py-24">
            <div className="container px-4 md:px-6">

                {/* Mission Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="inline-block px-3 py-1 rounded-full bg-[#17ad96]/10 border border-[#17ad96]/20 text-[#17ad96] text-[10px] font-bold tracking-[0.2em] uppercase">
                                Mission #{job.id.slice(-6).toUpperCase()}
                            </span>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${job.status === "OPEN"
                                ? "bg-[#17ad96]/20 text-[#17ad96] border-[#17ad96]/30"
                                : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                }`}>
                                {job.status}
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none uppercase italic">
                            {job.title}
                        </h1>
                        <div className="flex flex-wrap gap-6 text-[11px] font-bold text-gray-500 tracking-widest uppercase">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#17ad96]" /> {job.location}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#17ad96]" /> {new Date(job.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-[#17ad96]" /> {job.category}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-12 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Description Card */}
                        <div className="p-10 rounded-2xl bg-[#12171e] border border-white/5 space-y-8">
                            <h2 className="text-2xl font-black text-white flex items-center gap-4 italic uppercase tracking-tighter">
                                <Zap className="w-6 h-6 text-[#17ad96]" /> Mission Briefing
                            </h2>
                            <div className="h-px bg-white/5 w-full"></div>
                            <div className="prose prose-invert max-w-none">
                                <p className="whitespace-pre-wrap text-gray-400 text-lg leading-relaxed font-medium">
                                    {job.description}
                                </p>
                            </div>
                        </div>

                        {/* Messaging Area */}
                        {canChat && thread && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter shrink-0">
                                        Mission Command <span className="text-[#17ad96]/50 ml-2">Secure Link</span>
                                    </h2>
                                    <div className="flex-1 h-px bg-white/5"></div>
                                </div>
                                <ChatThread
                                    threadId={thread.id}
                                    currentUserId={session.user.id}
                                    initialMessages={messages}
                                />
                            </div>
                        )}

                        {/* Deliverables Section */}
                        {job.status === "AWARDED" && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter shrink-0">
                                        Mission <span className="text-blue-400">Deliverables</span>
                                    </h2>
                                    <div className="flex-1 h-px bg-white/5"></div>
                                </div>

                                <div className="grid gap-8 md:grid-cols-2">
                                    {/* Upload Area for Operator */}
                                    {isAwardedOperator && (
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Upload Dispatch Assets</p>
                                            <FileUploader
                                                label="Upload Final Assets"
                                                onUpload={async (url, name) => {
                                                    "use server"
                                                    await addDocument({
                                                        url,
                                                        name,
                                                        type: "DELIVERABLE",
                                                        jobId: job.id
                                                    })
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Assets List */}
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Available Assets</p>
                                        {(job.documents || []).length === 0 ? (
                                            <div className="p-10 rounded-2xl bg-black/20 border border-white/5 flex flex-col items-center justify-center text-center space-y-2 opacity-50">
                                                <FileDown className="w-8 h-8 text-gray-700" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">No assets transmitted yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {(job.documents || []).map((doc: any) => (
                                                    <div key={doc.id} className="p-4 rounded-xl bg-[#12171e] border border-white/5 flex items-center justify-between hover:border-blue-400/30 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-lg bg-blue-400/10 flex items-center justify-center border border-blue-400/20">
                                                                <FileDown className="w-5 h-5 text-blue-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white truncate max-w-[150px]">{doc.name}</p>
                                                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Added {new Date(doc.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 p-2 hover:bg-blue-400/10 rounded-lg transition-colors">
                                                            <ArrowUpRight className="w-5 h-5" />
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Area */}
                        {isOperator && hasApplied && (
                            <div className="p-10 rounded-2xl bg-[#12171e] border-2 border-[#17ad96]/30 shadow-2xl shadow-[#17ad96]/5 mb-8">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-6">
                                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter shrink-0">
                                            Your <span className="text-[#17ad96]">Proposal</span>
                                        </h2>
                                        <div className="flex-1 h-px bg-white/5"></div>
                                    </div>
                                    {(() => {
                                        const myProposal = job.proposals.find((p: any) => p.operatorId === operatorProfileId)
                                        return (
                                            <div className="p-8 rounded-2xl bg-black/40 border border-white/5 space-y-6 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4">
                                                    <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${myProposal?.status === "ACCEPTED"
                                                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                        : myProposal?.status === "REJECTED"
                                                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                                                            : "bg-[#17ad96]/20 text-[#17ad96] border-[#17ad96]/30"
                                                        }`}>
                                                        {myProposal?.status}
                                                    </div>
                                                </div>

                                                <div className="grid gap-8 md:grid-cols-2">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Your Bid</p>
                                                        <p className="text-3xl font-black text-white tracking-tighter italic">
                                                            ${Number(myProposal?.price || 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1 md:text-right">
                                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Submitted On</p>
                                                        <p className="text-sm font-bold text-gray-400">
                                                            {myProposal?.createdAt ? new Date(myProposal.createdAt).toLocaleDateString() : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="p-6 rounded-xl bg-black/20 border border-white/5 space-y-2">
                                                    <p className="text-[10px] font-black text-[#17ad96] uppercase tracking-[0.2em]">Cover Letter / Remarks</p>
                                                    <p className="text-sm text-gray-400 font-medium leading-relaxed italic">
                                                        "{myProposal?.message}"
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })()}
                                </div>
                            </div>
                        )}

                        {isOperator && job.status === "OPEN" && !hasApplied && (
                            <div className="p-10 rounded-2xl bg-[#12171e] border-2 border-[#17ad96]/30 shadow-2xl shadow-[#17ad96]/5">
                                <ProposalForm jobId={job.id} operatorId={operatorProfileId!} />
                            </div>
                        )}

                        {/* Client View - Proposals Received */}
                        {isClient && (
                            <div className="space-y-8 pt-8 border-t border-white/5">
                                <div className="flex items-center gap-6">
                                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter shrink-0">
                                        Incoming Proposals <span className="text-[#17ad96]/50 ml-2">[{job.proposals?.length || 0}]</span>
                                    </h2>
                                    <div className="flex-1 h-px bg-white/5"></div>
                                </div>

                                {!job.proposals || job.proposals.length === 0 ? (
                                    <div className="p-20 rounded-2xl border border-dashed border-white/10 bg-[#12171e]/30 text-center space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                                            <ShieldAlert className="w-8 h-8 text-gray-800" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-500 uppercase italic">Awaiting Pilot Responses</h3>
                                        <p className="text-gray-600 max-w-sm mx-auto text-sm font-medium uppercase tracking-tight">Certified operators are currently analyzing your mission requirements and airspace restrictions.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6">
                                        {job.proposals.map((proposal: any) => (
                                            <AwardProposalClient
                                                key={proposal.id}
                                                proposal={{
                                                    id: proposal.id,
                                                    price: Number(proposal.price),
                                                    message: proposal.message,
                                                    status: proposal.status,
                                                    createdAt: proposal.createdAt,
                                                    operator: {
                                                        name: proposal.operator.name,
                                                        description: proposal.operator.description
                                                    }
                                                }}
                                                canAward={job.status === "OPEN"}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Client Details Card */}
                        <div className="p-10 rounded-2xl bg-[#12171e] border border-white/5 space-y-8">
                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Mission Commander</h3>
                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 rounded-2xl bg-[#17ad96]/10 flex items-center justify-center border border-[#17ad96]/20 shadow-lg shadow-[#17ad96]/5">
                                    <User className="h-8 w-8 text-[#17ad96]" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xl font-black text-white leading-tight italic uppercase tracking-tight">{job.client.name}</div>
                                    <div className="flex items-center gap-1.5 text-[9px] text-[#17ad96] font-black tracking-[0.2em] uppercase">
                                        <ShieldCheck className="w-3 h-3" /> Alpha Status
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Sidebar */}
                        <div className="p-8 rounded-2xl bg-[#12171e]/50 border border-white/5 space-y-6">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                <span>Security Level</span>
                                <span className="text-[#17ad96]">Encrypted</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                <span>Airspace Verified</span>
                                <span className="text-blue-400">Class G/B/D</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                <span>Insurance Req</span>
                                <span className="text-white">$2M Liability</span>
                            </div>
                        </div>

                        {/* Help Notice */}
                        <div className="p-6 rounded-2xl border border-dashed border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#17ad96]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-[10px] text-gray-500 leading-relaxed uppercase font-bold tracking-widest text-center relative z-10">
                                Protected by DroneHub Secure Operations Protocol.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
