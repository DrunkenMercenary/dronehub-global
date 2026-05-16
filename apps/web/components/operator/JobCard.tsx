import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Briefcase, ChevronRight } from "lucide-react"
import Link from "next/link"
import { JobRequest } from "@prisma/client"

interface JobCardProps {
    job: JobRequest
}

export function JobCard({ job }: JobCardProps) {
    return (
        <div className="group relative rounded-2xl bg-[#12171e] border border-white/5 hover:border-[#17ad96]/40 transition-all duration-300 overflow-hidden">
            <div className="p-8 space-y-6">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-[#17ad96]/10 border border-[#17ad96]/20 text-[#17ad96] text-[10px] font-bold tracking-widest uppercase">
                                {job.category}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-[#17ad96] transition-colors line-clamp-1">
                            {job.title}
                        </h3>
                    </div>
                    <div className="text-right">
                        <p className="text-[#17ad96] font-bold text-lg">
                            {(job as any).budget ? `$${Number((job as any).budget).toLocaleString()}` : "Negotiable"}
                        </p>
                        <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Est. Budget</p>
                    </div>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                    {job.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-[11px] font-semibold text-gray-500 tracking-wider">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#17ad96]" />
                        {job.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#17ad96]" />
                        {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>

            <div className="px-8 pb-8">
                <Link href={`/jobs/${job.id}`}>
                    <Button
                        variant="outline"
                        className="w-full border-white/10 text-white hover:bg-[#17ad96] hover:text-[#0a0d11] hover:border-[#17ad96] font-bold transition-all group-hover:shadow-lg group-hover:shadow-[#17ad96]/10"
                    >
                        View Details <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    )
}
