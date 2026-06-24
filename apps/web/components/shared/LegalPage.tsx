export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: { h: string; p: string }[] }) {
    return (
        <div className="min-h-screen bg-[#0f1722] py-16 md:py-24">
            <div className="container max-w-3xl px-4 md:px-6">
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">{title}</h1>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-6">Last updated {updated}</p>
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 mb-10">
                    <p className="text-xs text-amber-200/80 leading-relaxed">This is a starting template, not legal advice. Have it reviewed by a qualified lawyer before relying on it.</p>
                </div>
                <div className="space-y-8">
                    {sections.map((s, i) => (
                        <div key={i} className="space-y-2">
                            <h2 className="text-lg font-bold text-white">{s.h}</h2>
                            <p className="text-gray-400 leading-relaxed">{s.p}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
