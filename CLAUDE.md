# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Prapti is a Heritage AR/VR platform (Next.js 14 App Router) that presents cultural heritage sites through interactive 3D models, 360°/180° panoramas, a Google Maps discovery view, and educational trivia. Content is contributed through a GitHub-style fork/PR workflow with role-based review.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build (output: standalone)
npm start            # Serve production build
npm run lint         # ESLint (next/core-web-vitals)
npm run type-check   # tsc --noEmit — run this to verify types; there is no test suite

npm run db:push      # Push Prisma schema to DB (no migration files)
npm run db:migrate   # prisma migrate dev
npm run db:seed      # Seed DB (tsx prisma/seed.ts)
npm run db:studio    # Prisma Studio
```

`postinstall` runs `prisma generate` automatically. There is **no test framework** — verify changes with `npm run type-check` and `npm run lint`. Standalone scripts under `scripts/` are run with `tsx` (e.g. `npx tsx scripts/verify-backend.ts`).

## Version constraints (do not violate)

The 3D/XR stack is version-locked to a mutually compatible set. **Do not upgrade to React 19** or bump three.js / fiber / drei / xr independently:
- react 18.3.1, next 14.2.x
- three 0.169.0, @react-three/fiber 8.17.10, @react-three/drei 9.115.0, @react-three/xr 6.6.26

Despite the README text mentioning "NextAuth v5", the actual dependency is **next-auth v4** (`^4.24.7`) — use v4 APIs (`getServerSession(authOptions)`, `NextAuthOptions`).

## Architecture

**Rendering model:** Server Components fetch data (Prisma) and pass it to Client Components for interactivity. 3D components (`ModelViewer`, `ARViewer`, `PanoramaViewer`) are `'use client'` and **must be dynamically imported with `{ ssr: false }`** and wrapped in `ThreeErrorBoundary` — Three.js breaks under SSR. `.glb`/`.gltf` are handled as `asset/resource` via a webpack rule in `next.config.js`, which also sets `fs/net/tls` fallbacks to `false` on the client.

**Data layer (Prisma + Neon Postgres):**
- `src/lib/prisma.ts` exports a singleton `prisma` client with a global cache (avoids connection exhaustion in dev) and a `$use` middleware that translates Prisma error codes (P1001, P1002, pool exhaustion, etc.) into user-friendly messages.
- The schema uses `relationMode = "prisma"` — **referential integrity is enforced by the ORM, not the database.** There are no FK constraints in Postgres, so the many `@@index` declarations matter for query performance and must be maintained deliberately.
- `Asset.fileSize` is a `BigInt`. BigInt does not JSON-serialize, so **always pass Prisma results through `serializeBigInt()` (from `src/lib/utils.ts`) before returning them** from an API route. `jsonResponse()` does this for you.

**Auth (NextAuth v4):** Config in `src/lib/auth.ts`. JWT session strategy (not database sessions, for mixed-provider compatibility) with `PrismaAdapter`. Two providers: Google OAuth and Credentials (bcrypt). The `jwt` callback upserts the DB user on Google sign-in and carries `role` onto the token; `session` callback exposes `id` and `role` on `session.user` (typed in `src/types/next-auth.d.ts`).

**Role-based access:** `UserRole` enum is `USER` → `CONTRIBUTOR` → `MODERATOR` → `ADMIN`. API routes gate mutations by fetching the session and checking `session.user.role` (or re-querying the DB for role). Pattern: `ADMIN` for direct site creation; `ADMIN`/`MODERATOR` for admin panel and contribution review.

**Contribution workflow:** Non-admins submit `Contribution` records (GitHub PR analog) with a flexible `contributionData` Json payload and `ContributionType`/`ContributionStatus` enums. `Review` records (one per reviewer per contribution) drive approval. Approved contributions merge into `HeritageSite`/`Asset`. Assets also have their own `AssetStatus` approval lifecycle (PENDING → APPROVED/REJECTED/ARCHIVED).

**Storage (Cloudflare R2):** `src/lib/r2.ts` configures an S3 client against the R2 endpoint. Upload helpers in `src/lib/upload.ts`. Keys are structured `sites/{siteId}/{assetType}/{timestamp}-{filename}`. Client-side asset loading can route through a proxy (`/api/proxy-asset`) to avoid CORS when `NEXT_PUBLIC_USE_ASSET_PROXY=true`.

**Caching (Upstash Redis, optional):** `src/lib/redis.ts` exports a `cache` helper that **degrades gracefully to no-op if `UPSTASH_REDIS_REST_*` env vars are absent** — never assume Redis is present. API routes (e.g. `/api/sites`) use a cache-key-then-DB pattern with a TTL and non-blocking `cache.set`, plus HTTP `Cache-Control` / `stale-while-revalidate` headers.

**Env vars:** Validated at build/runtime via `@t3-oss/env-nextjs` + Zod in `src/env.ts`. Import from `@/env` rather than reading `process.env` directly. Note server lib files (`prisma.ts`, `r2.ts`, `auth.ts`, `redis.ts`) also call dotenv `config()` at import so `tsx` scripts pick up `.env`. Set `SKIP_ENV_VALIDATION=1` to bypass validation during builds.

## Conventions

- **Path aliases:** `@/*` → `src/*` (also `@/components/*`, `@/lib/*`, `@/hooks/*`, `@/types/*`, etc.). Use these, not relative `../../` chains.
- **TypeScript is strict** including `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`. Prefix intentionally unused vars/args with `_`.
- Prettier: single quotes, semicolons, 2-space, `printWidth: 100`, always-parens arrows.
- Prefer Prisma type-safe queries over raw SQL.
- API routes return `{ success, data | error }` JSON; guard mutations with session + role checks.

## Directory map

- `src/app/` — App Router pages + `api/` route handlers. `admin/` (dashboard: sites, users, uploads, analytics, contributions), `site/[id]/`, `models/`, `images/` (panoramas), `map/`, `trivia/`, `ar/`, `auth/`.
- `src/components/` — `3d/` (viewers), `cards/`, `ui/`, `map/`, `layout/`, `ar/`, `error/`. Barrel exports via `index.ts`.
- `src/lib/` — `prisma`, `auth`, `r2`, `upload`, `redis`, `db-health`, `utils`, `maps/`.
- `src/hooks/` — map/geolocation hooks (`useGoogleMaps`, `useNearbySites`, `useMapFilters`, …).
- `prisma/schema.prisma` — full data model. `docs/` — extensive design/architecture/security/scaling docs and `example-data/` (sample sites, `.glb` models, 360° images) for seeding.
