"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { getUnreadCount } from "@/app/actions/notification"

export function NotificationBell() {
    const { data: session } = useSession()
    const [count, setCount] = useState(0)

    useEffect(() => {
        const email = session?.user?.email
        if (!email) return
        let active = true
        const load = async () => {
            try {
                const c = await getUnreadCount(email)
                if (active) setCount(c)
            } catch { /* ignore */ }
        }
        load()
        const t = setInterval(load, 30000)
        return () => { active = false; clearInterval(t) }
    }, [session?.user?.email])

    if (!session?.user?.email) return null

    return (
        <Link
            href="/notifications"
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-[#FB7427] hover:border-[#FB7427]/30 transition-all"
            aria-label="Notifications"
        >
            <Bell className="w-5 h-5" />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FB7427] text-[#0f1722] text-[10px] font-black flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                </span>
            )}
        </Link>
    )
}
