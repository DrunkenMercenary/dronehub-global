import { getApprovedOperators } from "@/lib/operators"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSavedOperatorIds } from "@/app/actions/favourite"
import { OperatorBrowser } from "@/components/operator/OperatorBrowser"
import { Users } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function OperatorsPage() {
    const operators = await getApprovedOperators()
    const session = await getServerSession(authOptions)
    const savedIds = session?.user?.email ? await getSavedOperatorIds(session.user.email) : []

    return (
        <div className="min-h-screen bg-[#0f1722] py-16 md:py-24">
            <div className="container px-4 md:px-6">
                <div className="space-y-4 mb-12 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FB7427]/10 border border-[#FB7427]/20">
                        <Users className="w-3.5 h-3.5 text-[#FB7427]" />
                        <span className="text-[10px] font-bold text-[#FB7427] uppercase tracking-[0.2em]">Verified operators</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-none">
                        Browse <span className="text-[#FB7427]">drone operators</span>
                    </h1>
                    <p className="text-gray-400 text-lg font-medium">
                        Find approved, verified drone operators by service and keyword. Then post a job to request a quote.
                    </p>
                </div>
                <OperatorBrowser operators={operators} savedIds={savedIds} />
            </div>
        </div>
    )
}
