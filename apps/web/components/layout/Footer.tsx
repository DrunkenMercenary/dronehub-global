import Link from "next/link"
import { Drone } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t border-border bg-card">
            <div className="container py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Drone className="w-5 h-5 text-primary" />
                            </div>
                            <span className="font-bold text-lg">DroneHub</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            The marketplace for professional drone services. Connect with verified operators for all your aerial needs.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">For customers</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/operators" className="hover:text-primary transition-colors">Browse operators</Link></li>
                            <li><Link href="/jobs/new" className="hover:text-primary transition-colors">Post a job</Link></li>
                            <li><Link href="/how-it-works" className="hover:text-primary transition-colors">How it works</Link></li>
                            <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">For operators</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/register/operator" className="hover:text-primary transition-colors">Join as operator</Link></li>
                            <li><Link href="/jobs" className="hover:text-primary transition-colors">Find jobs</Link></li>
                            <li><Link href="/regulations" className="hover:text-primary transition-colors">Regulations</Link></li>
                            <li><Link href="/how-it-works" className="hover:text-primary transition-colors">How it works</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/regulations" className="hover:text-primary transition-colors">Compliance</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">(c) 2026 DroneHub. All rights reserved.</p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
