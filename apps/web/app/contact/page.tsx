import { Mail, MessageSquare, MapPin } from "lucide-react"

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#0f1722] py-16 md:py-24">
            <div className="container max-w-3xl px-4 md:px-6">
                <div className="space-y-4 mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">Contact us</h1>
                    <p className="text-gray-400 text-lg">Questions, partnerships, or support, we'd love to hear from you.</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                    <a href="mailto:hello@dronehub.global" className="p-6 rounded-2xl bg-[#18222e] border border-white/5 hover:border-[#FB7427]/30 transition-all space-y-3 block">
                        <div className="w-11 h-11 rounded-xl bg-[#FB7427]/10 border border-[#FB7427]/20 flex items-center justify-center text-[#FB7427]"><Mail className="w-5 h-5" /></div>
                        <p className="font-bold text-white">Email</p>
                        <p className="text-sm text-gray-400">hello@dronehub.global</p>
                    </a>
                    <div className="p-6 rounded-2xl bg-[#18222e] border border-white/5 space-y-3">
                        <div className="w-11 h-11 rounded-xl bg-[#5BC2E7]/10 border border-[#5BC2E7]/20 flex items-center justify-center text-[#5BC2E7]"><MessageSquare className="w-5 h-5" /></div>
                        <p className="font-bold text-white">Support</p>
                        <p className="text-sm text-gray-400">Signed-in users can reach us from their dashboard.</p>
                    </div>
                </div>
                <div className="mt-6 p-6 rounded-2xl bg-[#18222e] border border-white/5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-gray-400"><MapPin className="w-5 h-5" /></div>
                    <div>
                        <p className="font-bold text-white">DroneHub</p>
                        <p className="text-sm text-gray-400">Asia-Pacific drone services marketplace</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
