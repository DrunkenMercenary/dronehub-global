"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { completeJob } from "@/app/actions/review"
import { CheckCircle } from "lucide-react"

export function CompleteJobButton({ jobId }: { jobId: string }) {
    const { data: session } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function onClick() {
        if (!session?.user?.email) return
        setLoading(true)
        setError("")
        const res = await completeJob(jobId, session.user.email)
        setLoading(false)
        if (res?.error) setError(res.error)
        else router.refresh()
    }

    return (
        <div className="space-y-2">
            <Button
                onClick={onClick}
                disabled={loading}
                className="bg-[#FB7427] hover:bg-[#e8651a] text-[#0f1722] font-bold h-12 px-6 rounded-xl"
            >
                <CheckCircle className="w-4 h-4 mr-2" /> {loading ? "Updating..." : "Mark as completed"}
            </Button>
            {error && <p className="text-xs font-bold text-red-400">{error}</p>}
        </div>
    )
}
