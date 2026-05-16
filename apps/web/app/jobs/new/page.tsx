
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createJob } from "@/app/actions/job"
import { useSession } from "next-auth/react"
import { Briefcase, MapPin, DollarSign, FileText, Zap } from "lucide-react"

const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    category: z.string().min(1, "Please select a category"),
    location: z.string().min(1, "Location is required"),
    budget: z.coerce.number().optional(),
})

const CATEGORIES = [
    { id: "photography", label: "Aerial Photography" },
    { id: "videography", label: "Cinematic Videography" },
    { id: "inspection", label: "Industrial Inspection" },
    { id: "surveying", label: "Mapping & Surveying" },
    { id: "search_rescue", label: "Search & Rescue" },
    { id: "agriculture", label: "Agriculture" },
]


export default function NewJobPage() {
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            title: "",
            description: "",
            location: "",
            category: "",
            budget: undefined,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!session?.user?.email) {
            setError("You must be logged in to post a mission.")
            return
        }

        setLoading(true)
        setError("")
        try {
            await createJob(values, session.user.email)
        } catch (e) {
            console.error(e)
            setError("Failed to post mission. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0d11] py-16 md:py-24">
            <div className="container max-w-3xl px-4 md:px-6">

                {/* Header */}
                <div className="space-y-4 mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17ad96]/10 border border-[#17ad96]/20">
                        <Briefcase className="w-3.5 h-3.5 text-[#17ad96]" />
                        <span className="text-[10px] font-bold text-[#17ad96] uppercase tracking-[0.2em]">Mission Control</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Deploy a <span className="text-[#17ad96]">New Mission</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg max-w-xl">
                        Brief your requirements and receive proposals from certified drone pilots worldwide.
                    </p>
                </div>

                {/* Form Card */}
                <div className="p-10 rounded-3xl bg-[#12171e] border border-white/5 relative overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#17ad96]/5 blur-3xl rounded-full translate-x-40 -translate-y-40 pointer-events-none" />

                    {error && (
                        <div className="mb-8 p-4 text-sm font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl">
                            {error}
                        </div>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 relative">

                            {/* Title */}
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                            <FileText className="w-3 h-3 text-[#17ad96]" /> Mission Title
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. Roof Inspection for Residential Building"
                                                {...field}
                                                className="bg-[#0a0d11] border-white/5 h-12 text-white placeholder:text-gray-600 focus:border-[#17ad96]/50 rounded-xl"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Category & Location */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                                <Briefcase className="w-3 h-3 text-[#17ad96]" /> Mission Type
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-[#0a0d11] border-white/5 h-12 text-white rounded-xl focus:border-[#17ad96]/50">
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-[#12171e] border-white/10 text-white">
                                                    {CATEGORIES.map(cat => (
                                                        <SelectItem
                                                            key={cat.id}
                                                            value={cat.id}
                                                            className="focus:bg-[#17ad96]/10 focus:text-[#17ad96]"
                                                        >
                                                            {cat.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                                <MapPin className="w-3 h-3 text-[#17ad96]" /> AO (Area of Operation)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="City or Address"
                                                    {...field}
                                                    className="bg-[#0a0d11] border-white/5 h-12 text-white placeholder:text-gray-600 focus:border-[#17ad96]/50 rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                            <Zap className="w-3 h-3 text-[#17ad96]" /> Mission Briefing
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe the deliverables, timeline, special requirements, airspace restrictions..."
                                                className="min-h-[160px] bg-[#0a0d11] border-white/5 text-white placeholder:text-gray-600 focus:border-[#17ad96]/50 rounded-xl resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Budget */}
                            <FormField
                                control={form.control}
                                name="budget"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                            <DollarSign className="w-3 h-3 text-[#17ad96]" /> Estimated Budget (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    placeholder="500"
                                                    {...field}
                                                    className="bg-[#0a0d11] border-white/5 h-12 text-white placeholder:text-gray-600 focus:border-[#17ad96]/50 rounded-xl pl-8"
                                                />
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">$</span>
                                            </div>
                                        </FormControl>
                                        <FormDescription className="text-gray-600 text-[10px] uppercase font-bold tracking-widest">
                                            USD. Leave blank if open to negotiation.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-[#17ad96] hover:bg-[#159a85] text-[#0a0d11] font-black uppercase tracking-tighter h-14 text-lg rounded-xl shadow-xl shadow-[#17ad96]/10 transition-all active:scale-[0.98] disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? "Transmitting Briefing..." : "Deploy Mission"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}
