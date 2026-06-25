import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getSavedOperators } from "@/app/actions/favourite"
import { parseServices, labelForCategory } from "@/lib/categories"
import { SaveButton } from "@/components/client/SaveButton"
import { Heart, ArrowUpRight, Building, User, ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function SavedOperatorsPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) redirect("/login")
    const operators = await getSavedOperators(session.user.email)

    return (
        <div className="min-h-screen bg-[#0f1722] py-16 md:py-24">
            <div className="container px-4 md:px-6">
                <Link href="/client/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#5BC2E7] transition-colors text-[10px] font-bold uppercase tracking-widest mb-8">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
                </Link>
                <div className="flex items-center gap-3 mb-10">
                    <Heart className="w-6 h-6 text-[#5BC2E7] fill-[#5BC2E7]" />
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Saved operators</h1>
                </div>

                {operators.length === 0 ? (
                    <div className="p-16 rounded-2xl border border-dashed border-white/10 bg-[#18222e]/40 text-center space-y-3">
                        <p className="text-lg font-bold text-gray-400">No saved operators yet</p>
                        <p className="text-sm text-gray-600">Tap the heart on any operator to shortlist them here.</p>
                        <Link href="/operators" className="inline-block text-[#FB7427] font-bold text-sm mt-2">Browse operators</Link>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {operators.map((op: any) => {
                            const isCompany = op.type === "COMPANY"
                            const services = parseServices(op.services).slice(0, 3)
                            return (
                                <Link key={op.id} href={`/operators/${op.id}`} className="group">
                                    <div className="h-full p-6 rounded-2xl bg-[#18222e] border border-white/5 hover:border-[#FB7427]/40 transition-all flex flex-col">
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-[#FB7427]/10 border border-[#FB7427]/20 flex items-center justify-center text-[#FB7427]">
                                                    {isCompany ? <Building className="w-6 h-6" /> : <User className="w-6 h-6" />}
                                                </div>
                                                <h3 className="text-base font-bold text-white group-hover:text-[#FB7427] transition-colors">
                                                    {isCompany && op.companyName ? op.companyName : op.name}
                                                </h3>
                                            </div>
                                            <SaveButton operatorId={op.id} initialSaved={true} />
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {services.map((sv: string) => (
                                                <span key={sv} className="text-[10px] font-bold text-gray-300 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">{labelForCategory(sv)}</span>
                                            ))}
                                        </div>
                                        <div className="mt-auto flex items-center justify-end pt-4 border-t border-white/5">
                                            <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-[#FB7427] transition-colors" />
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
