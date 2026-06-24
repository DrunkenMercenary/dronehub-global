# syntax=docker/dockerfile:1

# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
# OpenSSL is required by Prisma's query engine at build and runtime
RUN apk add --no-cache openssl libc6-compat

# ---- Dependencies ----
FROM base AS deps
# Copy root workspace config
COPY package.json package-lock.json ./
# Copy workspace package.json files
COPY apps/web/package.json ./apps/web/package.json
COPY packages/db/package.json ./packages/db/package.json
# Copy prisma schema (needed for postinstall generate)
COPY packages/db/prisma ./packages/db/prisma
# Install all dependencies (this triggers postinstall -> prisma generate)
RUN npm ci

# ---- Builder ----
FROM base AS builder
# Copy everything from deps (node_modules are hoisted to root by npm workspaces)
COPY --from=deps /app ./
# Copy all source code
COPY . .
# Build the Next.js app
RUN npm run build --workspace=web

# ---- Runner ----
FROM base AS runner
ENV NODE_ENV=production
# Don't run as root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the full workspace structure needed at runtime
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web ./apps/web
COPY --from=builder /app/packages/db ./packages/db

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "run", "start", "--workspace=web"]
