"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { ProposalCard } from "./ProposalCard"
import { awardProposal } from "@/app/actions/proposal"
import { useRouter } from "next/navigation"

interface AwardProposalClientProps {
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
    canAward: boolean
}

export function AwardProposalClient({ proposal, canAward }: AwardProposalClientProps) {
    const [isAwarding, setIsAwarding] = useState(false)
    const { data: session } = useSession()
    const router = useRouter()

    async function handleAward(proposalId: string) {
        if (!session?.user?.email) return

        setIsAwarding(true)
        try {
            const result = await awardProposal(proposalId, session.user.email)
            if (result?.error) {
                alert(result.error)
            } else {
                router.refresh()
            }
        } catch (error) {
            console.error("Award error:", error)
            alert("Failed to award proposal")
        } finally {
            setIsAwarding(false)
        }
    }

    return (
        <ProposalCard
            proposal={proposal}
            onAward={handleAward}
            isAwarding={isAwarding}
            canAward={canAward}
        />
    )
}
