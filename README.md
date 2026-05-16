# DroneHub MVP

This monorepo contains the DroneHub Marketplace MVP.

## Structure
- `apps/web`: Next.js frontend and API
- `packages/db`: Prisma ORM and database schema
- `execution`: Helper scripts
- `directives`: Instructions and requirements

## directives/dronehub_mvp_build.md

## Setup
1. `pip install -r requirements.txt` (if using python scripts) or just node
2. `npm install` in apps/web
3. Setup `.env`
4. `cd packages/db && npx prisma db push`
5. `cd apps/web && npm run dev`
