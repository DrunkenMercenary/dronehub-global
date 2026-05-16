"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { registerClient } from "@/app/actions/client"
import { User, Mail, Lock, ShieldCheck, Briefcase } from "lucide-react"

const formSchema = z.object({
    name: z.string().min(2, "Name or Company must be at least 2 characters"),
    email: z.string().email("Invalid mission-critical email address"),
    password: z.string().min(6, "Security key must be at least 6 characters"),
})

export function ClientRegistrationForm() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        setError("")

        try {
            const result = await registerClient(values)
            if (result && result.error) {
                setError(result.error)
            }
        } catch (e) {
            setError("Communication failure. Please re-transmit data.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md space-y-10">
            <div className="space-y-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17ad96]/10 border border-[#17ad96]/20 mx-auto">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#17ad96]" />
                    <span className="text-[10px] font-bold text-[#17ad96] uppercase tracking-[0.2em]">Secure Entry</span>
                </div>
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Mission Commander</h2>
                <p className="text-gray-500 text-sm font-medium">Register to post contracts and enlist elite drone pilots.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {error && (
                        <div className="p-4 text-sm font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl">
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                        <User className="w-3 h-3 text-[#17ad96]" /> Name or Organization
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Global Tech Solutions"
                                            {...field}
                                            className="bg-[#12171e] border-white/5 h-12 text-white placeholder:text-gray-600 focus:border-[#17ad96]/50 rounded-xl"
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
                                        <Mail className="w-3 h-3 text-[#17ad96]" /> Direct Frequency
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="commander@org.com"
                                            {...field}
                                            className="bg-[#12171e] border-white/5 h-12 text-white placeholder:text-gray-600 focus:border-[#17ad96]/50 rounded-xl"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                        <Lock className="w-3 h-3 text-[#17ad96]" /> Security Key
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            {...field}
                                            className="bg-[#12171e] border-white/5 h-12 text-white placeholder:text-gray-600 focus:border-[#17ad96]/50 rounded-xl"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[#17ad96] hover:bg-[#159a85] text-[#0a0d11] font-black uppercase tracking-tighter h-14 text-lg rounded-xl shadow-xl shadow-[#17ad96]/10 transition-all active:scale-95 mt-4"
                        disabled={loading}
                    >
                        {loading ? "Authenticating..." : "Establish Command"}
                    </Button>
                </form>
            </Form>

            <div className="pt-8 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    By enlisting, you agree to our standard operating procedures.
                </p>
            </div>
        </div>
    )
}
