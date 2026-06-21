# DroneHub - Phase B Report (hardening, journey test, real uploads)

Everything below was built in an isolated Linux copy, tested against a live Postgres,
and then published into your repo. The full build is green and the end-to-end journey
test passes 28 of 28 checks.

---

## What I changed

### 1. Auth moved out of the route file
`authOptions` now lives in `apps/web/lib/auth.ts`; the route file just wires the handler.
All six pages that used it were repointed. Google OAuth is now only enabled when both
Google env vars are set, so an unconfigured provider can't throw in production.

### 2. Fixed the matching bug (this was the important one)
The job form and operator form both used lowercase IDs (`inspection`, `surveying`...),
but the **seed** used Title-Case labels (`"Inspection"`, `"Cinematography"`, `"Real Estate"`),
and the feed match was case-sensitive. Result: seeded operators and newly posted jobs would
never see each other, so feeds looked silently empty.

Fixes:
- Added `apps/web/lib/categories.ts` as the single canonical taxonomy.
- Normalised job category and operator services to lowercase IDs on write and on match.
- Re-seeded operators/jobs onto the canonical IDs.

### 3. Approval gating (per the directive)
- Only `APPROVED` operators get a job feed.
- Only `APPROVED` operators can submit proposals (enforced in both proposal paths).

### 4. File uploads now actually work
Previously the uploader faked a URL and stored nothing. Now:
- `POST /api/upload` (auth required) stores the bytes — to S3/R2 if configured, otherwise
  to local disk (`apps/web/uploads`, gitignored).
- `GET /api/files/[key]` serves the stored file with the right content type and path-traversal guards.
- The `FileUploader` component sends the real file and uses the returned URL.

### 5. Secrets and repo hygiene
- Strong local `NEXTAUTH_SECRET` / `JWT_SECRET` generated (`.env` is local-only, not in git).
- `.gitignore` extended to exclude `uploads/`, `*.db`, and the stray build/test logs.

---

## The simulated journey test

`apps/web/journey.test.ts` drives the **real** server-action functions against a live
Postgres and asserts the database state at each step. It covers both journeys:

Operator (A): onboard -> appears in admin queue -> blocked from proposing while PENDING ->
admin approves -> feed populates with matching jobs -> proposes -> duplicate blocked.

Client (B): register -> post job -> dashboard lists it -> **approved operator sees the new
job (the cross-match test)** -> operator proposes -> client awards -> losing proposals
auto-rejected -> non-owner cannot award -> messaging thread exchanges messages ->
deliverable document saved -> admin stats populate.

Result: **28 passed, 0 failed.**

### Run it yourself
With Postgres running and `DATABASE_URL` set (locally, after `docker compose up`):

```bash
cd apps/web
npx prisma migrate reset --force --skip-generate --schema ../../packages/db/prisma/schema.prisma
npx tsx --tsconfig test/tsconfig.json journey.test.ts
```

(The `test/` folder contains a tiny stub so `revalidatePath` - which only runs inside a Next
request - is a no-op when actions are called directly from the test.)

---

## Two things you need to do on your machine

### A. Delete the stale git lock files (required before git will commit)
While committing through the sandbox, three 0-byte lock files were left behind and the
sandbox is not permitted to delete them. Git index operations (commit, `git rm`) are blocked
until you remove them. In the repo root:

```bash
del .git\HEAD.lock .git\index.lock .git\objects\maintenance.lock   # Windows
# or:  rm -f .git/HEAD.lock .git/index.lock .git/objects/maintenance.lock
```

### B. Untrack the old clutter (one command, optional but tidy)
`.gitignore` now excludes them, but these were already tracked, so untrack once:

```bash
git rm --cached packages/db/prisma/dev.db build_*.txt build_error.txt \
  apps/web/build_output.txt apps/web/test_output*.txt apps/web/tsc_error.log \
  packages/db/prisma_*.txt
```

Then commit everything:

```bash
git add -A
git commit -m "feat: Postgres migration, auth refactor, matching fix, real uploads, journey test"
```

---

## Status

- Local build: green (typecheck clean, production build passes).
- Database layer: migration + seed verified on Postgres.
- End-to-end journeys: 28/28 passing.
- Still your move: the Railway deploy itself (project, Postgres, env vars) per `RUN_AND_DEPLOY.md`.

Next sensible step is for you to run it locally and walk the six smoke-test steps, then we deploy.
