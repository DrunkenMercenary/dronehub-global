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
import { CompleteJobButton } from "@/components/client/CompleteJobButton"
import { ReviewForm } from "@/components/client/ReviewForm"
import { StarRating } from "@/components/shared/StarRating"
import { PayButton } from "@/components/client/PayButton"
import { getJobPayment } from "@/app/actions/payment"
import { isPaymentsEnabled } from "@/lib/stripe"

export const dynamic = 'force-dynamic'

async function getJobData(id: string) {
    try {
        const job = await prisma.jobRequest.findUnique({
            where: { id },
            include: {
                client: true,
                documents: true,
                review: { include: { client: { select: { name: true } } } },
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
    const payment = await getJobPayment(job.id)
    const paymentsEnabled = isPaymentsEnabled()
    const isAwardedOperator = isOperator && operatorProfileId === awardedProposal?.operatorId
    const isActive = job.status === "AWARDED" || job.status === "COMPLETED"
    const canChat = (isClient && isActive) || (isAwardedOperator && isActive)

    if (canChat && awardedProposal) {
        thread = await getOrCreateThread(job.id, job.clientId, awardedProposal.operatorId)
        if (thread) {
            messages = await getMessages(thread.id)
        }
    }

    return (
        <div className="min-h-screen bg-[#0f1722] py-16 md:py-24">
            <div className="container px-4 md:px-6">

                {/* Job header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="inline-block px-3 py-1 rounded-full bg-[#5BC2E7]/10 border border-[#5BC2E7]/20 text-[#5BC2E7] text-[10px] font-bold tracking-[0.2em] uppercase">
                                Job #{job.id.slice(-6).toUpperCase()}
                            </span>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${job.status === "OPEN"
                                ? "bg-[#5BC2E7]/20 text-[#5BC2E7] border-[#5BC2E7]/30"
                                : "bg-[#FB7427]/20 text-[#FB7427] border-[#FB7427]/30"
                                }`}>
                                {job.status}
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none uppercase italic">
                            {job.title}
                        </h1>
                        <div className="flex flex-wrap gap-6 text-[11px] font-bold text-gray-500 tracking-widest uppercase">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#5BC2E7]" /> {job.location}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#5BC2E7]" /> {new Date(job.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-[#5BC2E7]" /> {job.category}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-12 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Description Card */}
                        <div className="p-10 rounded-2xl bg-[#18222e] border border-white/5 space-y-8">
                            <h2 className="text-2xl font-black text-white flex items-center gap-4 italic uppercase tracking-tighter">
                                <Zap className="w-6 h-6 text-[#5BC2E7]" /> Job description
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
                                        Messages <span className="text-[#5BC2E7]/50 ml-2"></span>
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
                        {isActive && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter shrink-0">
                                        Deliverables
                                    </h2>
                                    <div className="flex-1 h-px bg-white/5"></div>
                                </div>

                                <div className="grid gap-8 md:grid-cols-2">
                                    {/* Upload Area for Operator */}
                                    {isAwardedOperator && (
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Upload files</p>
                                            <FileUploader
                                                label="Upload deliverables"
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
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Files</p>
                                        {(job.documents || []).length === 0 ? (
                                            <div className="p-10 rounded-2xl bg-black/20 border border-white/5 flex flex-col items-center justify-center text-center space-y-2 opacity-50">
                                                <FileDown className="w-8 h-8 text-gray-700" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">No files yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {(job.documents || []).map((doc: any) => (
                                                    <div key={doc.id} className="p-4 rounded-xl bg-[#18222e] border border-white/5 flex items-center justify-between hover:border-[#FB7427]/30 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-lg bg-[#FB7427]/10 flex items-center justify-center border border-[#FB7427]/20">
                                                                <FileDown className="w-5 h-5 text-[#FB7427]" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white truncate max-w-[150px]">{doc.name}</p>
                                                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Added {new Date(doc.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-[#FB7427] p-2 hover:bg-[#FB7427]/10 rounded-lg transition-colors">
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

                        {/* Project status + review */}
                        {(isClient || isAwardedOperator) && isActive && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter shrink-0">
                                        Project <span className="text-[#FB7427]">Status</span>
                                    </h2>
                                    <div className="flex-1 h-px bg-white/5"></div>
                                </div>

                                {/* Payment */}
                                {awardedProposal && (
                                    <div className="p-6 rounded-2xl bg-[#18222e] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <p className="text-white font-bold">Payment</p>
                                            <p className="text-sm text-gray-500">
                                                {payment?.status === "PAID"
                                                    ? "This job has been paid."
                                                    : `Agreed price: $${Number(awardedProposal.price).toLocaleString()}`}
                                            </p>
                                        </div>
                                        {payment?.status === "PAID" ? (
                                            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest border px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 border-green-500/30">Paid</span>
                                        ) : isClient && paymentsEnabled ? (
                                            <PayButton jobId={job.id} amount={Number(awardedProposal.price)} />
                                        ) : isClient ? (
                                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Online payment coming soon</span>
                                        ) : (
                                            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">Awaiting payment</span>
                                        )}
                                    </div>
                                )}

                                {job.status === "AWARDED" && isClient && (
                                    <div className="p-6 rounded-2xl bg-[#18222e] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <p className="text-white font-bold">Work delivered?</p>
                                            <p className="text-sm text-gray-500">Mark this job complete to leave a review.</p>
                                        </div>
                                        <CompleteJobButton jobId={job.id} />
                                    </div>
                                )}

                                {job.status === "AWARDED" && isAwardedOperator && (
                                    <p className="text-sm text-gray-500">Waiting for the client to mark this job complete.</p>
                                )}

                                {job.review && (
                                    <div className="p-6 rounded-2xl bg-[#18222e] border border-white/5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <StarRating value={job.review.rating} size="lg" />
                                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{new Date(job.review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {job.review.comment && <p className="text-gray-300 leading-relaxed">&ldquo;{job.review.comment}&rdquo;</p>}
                                        <p className="text-[11px] font-bold text-gray-500">Review by {job.review.client?.name || "Client"}</p>
                                    </div>
                                )}

                                {job.status === "COMPLETED" && isClient && !job.review && (
                                    <ReviewForm jobId={job.id} />
                                )}
                            </div>
                        )}

                        {/* Action Area */}
                        {isOperator && hasApplied && (
                            <div className="p-10 rounded-2xl bg-[#18222e] border-2 border-[#5BC2E7]/30 shadow-2xl shadow-[#5BC2E7]/5 mb-8">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-6">
                                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter shrink-0">
                                            Your <span className="text-[#5BC2E7]">Proposal</span>
                                        </h2>
                                        <div className="flex-1 h-px bg-white/5"></div>
                                    </div>
                                    {(() => {
                                        const myProposal = job.proposals.find((p: any) => p.operatorId === operatorProfileId)
                                        return (
                                            <div className="p-8 rounded-2xl bg-black/40 border border-white/5 space-y-6 overflow-hidden">
                                                <div className="flex justify-end">
                                                    <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${myProposal?.status === "ACCEPTED"
                                                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                        : myProposal?.status === "REJECTED"
                                                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                                                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
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
                                                    <p className="text-[10px] font-black text-[#5BC2E7] uppercase tracking-[0.2em]">Cover Letter / Remarks</p>
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
                            <div className="p-10 rounded-2xl bg-[#18222e] border-2 border-[#5BC2E7]/30 shadow-2xl shadow-[#5BC2E7]/5">
                                <ProposalForm jobId={job.id} operatorId={operatorProfileId!} />
                            </div>
                        )}

                        {/* Client View - Proposals Received */}
                        {isClient && (
                            <div className="space-y-8 pt-8 border-t border-white/5">
                                <div className="flex items-center gap-6">
                                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter shrink-0">
                                        Incoming Proposals <span className="text-[#5BC2E7]/50 ml-2">[{job.proposals?.length || 0}]</span>
                                    </h2>
                                    <div className="flex-1 h-px bg-white/5"></div>
                                </div>

                                {!job.proposals || job.proposals.length === 0 ? (
                                    <div className="p-20 rounded-2xl border border-dashed border-white/10 bg-[#18222e]/30 text-center space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                                            <ShieldAlert className="w-8 h-8 text-gray-800" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-500 uppercase italic">Awaiting Pilot Responses</h3>
                                        <p className="text-gray-600 max-w-sm mx-auto text-sm font-medium uppercase tracking-tight">Operators are reviewing your job. Proposals will appear here as they come in.</p>
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
                        <div className="p-10 rounded-2xl bg-[#18222e] border border-white/5 space-y-8">
                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Messageser</h3>
                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 rounded-2xl bg-[#5BC2E7]/10 flex items-center justify-center border border-[#5BC2E7]/20 shadow-lg shadow-[#5BC2E7]/5">
                                    <User className="h-8 w-8 text-[#5BC2E7]" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xl font-black text-white leading-tight italic uppercase tracking-tight">{job.client.name}</div>
                                    <div className="flex items-center gap-1.5 text-[9px] text-[#5BC2E7] font-black tracking-[0.2em] uppercase">
                                        <ShieldCheck className="w-3 h-3" /> Verified
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Sidebar */}
                        <div className="p-8 rounded-2xl bg-[#18222e]/50 border border-white/5 space-y-6">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                <span>Security Level</span>
                                <span className="text-[#5BC2E7]">Encrypted</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                <span>Airspace Verified</span>
                                <span className="text-[#FB7427]">Class G/B/D</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                <span>Insurance Req</span>
                                <span className="text-white">$2M Liability</span>
                            </div>
                        </div>

                        {/* Help Notice */}
                        <div className="p-6 rounded-2xl border border-dashed border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#5BC2E7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-[10px] text-gray-500 leading-relaxed uppercase font-bold tracking-widest text-center relative z-10">
                                Protected by DroneHub.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
