"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { createCheckoutSession } from "@/app/actions/payment"
import { CreditCard } from "lucide-react"

export function PayButton({ jobId, amount }: { jobId: string; amount: number }) {
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function pay() {
        if (!session?.user?.email) return
        setLoading(true); setError("")
        const res = await createCheckoutSession(jobId, session.user.email)
        if ((res as any)?.url) {
            window.location.href = (res as any).url
        } else {
            setError((res as any)?.error || "Could not start checkout")
            setLoading(false)
        }
    }

    return (
        <div className="space-y-2">
            <Button onClick={pay} disabled={loading} className="bg-[#5BC2E7] hover:bg-[#3aa9d4] text-[#0f1722] font-bold h-12 px-6 rounded-xl">
                <CreditCard className="w-4 h-4 mr-2" /> {loading ? "Redirecting to checkout..." : `Pay $${amount.toLocaleString()}`}
            </Button>
            {error && <p className="text-xs font-bold text-red-400">{error}</p>}
        </div>
    )
}
