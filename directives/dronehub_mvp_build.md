# DroneHub Marketplace MVP Build
Directive for a deployable Drone as a Service marketplace

> This directive is designed for a three layer architecture that separates intent, orchestration, and deterministic execution.
> The goal is a functional MVP that can be deployed and tested online, suitable for demos and pilot onboarding.

---

## Layer 1 Directive
What to do

### Objective

Build a functional MVP of the DroneHub Marketplace that supports:

- Public browsing of operator profiles
- Operator onboarding and authentication
- Client job posting
- Operator proposals
- Basic messaging per job
- Admin approval of operators
- Deployment to a live URL on the user’s domain

The MVP must be deployable and usable online for real testing with seeded data.

The MVP does not need advanced escrow, payouts, or full subscription billing in v1, but the system should be designed so Stripe can be added cleanly.

---

## Scope and MVP boundaries

### In scope for MVP

Public
- Home page
- Browse operators
- Operator public profile

Client
- Sign up, sign in
- Create a job request
- View job details
- View proposals
- Award a proposal
- Message thread per job

Operator
- Sign up, sign in
- Create and edit operator profile
- Choose services and service radius
- Upload compliance documents as files
- View matched jobs list
- Submit proposals
- Message thread per job

Admin
- Admin login
- Operator review queue
- Approve or reject operator profiles
- Basic metrics page, counts only
- Feature flags for markets, categories

Platform
- Basic rule based matching
- File storage for documents and deliverables
- Email notifications for key events, optional in MVP

### Explicitly out of scope for MVP

- Stripe subscriptions and paid plans
- Escrow and payouts
- Full analytics suite
- WhatsApp alerts
- Multi language packs
- Complex dispute workflows
- Computer vision checks
- OCR document processing

These should be designed for later, but not built for MVP.

---

## Success criteria for MVP demo

- A user can sign up as an Operator, create a profile, upload documents, and submit it for approval.
- An Admin can approve the Operator.
- A user can sign up as a Client, post a job, and see suitable Operators.
- Approved Operators can see the job in their feed and submit proposals.
- Client can award a proposal and exchange messages in a job thread.
- The app is deployed to a live environment and works over HTTPS on a user controlled domain.

---

## Roles and access control

Roles
- CLIENT
- OPERATOR
- ADMIN

Rules
- Only approved operators appear publicly.
- Only operators with status APPROVED can submit proposals.
- Only the job owner client can award the job.
- Admin can view and manage all jobs and operators.

---

## Core MVP user flows

Operator flow
1. Register
2. Create profile, services, radius, basic info
3. Upload licence and insurance files
4. Submit for review
5. Admin approves
6. Operator appears in search and can respond to jobs

Client flow
1. Register
2. Post a job with category and location
3. View job page
4. Receive proposals
5. Award a proposal
6. Message operator and upload deliverables

Admin flow
1. Login
2. Review operator queue
3. Approve or reject
4. View basic metrics counts

---

## Information architecture and pages

Public pages
- Home
- Browse Operators
- Operator Profile public page
- How it works for clients
- How it works for operators
- Pricing page placeholder
- Terms, privacy, contact

Client app pages
- Client dashboard
- Post a job
- Job detail with proposals
- Messages per job
- Account page

Operator app pages
- Operator dashboard
- Profile editor
- Jobs feed
- Proposal creation
- Messages per job
- Documents vault page

Admin app pages
- Overview metrics
- Operators review queue
- Operator detail approve reject
- Jobs list and detail

---

## MVP tech stack

Frontend
- Next.js with TypeScript
- Tailwind CSS
- shadcn UI
- React Hook Form and Zod

Backend
- Next.js route handlers for MVP, or a separate Node API if needed
- REST endpoints under /api
- Auth with NextAuth or custom JWT cookie sessions

Database
- PostgreSQL
- Prisma ORM

Storage
- S3 compatible storage for uploads, use presigned URLs

Deployment
- Docker for local dev
- Vercel or Render for the web app
- Neon or Supabase for Postgres
- Cloudflare DNS for domain mapping

---

## Environment variables

The execution layer must generate a `.env.example` and `.env` template.

Minimum required for MVP:

DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
JWT_SECRET=
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=

Optional for emails:

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

---

## Data model for MVP

The MVP must implement a simplified version of the full schema:

Required models
- User
- OperatorProfile
- ClientProfile
- JobRequest
- Proposal
- Thread
- Message
- Document

Subscription, Escrow, Payout, Invoice, Review can be stubbed or omitted for MVP.

---

## Matching rules for MVP

Use transparent rule based matching:

- Job category must be included in operator services
- Operator must be APPROVED
- Operator must be ACTIVE
- Operator radius must include job location, if location coordinates are available
- Sort by:
  - operator ratingAvg desc
  - distance asc if geo available
  - createdAt desc

If geo is not available, fallback to text match and service only.

---

## Deployment requirement

The MVP must be deployed to a live environment:
- HTTPS enabled
- Domain connected to user owned domain

The MVP must include a single command local run path:
- docker compose up
or
- npm run dev with env configured

---

## Layer 2 Orchestration
Decision making

### Responsibilities

The orchestrating agent must:

1. Read this directive first.
2. Check for existing tools in `execution/` before creating new scripts.
3. Scaffold the project repository with a standard structure:
   - `apps/web`
   - `packages/db`
   - `execution/`
   - `directives/`
   - `.tmp/`
4. Build MVP incrementally in milestones.
5. Run tests and smoke checks after each milestone.
6. Deploy early and often.
7. Self anneal when errors occur.

---

## Milestones for MVP

Milestone 1
- Repo scaffold
- Auth and roles
- Basic UI pages and layout
- Database connected

Milestone 2
- Operator onboarding and profile editor
- Admin approval queue
- Public browse and operator profiles

Milestone 3
- Client job posting
- Operator jobs feed and matching
- Proposals flow

Milestone 4
- Messaging threads per job
- File upload support

Milestone 5
- Basic admin metrics
- Demo seed data script
- Deployment and domain mapping instructions

---

## Self annealing loop

When something breaks:

1. Read the error message and stack trace.
2. Fix the deterministic code in execution scripts or the app code.
3. Run the smallest possible test to confirm the fix.
4. Update this directive with what was learned:
   - constraints
   - edge cases
   - better defaults
5. Repeat until stable.

Never ignore build failures or deployment errors.
Never hand wave missing environment variables.

Paid services are allowed only if required for deployment, otherwise choose free tiers.

---

## Layer 3 Execution
Doing the work

### Directory structure

- `directives/` MVP build instructions
- `execution/` deterministic scripts
- `.tmp/` intermediates
- `apps/web/` Next.js app
- `packages/db/` Prisma schema and migrations

---

## Required execution tools

The agent must create deterministic tools in `execution/` for:

1. `execution/scaffold_repo.py`
   - Creates folder structure
   - Writes base config files
   - Ensures consistent project layout

2. `execution/db_init.py`
   - Writes Prisma schema
   - Runs migrations
   - Seeds base categories and admin user

3. `execution/seed_demo_data.py`
   - Seeds example operators, clients, and jobs for demo
   - Ensures MVP is demo ready without manual work

4. `execution/deploy_checklist.md`
   - Step by step deployment instructions for chosen host
   - Domain mapping checklist
   - Required environment variables checklist

---

## Output deliverables

Deliverables must include:

- A deployed MVP accessible online
- A seeded demo environment
- Admin login credentials stored safely in local notes, not committed
- A README describing local dev setup and deployment
- A simple operator and client walkthrough

---

## Notes and constraints

- For MVP, keep payments stubbed.
- Prioritise usability and demo flow.
- Ensure all pages are mobile friendly.
- Ensure basic security:
  - secure cookies
  - role based guards
  - input validation
  - rate limiting basic

---

## External reference

Existing non operational MVP reference:
www.dronehub.global

This directive does not require matching its design, only functional parity for MVP.
