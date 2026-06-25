"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { orderPackage } from "@/app/actions/package"
import { ArrowRight } from "lucide-react"

export function OrderPackageButton({ packageId }: { packageId: string }) {
    const { data: session } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    if (!session?.user?.email) {
        return <Link href="/login" className="block"><Button className="w-full bg-[#5BC2E7] hover:bg-[#3aa9d4] text-[#0f1722] font-bold h-11 rounded-xl">Sign in to order</Button></Link>
    }
    if (session.user.role !== "CLIENT") {
        return <p className="text-[11px] text-gray-500 text-center">Sign in as a customer to order</p>
    }

    async function order() {
        setLoading(true); setError("")
        const res = await orderPackage(packageId, session!.user!.email!)
        if ((res as any)?.error) { setError((res as any).error); setLoading(false) }
        else router.push(`/jobs/${(res as any).jobId}`)
    }

    return (
        <div className="space-y-2">
            <Button onClick={order} disabled={loading} className="w-full bg-[#5BC2E7] hover:bg-[#3aa9d4] text-[#0f1722] font-bold h-11 rounded-xl">
                {loading ? "Placing order..." : <>Order now <ArrowRight className="ml-1 w-4 h-4" /></>}
            </Button>
            {error && <p className="text-[11px] font-bold text-red-400 text-center">{error}</p>}
        </div>
    )
}
