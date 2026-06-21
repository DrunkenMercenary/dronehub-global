import { getPendingOperators, updateOperatorStatus } from "@/app/actions/admin"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import {
    UserPlus,
    ShieldCheck,
    MapPin,
    Zap,
    Check,
    X,
    ArrowLeft,
    Clock
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = 'force-dynamic'

export default async function AdminOperatorQueuePage() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
        redirect("/dashboard")
    }

    const pendingOperators = await getPendingOperators()

    return (
        <div className="min-h-screen bg-[#0a0d11] py-16 md:py-24">
            <div className="container px-4 md:px-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                    <div className="space-y-4">
                        <Link href="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#17ad96] transition-colors text-[10px] font-black uppercase tracking-widest mb-4">
                            <ArrowLeft className="w-4 h-4" /> HQ Command
                        </Link>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/10 border border-blue-400/20">
                            <UserPlus className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Recruitment Queue</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">
                            Pilot <span className="text-blue-400">Verification</span>
                        </h1>
                        <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-xl">
                            Review and authorize new drone operators for platform access.
                        </p>
                    </div>
                </div>

                {/* Queue List */}
                <div className="space-y-6">
                    {pendingOperators.length === 0 ? (
                        <div className="p-20 rounded-3xl border border-dashed border-white/10 bg-[#12171e]/50 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                                <ShieldCheck className="w-8 h-8 text-gray-800" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-400 uppercase italic">Queue Depleted</h3>
                            <p className="text-gray-600 max-w-sm mx-auto text-sm font-medium">All operator applications have been processed. Systems are nominal.</p>
                        </div>
                    ) : (
                        pendingOperators.map((operator: any) => (
                            <div key={operator.id} className="p-8 rounded-2xl bg-[#12171e] border border-white/5 hover:border-blue-400/30 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border bg-yellow-400/20 text-yellow-400 border-yellow-400/30 flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" /> {operator.status}
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-600 tracking-widest uppercase">ID: {operator.id.slice(-8)}</span>
                                    </div>

                                    <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors uppercase italic tracking-tighter">
                                        {operator.name}
                                    </h3>

                                    <div className="flex flex-wrap gap-4 text-[10px] font-bold text-gray-500 tracking-widest uppercase">
                                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-400" /> {operator.lat ? `LAT ${operator.lat.toFixed(2)}` : "Position Unknown"}</span>
                                        <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-blue-400" /> {operator.services.split(',').length} SERVICES REGISTERED</span>
                                    </div>

                                    <p className="text-sm text-gray-400 italic max-w-2xl leading-relaxed">
                                        "{operator.description || "No pilot biography provided."}"
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <form action={async () => {
                                        "use server"
                                        await updateOperatorStatus(operator.id, "REJECTED")
                                    }}>
                                        <Button variant="outline" className="h-14 w-14 rounded-xl border-white/5 bg-black/40 text-red-400 hover:bg-red-400/10 hover:border-red-400/30 transition-all p-0">
                                            <X className="w-6 h-6" />
                                        </Button>
                                    </form>

                                    <form action={async () => {
                                        "use server"
                                        await updateOperatorStatus(operator.id, "APPROVED")
                                    }}>
                                        <Button className="h-14 px-8 rounded-xl bg-blue-400 hover:bg-blue-500 text-black font-black uppercase tracking-tighter transition-all flex items-center gap-2 group-hover:scale-105">
                                            Authorize <Check className="w-5 h-5" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    )
}
