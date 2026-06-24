import { getRegulations } from "@/lib/regulations"
import { RegulationsBrowser } from "@/components/shared/RegulationsBrowser"
import { Scale, Info } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function RegulationsPage() {
    const regulations = await getRegulations()

    return (
        <div className="min-h-screen bg-[#0f1722] py-16 md:py-24">
            <div className="container px-4 md:px-6">
                <div className="space-y-4 mb-8 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5BC2E7]/10 border border-[#5BC2E7]/20">
                        <Scale className="w-3.5 h-3.5 text-[#5BC2E7]" />
                        <span className="text-[10px] font-bold text-[#5BC2E7] uppercase tracking-[0.2em]">Compliance</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-none">
                        Drone <span className="text-[#5BC2E7]">regulations</span>
                    </h1>
                    <p className="text-gray-400 text-lg font-medium">
                        Quick reference for drone rules across the region. Check the basics before you post or accept a job.
                    </p>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 mb-10 max-w-3xl">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                        This is general guidance, not legal advice, and rules change. Always confirm current requirements with the national aviation authority before flying.
                    </p>
                </div>

                <RegulationsBrowser regulations={regulations} />
            </div>
        </div>
    )
}
