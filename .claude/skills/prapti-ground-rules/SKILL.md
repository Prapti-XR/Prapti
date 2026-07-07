---
name: prapti-ground-rules
description: Use before ANY code change in the Prapti repo — editing src/, prisma/, package.json, or config files. Contains the non-negotiable constraints (version locks, BigInt serialization, SSR rules for 3D, relationMode, env access) and the failure archaeology of everything already tried and rejected. Load first; violating these breaks the build or the runtime.
---

# Prapti Ground Rules (non-negotiables)

_Last verified: 2026-07-07 against `CLAUDE.md`, `package.json`, and a passing `npm run build`._

Prapti is a heritage AR/VR platform: Next.js 14 App Router + React Three Fiber + Prisma/Neon Postgres + NextAuth v4 + Cloudflare R2. These rules exist because breaking any one of them has already broken (or will break) the build or runtime. Each rule has its reason attached — do not "upgrade" past them without the user's sign-off.

## The rules, each with its reason

1. **Version locks — do NOT upgrade:**
   - `react 18.3.1`, `next 14.2.x` — the 3D stack is only tested against React 18; React 19 is incompatible with `@react-three/fiber 8.17.10` (source: `CLAUDE.md`, `docs/ARCHITECTURE.md` "Why React 18.3.1").
   - `three 0.169.0`, `@react-three/fiber 8.17.10`, `@react-three/drei 9.115.0`, `@react-three/xr 6.6.26` — a mutually compatible set; bumping one independently breaks the others.
   - `eslint ^8.57.1` + `eslint-config-next 14.2.33` — Next 14's `next lint` passes ESLint-8-era options (`useEslintrc`, `extensions`) that ESLint 9 removed. (Failure archaeology: the repo shipped with eslint 9 + config-next 15 and `npm run lint` errored out; downgraded 2026-07-07, see `system/defect-log.md` B2.)
   - **NextAuth is v4** (`^4.24.7`) despite README text mentioning "v5". Use v4 APIs: `getServerSession(authOptions)`, `NextAuthOptions`. (Source: `CLAUDE.md`.)
   - Prisma is **5.22.0** — `prisma.config.ts` is a Prisma 6+/7 feature and is NOT read. (Failure archaeology: a dead `prisma/prisma.config.ts` using `defineConfig` broke `tsc` and `next build`; deleted 2026-07-07, `system/defect-log.md` B1.)

2. **`serializeBigInt()` on every API response that touches assets.** `Asset.fileSize` is a Prisma `BigInt`; `JSON.stringify` throws on BigInt. Pass results through `serializeBigInt()` from `src/lib/utils.ts` — or use `jsonResponse()`, which does it for you. (Source: `CLAUDE.md`; enforced across `src/app/api/*`.)

3. **3D components are client-only.** `ModelViewer`, `ARViewer`, `PanoramaViewer`, `ImmersiveViewer` must be loaded with `dynamic(() => import(...), { ssr: false })` and wrapped in `ThreeErrorBoundary` (`src/components/error/ThreeErrorBoundary.tsx`) — Three.js touches `window`/WebGL and crashes under SSR. See `src/app/site/[id]/page.tsx` lines 12–30 for the canonical import pattern.

4. **React hooks are unconditional — never inside `try/catch`.** `useGLTF`/`useTexture` suspend by *throwing a Promise*; a `catch` swallows it and breaks Suspense entirely. (Failure archaeology: `ARViewer` had `useGLTF` + `useEffect` inside `try/catch`, producing `rules-of-hooks` errors and a broken loading path; fixed 2026-07-07, `system/defect-log.md` R1.) Also: create XR stores once per mount — `const [store] = useState(() => createXRStore())` — not on every render (R2).

5. **`relationMode = "prisma"`** in `prisma/schema.prisma`: referential integrity is enforced by the ORM, **not** the database. There are no FK constraints in Postgres, so the `@@index` declarations carry all query performance — keep them intact when editing the schema. (Source: `CLAUDE.md`, `docs/schema/schema_explanation.md`.)

6. **Env access via `@/env`** (`src/env.ts`, validated with `@t3-oss/env-nextjs` + Zod), not raw `process.env`. Raw access skips validation and hides missing-var failures until runtime. Exception (by design): server lib files (`prisma.ts`, `r2.ts`, `auth.ts`, `redis.ts`) call dotenv `config()` at import so `tsx` scripts pick up `.env`. `SKIP_ENV_VALIDATION=1` bypasses validation during builds.

7. **PrismaClient options must be typed.** (Failure archaeology: an `__internal.engine.connectionTimeout` block in `src/lib/prisma.ts` was typed `never` and broke `tsc`; removed 2026-07-07, `system/defect-log.md` B3.)

8. **TypeScript is strict** including `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`. Guard indexed access (`arr[i]?.field`), prefix intentionally unused vars/args with `_`. Prettier: single quotes, semicolons, 2-space, `printWidth: 100`.

9. **Path aliases**: `@/*` → `src/*` (plus `@/components/*`, `@/lib/*`, `@/hooks/*`, `@/types/*`). Never relative `../../` chains.

## When NOT to use this skill

Reading/answering questions about the repo without changing code, or editing only markdown under `docs/`, `prompts/`, or `system/` — the rules constrain code, not prose.

**How to re-verify this:** run `npm run type-check && npm run lint && npm run build` and diff `package.json` versions against the list above.
