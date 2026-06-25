import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getOperatorProfile } from "@/app/actions/operator"
import { getOperatorDocuments } from "@/app/actions/document"
import { DocumentsVault } from "@/components/operator/DocumentsVault"
import { PortfolioManager } from "@/components/operator/PortfolioManager"
import { ArrowLeft, ShieldCheck, Clock, CheckCircle, XCircle } from "lucide-react"

export const dynamic = "force-dynamic"

const STATUS = {
    APPROVED: { label: "Verified", cls: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
    PENDING: { label: "Pending review", cls: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Clock },
    REJECTED: { label: "Not approved", cls: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
} as const

export default async function DocumentsPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) redirect("/login")

    const profile = await getOperatorProfile(session.user.email)
    if (!profile) redirect("/register/operator")

    const documents = await getOperatorDocuments(profile.id)
    const status = STATUS[(profile.status as keyof typeof STATUS)] ?? STATUS.PENDING

    return (
        <div className="min-h-screen bg-[#0f1722] py-16 md:py-24">
            <div className="container max-w-4xl px-4 md:px-6">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#FB7427] transition-colors text-[10px] font-bold uppercase tracking-widest mb-8">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
                </Link>

                <div className="space-y-4 mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FB7427]/10 border border-[#FB7427]/20">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#FB7427]" />
                        <span className="text-[10px] font-bold text-[#FB7427] uppercase tracking-[0.2em]">Verification</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Documents</h1>
                        <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest border px-3 py-1 rounded-full ${status.cls}`}>
                            <status.icon className="w-3 h-3" /> {status.label}
                        </span>
                    </div>
                    <p className="text-gray-400 text-base max-w-2xl">
                        Upload your licence and insurance so our team can verify you. Approved operators get a verified badge and appear in the public directory.
                    </p>
                </div>

                <DocumentsVault operatorProfileId={profile.id} documents={documents} />

                <div className="mt-14 space-y-4">
                    <h2 className="text-2xl font-bold text-white">Portfolio</h2>
                    <p className="text-gray-400 text-sm max-w-2xl">Show off your best work. These images appear on your public profile.</p>
                    <PortfolioManager operatorProfileId={profile.id} documents={documents} />
                </div>
            </div>
        </div>
    )
}
