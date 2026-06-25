import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Users, Award, MessageSquare, Star, ShieldCheck, Search, Send, Upload, ArrowRight } from "lucide-react"

const CLIENT_STEPS = [
    { icon: FileText, title: "Post a job", body: "Describe your project, pick a category and location. It's free to post." },
    { icon: Users, title: "Review proposals", body: "Verified operators send quotes and cover notes. Compare price, range and ratings." },
    { icon: Award, title: "Award the work", body: "Choose the operator you trust. The others are notified automatically." },
    { icon: MessageSquare, title: "Collaborate & receive", body: "Message in the job thread and download deliverables when they're uploaded." },
    { icon: Star, title: "Mark complete & review", body: "Close the job and leave a rating that helps the whole community." },
]
const OPERATOR_STEPS = [
    { icon: ShieldCheck, title: "Sign up & get verified", body: "Create a profile and upload your licence and insurance for review." },
    { icon: Search, title: "Find matching jobs", body: "See jobs that match your services in your feed and the public board." },
    { icon: Send, title: "Send proposals", body: "Quote your price and delivery time with a short cover note." },
    { icon: Upload, title: "Deliver the work", body: "Once awarded, chat with the client and upload your final assets." },
    { icon: Star, title: "Earn your reputation", body: "Completed jobs and reviews build the rating that wins you more work." },
]

function Column({ title, accent, steps }: { title: string; accent: string; steps: typeof CLIENT_STEPS }) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <div className="space-y-4">
                {steps.map((s, i) => (
                    <div key={i} className="flex gap-4 p-5 rounded-2xl bg-[#18222e] border border-white/5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}1a`, color: accent }}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-white">{i + 1}. {s.title}</p>
                            <p className="text-sm text-gray-400 mt-1 leading-relaxed">{s.body}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-[#0f1722] py-16 md:py-24">
            <div className="container px-4 md:px-6">
                <div className="text-center space-y-4 mb-16 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">How DroneHub works</h1>
                    <p className="text-gray-400 text-lg">A simple, transparent way to connect drone work with the operators who can do it.</p>
                </div>
                <div className="grid gap-12 lg:grid-cols-2 max-w-5xl mx-auto">
                    <Column title="For customers" accent="#5BC2E7" steps={CLIENT_STEPS} />
                    <Column title="For operators" accent="#FB7427" steps={OPERATOR_STEPS} />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-16">
                    <Link href="/register/client"><Button className="bg-[#5BC2E7] hover:bg-[#3aa9d4] text-[#0f1722] font-bold h-14 px-8 rounded-xl">Post a job <ArrowRight className="ml-1 w-4 h-4" /></Button></Link>
                    <Link href="/register/operator"><Button variant="outline" className="border-2 border-[#FB7427]/40 text-[#FB7427] hover:bg-[#FB7427]/10 hover:border-[#FB7427] font-bold h-14 px-8 rounded-xl">Join as operator</Button></Link>
                </div>
            </div>
        </div>
    )
}
