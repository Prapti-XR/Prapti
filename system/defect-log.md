# Defect Log — Prompt 01 (Make It Work)

> Running log of defects found during the Goal-1 audit (2026-07-07).
> Status: `OPEN` / `FIXED` / `DEFERRED (reason)`.

## Build-blocking

| # | Status | File | Defect | Fix |
|---|--------|------|--------|-----|
| B1 | FIXED | `prisma/prisma.config.ts` | Uses `defineConfig` with its import commented out → TS2304. File is dead code: Prisma is 5.22, which does not read `prisma.config.ts` at all (that's a Prisma 6+/7 feature); file header itself says "not used in current setup". Fails both `tsc` and `next build`. | Delete the file. |
| B2 | FIXED | `package.json` | `eslint ^9.14.0` + `eslint-config-next ^15.0.3` against Next 14.2 — `next lint` passes ESLint-8-era options (`useEslintrc`, `extensions`) that ESLint 9 removed. `npm run lint` errors out and the build's lint phase fails. | Downgrade to `eslint@^8.57.1` + `eslint-config-next@14.2.33`. |
| B3 | FIXED | `src/lib/prisma.ts:22` | `__internal.engine.connectionTimeout` is not a valid `PrismaClient` constructor option (typed `never`) → TS2322. | Remove the `__internal` block. |
| B4 | FIXED | `src/app/trivia/page.tsx:77` | `question.answers[answerIndex].correct` — `question` and the indexed answer are possibly `undefined` (`noUncheckedIndexedAccess`) → TS18048/TS2532. Real runtime crash risk when data is empty. | Guard with optional chaining. |
| B5 | FIXED | `src/app/trivia/page.tsx:308` | `currentLevelData.siteName` possibly `undefined` → TS18048. | Optional chaining. |
| B6 | FIXED | `src/app/map/page.tsx:52,56` | `handleZoomIn`/`handleZoomOut` declared, never wired to any UI → TS6133. | Remove (map has native zoom; `zoom` state itself is used). |
| B7 | FIXED | `src/app/admin/upload/page.tsx:73` | `result` assigned, never read → TS6133. | Drop the assignment. |
| B8 | FIXED | `src/app/api/admin/sites/route.ts:66` | Unused `request` param in `GET` → TS6133. | Prefix `_request` (project convention). |
| B9 | FIXED | `src/app/api/admin/users/route.ts:6` | Same as B8. | Prefix `_request`. |
| B10 | FIXED | `src/components/3d/ModelViewer.tsx:112,120` | `description` prop destructured but unused; `isLoading` state never read → TS6133 ×2. | Stop destructuring `description`; use empty slot for `isLoading`. |
| B11 | FIXED | `src/lib/auth.ts:160,163` | `events.createUser`/`events.signIn` are empty handlers with unused params → TS6133/TS6198. | Delete the no-op `events` block. |
| B12 | FIXED | `scripts/upload-assets.ts:132` | `uploadDirectory` declared, never called from `main()` → TS6133. | `export` it (kept as a usable bulk-upload utility). |

## Runtime-crash

| # | Status | File | Defect | Fix |
|---|--------|------|--------|-----|
| R1 | FIXED | `src/components/3d/ARViewer.tsx:39-75` | `useGLTF` + `useEffect` called inside `try/catch` → `react-hooks/rules-of-hooks` lint **errors**. Worse: `useGLTF` suspends by throwing a Promise, which the `catch` swallowed and passed to `onError` as if it were an `Error` — breaking Suspense-based loading entirely. | Hooks hoisted to top level, unconditional; scene clone memoized; load errors now flow to `<Suspense>`/`ThreeErrorBoundary` as designed. |
| R2 | FIXED | `src/components/3d/ARViewer.tsx:126` | `createXRStore()` called on every render — new XR store per render resets XR session state. | `useState(() => createXRStore())` — one store per mount. |

## Auth

_(walked — nothing broken found: all `admin/*` routes gate with session + DB role re-query; `upload`/`contributions` check session; NextAuth v4 APIs used throughout.)_

## Data

_(walked — nothing broken: all pages read assets via `storageUrl` (correct schema field); every asset-returning route passes through `serializeBigInt`/`jsonResponse`; the three `admin/*` routes return only counts/scalars, so no BigInt exposure.)_

## Cosmetic-but-broken

| # | Status | File | Defect | Note |
|---|--------|------|--------|------|
| C1 | DEFERRED (by design) | `src/app/api/cache/sites/route.ts` | Returns `403` (not `401`) for unauthenticated callers. | Intentional admin-only gate; semantics debatable but harmless. |
| C2 | DEFERRED (low priority) | `package.json` | 33 npm audit vulnerabilities (1 critical) in transitive deps. | Not addressed in Goal-1 pass; version locks constrain upgrades. |

## Verification evidence (2026-07-07)

- `npm run type-check` → **0 errors**; `npm run lint` → **0 errors** (warnings only); `npm run build` → completes, full route table emitted.
- Dev server boots on :3000. **All 18 pages return 200** (home, about, doc, models, images, map, trivia, ar, profile, site, site/[id], admin ×5, auth ×2).
- API smoke: public GETs (`sites`, `sites/[id]`, `sites/nearby`, `models`, `images`, `trivia`, `health/db`) all **200 with real data**; `admin/*` all **401 unauthed**; `POST upload` / `POST admin/sites` / `PATCH admin/users` all **401 unauthed**; `register {}` → **400**.
- Credentials auth verified end-to-end: register **201** → NextAuth csrf → credentials callback sets `session-token` → session carries `id` + `role` → `admin/users` as `USER` role → **403** (role gate works). Test user deleted after.
- R2 assets reachable: PANORAMA_360 ×2 → `200 image/jpeg`, MODEL_3D → `200 model/gltf-binary`.
- DB healthy (`/api/health/db`), already pushed + seeded (sonda-fort etc. present with assets).

### Remaining manual steps (need user)

1. `npm run db:push` / `db:seed` — blocked by the permission classifier (mutates the shared Neon DB). DB is demonstrably already pushed + seeded; re-run manually if schema changes.
2. Google OAuth — needs a real browser + Google credentials; the config (`src/lib/auth.ts`) follows NextAuth v4 correctly and credentials flow works, but the live Google round-trip must be clicked through manually.
3. WebGL rendering of 3D/panorama/map — pages 200 and asset URLs serve correct MIME types; actual GPU render confirmed only by opening the pages in a browser.

## Environment notes

- `npm install` clean (689 packages; 33 audit vulnerabilities noted, not addressed in this pass).
- `.env` present; Prisma 5.22 loads it. `db:push`/`db:seed` verification pending.
- Build compiles fine (`✓ Compiled successfully`) — failures are all in the lint/type-check phase.
