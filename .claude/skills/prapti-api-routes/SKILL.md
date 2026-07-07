---
name: prapti-api-routes
description: Use when creating or editing any route handler under src/app/api/ in Prapti — response shape, auth/role gating pattern, BigInt serialization, status-code contract, caching pattern, and input validation. Also use when a page's fetch() to an API misbehaves.
---

# Prapti API Route Conventions

_Last verified: 2026-07-07 against `src/app/api/*` and `CLAUDE.md`._

## Response shape (the contract)

Success: `{ success: true, data: <payload> }`. Failure: `{ error: '<user-safe message>' }` with the right status. Never leak stack traces or Prisma internals — log them server-side (`console.error`) and return a generic message (source: `docs/security/api_security.md` §Error Response Security).

## Status codes

- `200` success · `201` resource created (see `POST /api/auth/register`)
- `400` invalid/missing input — validate **before** touching the DB
- `401` no session · `403` authenticated but wrong role
- `500` unexpected — always inside a `try/catch` that logs

## Auth/role gating pattern (copy this)

```ts
const session = await getServerSession(authOptions);          // NextAuth v4 API
if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// Re-query the DB for role on privileged routes (token role can be stale):
const user = await prisma.user.findUnique({
  where: { email: session.user.email! },
  select: { role: true },
});
if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

Role ladder: `USER → CONTRIBUTOR → MODERATOR → ADMIN`. Pattern in practice: `ADMIN` for direct site creation; `ADMIN`/`MODERATOR` for admin panel + contribution review (source: `CLAUDE.md`; exemplars: `src/app/api/admin/sites/route.ts`, `src/app/api/admin/users/route.ts` — note `PATCH` there is ADMIN-only).

## BigInt rule (will 500 in production if skipped)

Any query returning `Asset` rows (or anything selecting `fileSize`) must pass through `serializeBigInt()` from `src/lib/utils.ts` before `NextResponse.json(...)` — or use `jsonResponse()` which handles it. Counts/`groupBy`/scalar selects are plain numbers and safe (that's why `admin/analytics` doesn't need it).

## Caching pattern (optional Redis)

`src/lib/redis.ts` exports `cache` that **degrades to a no-op when `UPSTASH_REDIS_REST_*` env vars are absent — never assume Redis exists**. Pattern used by `/api/sites`: check cache key → on miss query Prisma → `cache.set` non-blocking → also set HTTP `Cache-Control` / `stale-while-revalidate` headers. Nearby-sites cache keys are bounding-box + filters with short TTLs (source: `docs/scaling/REDIS_SETUP_GUIDE.md`). Admin cache management endpoint: `GET/DELETE /api/cache/sites` (ADMIN only, returns 403 unauthenticated by design).

## Input validation

Validate required fields explicitly and return 400 with a specific message (see `POST /api/admin/sites` lines 26–30). `docs/backend/getting_started.md` prescribes Zod schemas under `src/lib/validations/` for new surface area — prefer that for anything non-trivial. Coerce numerics (`parseFloat(data.latitude)`) rather than trusting client types.

## Unused `request` params

Strict TS flags them (`noUnusedParameters`) — write `export async function GET(_request: NextRequest)` when the request object is unneeded.

## Existing route map (18 routes)

`sites` (GET list, cached) · `sites/[id]` · `sites/nearby` · `models` · `images` · `trivia` · `upload` (POST, auth) · `auth/[...nextauth]` · `auth/register` · `contributions` (+ `[id]`, `[id]/review`) · `admin/{sites,users,analytics,contributions}` · `cache/sites` · `health/db`. Pages fetch these with plain `fetch('/api/...')` from client components.

## When NOT to use this skill

UI/component work (use `prapti-design-system`), schema changes (use `prapti-data-model`), auth *configuration* changes (use `prapti-auth`).

**How to re-verify this:** read any two routes under `src/app/api/admin/` and `src/lib/utils.ts` (`serializeBigInt`, `jsonResponse`); confirm the status-code contract with the curl checks in `prapti-verification`.
