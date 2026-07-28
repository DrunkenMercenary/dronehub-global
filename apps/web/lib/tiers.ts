// Operator subscription tiers. Single source of truth for plan gating.
// Billing is not live yet: `plan` on OperatorProfile is set manually/seeded
// until Stripe subscriptions are switched on. Gating reads `plan` only.

export type Plan = "FREE" | "PRO"

export type TierConfig = {
    id: Plan
    label: string
    // Monthly price in the smallest currency unit (cents). 0 for free.
    priceMonthly: number
    currency: string
    blurb: string
    features: string[]
    // Stripe price id, wired later. Empty until billing is enabled.
    stripePriceIdEnv?: string
}

export const TIERS: Record<Plan, TierConfig> = {
    FREE: {
        id: "FREE",
        label: "Free",
        priceMonthly: 0,
        currency: "usd",
        blurb: "Get listed and start receiving job invitations.",
        features: [
            "Public profile in the directory",
            "Receive and respond to job invitations",
            "Up to 3 services listed",
        ],
    },
    PRO: {
        id: "PRO",
        label: "Pro",
        priceMonthly: 4900,
        currency: "usd",
        blurb: "Stand out, get found first, and win more work.",
        features: [
            "Verified badge after approval",
            "Priority placement in directory and search",
            "Unlimited services listed",
            "Everything in Free",
        ],
        stripePriceIdEnv: "STRIPE_PRICE_PRO_MONTHLY",
    },
}

export const PLANS: Plan[] = ["FREE", "PRO"]

export function normalisePlan(plan: string | null | undefined): Plan {
    return plan === "PRO" ? "PRO" : "FREE"
}

export function isPaid(plan: string | null | undefined): boolean {
    return normalisePlan(plan) === "PRO"
}

export function planLabel(plan: string | null | undefined): string {
    return TIERS[normalisePlan(plan)].label
}

// Gating: the verified badge is a paid (Pro) benefit, and only after the
// operator has been approved by an admin. Both conditions must hold.
export function canShowVerifiedBadge(args: {
    status?: string | null
    plan?: string | null
}): boolean {
    return args.status === "APPROVED" && isPaid(args.plan)
}

// Directory ranking weight: higher sorts first. Pro operators rank above Free.
export function rankWeight(plan: string | null | undefined): number {
    return isPaid(plan) ? 1 : 0
}
