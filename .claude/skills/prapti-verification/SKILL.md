---
name: prapti-verification
description: Use before claiming ANY Prapti work is done, fixed, or passing — before committing, opening a PR, or telling the user a feature works. Defines the evidence gate (type-check, lint, build, driving the dev server, API status-code checks, auth flow recipe) and the ground-truth-only rule. There is no test suite; this gate is the test suite.
---

# Prapti Verification Gate — evidence before assertions

_Last verified: 2026-07-07. There is **no test framework** in this repo (source: `CLAUDE.md`); this checklist is the only safety net._

## The gate (run all, read the output)

```bash
npm run type-check   # tsc --noEmit — must be ZERO errors (strict mode)
npm run lint         # next lint — zero ERRORS (warnings acceptable per goals.md)
npm run build        # next build — must complete and print the route table
```

**Trap:** piping build output through `tail` masks the exit code. Check for `Failed to compile` / `Type error` markers in the full log, not just the last lines. A build that prints the route table (`○ (Static) / ƒ (Dynamic)` footer) completed its type-check phase.

## Drive the app (don't assume)

```bash
npm run dev   # boots on http://localhost:3000
```

1. **Pages** — every route should return 200:
   `/ /about /doc /models /images /map /trivia /ar /profile /site /site/<id> /admin /admin/{analytics,contributions,users,upload,sites/new} /auth/{signin,signup}`; an unknown path returns the styled 404 (`src/app/not-found.tsx`).
2. **APIs** — correct status codes are the contract:
   - Public GETs 200 with real data: `/api/sites`, `/api/sites/[id]`, `/api/sites/nearby?latitude=..&longitude=..`, `/api/models`, `/api/images`, `/api/trivia`, `/api/health/db`.
   - Unauthenticated → **401**: all `/api/admin/*`, `POST /api/upload`, mutations generally.
   - Wrong role → **403** (e.g. `USER` hitting `/api/admin/users`). `/api/cache/sites` returns 403 unauthenticated **by design**.
   - Invalid input → **400** (e.g. `POST /api/auth/register` with `{}`).
3. **Credentials auth end-to-end recipe** (works with `curl`/`fetch`):
   register via `POST /api/auth/register` → `GET /api/auth/csrf` (keep cookies) → `POST /api/auth/callback/credentials` with `csrfToken`, `email`, `password` form-encoded → a `session-token` cookie is set → `GET /api/auth/session` shows `user.id` and `user.role`. Delete any throwaway test user afterwards (e.g. `npx tsx -e "...prisma.user.deleteMany({where:{email:{startsWith:'<your-test-prefix>'}}})"`).
4. **Assets** — `HEAD` the `storageUrl` of a site's assets; expect `200` with `image/jpeg` (panoramas) or `model/gltf-binary` (models).

## What cannot be verified headlessly (say so explicitly)

- **Google OAuth** — needs a real browser + Google credentials. Config is `src/lib/auth.ts` (NextAuth v4); state that the live round-trip is a manual step.
- **WebGL rendering** (3D/panorama/map visuals) — a 200 page + reachable assets is necessary but not sufficient; actual rendering needs eyes on a browser.
- **WebXR sessions** — `store.enterVR()` / `enterAR()` can be code-verified only up to the call; an immersive session needs a headset/AR device or emulator.
- **`npm run db:push` / `db:seed`** — mutate the shared Neon database; run them only with the user's consent. `GET /api/health/db` confirms connectivity without mutating.

## Ground-truth-only rule (from `goals.md`)

Every factual claim about this project must trace to a repo file or the user's direct answer. Label anything inferred as **inference**. A confidently wrong statement is worse than an admitted unknown. When reporting: paste the actual command output, name what was NOT verified, and never say "should work".

## When NOT to use this skill

Pure research/reading tasks with no claim of completion, and doc-only edits (still run nothing, claim nothing about runtime).

**How to re-verify this:** the script targets live in `package.json`; the acceptance criteria live in `goals.md` Goal 1.
