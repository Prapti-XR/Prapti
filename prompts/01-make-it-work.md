# Prompt 01 — Make Prapti a Working Shot

**Paste this to Fable in a fresh session in this repo.**

---

You are the lead engineer on **Prapti**, a heritage AR/VR platform built on Next.js 14. Your job in this session is to take the app to a **fully working, deployable state** — Goal 1 in `goals.md`.

## Step 0 — Load context (do this before touching anything)

Read, in this order:
1. `goals.md` (repo root) — the goals and the non-negotiable ground rules.
2. `CLAUDE.md` (repo root) — architecture, conventions, version locks.
3. Skim `docs/backend/`, `docs/schema/`, `docs/authentication/`, `docs/deployment/` and `prisma/schema.prisma`.

Do not skip this. The ground rules below will break the build if violated.

## Non-negotiable ground rules (from CLAUDE.md)

- **No React 19.** Keep `next 14.2.x`, `react 18.3.1`, and the pinned 3D stack (`three 0.169.0`, `@react-three/fiber 8.17.10`, `@react-three/drei 9.115.0`, `@react-three/xr 6.6.26`). Auth is **NextAuth v4** — use v4 APIs.
- Always run Prisma results through `serializeBigInt()` (`src/lib/utils.ts`) before returning JSON — `Asset.fileSize` is a `BigInt`.
- 3D viewers are client-only: dynamic import with `{ ssr: false }`, wrapped in `ThreeErrorBoundary`.
- `relationMode = "prisma"` — no DB foreign keys; keep `@@index` declarations intact.
- Read env through `@/env`, not `process.env`.

## Step 1 — Audit (produce a defect list before fixing)

Run and capture output for each:

```bash
npm install
npm run type-check
npm run lint
npm run build
```

Then, statically and by reasoning through the code:
- Walk **every page** under `src/app/` (home, `models`, `images`, `map`, `trivia`, `about`, `ar`, `profile`, `site/[id]`, `admin/*`, `auth/*`). Note anything that would crash at runtime, fetch from a broken route, or reference a missing prop/type.
- Walk **every route handler** under `src/app/api/` (`sites`, `sites/[id]`, `sites/nearby`, `models`, `images`, `trivia`, `upload`, `contributions/*`, `admin/*`, `auth/*`, `cache/sites`, `health/db`). Check: auth/role guard is correct, inputs validated, Prisma results serialized, error path returns proper status.
- Check env/config: `src/env.ts` vs `.env.example`; confirm `prisma db push` and `db:seed` (`prisma/seed.ts`) run against a real dev database.

**Write the findings to a running defect log** (`system/defect-log.md` if `system/` exists, otherwise inline in your message). Group by: build-blocking / runtime-crash / auth / data / cosmetic-but-broken. Order by severity.

## Step 2 — Fix to a working state

Work through the defect log **most-severe first**. For each fix:
- Make the smallest change that correctly resolves it, matching surrounding code style.
- Respect the ground rules above.
- Prefer reusing existing utilities (`src/lib/*`, `src/hooks/*`) over new code.

Do not silence errors with `any` casts or `@ts-ignore` unless there is truly no typed alternative — and if you do, leave a one-line comment explaining why.

## Step 3 — Verify (evidence, not assertion)

Re-run and confirm clean:

```bash
npm run type-check   # zero errors
npm run lint         # no errors
npm run build        # completes
npm run dev          # boots on :3000
```

Then drive the app: confirm each page in Step 1 renders, each auth-gated API returns 401/403 without a session and 2xx with the right role, `db:seed` populates data, and a 3D model + a 360° panorama + the map each render. Where you can't fully drive a flow (e.g. real Google OAuth), state exactly what you verified and what remains manual.

## Definition of Done

- [ ] `type-check`, `lint`, `build` all pass — paste the final output.
- [ ] `dev` server boots; every `src/app` page renders without crashing.
- [ ] Every `src/app/api` route returns correct status codes for authed/unauthed/valid/invalid input.
- [ ] Both auth providers work (or the exact manual step to confirm Google is stated).
- [ ] 3D / 360° / map all render.
- [ ] `db:push` + `db:seed` succeed.
- [ ] Defect log shows every item as fixed or explicitly deferred with a reason.

Finish with: a summary of what was broken and how you fixed it, and a short list of anything still uncertain or requiring the user (e.g. missing credentials).
