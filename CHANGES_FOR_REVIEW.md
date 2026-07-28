# Changes for review - auth hardening, login, demo wording

Date: 28 July 2026
Status: written and verified in an isolated sandbox. Nothing pushed. Your live
site and live `neondb` were never touched. Review, then push yourself.

## What I verified (automated gates, all green)

- **Full TypeScript type-check** of the whole app: clean. Every caller of a
  changed action still compiles, so no page was silently broken by the new
  signatures.
- **New security regression test** `apps/web/auth-guards.test.ts`: 13 of 13
  passed against a real seeded database. It proves that with no session, every
  guarded action refuses to act, and that the database is not mutated (the guard
  fires before the write). This is the exact exploit class from the audit.
- **Migration grandfather step**: ran it against the test DB. All 5 APPROVED
  operators moved to PRO (kept their badge); the PENDING one stayed FREE.

What I could not fully automate: the signed-in happy path (a real logged-in user
posting a job, bidding, awarding) and a production `next build`, both for sandbox
reasons, not code reasons. Please click through those on the Railway preview
after deploy. Details in STRESS_TEST_FINDINGS.md.

## 1. Server-action auth hardening (the critical fix)

New file `apps/web/lib/session.ts`: one place that answers "who is calling this
action", always from the signed-in session, never from arguments.

Every mutating and data-reading server action now derives identity from the
session. Where an action still takes an email/id argument, it is kept only so
existing callers compile and is ignored for security decisions. Files changed:

- `admin.ts` - all three actions now require an ADMIN session. This closes the
  worst hole: an operator could previously self-approve and get the verified
  badge. `updateOperatorStatus` now refuses without admin.
- `proposal.ts` - `createProposal` verifies the signed-in operator owns the
  `operatorId` in the payload; `awardProposal` uses the session client.
- `job.ts`, `review.ts`, `package.ts`, `favourite.ts`, `notification.ts`,
  `account.ts`, `operator.ts`, `operator_profile.ts`, `payment.ts`,
  `subscription.ts` - identity from session; no cross-user reads or writes.
- `message.ts` - sender and thread access are now checked against the session;
  only a conversation participant can read or post.
- `document.ts` - licence/insurance documents are returned only to the owner or
  an admin. Portfolio images stay public. Uploads must target your own profile.

Registration actions (`onboardOperator`, `registerClient`) are intentionally
left open - creating an account should not require being signed in.

## 2. Login and Google sign-in

- Email + password login is unchanged and still works.
- Added a "Continue with Google" button to `/login`. It only renders when the
  Google provider is actually configured, so there is no dead button in
  production. It will appear automatically once the keys below are set.

**To turn Google sign-in on (needs you):**
1. In Google Cloud Console, create an OAuth 2.0 Client ID (Web application).
2. Authorised redirect URI: `https://www.dronehub.global/api/auth/callback/google`
   (add `http://localhost:3000/api/auth/callback/google` for local dev).
3. Put the client id and secret into Railway env vars `GOOGLE_CLIENT_ID` and
   `GOOGLE_CLIENT_SECRET` (they are currently empty). The button then appears and
   works. No code change needed.

## 3. Demo wording removed

- Homepage: the "View 90-Second Investor Demo" link now reads "See how it works"
  and points to `/how-it-works`.
- Login: the "Demo accounts / Demo logins for testing" box is gone.

## 4. Deploy safety - badge-strip migration guarded

`packages/db/prisma/migrations/20260625120000_add_operator_plan/migration.sql`
now grandfathers existing APPROVED operators onto PRO in the same migration, so
nobody loses their verified badge when the tier work deploys.

## Suggested commit sequence (you run these)

```
# from the repo root, after reviewing the diff
git add -A
git commit -m "feat: session-based auth on all server actions; Google sign-in button; grandfather operators to PRO; remove demo wording"
git push origin main   # Railway auto-deploys
```

After deploy, smoke test on the preview: log in with email/password, post a job
as a client, bid as an approved operator, award it, and confirm an operator
cannot reach /admin.

## Files added
- `apps/web/lib/session.ts`
- `apps/web/auth-guards.test.ts`
- `CHANGES_FOR_REVIEW.md` (this file)

## Files changed
- 14 server actions under `apps/web/app/actions/`
- `apps/web/app/login/page.tsx`, `apps/web/app/page.tsx`
- `packages/db/prisma/migrations/20260625120000_add_operator_plan/migration.sql`
