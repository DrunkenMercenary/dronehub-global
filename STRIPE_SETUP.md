# Stripe payments - setup guide

Payments are fully built and wired, but switched off until you add your keys. With no keys,
the app runs exactly as before and the job page shows "Online payment coming soon". Add the
two keys below and payment goes live, no code changes needed.

## What's built
- A "Pay" button on an awarded job (charges the agreed proposal price) that sends the client
  to Stripe Checkout.
- A webhook (`/api/stripe/webhook`) that marks the job paid when checkout completes and
  notifies both client and operator.
- A `Payment` record per job (amount, status, Stripe IDs), already in your database.

## Turn it on (about 10 minutes)

### 1. Get your keys
1. Create/sign in at https://dashboard.stripe.com and stay in **Test mode** to start.
2. Developers → API keys → copy the **Secret key** (`sk_test_...`).

### 2. Add the secret key
Put it in your env (locally in `.env`, and in Railway's Variables for production):
```
STRIPE_SECRET_KEY="sk_test_xxx"
```

### 3. Set up the webhook
Production (after deploy):
1. Stripe Dashboard → Developers → Webhooks → Add endpoint.
2. Endpoint URL: `https://your-domain/api/stripe/webhook`
3. Event to send: `checkout.session.completed`
4. Copy the **Signing secret** (`whsec_...`) into your env:
```
STRIPE_WEBHOOK_SECRET="whsec_xxx"
```

Local testing (uses the Stripe CLI):
```
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
The CLI prints a `whsec_...` secret, put that in your local `.env`.

### 4. Restart the app
```
npm run dev
```
Pay with the Stripe test card `4242 4242 4242 4242`, any future expiry, any CVC.

## Important: what's still roadmap
This scaffolding charges your platform Stripe account. To actually **pay operators**
(split funds, payouts, escrow, platform fee), you need **Stripe Connect** - operators
onboard their own Stripe accounts and you transfer or destination-charge to them. That's the
natural next step and the data model is ready for it. Also roadmap: refunds, multi-currency,
and milestone/escrow release.

## Files involved (if you want to look)
- `apps/web/lib/stripe.ts` - lazy Stripe client (null when no key)
- `apps/web/app/actions/payment.ts` - creates the Checkout session
- `apps/web/lib/payments.ts` - fulfilment (marks paid + notifies)
- `apps/web/app/api/stripe/webhook/route.ts` - the webhook
- `apps/web/components/client/PayButton.tsx` - the button
