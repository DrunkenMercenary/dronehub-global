import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Globe, ShieldCheck, Camera, Map, Building2, Users, ArrowRight } from "lucide-react"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0f1722] text-white">
      {/* Hero Section */}
      <section className="relative w-full min-h-[85vh] flex items-center bg-gradient-to-b from-[#18222e] to-[#0f1722] overflow-hidden border-b border-white/5">
        <div className="container px-4 md:px-6 relative z-10 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-block px-3 py-1 rounded-full bg-[#FB7427]/10 border border-[#FB7427]/20">
                <span className="text-[#FB7427] text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FB7427] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FB7427]"></span>
                  </span>
                  Global Drone Services Platform
                </span>
              </div>
              <div className="space-y-6">
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-white leading-[1.1]">
                  Find Expert <br />
                  <span className="text-[#FB7427]">Drone Operators</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-400 max-w-[540px] leading-relaxed">
                  Get quotes from certified drone pilots in your area for aerial photography, building inspections, surveying, and mapping projects. Professional results guaranteed.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/register/client">
                  <Button size="lg" className="w-full sm:w-auto bg-[#FB7427] hover:bg-[#e8651a] text-[#0f1722] font-bold px-10 h-14 text-base rounded-lg transition-all shadow-lg shadow-[#FB7427]/20 border-none">
                    Get Started as Customer
                  </Button>
                </Link>
                <Link href="/register/operator">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-[#5BC2E7]/40 text-[#5BC2E7] hover:bg-[#5BC2E7]/10 hover:border-[#5BC2E7] font-bold px-10 h-14 text-base rounded-lg transition-all">
                    Join as Operator
                  </Button>
                </Link>
              </div>
              <div className="pt-2">
                <Link href="#demo" className="text-[#FB7427] hover:text-[#FB7427] text-sm font-semibold tracking-wide flex items-center gap-2 group transition-colors">
                  View 90-Second Investor Demo
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
              <div className="absolute inset-0 bg-[#FB7427]/10 rounded-full blur-[120px] opacity-30"></div>
              <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
                <Image
                  src="/drone-hero.png"
                  alt="Professional drone visualization"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-20 flex flex-wrap gap-10 opacity-60">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-white uppercase group hover:opacity-100 transition-opacity">
              <ShieldCheck className="w-4 h-4 text-[#5BC2E7]" />
              Certified Operators
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-white uppercase group hover:opacity-100 transition-opacity">
              <CheckCircle className="w-4 h-4 text-[#FB7427]" />
              Trusted Platform
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-white uppercase group hover:opacity-100 transition-opacity">
              <Globe className="w-4 h-4 text-[#5BC2E7]" />
              Global Network
            </div>
          </div>
        </div>
      </section>

      {/* Professional Drone Services */}
      <section className="w-full py-24 md:py-32 bg-[#0f1722]">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Professional Drone Services</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
              Connect with certified operators for specialized aerial services across industries
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            {[
              {
                title: "Building Inspection",
                description: "Comprehensive structural assessments, roof inspections, and safety audits",
                icon: Building2
              },
              {
                title: "3D Mapping",
                description: "LiDAR scanning, photogrammetry, and precise 3D modeling services",
                icon: Map
              },
              {
                title: "Aerial Photography",
                description: "High-resolution imagery for real estate, marketing, and events",
                icon: Camera
              },
              {
                title: "Surveying",
                description: "Land surveying, topographic mapping, and construction monitoring",
                icon: Globe
              },
            ].map((service, i) => (
              <div
                key={i}
                className="group p-10 rounded-2xl bg-[#18222e] border border-white/5 hover:border-[#FB7427]/40 transition-all duration-500 text-center flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-[20px] bg-[#FB7427]/5 flex items-center justify-center mb-8 border border-[#FB7427]/10 group-hover:bg-[#FB7427]/10 transition-colors duration-500">
                  <service.icon className="w-8 h-8 text-[#FB7427] group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#FB7427] transition-colors">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="w-full py-24 md:py-32 bg-[#0f1722] border-t border-white/5">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Why Choose DroneHub?</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
              The trusted platform connecting businesses with certified drone professionals worldwide
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {[
              {
                title: "Certified Operators",
                description: "All operators are fully licensed, insured, and verified. Every pilot undergoes background checks and maintains current certifications.",
                icon: ShieldCheck
              },
              {
                title: "Global Coverage",
                description: "Find qualified drone pilots anywhere in the world. Our network spans major cities and remote locations across all continents.",
                icon: Globe
              },
              {
                title: "Secure Platform",
                description: "End-to-end project management with secure payments, clear contracts, and comprehensive insurance coverage for every job.",
                icon: CheckCircle
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-10 rounded-2xl bg-[#18222e] border border-white/5 text-center flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-[20px] bg-[#5BC2E7]/5 flex items-center justify-center mb-8 border border-[#5BC2E7]/10">
                  <item.icon className="w-8 h-8 text-[#5BC2E7]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-6">{item.title}</h3>
                <p className="text-gray-400 text-[15px] leading-relaxed font-medium">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer-like CTA Section */}
      <section className="w-full py-24 bg-[#FB7427]">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/10 text-[#0f1722] text-xs font-bold tracking-widest uppercase">
              Join thousands of satisfied customers and verified operators
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-[#0f1722] tracking-tighter uppercase leading-[0.9]">Ready to <br />Get Started?</h2>
            <p className="text-xl md:text-2xl text-[#0f1722]/80 max-w-2xl mx-auto leading-relaxed font-bold italic">
              Whether you need drone services or want to offer them, DroneHub connects professionals worldwide for successful aerial projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-4">
              <Link href="/register/client">
                <Button size="lg" className="w-full sm:w-auto bg-[#0f1722] text-white hover:bg-black font-bold px-12 h-16 text-lg rounded-xl shadow-2xl shadow-black/20">
                  Get Started Today <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/operators">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-[#0f1722] text-[#0f1722] hover:bg-[#0f1722] hover:text-white font-bold px-12 h-16 text-lg rounded-xl transition-all">
                  Browse Services
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 pt-8 text-[#0f1722]/60 text-[10px] font-black tracking-[0.3em] uppercase">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Verified Operators
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Secure Payments
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Global Coverage
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
