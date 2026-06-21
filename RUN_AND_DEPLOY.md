# DroneHub - Run Locally and Deploy to Railway

This is the practical guide. It assumes the Postgres switch is already done (it is).
Everything below has been verified: migration applies, seed runs, and the production
build is green both with and without a live database.

---

## What changed in this pass

- Prisma now targets **Postgres** (`provider = "postgresql"`, `url = env("DATABASE_URL")`).
- `packages/db/.env` had a stale placeholder URL (`johndoe@.../mydb`). Fixed to match the app.
- A real initial migration was generated and committed: `packages/db/prisma/migrations/20260621043917_init`.
- Your previous state is saved on the git branch `baseline-pre-postgres` if you ever need to roll back.

---

## Part 1 - Run it locally

You need Docker Desktop (for Postgres) and Node 20+.

```bash
# 1. Start Postgres (uses docker-compose.yml already in the repo)
docker compose up -d

# 2. Install everything from the repo root
npm install

# 3. Apply the database migration
cd packages/db
npx prisma migrate deploy

# 4. Seed the demo data
npx tsx seed.ts

# 5. Start the app (from the repo root)
cd ../..
npm run dev
```

Open http://localhost:3000

If `docker compose up` ever fails on the port, something else is using 5432. Stop it,
or change the port in both `docker-compose.yml` and your `DATABASE_URL`.

### Demo logins (created by the seed)

| Role     | Email                        | Password   |
|----------|------------------------------|------------|
| Admin    | commander@dronehub.global    | admin123   |
| Operator | pilot@dronehub.global        | demo123    |
| Client   | realestate@example.com       | demo123    |

### Smoke test (the six things that must work)

1. Register as an operator, complete the onboarding form, submit for review.
2. Log in as admin, approve that operator.
3. Register as a client, post a job.
4. Approved operator sees the job in their feed and submits a proposal.
5. Client awards the proposal.
6. Client and operator exchange messages on the job thread.

---

## Part 2 - Deploy to Railway

Railway will host both the app and the Postgres database in one project, building from the
Dockerfile already in the repo.

### Step 1 - Push your code
Make sure the current branch is committed and pushed to GitHub. Railway deploys from a repo.

```bash
git add -A
git commit -m "feat: switch to Postgres, add initial migration"
git push
```

### Step 2 - Create the project and database
1. railway.app -> New Project -> Deploy from GitHub repo -> pick this repo.
2. In the same project: New -> Database -> Add PostgreSQL.
3. Railway exposes the database URL as a variable on the Postgres service
   (usually `DATABASE_URL` or `DATABASE_PRIVATE_URL`).

### Step 3 - Set environment variables on the web service
In the web service -> Variables, add:

```
DATABASE_URL      = ${{Postgres.DATABASE_URL}}   # reference the Postgres service
NEXTAUTH_URL      = https://your-app.up.railway.app   # your Railway domain, then your custom domain
NEXTAUTH_SECRET   = <generate a strong value, see below>
JWT_SECRET        = <generate a second strong value>
```

Optional (only if you want real file uploads instead of the demo fallback):

```
S3_ENDPOINT          = ...
S3_BUCKET            = ...
S3_ACCESS_KEY_ID     = ...
S3_SECRET_ACCESS_KEY = ...
```

Generate strong secrets:

```bash
openssl rand -base64 32
```

### Step 4 - Run the migration against the Railway database (one time)
The Dockerfile builds the app but does not run migrations. Run it once after the first deploy.

Easiest path with the Railway CLI:

```bash
npm i -g @railway/cli
railway login
railway link            # select your project
railway run --service <web-service-name> sh -c "cd packages/db && npx prisma migrate deploy && npx tsx seed.ts"
```

(Seed is optional in production. Run it only if you want the demo data live.)

### Step 5 - Verify
- Visit `https://your-app.up.railway.app/api/health` -> should return `{"status":"ok"}`.
- Log in with an admin account and walk the six smoke-test steps above.

### Step 6 - Custom domain + HTTPS
1. Railway web service -> Settings -> Networking -> Custom Domain. Add your domain.
2. In Cloudflare DNS, add the CNAME Railway gives you.
3. Update `NEXTAUTH_URL` to your final domain and redeploy. (NextAuth callbacks break if this is wrong.)

---

## Required environment variables (checklist)

| Variable             | Local                                   | Railway                          |
|----------------------|-----------------------------------------|----------------------------------|
| DATABASE_URL         | postgres on localhost:5432              | reference the Postgres service   |
| NEXTAUTH_URL         | http://localhost:3000                   | your https domain                |
| NEXTAUTH_SECRET      | any dev value                           | strong random value              |
| JWT_SECRET           | any dev value                           | strong random value              |
| S3_* (optional)      | blank = demo upload mode                | set only for real file storage   |

---

## Before you go fully public (recommended, not yet done)

These are the Phase B items from the review, worth doing before real users:

1. Rotate `NEXTAUTH_SECRET` / `JWT_SECRET` (currently the weak placeholder), and stop tracking `.env` in git.
2. Move `authOptions` out of the route file into `lib/auth.ts` (works today, but it is fragile under Next 16).
3. Tighten operator matching: enforce APPROVED + ACTIVE and reconcile service IDs vs job category.
4. Configure real S3/R2 storage if document uploads need to persist.
5. Clean the repo: stop tracking `dev.db`, `.next/`, and the old `*_log*.txt` / `*output*.txt` files.

Say the word and I will do this list next.
