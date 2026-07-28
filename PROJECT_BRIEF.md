# DroneHub - Project Brief

The single source of truth for this project. Read this first.

## What this is
DroneHub is a Drone-as-a-Service marketplace connecting drone operators (pilots and
companies) with customers who need aerial work (photography, inspection, surveying,
mapping, agriculture, search & rescue). Asia-Pacific focus, with Hong Kong as the first
market. It blends two hiring models: Upwork-style job posting + bidding, and Fiverr-style
fixed-price packages with direct ordering.

## Live + deployment
- Live site: https://www.dronehub.global (bare dronehub.global 301-redirects to www)
- Temporary Railway URL: https://web-production-dc6f7.up.railway.app
- Hosting: Railway (project "nurturing-serenity", service "web"), auto-deploys on push to GitHub `main`
- Repo: github.com/DrunkenMercenary/dronehub-global (branch `main`)
- Database: Neon Postgres (already migrated + seeded)
- Domain: GoDaddy DNS (CNAME www -> Railway, _railway-verify.www TXT, root forwards to www)
- File storage: local disk by default; S3/R2 ready when keys are added

To deploy a change: commit, then `git push origin main`. Railway builds and releases in ~2-3 min.

## Tech stack
- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4, shadcn/ui, lucide icons
- Auth: NextAuth v4 (JWT, credentials), role-based (CLIENT, OPERATOR, ADMIN)
- Prisma 5 ORM, PostgreSQL (Neon)
- npm workspaces monorepo: `apps/web` (the app) + `packages/db` (schema, migrations, seed)
- Deployed via the repo's Dockerfile (node:20-alpine, OpenSSL installed for Prisma)

## What's built (all live + tested)
- Accounts, role-based onboarding (client + operator), admin approval queue
- Operator credential vault (licence/insurance upload) + verified badge
- Public operator directory with search + category filters; public operator profiles
- Job posting, operator job feed (rules-based matching), proposals/bidding, award
- Job lifecycle: Open -> Awarded -> Completed
- Fiverr-style service packages + direct order (creates an awarded job)
- Ratings & reviews after completion (aggregate scores on profiles + directory)
- Per-job messaging; in-app notifications (bell + /notifications)
- Operator portfolio gallery; saved operators (client favourites); account settings
- Regulatory knowledge base (/regulations) by country
- Static pages: how-it-works, pricing, terms, privacy, contact
- Stripe Checkout for awarded jobs (built, switched off until keys are added; webhook fulfilment ready)
- End-to-end journey test (`apps/web/journey.test.ts`) covering the full flows

## Brand / design
- Blue (#5BC2E7, Gulf/McLaren style) is the primary brand colour; orange (#FB7427) is the secondary/accent
- Dark slate base (#0f1722 / #18222e). Semantic status: green = approved, amber = pending, red = rejected
- Tone: clear and professional with a light aviation edge (no heavy "military/mission" jargon)

## Business model (direction, not final)
- Operators are the payer: freemium -> paid subscription for access, visibility, the verified badge, tools
- Customers stay mostly free to build demand liquidity
- Avoid commission on jobs: work is in-person/offline (HK uses WhatsApp), so commission leaks
- Two tracks: self-serve marketplace for SME/long-tail; managed/agency model for enterprise (MTR, Jockey Club, etc.) where DroneHub is onboarded as a single vetted vendor and takes margin
- Stripe is scaffolded; Stripe Connect (paying operators) is the next payments step

## What's next (roadmap)
- Operator subscription tiers + billing (the chosen model)
- Stripe Connect onboarding + payouts/escrow
- Email notifications (SMTP), Google sign-in (keys)
- Deeper search (geo/distance), two-way reviews, analytics dashboard

## Dev workflow notes (important)
- After ANY database schema change, run `npm run generate` before `npm run dev`, or the app 404s/errors on stale Prisma client
- Local run: `docker compose up` (or point DATABASE_URL at Neon) -> `npm install` -> `cd packages/db && npx prisma migrate deploy && npx tsx seed.ts` -> `npm run dev`
- Demo logins (seeded): see `packages/db/seed.ts` for the seeded accounts. Passwords are NOT recorded here because this repo is public. Production passwords must be rotated away from the seed defaults.
- Secrets live in `.env` (gitignored), not in the repo. Railway holds the production env vars (DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, JWT_SECRET; Stripe keys blank for now)

## Key docs in this folder
- FEATURE_MAP.md - full feature roadmap (done / roadmap)
- RUN_AND_DEPLOY.md - local run + Railway deploy steps
- STRIPE_SETUP.md - how to switch payments on
- SOW_GAP_AND_UX_REVIEW.md - scope vs build gap analysis + UX review
- CODE_REVIEW.md, PHASE_B_REPORT.md, MORNING_SUMMARY.md - progress history
