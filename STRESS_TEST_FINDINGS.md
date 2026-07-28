# DroneHub - Stress Test & Security Findings

Date: 17 July 2026
Tester: automated adversarial pass in an isolated sandbox
Scope: the uncommitted subscription-tier work + a security audit of the whole app

## How this was tested

I never touched your production database or the live site. I copied the repo into a
throwaway sandbox, spun up a separate `dh_test` database on your Neon instance (your
live `neondb` was left alone), applied all migrations, seeded it, and drove the real
server-action code against it. The live site stayed read-only.

## The headline

The build is more solid than the marketing-y "all live + tested" line in the brief
suggests, with **one systemic security hole that matters a lot for this specific product**:
none of your server actions check who is calling them. Everything else is competent.

---

## What passed (verified, not assumed)

- **All database migrations apply cleanly**, including the new `add_operator_plan` one.
- **TypeScript type-check is green** across the whole app, including the three uncommitted
  tier files (`tiers.ts`, `operators.ts`, `subscription.ts`). The `SUBSCRIPTION_TIERS.md`
  note that this was "not yet verified by a build" is now resolved: it type-checks.
- **Seed runs clean.** Demo environment builds.
- **18 of 18 core journey assertions passed**: operator onboarding, PENDING state,
  admin approval queue, pre-approval proposal block, document upload, the taxonomy
  cross-match bug test, client registration, job posting, and the operator feed picking
  up a brand-new client job. This is the part your journey test flags as the historically
  fragile bit, and it holds.
- **The file-upload API route is done properly**: it requires an authenticated session,
  rejects anonymous callers with 401, sanitises filenames, and enforces a 10MB cap.
- Inputs are validated with zod; the award action has a real data-ownership check.

Two things I could not finish in-sandbox, purely for environment reasons, not code
reasons: a full production `next build` (the sandbox ran out of memory on Turbopack and
threw a bus error, unrelated to your code), and the back half of the journey test
(proposal / award / messaging / packages / payment / reviews). The second one stalls
because your DB is in Singapore and the sandbox is far away, so each of the ~30 queries
is a slow round-trip and the test runs past the sandbox's per-command time limit. I
verified those paths by reading the code instead.

---

## Findings, worst first

### 1. CRITICAL - Server actions trust the identity you pass them, not your session

This is the one to care about. Every one of your 42 server actions decides "who is this"
by reading an email or a profile id **from the arguments the caller sends**, and none of
them independently checks the logged-in session. Server actions look like private function
calls but they compile to public POST endpoints. Anyone can invoke them with any arguments.

Your `middleware.ts` protects *page navigation* (you can't load `/admin`), but it does not
protect the action endpoints themselves. And tellingly, your upload *API route* does call
`getServerSession` - so the knowledge is there, it just never made it into the actions.

Concrete exploits this allows:

- **Operator self-approval (fraud vector).** `updateOperatorStatus(operatorId, "APPROVED")`
  in `admin.ts` has zero caller check. A logged-in operator can approve their own profile,
  get the verified badge, and appear in the directory - no admin involved. This directly
  breaks the trust model that your entire Pro tier is being sold on.
- **Bid as another operator.** `createProposal({ operatorId, ... })` never checks that the
  caller owns that operator profile. You can submit proposals in a competitor's name.
- **Award on someone else's job.** `awardProposal(proposalId, clientEmail)` checks that the
  passed email owns the job, but the email is attacker-supplied and emails aren't secret.
- Same shape across messages, packages, reviews, favourites, and account settings.

**Fix (about half a day, one pattern applied everywhere):** at the top of each action,
call `getServerSession(authOptions)`, derive the user from the session, and ignore any
identity passed in the arguments. Add a role check (`ADMIN`) to the admin actions. This is
a well-worn Next.js pattern and none of your data model has to change.

### 2. HIGH (deployment landmine) - Deploying the tier work strips every operator's badge

The `add_operator_plan` migration defaults every existing operator to FREE. Your gating
says the verified badge only shows for APPROVED **and** Pro. So the moment this deploys,
every currently-verified operator on the live site silently loses their badge until each
is manually set to Pro. Fine on seed data. Not fine if any real operator is in `neondb`.

**Fix:** before deploying, either check whether `neondb` has real operators, or bulk-set
existing APPROVED operators to PRO in the same migration so nobody loses status.

### 3. MEDIUM - Billing is off, and the brief should keep saying so

`createSubscriptionCheckout` is correctly dormant until Stripe keys exist. That's the right
call. Just make sure the reveal narrative never implies operators can pay yet - they can't.

### 4. LOW - Local disk file storage

Uploads default to local disk unless S3/R2 keys are set. On Railway that means uploaded
licences and insurance docs vanish on every redeploy. Fine for a demo, worth a line in the
"not done" column.

---

## Corrected done vs not-done (for the reveal)

Your `PROJECT_BRIEF.md` lists the built features as "all live + tested". Two precision fixes
so you never get caught overselling:

- The **subscription tiers** are written and now verified to type-check and migrate, but
  they are **uncommitted and not deployed**. The live site does not have them yet.
- "Tested" is fair for the happy-path flows (journey test passes). It is **not** yet fair on
  the security dimension - finding #1 above is real and unpatched. Better framing for a
  technical audience: "core flows are end-to-end tested; a security-hardening pass on server
  actions is the immediate next task."

Being the one who walks in already knowing this is far stronger than having Tim find it.

---

## Note

I created a `dh_test` database on your Neon project for isolation. It's separate from your
live `neondb` and harmless, but say the word and I'll drop it.
