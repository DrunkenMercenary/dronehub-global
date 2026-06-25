"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileUploader } from "@/components/shared/FileUploader"
import { addDocument } from "@/app/actions/document"
import { FileText, ShieldCheck, FileCheck2, ArrowUpRight } from "lucide-react"

type Doc = { id: string; url: string; name: string; type: string; createdAt: string | Date }

const SLOTS = [
    { type: "LICENSE", label: "Drone licence / certification", icon: ShieldCheck },
    { type: "INSURANCE", label: "Insurance certificate", icon: FileCheck2 },
]

export function DocumentsVault({
    operatorProfileId,
    documents,
}: {
    operatorProfileId: string
    documents: Doc[]
}) {
    const router = useRouter()
    const [docs, setDocs] = useState<Doc[]>(documents)

    async function handleUpload(type: string, url: string, name: string) {
        const res = await addDocument({ url, name, type, operatorProfileId })
        if (res?.success && res.document) {
            setDocs((d) => [...d, res.document as Doc])
            router.refresh()
        }
    }

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            {SLOTS.map((slot) => {
                const existing = docs.filter((d) => d.type === slot.type)
                return (
                    <div key={slot.type} className="p-6 rounded-2xl bg-[#18222e] border border-white/5 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#FB7427]/10 border border-[#FB7427]/20 flex items-center justify-center text-[#FB7427]">
                                <slot.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">{slot.label}</h3>
                                <p className="text-[11px] font-medium text-gray-500">{existing.length} uploaded</p>
                            </div>
                        </div>

                        {existing.length > 0 && (
                            <div className="space-y-2">
                                {existing.map((d) => (
                                    <a
                                        key={d.id}
                                        href={d.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-black/30 border border-white/5 hover:border-[#FB7427]/30 transition-all group"
                                    >
                                        <span className="flex items-center gap-3 min-w-0">
                                            <FileText className="w-4 h-4 text-[#FB7427] shrink-0" />
                                            <span className="text-sm text-gray-300 truncate">{d.name}</span>
                                        </span>
                                        <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-[#FB7427] transition-colors shrink-0" />
                                    </a>
                                ))}
                            </div>
                        )}

                        <FileUploader
                            label={`Upload ${slot.label.toLowerCase()}`}
                            acceptedTypes=".pdf,.jpg,.jpeg,.png"
                            onUpload={(url, name) => handleUpload(slot.type, url, name)}
                        />
                    </div>
                )
            })}
        </div>
    )
}
