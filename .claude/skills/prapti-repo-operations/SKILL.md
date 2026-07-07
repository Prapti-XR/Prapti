---
name: prapti-repo-operations
description: Use when getting oriented in the Prapti repo, running or maintaining the system/ artifacts (defect log, UI audit), looking for where something lives, writing commits, or wondering which docs are authoritative. The zero-context starting map.
---

# Prapti Repo Operations & Map

_Last verified: 2026-07-07._

## What this project is

A heritage AR/VR platform presenting cultural heritage sites through 3D models, 360°/180° panoramas, a Google Maps discovery view, and educational trivia, with a GitHub-style fork/PR contribution workflow. Stack: Next.js 14 App Router (Server Components fetch via Prisma → pass to Client Components), Neon Postgres, NextAuth v4, Cloudflare R2, optional Upstash Redis.

## Directory map

- `src/app/` — pages + `api/` route handlers. Public: home, `about`, `doc`, `models`, `images` (panoramas), `map`, `trivia`, `site`, `site/[id]`, `ar`, `profile`, `auth/*`. Admin: `admin/{analytics,contributions,sites/new,upload,users}`. Global states: `error.tsx`, `not-found.tsx`, per-route `loading.tsx`.
- `src/components/` — `3d/` (viewers incl. `ImmersiveViewer`), `ui/` (Button/Badge/Search/Skeleton), `cards/`, `map/`, `layout/` (Navbar), `ar/` (QRCodeModal), `error/` (ThreeErrorBoundary). Barrel exports via `index.ts`.
- `src/lib/` — `prisma` (singleton), `auth` (NextAuth config), `r2`, `upload`, `redis` (no-op-degrading cache), `db-health`, `utils` (`serializeBigInt`, `jsonResponse`, `cn`), `maps/`. `src/hooks/` — map/geolocation hooks. `src/env.ts` — validated env.
- `prisma/schema.prisma` + `prisma/seed.ts`; `scripts/` run with `npx tsx`; `docs/` — the authoritative design/architecture/security/scaling docs + `example-data/`.
- **Read order for a fresh session: `goals.md` → `CLAUDE.md` → the relevant skill here → the relevant `docs/` file.**

## The `system/` artifacts and how to run them

> Note (2026-07-07): `prompts/03-system-dev-feature.md` was **skipped at the user's request**, so `system/` holds working logs from prompts 01–02, not a dev-workflow toolkit.

- **`system/defect-log.md`** — the running defect ledger. To "run" it: on any bug hunt, append a row (`ID | STATUS | file | defect | fix`), grouped build-blocking / runtime-crash / auth / data / cosmetic, most severe first; flip `OPEN → FIXED` only after the verification gate passes (see `prapti-verification`). Done correctly = every row is FIXED or DEFERRED-with-reason and the verification-evidence section at the bottom is updated with fresh command output.
- **`system/ui-audit.md`** — the UI conformance audit against `docs/DESIGN_SYSTEM.md`. To re-run: scan `src/` for off-palette utilities (`grep -rE '(bg|text|border)-(blue|purple|yellow|slate|amber|gray)-[0-9]'`), raw `<button>`s bypassing `components/ui`, missing `font-serif` headings, missing `aria-*`/focus rings; write findings in priority order; fix; record the result section. Done correctly = the greps come back ~empty (semantic red/green excepted) and `type-check`/`lint` stay clean.

## Voice & style rules (with sources)

- **Commit messages:** conventional-commit style with `feat:`/`fix:` prefixes and a descriptive summary — matches git history (e.g. `feat: add admin panel with site creation, file uploads, user management…`, commit `2f98cf8`).
- **API responses:** `{ success, data | error }` — see `prapti-api-routes`.
- **Product copy:** heritage voice — warm, plain verbs, sentence case; errors explain what happened and offer a way forward, never apologize vaguely. Real excerpts that set the bar: "This page is lost to history … The heritage sites are still where you left them." (`src/app/not-found.tsx`); "VR headset not detected — explore in 360° with drag and scroll" (`src/components/3d/ImmersiveViewer.tsx`).
- **Code style:** Prettier single quotes/semicolons/2-space/printWidth 100; strict TS; path aliases (see `prapti-ground-rules`).

## Deployment notes

Target is Vercel (`vercel.json`, `output: standalone` in `next.config.js`). `postinstall` runs `prisma generate`. `SKIP_ENV_VALIDATION=1` bypasses env validation for CI builds. Env vars documented in `.env.example`; validated in `src/env.ts`. `.glb`/`.gltf` are webpack `asset/resource` and `fs/net/tls` fallbacks are disabled client-side in `next.config.js`.

## When NOT to use this skill

Deep work inside a domain already covered by a sibling skill — this is the orientation layer, not the specialist manual.

**How to re-verify this:** `ls` the directories above; read `system/*.md` headers; `git log --oneline -5` for the commit convention.
