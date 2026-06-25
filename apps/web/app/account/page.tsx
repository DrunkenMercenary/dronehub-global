import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAccount } from "@/app/actions/account"
import { AccountSettings } from "@/components/shared/AccountSettings"
import { Settings } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AccountPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) redirect("/login")
    const account = await getAccount(session.user.email)
    if (!account) redirect("/login")

    return (
        <div className="min-h-screen bg-[#0f1722] py-16 md:py-24">
            <div className="container px-4 md:px-6">
                <div className="flex items-center gap-3 mb-10">
                    <Settings className="w-6 h-6 text-[#5BC2E7]" />
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Account settings</h1>
                </div>
                <AccountSettings account={account} />
            </div>
        </div>
    )
}
