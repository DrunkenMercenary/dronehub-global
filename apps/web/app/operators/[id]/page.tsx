import { getPublicOperator } from "@/lib/operators"
import { getOperatorReviews } from "@/app/actions/review"
import { getOperatorDocuments } from "@/app/actions/document"
import { getPublicPackages } from "@/app/actions/package"
import { OrderPackageButton } from "@/components/client/OrderPackageButton"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSavedOperatorIds } from "@/app/actions/favourite"
import { SaveButton } from "@/components/client/SaveButton"
import { StarRating } from "@/components/shared/StarRating"
import { parseServices, labelForCategory } from "@/lib/categories"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, MapPin, Briefcase, Building, User, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function OperatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const op = await getPublicOperator(id)
    if (!op) notFound()
    const reviews = await getOperatorReviews(id)
    const portfolio = (await getOperatorDocuments(id)).filter((d: any) => d.type === "PORTFOLIO")
    const packages = await getPublicPackages(id)
    const session = await getServerSession(authOptions)
    const savedIds = session?.user?.email ? await getSavedOperatorIds(session.user.email) : []

    const services = parseServices(op.services)
    const isCompany = op.type === "COMPANY"
    const displayName = isCompany && op.companyName ? op.companyName : op.name

    return (
        <div className="min-h-screen bg-[#0f1722] py-16 md:py-24">
            <div className="container max-w-5xl px-4 md:px-6">
                <Link href="/operators" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#5BC2E7] transition-colors text-[10px] font-bold uppercase tracking-widest mb-8">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to operators
                </Link>

                <div className="grid gap-10 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-10">
                        <div className="flex items-start gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-[#5BC2E7]/10 border border-[#5BC2E7]/20 flex items-center justify-center text-[#5BC2E7] shrink-0">
                                {isCompany ? <Building className="w-10 h-10" /> : <User className="w-10 h-10" />}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{displayName}</h1>
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-[#5BC2E7] uppercase tracking-widest bg-[#5BC2E7]/10 border border-[#5BC2E7]/20 px-2.5 py-1 rounded-full">
                                        <ShieldCheck className="w-3 h-3" /> Verified
                                    </span>
                                    <SaveButton operatorId={op.id} initialSaved={savedIds.includes(op.id)} />
                                </div>
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                    {isCompany ? "Drone service company" : "Independent drone pilot"}
                                </p>
                                <div className="pt-1">
                                    <StarRating value={op.ratingAvg} count={op.ratingCount} size="lg" />
                                </div>
                            </div>
                        </div>

                        {op.description && (
                            <div className="space-y-3">
                                <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">About</h2>
                                <p className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap">{op.description}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Services</h2>
                            <div className="flex flex-wrap gap-2">
                                {services.map((s) => (
                                    <span key={s} className="flex items-center gap-2 text-sm font-medium text-white bg-[#18222e] border border-white/5 px-4 py-2 rounded-xl">
                                        <CheckCircle className="w-4 h-4 text-[#5BC2E7]" /> {labelForCategory(s)}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {packages.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Packages</h2>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {packages.map((pk: any) => (
                                        <div key={pk.id} className="p-5 rounded-2xl bg-[#18222e] border border-white/5 space-y-3 flex flex-col">
                                            <h3 className="font-bold text-white">{pk.title}</h3>
                                            <p className="text-sm text-gray-400 leading-relaxed flex-1 line-clamp-3">{pk.description}</p>
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl font-black text-white">${pk.price.toLocaleString()}</span>
                                                <span className="text-xs text-gray-500">{pk.deliveryDays} day delivery</span>
                                            </div>
                                            <OrderPackageButton packageId={pk.id} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {portfolio.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Portfolio</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {portfolio.map((d: any) => (
                                        <a key={d.id} href={d.url} target="_blank" rel="noopener noreferrer"
                                            className="aspect-square rounded-xl overflow-hidden bg-black/30 border border-white/5 hover:border-[#5BC2E7]/40 transition-all">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={d.url} alt={d.name} className="w-full h-full object-cover" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-5">
                            <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                Reviews {op.ratingCount > 0 && <span className="text-gray-600">({op.ratingCount})</span>}
                            </h2>
                            {reviews.length === 0 ? (
                                <p className="text-sm text-gray-500">No reviews yet. This operator has not been reviewed.</p>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((r) => (
                                        <div key={r.id} className="p-5 rounded-2xl bg-[#18222e] border border-white/5 space-y-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <StarRating value={r.rating} size="sm" />
                                                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {r.comment && <p className="text-sm text-gray-300 leading-relaxed">{r.comment}</p>}
                                            <p className="text-[11px] font-bold text-gray-500">{r.client?.name || "Client"} · {r.job?.title}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-[#18222e] border border-white/5 space-y-5">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-[#5BC2E7]" /> Jobs completed</span>
                                <span className="text-lg font-bold text-white">{op.jobsCompleted}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#5BC2E7]" /> Service range</span>
                                <span className="text-lg font-bold text-white">{op.radius ? `${op.radius} km` : "On request"}</span>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-[#5BC2E7]/5 border border-[#5BC2E7]/15 space-y-4">
                            <h3 className="text-sm font-bold text-white">Need this kind of work?</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">Post a job and verified operators like {displayName} can send you a quote.</p>
                            <Link href="/jobs/new" className="block">
                                <Button className="w-full bg-[#FB7427] hover:bg-[#e8651a] text-[#0f1722] font-bold h-12 rounded-xl">
                                    Post a job <ArrowRight className="ml-1 w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
