"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { CATEGORIES, parseServices, labelForCategory } from "@/lib/categories"
import type { PublicOperator } from "@/lib/operators"
import { Search, MapPin, ShieldCheck, ArrowUpRight, Building, User } from "lucide-react"
import { StarRating } from "@/components/shared/StarRating"
import { SaveButton } from "@/components/client/SaveButton"

export function OperatorBrowser({ operators, savedIds = [] }: { operators: PublicOperator[]; savedIds?: string[] }) {
    const [query, setQuery] = useState("")
    const [category, setCategory] = useState<string | null>(null)

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return operators.filter((op) => {
            const services = parseServices(op.services)
            const matchesCategory = !category || services.includes(category)
            const haystack = `${op.name} ${op.companyName ?? ""} ${op.description ?? ""}`.toLowerCase()
            const matchesQuery = !q || haystack.includes(q)
            return matchesCategory && matchesQuery
        })
    }, [operators, query, category])

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-5">
                <div className="relative max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <Input
                        placeholder="Search by name, company, or keyword"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="bg-[#18222e] border-white/5 h-12 pl-11 text-white placeholder:text-gray-600 focus:border-[#FB7427]/50 rounded-xl"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setCategory(null)}
                        className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all ${category === null
                            ? "bg-[#FB7427]/15 text-[#FB7427] border-[#FB7427]/40"
                            : "bg-[#18222e] text-gray-400 border-white/5 hover:border-white/15"}`}
                    >
                        All services
                    </button>
                    {CATEGORIES.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setCategory(c.id)}
                            className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all ${category === c.id
                                ? "bg-[#FB7427]/15 text-[#FB7427] border-[#FB7427]/40"
                                : "bg-[#18222e] text-gray-400 border-white/5 hover:border-white/15"}`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>

            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                {filtered.length} operator{filtered.length === 1 ? "" : "s"}
            </p>

            {filtered.length === 0 ? (
                <div className="p-16 rounded-2xl border border-dashed border-white/10 bg-[#18222e]/40 text-center space-y-3">
                    <p className="text-lg font-bold text-gray-400">No operators match your search</p>
                    <p className="text-sm text-gray-600">Try a different keyword or clear the service filter.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((op) => {
                        const services = parseServices(op.services).slice(0, 3)
                        const isCompany = op.type === "COMPANY"
                        return (
                            <Link key={op.id} href={`/operators/${op.id}`} className="group">
                                <div className="h-full p-6 rounded-2xl bg-[#18222e] border border-white/5 hover:border-[#FB7427]/40 transition-all duration-300 flex flex-col">
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-[#FB7427]/10 border border-[#FB7427]/20 flex items-center justify-center text-[#FB7427]">
                                                {isCompany ? <Building className="w-6 h-6" /> : <User className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-white leading-tight group-hover:text-[#FB7427] transition-colors">
                                                    {isCompany && op.companyName ? op.companyName : op.name}
                                                </h3>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                    {isCompany ? "Company" : "Solo pilot"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <SaveButton operatorId={op.id} initialSaved={savedIds.includes(op.id)} />
                                            {op.verified && (
                                                <span className="flex items-center gap-1 text-[9px] font-bold text-[#FB7427] uppercase tracking-widest">
                                                    <ShieldCheck className="w-3 h-3" /> Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <StarRating value={op.ratingAvg} count={op.ratingCount} size="sm" />
                                    </div>
                                    {op.description && (
                                        <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-4">{op.description}</p>
                                    )}
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {services.map((s) => (
                                            <span key={s} className="text-[10px] font-bold text-gray-300 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">
                                                {labelForCategory(s)}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                            {op.radius ? (<><MapPin className="w-3 h-3 text-[#FB7427]" /> {op.radius} km range</>) : "Service area on request"}
                                        </span>
                                        <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-[#FB7427] transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
