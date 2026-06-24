"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import type { Regulation } from "@/lib/regulations"
import { Search, ExternalLink, Scale, MapPin } from "lucide-react"

export function RegulationsBrowser({ regulations }: { regulations: Regulation[] }) {
    const [query, setQuery] = useState("")
    const [country, setCountry] = useState<string | null>(null)

    const countries = useMemo(
        () => Array.from(new Set(regulations.map((r) => r.country))).sort(),
        [regulations]
    )

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return regulations.filter((r) => {
            const matchesCountry = !country || r.country === country
            const hay = `${r.country} ${r.category} ${r.title} ${r.summary} ${r.authority ?? ""}`.toLowerCase()
            return matchesCountry && (!q || hay.includes(q))
        })
    }, [regulations, query, country])

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-5">
                <div className="relative max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <Input
                        placeholder="Search rules by country, topic, or keyword"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="bg-[#18222e] border-white/5 h-12 pl-11 text-white placeholder:text-gray-600 focus:border-[#5BC2E7]/50 rounded-xl"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setCountry(null)}
                        className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all ${country === null ? "bg-[#5BC2E7]/15 text-[#5BC2E7] border-[#5BC2E7]/40" : "bg-[#18222e] text-gray-400 border-white/5 hover:border-white/15"}`}>
                        All countries
                    </button>
                    {countries.map((c) => (
                        <button key={c} onClick={() => setCountry(c)}
                            className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all ${country === c ? "bg-[#5BC2E7]/15 text-[#5BC2E7] border-[#5BC2E7]/40" : "bg-[#18222e] text-gray-400 border-white/5 hover:border-white/15"}`}>
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="p-16 rounded-2xl border border-dashed border-white/10 bg-[#18222e]/40 text-center">
                    <p className="text-lg font-bold text-gray-400">No guidance matches your search</p>
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2">
                    {filtered.map((r) => (
                        <div key={r.id} className="p-6 rounded-2xl bg-[#18222e] border border-white/5 space-y-3 flex flex-col">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#5BC2E7] uppercase tracking-widest bg-[#5BC2E7]/10 border border-[#5BC2E7]/20 px-2.5 py-1 rounded-full">
                                    <MapPin className="w-3 h-3" /> {r.country}
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/5 border border-white/5 px-2.5 py-1 rounded-full">
                                    <Scale className="w-3 h-3" /> {r.category}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-white">{r.title}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed flex-1">{r.summary}</p>
                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{r.authority}</span>
                                {r.sourceUrl && (
                                    <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-[#5BC2E7] uppercase tracking-widest hover:underline">
                                        Official site <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
