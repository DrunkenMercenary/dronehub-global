"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Button } from "@/components/ui/button"
import { updateDisplayName, changePassword } from "@/app/actions/account"

export function AccountSettings({ account }: { account: { email: string | null; role: string; name: string; hasPassword: boolean } }) {
    const { data: session } = useSession()
    const router = useRouter()
    const email = session?.user?.email || account.email || ""

    const [name, setName] = useState(account.name)
    const [nameMsg, setNameMsg] = useState<{ ok?: boolean; text: string } | null>(null)
    const [nameLoading, setNameLoading] = useState(false)

    const [cur, setCur] = useState("")
    const [next, setNext] = useState("")
    const [pwMsg, setPwMsg] = useState<{ ok?: boolean; text: string } | null>(null)
    const [pwLoading, setPwLoading] = useState(false)

    async function saveName() {
        setNameLoading(true); setNameMsg(null)
        const res = await updateDisplayName(email, name)
        setNameLoading(false)
        if ((res as any)?.error) setNameMsg({ text: (res as any).error })
        else { setNameMsg({ ok: true, text: "Saved" }); router.refresh() }
    }
    async function savePassword() {
        setPwLoading(true); setPwMsg(null)
        const res = await changePassword(email, cur, next)
        setPwLoading(false)
        if ((res as any)?.error) setPwMsg({ text: (res as any).error })
        else { setPwMsg({ ok: true, text: "Password updated" }); setCur(""); setNext("") }
    }

    return (
        <div className="space-y-8 max-w-xl">
            <div className="p-8 rounded-2xl bg-[#18222e] border border-white/5 space-y-5">
                <h2 className="text-lg font-bold text-white">Profile</h2>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Display name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-[#0f1722] border-white/5 h-12 text-white rounded-xl" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</label>
                    <Input value={account.email || ""} disabled className="bg-[#0f1722]/50 border-white/5 h-12 text-gray-500 rounded-xl" />
                </div>
                {nameMsg && <p className={`text-xs font-bold ${nameMsg.ok ? "text-green-400" : "text-red-400"}`}>{nameMsg.text}</p>}
                <Button onClick={saveName} disabled={nameLoading} className="bg-[#5BC2E7] hover:bg-[#3aa9d4] text-[#0f1722] font-bold h-11 px-6 rounded-xl">{nameLoading ? "Saving..." : "Save changes"}</Button>
            </div>

            {account.hasPassword && (
                <div className="p-8 rounded-2xl bg-[#18222e] border border-white/5 space-y-5">
                    <h2 className="text-lg font-bold text-white">Password</h2>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current password</label>
                        <PasswordInput value={cur} onChange={(e) => setCur(e.target.value)} className="bg-[#0f1722] border-white/5 h-12 text-white rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">New password</label>
                        <PasswordInput value={next} onChange={(e) => setNext(e.target.value)} className="bg-[#0f1722] border-white/5 h-12 text-white rounded-xl" />
                    </div>
                    {pwMsg && <p className={`text-xs font-bold ${pwMsg.ok ? "text-green-400" : "text-red-400"}`}>{pwMsg.text}</p>}
                    <Button onClick={savePassword} disabled={pwLoading} className="bg-[#FB7427] hover:bg-[#e8651a] text-[#0f1722] font-bold h-11 px-6 rounded-xl">{pwLoading ? "Updating..." : "Update password"}</Button>
                </div>
            )}
        </div>
    )
}
