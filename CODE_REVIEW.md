# DroneHub Marketplace - Code Review and Path to Live

Date: 21 June 2026
Scope: read-only review of the existing monorepo. No code was changed.

---

## 1. What the stack is

A single npm-workspaces monorepo.

**apps/web** - the whole product (frontend + backend in one Next.js app)
- Next.js 16.0.10 (App Router, Turbopack), React 19.2, TypeScript 5
- Tailwind CSS v4, shadcn/ui (Radix primitives), lucide icons
- Forms: react-hook-form + Zod
- Auth: NextAuth v4, JWT session strategy, Credentials provider (bcrypt password hashing), Google provider scaffolded but with empty credentials, Prisma adapter
- Storage: AWS S3 SDK (works with S3 / Cloudflare R2 / MinIO) with presigned URLs, plus a "demo bypass" that fakes uploads when no bucket is configured
- Server logic lives in `app/actions/*` (Next server actions) rather than REST routes
- Tests: Playwright e2e (one operator-journey spec)

**packages/db** - the data layer
- Prisma 5.22 ORM, schema + seed script
- Models: User, Account, Session, ClientProfile, OperatorProfile, JobRequest, Proposal, Thread, Message, Document

**Infra / deploy**
- Dockerfile (multi-stage) and docker-compose (Postgres 15 only)
- Git history shows several Railway deploy attempts (Nixpacks, then Railpack, then a Dockerfile). README also mentions Vercel/Render + Neon/Supabase + Cloudflare DNS

---

## 2. What's working

- **The code compiles.** A clean TypeScript typecheck (`tsc --noEmit`) passes with zero errors. The historical type error in `OnboardingForm.tsx` and the `/login` prerender error are both already patched in the current files.
- **Auth and roles**: client/operator registration, login, JWT sessions, role-based route guards in middleware, admin-only guard.
- **Operator flow**: onboarding form + server action, admin approval queue (approve/reject).
- **Client flow**: post a job, operator feed with basic category matching, submit proposals, award a proposal.
- **Messaging**: per-job thread component, plus a file-upload component and S3 helper (with the demo fallback).
- **Demo data**: a seed script creates an admin (`commander@dronehub.global` / `admin123`), an operator (`pilot@dronehub.global` / `demo123`) and sample clients.
- **Health check**: `/api/health` endpoint exists.
- The UI is genuinely polished and themed.

---

## 3. What's broken or incomplete

1. **Database engine mismatch (the single biggest issue).** The Prisma schema is set to **SQLite** with a hardcoded `file:./dev.db`, and `dev.db` is committed. But `.env` and `docker-compose.yml` are both **Postgres**. So the app currently ignores `DATABASE_URL` entirely and reads a local SQLite file. This will not host: serverless and container platforms wipe the local filesystem, so the SQLite file (and all data) disappears on every deploy/restart.

2. **The datasource URL is hardcoded**, not `env("DATABASE_URL")`. Even setting an env var in prod does nothing today.

3. **Secrets are committed and weak.** `.env` is tracked in git with `NEXTAUTH_SECRET` and `JWT_SECRET` both set to `"supersecretchangeinprod"`. These must be rotated and the file untracked before any public deploy.

4. **The entire working tree is uncommitted.** Every source file shows as Modified against the last commit. That means the version Railway would build from git is *not* the version on disk, and a lot of work is sitting unsaved. Risky.

5. **`authOptions` is exported from `route.ts`.** Next.js 16 is stricter about route files exporting only HTTP handlers. This compiled in typecheck but is a known foot-gun and should move to `lib/auth.ts`. Worth confirming against a full production build.

6. **Middleware is deprecated** in Next 16 ("use proxy instead"). A warning today, a likely breakage on the next major.

7. **Matching is thin and possibly mismatched.** The operator feed filters only by `job.category IN operator.services`. It does not enforce APPROVED/ACTIVE, and there is no radius/geo or rating sort the directive calls for. More importantly, operator services are stored as IDs like `photography` while jobs may store a different category label, which can silently produce empty feeds.

8. **Storage is simulated by default.** Until a real S3/R2 bucket is set, document and deliverable uploads return fake URLs and nothing persists.

9. **Google OAuth** is wired with empty client ID/secret. Harmless unless a user clicks it, then it errors.

10. **Several MVP pages from the directive are missing**: public Browse Operators, public Operator Profile, How-it-works (client + operator), Pricing placeholder, Terms/Privacy/Contact, Account page, Profile editor, Documents vault.

11. **Repo clutter**: `dev.db`, `.next/`, and numerous `build_log*.txt` / `test_output*.txt` / error logs are committed.

---

## 4. What's stopping it running locally

- Prisma client must be generated for your OS (a stale Windows-only engine is in the tree).
- The DB story is contradictory (SQLite schema vs Postgres env), so "follow the README" currently leads to confusion.
- Once the datasource and engine are sorted, it is the standard sequence: install at root, generate, push schema, seed, `npm run dev`.

It is close. This is a configuration problem, not a rewrite.

---

## 5. What's stopping it being hosted

- SQLite is a non-starter on Railway/Vercel/Render. Needs managed Postgres (Neon, Supabase, or Railway Postgres) plus the schema switch and a migration.
- Real secrets and a prod `NEXTAUTH_URL`.
- A real storage bucket if document upload needs to actually work for the pilot.
- A confirmed green production build (could not be completed in this sandbox due to resource limits, but typecheck is clean and the known blockers are patched).
- Domain + HTTPS mapping.

---

## 6. Prioritised task list

### Phase A - Get it running locally (green)
- **A0.** Commit the current working tree to a branch so the work is saved and you have a known baseline.
- **A1.** Switch the DB to Postgres now to match production (avoids a second migration later): set schema `provider = "postgresql"`, change the datasource to `url = env("DATABASE_URL")`, and run Postgres via `docker compose up`.
- **A2.** `npm install` at root, `prisma generate`, `prisma migrate dev`, run the seed.
- **A3.** `npm run dev` and smoke-test the six success-criteria flows end to end.
- **A4.** Run a full `npm run build` and confirm it is green (validates `/login`, the `authOptions` export, and middleware).

### Phase B - Harden before deploy
- **B1.** Move `authOptions` into `lib/auth.ts`; confirm middleware vs proxy.
- **B2.** Rotate secrets, untrack `.env`, generate a strong `NEXTAUTH_SECRET`.
- **B3.** Tighten matching: enforce APPROVED + ACTIVE for proposals, reconcile service IDs vs job category, add rating/radius sort if cheap.
- **B4.** Configure real S3/R2 (or consciously accept demo storage for the first pilot).
- **B5.** Clean the repo: untrack `dev.db`, `.next/`, and the log/output txt files.

### Phase C - Deploy
- **C1.** Provision managed Postgres; run `migrate deploy` + seed.
- **C2.** Pick the host (Railway already has a Dockerfile, or Vercel) and set env vars.
- **C3.** Deploy and smoke-test over HTTPS.
- **C4.** Map your domain + HTTPS (Cloudflare DNS).
- **C5.** Store admin credentials safely and write the operator/client walkthrough.

### Phase D - Fill remaining MVP gaps (after first deploy)
- Public Browse Operators + public profile, How-it-works, Pricing placeholder, Terms/Privacy/Contact, Account/Profile editor, Documents vault.

---

## 7. Recommended starting point

Phase A, and inside it, A1 (the database switch) is the keystone. Almost everything downstream depends on it. The fastest credible route to "running locally then hosted" is: Postgres from the start, green build, then deploy to Railway using the Dockerfile that is already in the repo.
