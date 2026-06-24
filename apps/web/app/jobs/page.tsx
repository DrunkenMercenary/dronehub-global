import { prisma } from "@/lib/prisma"
import { JobCard } from "@/components/operator/JobCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal, Briefcase } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function BrowseJobsPage() {
    let jobs: any[] = []

    try {
        jobs = await prisma.jobRequest.findMany({
            where: {
                status: "OPEN"
            },
            orderBy: {
                createdAt: "desc"
            }
        })
    } catch (error) {
        console.error("Browse Jobs DB Error:", error)
    }

    return (
        <div className="min-h-screen bg-[#0f1722] py-16 md:py-24">
            <div className="container px-4 md:px-6">
                {/* Header Section */}
                <div className="max-w-4xl mb-16 space-y-6">
                    <div className="inline-block px-3 py-1 rounded-full bg-[#FB7427]/10 border border-[#FB7427]/20">
                        <span className="text-[#FB7427] text-[10px] font-bold tracking-[0.2em] uppercase">
                            Available Opportunities
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
                        Find Your Next <span className="text-[#FB7427]">Mission</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed font-medium">
                        Browse through open projects and submit your best proposals to work with clients worldwide.
                    </p>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-12">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                        <Input
                            placeholder="Search by location, keyword or drone type..."
                            className="w-full bg-[#18222e] border-white/5 h-14 pl-12 text-white placeholder:text-gray-600 focus:border-[#FB7427]/50 transition-all rounded-xl"
                        />
                    </div>
                    <Button size="lg" variant="outline" className="h-14 border-white/5 bg-[#18222e] text-white font-bold px-8 rounded-xl hover:bg-[#FB7427]/10 hover:border-[#FB7427]/30">
                        <SlidersHorizontal className="mr-2 w-5 h-5" /> Filters
                    </Button>
                </div>

                {/* Job Grid */}
                {jobs.length === 0 ? (
                    <div className="p-20 rounded-3xl border border-dashed border-white/10 bg-[#18222e]/50 text-center space-y-6">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                            <Briefcase className="w-8 h-8 text-gray-800" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-gray-400 uppercase italic">No Missions Available</h3>
                            <p className="text-gray-600 max-w-sm mx-auto text-sm font-medium">
                                No open missions at the moment. Check back soon for new opportunities.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {jobs.map((job) => (
                            <JobCard key={job.id} job={job as any} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
