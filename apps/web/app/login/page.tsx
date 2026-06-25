"use client"

import { signIn } from "next-auth/react"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ShieldCheck, Lock, Mail, ArrowRight, Plane, Briefcase } from "lucide-react"

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError("Sign in failed. Please check your email and password.")
            } else if (result?.ok) {
                router.push(callbackUrl)
                router.refresh()
            }
        } catch (e) {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0f1722] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                {/* Brand Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5BC2E7]/10 border border-[#5BC2E7]/20 mx-auto">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#5BC2E7]" />
                        <span className="text-[10px] font-bold text-[#5BC2E7] uppercase tracking-[0.2em]">Welcome back</span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Sign in</h1>
                    <p className="text-gray-500 text-sm font-medium italic">Sign in to your account.</p>
                </div>

                <Card className="bg-[#18222e] border-white/5 shadow-2xl shadow-black/50 overflow-hidden rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-white text-lg font-bold uppercase tracking-widest hidden">Sign In</CardTitle>
                        <CardDescription className="text-gray-500 font-medium"> Sign in to continue.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 text-xs font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-gray-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                        <Mail className="w-3 h-3 text-[#5BC2E7]" /> Email
                                    </label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="pilot@dronehub.global"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-[#0f1722] border-white/5 h-12 text-white placeholder:text-gray-700 focus:border-[#5BC2E7]/50 rounded-xl transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-gray-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                        <Lock className="w-3 h-3 text-[#5BC2E7]" /> Password
                                    </label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="bg-[#0f1722] border-white/5 h-12 text-white placeholder:text-gray-700 focus:border-[#5BC2E7]/50 rounded-xl transition-all"
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full bg-[#5BC2E7] hover:bg-[#3aa9d4] text-[#0f1722] font-black uppercase tracking-tighter h-14 rounded-xl shadow-lg shadow-[#5BC2E7]/5 group transition-all active:scale-[0.98]" disabled={loading}>
                                {loading ? "Signing in..." : (
                                    <span className="flex items-center gap-2">
                                        Sign in <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </Button>

                            <div className="text-center pt-4">
                                <Link href="/register" className="text-[10px] font-bold text-gray-500 hover:text-[#5BC2E7] uppercase tracking-[0.2em] transition-colors">
                                    New here? Create an account
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Demo Credentials Box */}
                <div className="p-6 rounded-2xl bg-[#5BC2E7]/5 border border-[#5BC2E7]/10 space-y-4">
                    <h3 className="text-[10px] font-black text-[#5BC2E7] uppercase tracking-[0.3em]">Demo accounts</h3>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div
                            className="p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:border-[#5BC2E7]/30 transition-all group"
                            onClick={() => { setEmail("pilot@dronehub.global"); setPassword("demo123") }}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Plane className="w-3 h-3 text-[#5BC2E7]" />
                                <span className="text-[9px] font-bold text-white uppercase">Operator</span>
                            </div>
                            <p className="text-[8px] text-gray-500 font-bold truncate">pilot@dronehub.global</p>
                        </div>
                        <div
                            className="p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:border-[#5BC2E7]/30 transition-all group"
                            onClick={() => { setEmail("realestate@example.com"); setPassword("demo123") }}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Briefcase className="w-3 h-3 text-[#5BC2E7]" />
                                <span className="text-[9px] font-bold text-white uppercase">Client</span>
                            </div>
                            <p className="text-[8px] text-gray-500 font-bold truncate">realestate@example.com</p>
                        </div>
                        <div
                            className="p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:border-[#5BC2E7]/30 transition-all group"
                            onClick={() => { setEmail("commander@dronehub.global"); setPassword("admin123") }}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck className="w-3 h-3 text-[#5BC2E7]" />
                                <span className="text-[9px] font-bold text-white uppercase">Admin</span>
                            </div>
                            <p className="text-[8px] text-gray-500 font-bold truncate">commander@dronehub.global</p>
                        </div>
                    </div>
                    <p className="text-[8px] text-gray-600 font-bold">Demo logins for testing. Click to fill, then sign in.</p>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0f1722] flex items-center justify-center"><div className="text-[#5BC2E7] font-bold tracking-widest uppercase text-sm animate-pulse">Loading...</div></div>}>
            <LoginContent />
        </Suspense>
    )
}
