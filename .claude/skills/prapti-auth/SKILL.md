---
name: prapti-auth
description: Use when touching authentication or authorization in Prapti — src/lib/auth.ts, sign-in/sign-up pages, session handling, role checks, Google OAuth setup, or debugging 401/403 behavior. NextAuth v4 specifics (not v5), JWT strategy rationale, and a headless test recipe.
---

# Prapti Authentication (NextAuth v4)

_Last verified: 2026-07-07 against `src/lib/auth.ts`, `src/types/next-auth.d.ts`, and a live end-to-end credentials test._

## Fixed decisions and their reasons

- **NextAuth v4** (`^4.24.7`) — README text mentioning "v5" is wrong; use `getServerSession(authOptions)`, `NextAuthOptions` (source: `CLAUDE.md`). Config lives in `src/lib/auth.ts`.
- **JWT session strategy** (not database sessions) — chosen for mixed-provider compatibility (Credentials provider requires JWT), with `PrismaAdapter` still attached for OAuth account/user persistence (source: `CLAUDE.md`, `docs/authentication/authentication.md`).
- **Two providers:** Google OAuth, and Credentials with **bcrypt**-hashed passwords.
- The `jwt` callback **upserts the DB user on Google sign-in** and carries `role` onto the token; the `session` callback exposes `id` and `role` on `session.user` — typed in `src/types/next-auth.d.ts`. If you add a field to the session, update that type file or strict TS fails.
- `debug: false` intentionally (prevents sensitive data in logs).

## Using auth

- **Server (route handlers / RSC):** `const session = await getServerSession(authOptions)`. For privileged mutations, **re-query the DB for role** rather than trusting the token (pattern in every `/api/admin/*` route; token roles can be stale after a role change).
- **Client:** `useSession()` from `next-auth/react`; Navbar (`src/components/layout/Navbar.tsx`) shows the role-based menu pattern (`ADMIN` → Admin Dashboard; `MODERATOR`+ → Moderation).
- **Registration:** `POST /api/auth/register` (validates input → 400; duplicate email handling; bcrypt hash) then sign in via the credentials provider.
- Role ladder: `USER → CONTRIBUTOR → MODERATOR → ADMIN`; role changes via `PATCH /api/admin/users` (ADMIN only).

## Headless verification recipe (proven to work)

1. `POST /api/auth/register` with `{ name, email, password }` → 201.
2. `GET /api/auth/csrf` → save cookies + `csrfToken`.
3. `POST /api/auth/callback/credentials` (form-encoded `csrfToken`, `email`, `password`, cookies attached) → sets `next-auth.session-token` cookie.
4. `GET /api/auth/session` with cookies → `{ user: { id, role, ... } }`.
5. Hit `/api/admin/users` with that cookie as a `USER` → expect **403** (proves role gating).
6. Delete the throwaway user when done.

## Google OAuth

Needs `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (+ `NEXTAUTH_URL`, `NEXTAUTH_SECRET`) in `.env`; redirect URI `<origin>/api/auth/callback/google`. Setup + troubleshooting (redirect_uri_mismatch, invalid_client): `docs/authentication/google_oauth_setup.md`. **Cannot be verified headlessly** — say so rather than claiming it works.

## Security posture (pointers)

Session/authorization hardening guidance: `docs/security/authentication_security.md`; OWASP mapping: `docs/security/owasp_compliance.md`. Key implemented mitigations: bcrypt hashing, role re-query on privileged routes, no sensitive logging, generic error messages.

## When NOT to use this skill

General API mechanics (status codes, serialization → `prapti-api-routes`); UI of the sign-in pages (→ `prapti-design-system`).

**How to re-verify this:** read `src/lib/auth.ts` end-to-end and run the 6-step recipe above against a dev server.
