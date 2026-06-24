"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Heart } from "lucide-react"
import { toggleSaved } from "@/app/actions/favourite"

export function SaveButton({ operatorId, initialSaved = false }: { operatorId: string; initialSaved?: boolean }) {
    const { data: session } = useSession()
    const [saved, setSaved] = useState(initialSaved)
    const [loading, setLoading] = useState(false)

    if (!session?.user?.email || session.user.role !== "CLIENT") return null

    async function toggle(e: React.MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
        if (loading) return
        setLoading(true)
        const res = await toggleSaved(operatorId, session!.user!.email!)
        if ((res as any)?.success) setSaved(!!(res as any).saved)
        setLoading(false)
    }

    return (
        <button
            onClick={toggle}
            aria-label={saved ? "Remove from saved" : "Save operator"}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 border border-white/5 hover:border-[#FB7427]/40 transition-all"
        >
            <Heart className={`w-4 h-4 ${saved ? "fill-[#FB7427] text-[#FB7427]" : "text-gray-400"}`} />
        </button>
    )
}
