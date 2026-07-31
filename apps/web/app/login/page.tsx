"use client"

import { signIn, getProviders } from "next-auth/react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ShieldCheck, Lock, Mail, ArrowRight } from "lucide-react"

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    // Only show the Google button when the Google provider is actually
    // configured (keys present), so there is never a dead button in production.
    const [googleEnabled, setGoogleEnabled] = useState(false)

    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

    useEffect(() => {
        getProviders().then((p) => setGoogleEnabled(!!p?.google)).catch(() => setGoogleEnabled(false))
    }, [])

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
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        placeholder="Your password"
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

                            {googleEnabled && (
                                <>
                                    <div className="flex items-center gap-3">
                                        <div className="h-px flex-1 bg-white/5" />
                                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em]">or</span>
                                        <div className="h-px flex-1 bg-white/5" />
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={() => signIn("google", { callbackUrl })}
                                        className="w-full bg-white hover:bg-gray-100 text-[#0f1722] font-bold h-14 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
                                        </svg>
                                        Continue with Google
                                    </Button>
                                </>
                            )}

                            <div className="text-center pt-4">
                                <Link href="/register" className="text-[10px] font-bold text-gray-500 hover:text-[#5BC2E7] uppercase tracking-[0.2em] transition-colors">
                                    New here? Create an account
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
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
