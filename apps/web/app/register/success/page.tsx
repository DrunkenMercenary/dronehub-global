
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export default function RegisterSuccessPage() {
    return (
        <div className="min-h-screen bg-[#0a0d11] flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md px-4">
                <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-[#17ad96]/10 border border-[#17ad96]/20 flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-[#17ad96]" />
                    </div>
                </div>
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                    Registration <span className="text-[#17ad96]">Complete</span>
                </h1>
                <p className="text-gray-400 font-medium leading-relaxed">
                    Your account has been created successfully. If you registered as an operator,
                    your profile is pending admin approval. You can log in immediately.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
                    <Link href="/login">
                        <Button className="bg-[#17ad96] hover:bg-[#159a85] text-[#0a0d11] font-black uppercase tracking-tighter px-8 h-12 rounded-xl shadow-xl shadow-[#17ad96]/10 transition-all active:scale-95">
                            Login Now
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button variant="outline" className="border-white/10 text-white font-bold hover:bg-white/5 px-8 h-12 rounded-xl">
                            Return Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
