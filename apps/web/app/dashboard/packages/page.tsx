import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getOperatorProfile } from "@/app/actions/operator"
import { getOperatorPackages } from "@/app/actions/package"
import { PackagesManager } from "@/components/operator/PackagesManager"
import { ArrowLeft, Package } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function PackagesPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) redirect("/login")
    const profile = await getOperatorProfile(session.user.email)
    if (!profile) redirect("/register/operator")
    const packages = await getOperatorPackages(session.user.email)

    return (
        <div className="min-h-screen bg-[#0f1722] py-16 md:py-24">
            <div className="container px-4 md:px-6">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#5BC2E7] transition-colors text-[10px] font-bold uppercase tracking-widest mb-8">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
                </Link>
                <div className="flex items-center gap-3 mb-3">
                    <Package className="w-6 h-6 text-[#5BC2E7]" />
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Service packages</h1>
                </div>
                <p className="text-gray-400 mb-10 max-w-2xl">Publish fixed-price packages so clients can order your services directly, no bidding required.</p>
                <PackagesManager packages={packages} />
            </div>
        </div>
    )
}
