import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight } from "lucide-react"

const PLANS = [
    { name: "Customer", price: "Free", tagline: "Post jobs and hire operators", accent: "#FB7427", features: ["Unlimited job posts", "Receive unlimited proposals", "In-app messaging", "Verified operators only", "Ratings & reviews"], cta: "Post a job", href: "/register/client" },
    { name: "Operator", price: "Free", tagline: "Find work and grow your reputation", accent: "#5BC2E7", features: ["Public verified profile", "Job feed matched to your services", "Send proposals", "Portfolio & documents", "Build your rating"], cta: "Join as operator", href: "/register/operator", featured: true },
]

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-[#0f1722] py-16 md:py-24">
            <div className="container px-4 md:px-6">
                <div className="text-center space-y-4 mb-16 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">Simple pricing</h1>
                    <p className="text-gray-400 text-lg">Free to join while we grow. Secure in-platform payments with a small service fee are coming soon.</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
                    {PLANS.map((p) => (
                        <div key={p.name} className={`p-8 rounded-3xl bg-[#18222e] border ${p.featured ? "border-[#5BC2E7]/40" : "border-white/5"} space-y-6`}>
                            <div className="space-y-1">
                                <p className="text-sm font-bold uppercase tracking-widest" style={{ color: p.accent }}>{p.name}</p>
                                <p className="text-4xl font-black text-white">{p.price}</p>
                                <p className="text-sm text-gray-400">{p.tagline}</p>
                            </div>
                            <ul className="space-y-3">
                                {p.features.map((f) => (
                                    <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                                        <Check className="w-4 h-4 shrink-0" style={{ color: p.accent }} /> {f}
                                    </li>
                                ))}
                            </ul>
                            <Link href={p.href} className="block">
                                <Button className="w-full font-bold h-12 rounded-xl text-[#0f1722]" style={{ backgroundColor: p.accent }}>
                                    {p.cta} <ArrowRight className="ml-1 w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>
                <p className="text-center text-xs text-gray-600 mt-10 max-w-xl mx-auto">Pricing is indicative and subject to change as the platform evolves.</p>
            </div>
        </div>
    )
}
