import Link from "next/link"
import { Drone } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t border-border bg-card">
            <div className="container py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Drone className="w-5 h-5 text-primary" />
                            </div>
                            <span className="font-bold text-lg">DroneHub</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            The world's leading marketplace for professional drone services. Connect with certified operators for all your aerial needs.
                        </p>
                    </div>

                    {/* For Customers */}
                    <div>
                        <h3 className="font-semibold mb-4">For Customers</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/browse" className="hover:text-primary transition-colors">Find Services</Link></li>
                            <li><Link href="/jobs/new" className="hover:text-primary transition-colors">Post a Job</Link></li>
                            <li><Link href="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
                            <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    {/* For Operators */}
                    <div>
                        <h3 className="font-semibold mb-4">For Operators</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/register/operator" className="hover:text-primary transition-colors">Join as Operator</Link></li>
                            <li><Link href="/success-stories" className="hover:text-primary transition-colors">Success Stories</Link></li>
                            <li><Link href="/resources" className="hover:text-primary transition-colors">Resources</Link></li>
                            <li><Link href="/community" className="hover:text-primary transition-colors">Community</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                            <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © 2024 DroneHub. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
