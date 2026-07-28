# DroneHub - Operator Subscription Tiers (Free + Pro)

Date: 25 June 2026
Status: Built, not yet verified by a local build or deployed. Billing is off until Stripe keys are added.

## What this adds
A Free + Pro tier model for operators. `plan` on the operator profile is the single
source of truth for gating. Two benefits are gated behind Pro:

1. **Verified badge** - shows only when the operator is APPROVED and on Pro.
2. **Directory ranking** - Pro operators sort above Free in the directory and search.

Billing is deliberately not live. `plan` is set by seed/admin for now. The Stripe
subscription action is wired but dormant until keys and a price id are configured,
exactly like the existing one-off Checkout.

## Files changed
- `packages/db/prisma/schema.prisma` - OperatorProfile gains `plan` (default FREE),
  `planSince`, `stripeCustomerId`, `stripeSubscriptionId`.
- `packages/db/prisma/migrations/20260625120000_add_operator_plan/migration.sql` - additive ALTER TABLE.
- `apps/web/lib/tiers.ts` - tier config + gating helpers (`isPaid`, `canShowVerifiedBadge`, `rankWeight`).
- `apps/web/lib/operators.ts` - directory now returns a `verified` flag and ranks Pro first.
- `apps/web/components/operator/OperatorBrowser.tsx` - badge gated on `op.verified`.
- `apps/web/app/operators/[id]/page.tsx` - profile badge gated on `op.verified`.
- `apps/web/app/actions/subscription.ts` - dormant Pro subscription Checkout (off until keys).
- `packages/db/seed.ts` - demo operator "Alpha Flight" set to Pro so the badge + ranking show.

## Behaviour change to note
After the migration, every existing approved operator defaults to **Free**, so they
lose the verified badge until upgraded. To set specific operators to Pro on the live DB:

```sql
UPDATE "OperatorProfile" SET "plan" = 'PRO', "planSince" = now() WHERE "id" = '<operator_id>';
```

## Verify locally before deploying (I could not run these from my sandbox)
```
npm run generate            # regenerate Prisma client with the new fields
cd packages/db && npx prisma migrate deploy   # applies the new migration
npx tsx seed.ts             # optional: reseed so Alpha Flight is Pro
cd ../../ && npm run build  # type-check + build must be green
npx tsx apps/web/journey.test.ts   # end-to-end journey test
```

## Deploy (only after the above is green)
```
git add -A && git commit -m "feat: operator Free/Pro tiers, gate verified badge + directory ranking"
git push origin main        # Railway auto-deploys
```

## Switching billing on later (next step, not done here)
1. Create a recurring Price in Stripe for Pro.
2. Set `STRIPE_SECRET_KEY` and `STRIPE_PRICE_PRO_MONTHLY` in Railway.
3. Add an Upgrade button calling `createSubscriptionCheckout`, and extend the Stripe
   webhook to flip `plan` to PRO on `checkout.session.completed` / subscription events,
   and back to FREE on cancellation.
