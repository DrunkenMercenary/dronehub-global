"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import Link from "next/link"
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
    name: z.string().min(2, "Name or company must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
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
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md space-y-10">
            <div className="space-y-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5BC2E7]/10 border border-[#5BC2E7]/20 mx-auto">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#5BC2E7]" />
                    <span className="text-[10px] font-bold text-[#5BC2E7] uppercase tracking-[0.2em]">Create Account</span>
                </div>
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Sign Up</h2>
                <p className="text-gray-500 text-sm font-medium">Create an account to post jobs and hire drone operators.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {error && (
                        <div className="p-4 text-sm font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl space-y-2">
                            <p>{error}</p>
                            {/* If the problem is that they already have an account,
                                give them the way out rather than a dead end. */}
                            {error.toLowerCase().includes("already") && (
                                <Link
                                    href={`/login?callbackUrl=/client/dashboard`}
                                    className="inline-block underline text-[#5BC2E7] hover:text-white transition-colors"
                                >
                                    Go to sign in
                                </Link>
                            )}
                        </div>
                    )}

                    <div className="space-y-5">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                        <User className="w-3 h-3 text-[#5BC2E7]" /> Name or Organization
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Global Tech Solutions"
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
                                            placeholder="you@company.com"
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
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                        <Lock className="w-3 h-3 text-[#5BC2E7]" /> Password
                                    </FormLabel>
                                    <FormControl>
                                        <PasswordInput
                                            placeholder="At least 6 characters"
                                            {...field}
                                            className="bg-[#18222e] border-white/5 h-12 text-white placeholder:text-gray-600 focus:border-[#5BC2E7]/50 rounded-xl"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[#5BC2E7] hover:bg-[#3aa9d4] text-[#0f1722] font-black uppercase tracking-tighter h-14 text-lg rounded-xl shadow-xl shadow-[#5BC2E7]/10 transition-all active:scale-95 mt-4"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </Button>
                </form>
            </Form>

            <div className="pt-8 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    By signing up, you agree to our terms of service.
                </p>
            </div>
        </div>
    )
}
