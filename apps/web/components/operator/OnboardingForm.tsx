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
import { Checkbox } from "@/components/ui/checkbox"
import { onboardOperator } from "@/app/actions/operator"
import { Plane, ShieldCheck, MapPin, Briefcase, Lock, Mail, User, Users, Building } from "lucide-react"

const formSchema = z.object({
    name: z.string().min(2, "Real name or call sign is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Security key must be at least 6 characters"),
    type: z.enum(["INDIVIDUAL", "COMPANY"]),
    companyName: z.string().optional(),
    fleetSize: z.coerce.number().min(1).default(1),
    description: z.string().optional(),
    services: z.array(z.string()).min(1, "Select at least one specialty."),
    radius: z.coerce.number().min(1, "Radius must be at least 1km"),
})

const SERVICE_OPTIONS = [
    { id: "photography", label: "Aerial Photography", icon: "📸" },
    { id: "videography", label: "Cinematic 4K Video", icon: "🎬" },
    { id: "inspection", label: "Industrial/Thermal", icon: "🏗️" },
    { id: "surveying", label: "3D Mapping/LiDAR", icon: "🗺️" },
    { id: "search_rescue", label: "Search & Rescue", icon: "🚁" },
    { id: "agriculture", label: "Precision Ag", icon: "🌾" },
    { id: "facade_washing", label: "Drone / Facade Washing", icon: "🧼" },
]

export function OnboardingForm() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            email: "",
            password: "",
            type: "INDIVIDUAL",
            companyName: "",
            fleetSize: 1,
            description: "",
            services: [],
            radius: 50,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        setError("")

        try {
            const result = await onboardOperator(values)
            if (result && result.error) {
                setError(result.error)
            }
        } catch (e) {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5BC2E7]/10 border border-[#5BC2E7]/20">
                        <Plane className="w-3.5 h-3.5 text-[#5BC2E7]" />
                        <span className="text-[10px] font-bold text-[#5BC2E7] uppercase tracking-[0.2em]">Operator sign-up</span>
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Join as an operator</h2>
                    <p className="text-gray-500 text-sm font-medium">Tell us about your services to start receiving jobs.</p>
                </div>

                {error && (
                    <div className="p-4 text-sm font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl">
                        {error}
                    </div>
                )}

                <div className="space-y-8">
                    {/* Entity Type Selection */}
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem className="space-y-4">
                                <FormLabel className="text-gray-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#5BC2E7]" /> Account type
                                </FormLabel>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        onClick={() => field.onChange("INDIVIDUAL")}
                                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${field.value === "INDIVIDUAL"
                                            ? "bg-[#5BC2E7]/10 border-[#5BC2E7]/30 text-white shadow-lg shadow-[#5BC2E7]/5"
                                            : "bg-[#18222e] border-white/5 text-gray-500 hover:border-white/10"
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${field.value === "INDIVIDUAL" ? "bg-[#5BC2E7]/20 text-[#5BC2E7]" : "bg-white/5"}`}>
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-black uppercase italic leading-none mb-1">Solo Pilot</p>
                                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Individual Entry</p>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => field.onChange("COMPANY")}
                                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${field.value === "COMPANY"
                                            ? "bg-[#5BC2E7]/10 border-[#5BC2E7]/30 text-white shadow-lg shadow-[#5BC2E7]/5"
                                            : "bg-[#18222e] border-white/5 text-gray-500 hover:border-white/10"
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${field.value === "COMPANY" ? "bg-[#5BC2E7]/20 text-[#5BC2E7]" : "bg-white/5"}`}>
                                            <Building className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-black uppercase italic leading-none mb-1">Company</p>
                                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Agency / Team</p>
                                        </div>
                                    </div>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {form.watch("type") === "COMPANY" && (
                        <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-top-4 duration-500">
                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                            <Building className="w-3 h-3 text-[#5BC2E7]" /> Registered Company Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. Apex Aerial Solutions"
                                                {...field}
                                                className="bg-[#18222e] border-white/5 h-12 text-white placeholder:text-gray-600 focus:border-[#5BC2E7]/50 rounded-xl"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="fleetSize"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                            <Users className="w-3 h-3 text-[#5BC2E7]" /> Total Fleet Pilots
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="1"
                                                {...field}
                                                className="bg-[#18222e] border-white/5 h-12 text-white placeholder:text-gray-600 focus:border-[#5BC2E7]/50 rounded-xl"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {/* Basic Info Section */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                        <User className="w-3 h-3 text-[#5BC2E7]" /> {form.watch("type") === "COMPANY" ? "Main Contact Name" : "Full Name"}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={form.watch("type") === "COMPANY" ? "e.g. Jane Smith" : "e.g. Jane Smith"}
                                            {...field}
                                            className="bg-[#18222e] border-white/5 h-12 text-white placeholder:text-gray-600 focus:border-[#5BC2E7]/50 rounded-xl"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                        <Mail className="w-3 h-3 text-[#5BC2E7]" /> Email Address
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="pilot@dronehub.global"
                                            {...field}
                                            className="bg-[#18222e] border-white/5 h-12 text-white placeholder:text-gray-600 focus:border-[#5BC2E7]/50 rounded-xl"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                    <Lock className="w-3 h-3 text-[#5BC2E7]" /> Password
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        {...field}
                                        className="bg-[#18222e] border-white/5 h-12 text-white placeholder:text-gray-600 focus:border-[#5BC2E7]/50 rounded-xl"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                    <Briefcase className="w-3 h-3 text-[#5BC2E7]" /> About you
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Describe your experience, equipment, and certifications..."
                                        className="resize-none bg-[#18222e] border-white/5 min-h-[120px] text-white placeholder:text-gray-600 focus:border-[#5BC2E7]/50 rounded-xl"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Services Grid */}
                    <FormField
                        control={form.control}
                        name="services"
                        render={() => (
                            <FormItem>
                                <div className="mb-4 space-y-1">
                                    <FormLabel className="text-gray-300 font-bold uppercase tracking-widest text-[10px]">Services offered</FormLabel>
                                    <FormDescription className="text-gray-600 text-[10px] uppercase font-bold tracking-tighter">
                                        Select at least one sector of operation.
                                    </FormDescription>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {SERVICE_OPTIONS.map((item) => (
                                        <FormField
                                            key={item.id}
                                            control={form.control}
                                            name="services"
                                            render={({ field }) => {
                                                const isChecked = !!(field.value as string[])?.includes(item.id)
                                                return (
                                                    <FormItem
                                                        key={item.id}
                                                        className={`flex flex-row items-center space-x-3 space-y-0 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${isChecked
                                                            ? "bg-[#5BC2E7]/10 border-[#5BC2E7]/30 text-white"
                                                            : "bg-[#18222e] border-white/5 text-gray-400 hover:border-white/10"
                                                            }`}
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={isChecked}
                                                                className="border-white/20 data-[state=checked]:bg-[#5BC2E7] data-[state=checked]:border-[#5BC2E7]"
                                                                onCheckedChange={(checked: boolean) => {
                                                                    const currentValues = (field.value as string[]) || []
                                                                    return checked === true
                                                                        ? field.onChange([...currentValues, item.id])
                                                                        : field.onChange(
                                                                            currentValues.filter(
                                                                                (value: string) => value !== item.id
                                                                            )
                                                                        )
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-bold text-xs flex items-center gap-2 cursor-pointer w-full">
                                                            <span className="text-lg">{item.icon}</span> {item.label}
                                                        </FormLabel>
                                                    </FormItem>
                                                )
                                            }}
                                        />
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="radius"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                    <MapPin className="w-3 h-3 text-[#5BC2E7]" /> Service radius (km)
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            {...field}
                                            className="bg-[#18222e] border-white/5 h-12 text-white placeholder:text-gray-600 focus:border-[#5BC2E7]/50 rounded-xl pr-12"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-600 uppercase">KM</div>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full bg-[#5BC2E7] hover:bg-[#3aa9d4] text-[#0f1722] font-black uppercase tracking-tighter h-16 text-xl rounded-xl shadow-xl shadow-[#5BC2E7]/10 transition-all active:scale-95"
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Create profile"}
                </Button>
            </form>
        </Form>
    )
}
