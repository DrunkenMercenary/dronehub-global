"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Drone, Search, LayoutDashboard, Menu, LogOut, ChevronDown, Users, Scale } from "lucide-react"
import { useState } from "react"
import { NotificationBell } from "@/components/layout/NotificationBell"

export function Navbar() {
    const { data: session, status } = useSession()
    const [mobileOpen, setMobileOpen] = useState(false)

    const isLoggedIn = status === "authenticated" && session?.user
    const userRole = session?.user?.role
    const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "User"

    const dashboardHref =
        userRole === "ADMIN" ? "/admin" :
            userRole === "CLIENT" ? "/client/dashboard" :
                "/dashboard"

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0f1722]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0f1722]/60">
            <div className="container flex h-20 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 rounded-xl bg-[#FB7427]/10 flex items-center justify-center border border-[#FB7427]/20 group-hover:bg-[#FB7427]/20 transition-all duration-300 shadow-lg shadow-[#FB7427]/5">
                            <Drone className="w-6 h-6 text-[#FB7427]" />
                        </div>
                        <span className="font-black text-xl tracking-tighter text-white uppercase italic">
                            DroneHub
                        </span>
                    </Link>

                    <nav className="hidden lg:flex items-center space-x-8 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                        <Link href="/operators" className="transition-all hover:text-[#5BC2E7] flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" /> Browse operators
                        </Link>
                        <Link href="/jobs" className="transition-all hover:text-[#FB7427] flex items-center gap-2">
                            <Search className="w-3.5 h-3.5" /> Find jobs
                        </Link>
                        <Link href="/regulations" className="transition-all hover:text-[#5BC2E7] flex items-center gap-2">
                            <Scale className="w-3.5 h-3.5" /> Regulations
                        </Link>
                        {!isLoggedIn && (
                            <Link href="/register/operator" className="transition-all hover:text-[#FB7427] flex items-center gap-2">
                                Become an operator
                            </Link>
                        )}
                        {isLoggedIn && (
                            <Link href={dashboardHref} className="transition-all hover:text-[#FB7427] flex items-center gap-2">
                                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {!isLoggedIn ? (
                        <div className="hidden md:flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 px-6">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-[#FB7427] hover:bg-[#e8651a] text-[#0f1722] font-black uppercase tracking-tighter px-8 h-11 rounded-xl shadow-xl shadow-[#FB7427]/10 transition-all active:scale-95">
                                    Sign up
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-4">
                            <NotificationBell />
                            <Link href="/account" className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-[#FB7427]/30 transition-all">
                                <div className="w-8 h-8 rounded-lg bg-[#FB7427]/20 flex items-center justify-center text-[#FB7427] font-black text-sm uppercase">
                                    {userName.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-white leading-none">{userName}</p>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{userRole}</p>
                                </div>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                title="Sign Out"
                            >
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden text-gray-400"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        <Menu className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="lg:hidden border-t border-white/5 bg-[#0f1722]/95 backdrop-blur-xl">
                    <div className="container px-4 py-6 space-y-4">
                        <Link
                            href="/operators"
                            className="block text-sm font-bold text-gray-400 hover:text-[#5BC2E7] transition-colors uppercase tracking-wider py-2"
                            onClick={() => setMobileOpen(false)}
                        >
                            Browse operators
                        </Link>
                        <Link
                            href="/jobs"
                            className="block text-sm font-bold text-gray-400 hover:text-[#FB7427] transition-colors uppercase tracking-wider py-2"
                            onClick={() => setMobileOpen(false)}
                        >
                            Find jobs
                        </Link>
                        <Link
                            href="/regulations"
                            className="block text-sm font-bold text-gray-400 hover:text-[#5BC2E7] transition-colors uppercase tracking-wider py-2"
                            onClick={() => setMobileOpen(false)}
                        >
                            Regulations
                        </Link>
                        {!isLoggedIn ? (
                            <>
                                <Link
                                    href="/register/operator"
                                    className="block text-sm font-bold text-gray-400 hover:text-[#FB7427] transition-colors uppercase tracking-wider py-2"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Become an operator
                                </Link>
                                <div className="flex gap-3 pt-2">
                                    <Link href="/login" className="flex-1">
                                        <Button variant="outline" className="w-full border-white/10 text-white font-bold" onClick={() => setMobileOpen(false)}>
                                            Login
                                        </Button>
                                    </Link>
                                    <Link href="/register" className="flex-1">
                                        <Button className="w-full bg-[#FB7427] hover:bg-[#e8651a] text-[#0f1722] font-black" onClick={() => setMobileOpen(false)}>
                                            Sign up
                                        </Button>
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href={dashboardHref}
                                    className="block text-sm font-bold text-gray-400 hover:text-[#FB7427] transition-colors uppercase tracking-wider py-2"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#FB7427]/20 flex items-center justify-center text-[#FB7427] font-black text-sm">
                                            {userName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{userName}</p>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{userRole}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="text-red-400 hover:bg-red-400/10 text-xs font-bold uppercase"
                                    >
                                        <LogOut className="w-4 h-4 mr-1" /> Sign Out
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}
