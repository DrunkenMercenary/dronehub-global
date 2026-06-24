"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileUploader } from "@/components/shared/FileUploader"
import { addDocument } from "@/app/actions/document"
import { ImageIcon } from "lucide-react"

type Doc = { id: string; url: string; name: string; type: string }

export function PortfolioManager({
    operatorProfileId,
    documents,
}: {
    operatorProfileId: string
    documents: Doc[]
}) {
    const router = useRouter()
    const [items, setItems] = useState<Doc[]>(documents.filter((d) => d.type === "PORTFOLIO"))

    async function handleUpload(url: string, name: string) {
        const res = await addDocument({ url, name, type: "PORTFOLIO", operatorProfileId })
        if (res?.success && res.document) {
            setItems((d) => [...d, res.document as Doc])
            router.refresh()
        }
    }

    return (
        <div className="space-y-6">
            {items.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {items.map((d) => (
                        <a key={d.id} href={d.url} target="_blank" rel="noopener noreferrer"
                            className="aspect-square rounded-xl overflow-hidden bg-black/30 border border-white/5 hover:border-[#5BC2E7]/40 transition-all flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={d.url} alt={d.name} className="w-full h-full object-cover" />
                        </a>
                    ))}
                </div>
            )}
            <div className="max-w-md">
                <FileUploader label="Add a work sample (image)" acceptedTypes=".jpg,.jpeg,.png,.webp,.gif" onUpload={handleUpload} />
            </div>
        </div>
    )
}
