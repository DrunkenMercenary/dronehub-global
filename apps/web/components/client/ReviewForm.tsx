"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createReview } from "@/app/actions/review"

export function ReviewForm({ jobId }: { jobId: string }) {
    const { data: session } = useSession()
    const router = useRouter()
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0)
    const [comment, setComment] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function submit() {
        if (!session?.user?.email) return setError("You must be signed in.")
        if (rating < 1) return setError("Please choose a star rating.")
        setLoading(true)
        setError("")
        const res = await createReview({ jobId, rating, comment }, session.user.email)
        setLoading(false)
        if (res?.error) setError(res.error)
        else router.refresh()
    }

    return (
        <div className="p-8 rounded-2xl bg-[#18222e] border border-white/5 space-y-6">
            <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Rate this operator</h3>
                <p className="text-sm text-gray-500">Your feedback helps other customers choose with confidence.</p>
            </div>
            {error && <p className="text-xs font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">{error}</p>}
            <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <button
                        key={i}
                        type="button"
                        onMouseEnter={() => setHover(i)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setRating(i)}
                        className="transition-transform hover:scale-110"
                        aria-label={`${i} star${i > 1 ? "s" : ""}`}
                    >
                        <Star className={`w-8 h-8 ${i <= (hover || rating) ? "text-[#FB7427] fill-[#FB7427]" : "text-gray-600"}`} />
                    </button>
                ))}
            </div>
            <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share a few words about the work (optional)"
                className="bg-[#0f1722] border-white/5 min-h-[100px] text-white placeholder:text-gray-600 focus:border-[#FB7427]/50 rounded-xl resize-none"
            />
            <Button
                onClick={submit}
                disabled={loading}
                className="bg-[#FB7427] hover:bg-[#e8651a] text-[#0f1722] font-bold h-12 px-8 rounded-xl"
            >
                {loading ? "Submitting..." : "Submit review"}
            </Button>
        </div>
    )
}
