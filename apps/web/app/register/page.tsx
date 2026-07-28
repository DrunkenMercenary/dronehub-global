
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Plane } from "lucide-react"
import { GoogleAuthButton } from "@/components/shared/GoogleAuthButton"

export default async function RegisterPage({
    searchParams,
}: {
    searchParams: Promise<{ setup?: string }>
}) {
    const params = await searchParams
    const isFinishingSetup = params?.setup === "1"

    return (
        <div className="container flex min-h-[calc(100vh-140px)] flex-col items-center justify-center py-10">
            {isFinishingSetup && (
                <div className="mb-8 w-full max-w-4xl rounded-xl border border-[#5BC2E7]/20 bg-[#5BC2E7]/10 p-5 text-center">
                    <p className="text-sm font-semibold text-white">
                        Almost there. Choose how you&apos;ll use DroneHub to finish setting up your account.
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                        You&apos;re signed in, but we need a little more information before you can post or bid on work.
                    </p>
                </div>
            )}

            <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
                <Card className="flex flex-col hover:border-primary transition-colors cursor-pointer group">
                    <CardHeader>
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary group-hover:bg-primary/10">
                            <User className="h-6 w-6 text-foreground group-hover:text-primary" />
                        </div>
                        <CardTitle>I am a Client</CardTitle>
                        <CardDescription>
                            I want to hire drone operators for a project.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                        <Link href="/register/client" className="w-full">
                            <Button className="w-full" variant="outline">Join as Client</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="flex flex-col hover:border-primary transition-colors cursor-pointer group">
                    <CardHeader>
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary group-hover:bg-primary/10">
                            <Plane className="h-6 w-6 text-foreground group-hover:text-primary" />
                        </div>
                        <CardTitle>I am an Operator</CardTitle>
                        <CardDescription>
                            I am a certified pilot and want to offer my services.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                        <Link href="/register/operator" className="w-full">
                            <Button className="w-full">Join as Operator</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {!isFinishingSetup && (
                <div className="mt-10 w-full max-w-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">or</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>
                    <GoogleAuthButton label="Sign up with Google" />
                    <p className="text-center text-[11px] text-gray-500">
                        You&apos;ll choose Client or Operator after signing in.
                    </p>
                </div>
            )}
        </div>
    )
}
