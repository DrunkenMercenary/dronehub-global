
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Plane } from "lucide-react"

export default function RegisterPage() {
    return (
        <div className="container flex min-h-[calc(100vh-140px)] items-center justify-center py-10">
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
        </div>
    )
}
