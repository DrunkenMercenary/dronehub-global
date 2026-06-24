# DroneHub - Full Marketplace Feature Map

A complete map of what a Drone-as-a-Service marketplace needs, drawing on the
Upwork / Fiverr playbook, mapped to what's built, what I'm building tonight, and
what's sensibly left for later.

Status key: ✅ Done · 🌙 Building tonight · 🗺️ Roadmap (designed, not built)

---

## 1. Accounts & identity
- ✅ Email/password auth, JWT sessions, role-based access (Client, Operator, Admin)
- ✅ Role-based onboarding (operator sign-up, client sign-up)
- ✅ Operator profile (individual or company, services, radius, bio)
- ✅ Admin approval / rejection of operators
- ✅ Credential vault (licence + insurance upload), verified badge
- 🌙 Account settings (edit profile, change password)
- 🗺️ Google OAuth (scaffolded, needs keys), 2FA, email verification

## 2. Discovery & search
- ✅ Public operator directory with keyword search + category filter
- ✅ Public operator profiles (services, bio, range, jobs completed, reviews)
- ✅ Rules-based job matching to operators (category + approval gating)
- 🌙 Operator portfolio gallery (image work samples on profiles)
- 🌙 Saved operators / favourites (clients shortlist operators)
- 🗺️ Geo/distance ranking, "suggested matches", category landing pages, sort options

## 3. Hiring & engagement (the two marketplace models)
- ✅ Job posting (client briefs a project)
- ✅ Operator job feed (matched open jobs)
- ✅ Proposals / bidding (operator quotes price + cover note)
- ✅ Award a proposal (Upwork-style competitive hire)
- ✅ Job lifecycle: Open → Awarded → Completed
- ✅ Service packages / "gigs" (Fiverr-style fixed-price packages operators publish)
- ✅ Direct hire / instant order of a package (no bidding, creates an awarded job)
- 🗺️ Milestones, scope change requests, re-open / cancel flows

## 4. Communication
- ✅ Per-job messaging thread (client ↔ awarded operator)
- 🌙 In-app notifications (new proposal, awarded, message, review, approval, completion)
- 🗺️ Email notifications (needs SMTP), real-time push, read receipts, attachments in chat

## 5. Trust & reputation
- ✅ Ratings & written reviews after completion, aggregate scores on profiles + directory
- ✅ Verified-operator badge tied to admin approval
- ✅ Anti-fraud review rules (only the paying client, once, after completion)
- 🌙 Two-way reviews groundwork (operator can rate the client)
- 🗺️ Response rate, on-time %, repeat-client count, dispute/reporting

## 6. Transactions & billing
- ✅ Payment record per job + Stripe Checkout for awarded jobs (add keys to switch on)
- ✅ Webhook fulfilment (marks paid + notifies client and operator), graceful without keys
- 🗺️ Stripe Connect payouts to operators + escrow / milestone release
- 🗺️ Multi-currency, platform fee, invoices, refunds
- Note: Checkout is built and tested; Connect (paying operators) is the next step.

## 7. Content & compliance
- 🌙 Regulatory knowledge base (drone rules by country/region, searchable)
- 🌙 Static pages: how it works (client + operator), pricing, terms, privacy, contact
- 🗺️ Blog / resources, multi-language, regional airspace data feeds

## 8. Operations & admin
- ✅ Operator approval queue with submitted documents
- ✅ Basic admin metrics (users, jobs, volume)
- 🌙 Notifications visible to admins on key events
- 🗺️ Full analytics (growth, conversion, engagement), content management UI, user moderation, transaction monitoring

## 9. Platform & non-functional
- ✅ PostgreSQL (Neon) + Prisma, migrations
- ✅ S3/R2-ready file storage with local fallback
- ✅ Mobile-responsive dark UI, dual-tone brand (orange + Gulf blue)
- ✅ Deployable (Dockerfile, Railway-ready)
- 🗺️ Caching/search index at scale, rate limiting, audit logs, GDPR tooling

---

## Tonight's build order (highest value, lowest risk first)
1. In-app notifications — connects every existing flow.
2. Regulatory module — closes the last SOW Phase 1 gap.
3. Static info pages — fills the information architecture.
4. Operator portfolio gallery — richer profiles.
5. Saved operators (favourites) — buyer-side stickiness.
6. Account settings — fixes dead links, basic self-service.

Everything is built modularly: each feature is its own model + actions + components,
tested via the end-to-end journey harness, with the production build kept green and
all changes published to the workspace. Payments an