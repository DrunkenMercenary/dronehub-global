import Stripe from "stripe"

let _stripe: Stripe | null = null

// Returns a Stripe client only when a secret key is configured.
// Everything that calls this must handle null so the app runs fine without keys.
export function getStripe(): Stripe | null {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) return null
    if (!_stripe) _stripe = new Stripe(key)
    return _stripe
}

export function isPaymentsEnabled(): boolean {
    return !!process.env.STRIPE_SECRET_KEY
}
