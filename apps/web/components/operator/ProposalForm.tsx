"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { createProposal } from "@/app/actions/proposal"
import { useRouter } from "next/navigation"
import { DollarSign, Clock, MessageSquare, Zap, ShieldCheck, ArrowRight } from "lucide-react"

const formSchema = z.object({
    amount: z.coerce.number().min(1, "Bid amount must be at least 1"),
    deliveryTime: z.string().min(1, "Delivery timeframe is required"),
    coverLetter: z.string().min(10, "Cover letter must be at least 10 characters"),
})

interface ProposalFormProps {
    jobId: string
    operatorId: string
}

export function ProposalForm({ jobId, operatorId }: ProposalFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            amount: 0,
            deliveryTime: "3 Days",
            coverLetter: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        setError("")

        try {
            const result = await createProposal({
                ...values,
                jobId,
                operatorId,
            })

            if (result.error) {
                setError(result.error)
            } else {
                router.refresh()
            }
        } catch (e) {
            setError("Failed to submit proposal. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                            <Zap className="w-6 h-6 text-[#17ad96]" /> Submit Mission Bid
                        </h2>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Pilot Credentials Verification Active</p>
                    </div>
                    <div className="h-px flex-1 bg-white/5 mx-4 hidden md:block"></div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-[#17ad96] uppercase tracking-[0.2em] px-3 py-1 bg-[#17ad96]/10 rounded-full border border-[#17ad96]/20">
                        <ShieldCheck className="w-3 h-3" /> Secure Link
                    </div>
                </div>

                {error && (
                    <div className="p-4 text-xs font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl">
                        {error}
                    </div>
                )}

                <div className="grid gap-8 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-gray-300 font-bold uppercase tracking-widest text-[9px] flex items-center gap-2">
                                    <DollarSign className="w-3.5 h-3.5 text-[#17ad96]" /> Operational Fee (USD)
                                </FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <Input
                                            type="number"
                                            placeholder="500"
                                            {...field}
                                            className="bg-[#0a0d11] border-white/5 h-14 text-white text-lg font-bold placeholder:text-gray-700 focus:border-[#17ad96]/50 rounded-xl transition-all pl-10"
                                        />
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 group-focus-within:text-[#17ad96] transition-colors" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="deliveryTime"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-gray-300 font-bold uppercase tracking-widest text-[9px] flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-[#17ad96]" /> Mission Window
                                </FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <Input
                                            placeholder="e.g. 72 Hours"
                                            {...field}
                                            className="bg-[#0a0d11] border-white/5 h-14 text-white text-lg font-bold placeholder:text-gray-700 focus:border-[#17ad96]/50 rounded-xl transition-all pl-10"
                                        />
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 group-focus-within:text-[#17ad96] transition-colors" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="coverLetter"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="text-gray-300 font-bold uppercase tracking-widest text-[9px] flex items-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5 text-[#17ad96]" /> Pilot Statement / Credentials
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Summarize your mission experience and equipment technical specs..."
                                    className="resize-none bg-[#0a0d11] border-white/5 min-h-[160px] text-white font-medium placeholder:text-gray-700 focus:border-[#17ad96]/50 rounded-2xl transition-all p-6"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full bg-[#17ad96] hover:bg-[#159a85] text-[#0a0d11] font-black uppercase tracking-tighter h-16 text-xl rounded-2xl shadow-xl shadow-[#17ad96]/10 group transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-3"
                    disabled={loading}
                >
                    {loading ? "Transmitting..." : (
                        <>
                            Authorize Bid Submission <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </Button>
            </form>
        </Form>
    )
}
