"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DollarSign, Calendar, MessageSquare, ShieldCheck, User, ArrowUpRight, Zap } from "lucide-react"

interface ProposalCardProps {
    proposal: {
        id: string
        price: number
        message: string
        status: string
        createdAt: Date
        operator: {
            name: string
            description: string | null
        }
    }
    onAward?: (proposalId: string) => void
    isAwarding?: boolean
    canAward?: boolean
}

export function ProposalCard({ proposal, onAward, isAwarding, canAward = true }: ProposalCardProps) {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case "ACCEPTED":
                return "bg-green-500/20 text-green-400 border-green-500/30"
            case "REJECTED":
                return "bg-red-500/20 text-red-400 border-red-500/30"
            default:
                return "bg-amber-500/20 text-amber-400 border-amber-500/30"
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="group relative rounded-2xl bg-[#18222e] border border-white/5 hover:border-[#5BC2E7]/30 transition-all duration-300 overflow-hidden">
            <div className="p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center relative overflow-hidden group-hover:bg-[#5BC2E7]/10 transition-colors">
                            <span className="text-xl font-black text-white italic tracking-tighter relative z-10">{getInitials(proposal.operator.name)}</span>
                            <div className="absolute inset-0 bg-gradient-to-br from-[#5BC2E7]/5 to-transparent"></div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-white group-hover:text-[#5BC2E7] transition-colors uppercase italic tracking-tighter">
                                {proposal.operator.name}
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                <ShieldCheck className="w-3 h-3 text-[#5BC2E7]" /> Licensed Operator
                            </div>
                        </div>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(proposal.status)}`}>
                        {proposal.status}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Your price</p>
                        <p className="text-3xl font-black text-white tracking-tighter italic">
                            ${proposal.price.toLocaleString()} <span className="text-[12px] text-gray-500 not-italic uppercase tracking-widest ml-1 font-bold">USD</span>
                        </p>
                    </div>
                    <div className="space-y-2 md:text-right">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Scheduled Transmission</p>
                        <div className="flex items-center md:justify-end gap-2 text-xs font-bold text-gray-400 capitalize">
                            <Calendar className="w-3.5 h-3.5 text-[#5BC2E7]" /> {new Date(proposal.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-black/40 border border-white/5 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#5BC2E7] uppercase tracking-[0.2em]">
                        <Zap className="w-3 h-3" /> Proposal
                    </div>
                    <p className="text-sm text-gray-400 font-medium leading-relaxed italic">
                        "{proposal.message}"
                    </p>
                </div>

                {canAward && proposal.status === "PENDING" && onAward && (
                    <Button
                        onClick={() => onAward(proposal.id)}
                        disabled={isAwarding}
                        className="w-full bg-[#5BC2E7] hover:bg-[#3aa9d4] text-[#0f1722] font-black uppercase tracking-tighter h-14 rounded-xl shadow-lg shadow-[#5BC2E7]/5 group transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {isAwarding ? "Authorizing Award..." : (
                            <>
                                Award This Job <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Design Element */}
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#5BC2E7]/5 blur-3xl rounded-full translate-x-12 translate-y-12"></div>
        </div>
    )
}
