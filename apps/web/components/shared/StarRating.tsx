import { Star } from "lucide-react"

export function StarRating({
    value,
    count,
    size = "sm",
    showEmpty = true,
}: {
    value: number | null
    count?: number
    size?: "sm" | "lg"
    showEmpty?: boolean
}) {
    const v = value ?? 0
    const s = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5"
    if ((value == null || count === 0) && !showEmpty) return null
    return (
        <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                        key={i}
                        className={`${s} ${i <= Math.round(v) ? "text-[#FB7427] fill-[#FB7427]" : "text-gray-600"}`}
                    />
                ))}
            </div>
            {value != null && count !== 0 ? (
                <span className="text-xs font-bold text-white">{v.toFixed(1)}</span>
            ) : (
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">No reviews yet</span>
            )}
            {count != null && count > 0 && (
                <span className="text-[11px] font-medium text-gray-500">({count})</span>
            )}
        </div>
    )
}
