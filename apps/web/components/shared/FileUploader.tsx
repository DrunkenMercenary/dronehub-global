"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react"

interface FileUploaderProps {
    onUpload: (url: string, fileName: string) => Promise<void>
    label: string
    acceptedTypes?: string
}

export function FileUploader({ onUpload, label, acceptedTypes }: FileUploaderProps) {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0])
            setStatus("idle")
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setUploading(true)
        try {
            // In a real app, we'd use a server action or API route to get a presigned URL
            // and then upload directly to S3. For this MVP, we'll simulate.
            console.log("Uploading file:", file.name)

            // Artificial delay
            await new Promise(r => setTimeout(r, 1500))

            const mockUrl = `https://demo-storage.dronehub.global/${file.name}`
            await onUpload(mockUrl, file.name)

            setStatus("success")
            setFile(null)
        } catch (error) {
            console.error("Upload failed", error)
            setStatus("error")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-8 bg-black/20 hover:border-[#17ad96]/30 transition-all group">
                {status === "success" ? (
                    <div className="flex flex-col items-center gap-4 py-4 animate-in fade-in zoom-in duration-300">
                        <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <p className="text-sm font-black text-white uppercase italic tracking-tighter">Transmission Complete</p>
                        <Button
                            variant="link"
                            onClick={() => setStatus("idle")}
                            className="text-[#17ad96] text-[10px] font-bold uppercase tracking-widest"
                        >
                            Upload Another File
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="h-14 w-14 rounded-xl bg-[#17ad96]/10 flex items-center justify-center border border-[#17ad96]/20 group-hover:scale-110 transition-transform mb-4">
                            <FileText className="w-6 h-6 text-[#17ad96]" />
                        </div>
                        <div className="text-center space-y-1 mb-6">
                            <p className="text-sm font-bold text-white uppercase tracking-tighter italic">{label}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Supports PDF, JPG, PNG (Max 10MB)</p>
                        </div>

                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={handleFileChange}
                            accept={acceptedTypes}
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer bg-white/5 hover:bg-white/10 px-6 py-3 rounded-lg text-white text-xs font-black uppercase tracking-widest transition-colors mb-4 border border-white/5"
                        >
                            {file ? file.name : "Select Dispatch Files"}
                        </label>

                        {file && (
                            <Button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="bg-[#17ad96] hover:bg-[#159a85] text-[#0a0d11] font-black uppercase tracking-tighter w-full h-12 shadow-lg shadow-[#17ad96]/10"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" /> Start Transmission
                                    </>
                                )}
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
