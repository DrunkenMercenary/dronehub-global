"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CATEGORIES, labelForCategory } from "@/lib/categories"
import { createPackage, updatePackage, togglePackageActive, deletePackage } from "@/app/actions/package"
import { Plus, Pencil, Trash2, Eye, EyeOff, Clock, DollarSign } from "lucide-react"

type Pkg = { id: string; title: string; description: string; category: string; price: number; deliveryDays: number; active: boolean }

const empty = { title: "", description: "", category: "", price: "", deliveryDays: "7" }

export function PackagesManager({ packages }: { packages: Pkg[] }) {
    const { data: session } = useSession()
    const router = useRouter()
    const email = session?.user?.email || ""
    const [form, setForm] = useState<any>(empty)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    function set(k: string, v: string) { setForm((f: any) => ({ ...f, [k]: v })) }
    function reset() { setForm(empty); setEditingId(null); setError("") }

    async function submit() {
        setLoading(true); setError("")
        const payload = { ...form, price: Number(form.price), deliveryDays: Number(form.deliveryDays) }
        const res = editingId ? await updatePackage(editingId, payload, email) : await createPackage(payload, email)
        setLoading(false)
        if ((res as any)?.error) setError((res as any).error)
        else { reset(); router.refresh() }
    }
    function edit(p: Pkg) {
        setEditingId(p.id)
        setForm({ title: p.title, description: p.description, category: p.category, price: String(p.price), deliveryDays: String(p.deliveryDays) })
    }
    async function toggle(id: string) { await togglePackageActive(id, email); router.refresh() }
    async function remove(id: string) { await deletePackage(id, email); router.refresh() }

    return (
        <div className="grid gap-10 lg:grid-cols-2">
            <div className="p-6 rounded-2xl bg-[#18222e] border border-white/5 space-y-4 h-fit">
                <h2 className="text-lg font-bold text-white">{editingId ? "Edit package" : "Create a package"}</h2>
                {error && <p className="text-xs font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">{error}</p>}
                <Input placeholder="Title (e.g. Real estate photo package)" value={form.title} onChange={(e) => set("title", e.target.value)} className="bg-[#0f1722] border-white/5 h-12 text-white rounded-xl" />
                <Textarea placeholder="What's included, turnaround, deliverables..." value={form.description} onChange={(e) => set("description", e.target.value)} className="bg-[#0f1722] border-white/5 min-h-[100px] text-white rounded-xl resize-none" />
                <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full bg-[#0f1722] border border-white/5 h-12 text-white rounded-xl px-3 text-sm">
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <Input type="number" placeholder="Price (USD)" value={form.price} onChange={(e) => set("price", e.target.value)} className="bg-[#0f1722] border-white/5 h-12 text-white rounded-xl pl-9" />
                    </div>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <Input type="number" placeholder="Delivery days" value={form.deliveryDays} onChange={(e) => set("deliveryDays", e.target.value)} className="bg-[#0f1722] border-white/5 h-12 text-white rounded-xl pl-9" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button onClick={submit} disabled={loading} className="bg-[#5BC2E7] hover:bg-[#3aa9d4] text-[#0f1722] font-bold h-11 px-6 rounded-xl">
                        <Plus className="w-4 h-4 mr-1" /> {loading ? "Saving..." : editingId ? "Save changes" : "Add package"}
                    </Button>
                    {editingId && <Button onClick={reset} variant="outline" className="border-white/10 text-white h-11 rounded-xl">Cancel</Button>}
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-bold text-white">Your packages ({packages.length})</h2>
                {packages.length === 0 ? (
                    <p className="text-sm text-gray-500">No packages yet. Create one to let clients order your services directly.</p>
                ) : (
                    packages.map((p) => (
                        <div key={p.id} className="p-5 rounded-2xl bg-[#18222e] border border-white/5 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-bold text-white">{p.title}</p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{labelForCategory(p.category)}</p>
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${p.active ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-white/5 text-gray-500 border-white/10"}`}>{p.active ? "Live" : "Hidden"}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="font-black text-white">${p.price.toLocaleString()}</span>
                                <span className="text-gray-500 text-xs">{p.deliveryDays} day delivery</span>
                            </div>
                            <div className="flex gap-2 pt-1">
                                <Button onClick={() => edit(p)} variant="outline" className="h-9 border-white/10 text-white text-xs rounded-lg"><Pencil className="w-3.5 h-3.5 mr-1" /> Edit</Button>
                                <Button onClick={() => toggle(p.id)} variant="outline" className="h-9 border-white/10 text-white text-xs rounded-lg">{p.active ? <><EyeOff className="w-3.5 h-3.5 mr-1" /> Hide</> : <><Eye className="w-3.5 h-3.5 mr-1" /> Show</>}</Button>
                                <Button onClick={() => remove(p.id)} variant="outline" className="h-9 border-white/10 text-red-400 hover:bg-red-400/10 text-xs rounded-lg"><Trash2 className="w-3.5 h-3.5" /></Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
