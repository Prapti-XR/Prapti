# goals.md — Prapti North-Star Goals (for Fable)

> **Audience:** Fable (Claude Fable 5), running in this repo in later sessions.
> **Read this first, then `CLAUDE.md`, then the relevant files under `docs/`.**
> **Last updated:** 2026-07-07

---

## Mission

Take **Prapti** — a heritage AR/VR platform built on Next.js 14 — from its current partially-built state to a **fully working, deployable product with a beautiful, cohesive UI**.

There are **two quality goals** (working app + beautiful UI) and **one headline feature** (an immersive VR view). Everything in `prompts/` serves one of them.

---

## Goal 1 — Working shot (the app actually runs)

**Definition of done (acceptance criteria):**

- [ ] `npm install` completes clean (note: `postinstall` runs `prisma generate`).
- [ ] `npm run type-check` passes with **zero** errors (strict mode, incl. `noUncheckedIndexedAccess`).
- [ ] `npm run lint` passes (warnings acceptable, no errors).
- [ ] `npm run build` completes (`output: standalone`).
- [ ] `npm run dev` boots and serves `http://localhost:3000`.
- [ ] `npm run db:push` applies the schema and `npm run db:seed` seeds without error.
- [ ] **Every page** under `src/app/` renders without a runtime crash (home, `models`, `images`, `map`, `trivia`, `about`, `ar`, `profile`, `site/[id]`, `admin/*`, `auth/*`).
- [ ] **Every route** under `src/app/api/` returns a sane response (2xx on valid input, correct 401/403 on auth-gated ones).
- [ ] Auth works for **both** providers: Google OAuth and email/password credentials.
- [ ] 3D models, 360°/180° panoramas, and the Google Map all render on their pages.
- [ ] The project is deployable to Vercel (env vars documented, no build-time env crash — `SKIP_ENV_VALIDATION=1` understood).

Run `prompts/01-make-it-work.md` to reach this.

---

## Goal 2 — Beautiful UI (elevate, don't replace)

**Keep the existing heritage identity.** Do **not** invent a new palette or fonts. The direction is *elevation*: take the established design system further in polish, motion, and 3D presentation.

- Palette: `heritage-primary #FEC683`, `heritage-secondary #8B4513`, `heritage-accent #96ADC8`, `heritage-dark #3E2723`, `heritage-light #DAE0F2` (defined in `tailwind.config.js`).
- Type: Playfair Display (serif, headings) + Inter (sans, body).
- Full spec: `docs/DESIGN_SYSTEM.md` and `docs/styling/`.

**Definition of done (acceptance criteria):**

- [ ] Every page conforms to `docs/DESIGN_SYSTEM.md` (color, type scale, spacing, radius, shadow).
- [ ] Components are used consistently (`src/components/ui`, `src/components/cards`) — no ad-hoc one-off styling that contradicts the system.
- [ ] Purposeful motion (page/section transitions, hover states) using the existing `fade-in` / `slide-up` animations or extensions of them.
- [ ] 3D and 360° viewers have polished framing, controls, and loading states.
- [ ] Fully responsive at `sm 640 / md 768 / lg 1024 / xl 1280`.
- [ ] Accessibility meets **WCAG AA** (contrast, 44px tap targets, focus rings, keyboard nav, ARIA labels).
- [ ] Every async surface has proper **loading / empty / error** states.

Run `prompts/02-beautiful-ui.md` to reach this.

---

## Goal 3 — Feature: Immersive VR view (3D model inside the 360° environment)

**What the user wants:** a viewer where a heritage site's **3D model is centered** and its **360° panorama forms the surrounding environment** around it — the model as the focal object, the panorama as the world behind it — and you can enter it in **VR** (WebXR `immersive-vr`), with a normal orbit/look-around fallback on desktop and mobile.

This is a *composition of parts that already exist* in this repo — do not reinvent them:
- **The surround** = the inverted equirectangular sphere from `src/components/3d/PanoramaViewer.tsx` (`sphereGeometry` radius ~500, `THREE.BackSide`, `EquirectangularReflectionMapping`, `SRGBColorSpace`).
- **The focal model** = the centered GLTF from `src/components/3d/ModelViewer.tsx` (`useGLTF` + drei `<Center>`).
- **VR entry** = the XR store pattern from `src/components/3d/ARViewer.tsx` (`createXRStore()`), but using `store.enterVR()` and `navigator.xr.isSessionSupported('immersive-vr')` instead of the AR equivalents.

**Data:** a site needs both a `MODEL_3D` asset and a `PANORAMA_360` asset (see `prisma/schema.prisma` `AssetType`). The `/api/sites/[id]` route already returns a site's assets — the `ar/page.tsx` already picks the `MODEL_3D` asset the same way you'll pick the panorama.

**Definition of done (acceptance criteria):**

- [ ] New client component (e.g. `src/components/3d/ImmersiveViewer.tsx`) that renders the panorama sphere as the environment with the centered 3D model inside it.
- [ ] Dynamically imported with `{ ssr: false }` and wrapped in `ThreeErrorBoundary` (per the ground rules).
- [ ] Camera/user views the model as the centered focal point with the panorama filling the background; comfortable default framing and scale.
- [ ] "Enter VR" works on WebXR-capable devices; graceful, clearly-worded fallback when `immersive-vr` is unsupported (mirror `ARViewer`'s unsupported-state UX).
- [ ] Non-VR fallback: orbit/look-around with `OrbitControls`, loading + error states matching the other viewers.
- [ ] Graceful handling when a site is missing a panorama and/or a model (fall back to a drei `Environment` or a solid backdrop; never crash).
- [ ] Surfaced in the product — e.g. a "VR View" mode alongside the existing AR/3D toggle in `src/app/ar/page.tsx`, or an equivalent entry point on `site/[id]`.

Run `prompts/05-vr-model-in-panorama.md` to build this.

---

## Ground rules (non-negotiable — from `CLAUDE.md`)

These are hard constraints. Violating them breaks the build or the runtime.

1. **Version locks.** Do NOT upgrade to React 19. Keep `next 14.2.x`, `react 18.3.1`, and the pinned 3D stack (`three 0.169.0`, `@react-three/fiber 8.17.10`, `@react-three/drei 9.115.0`, `@react-three/xr 6.6.26`). Auth is **NextAuth v4** (`^4.24.7`) — use v4 APIs (`getServerSession(authOptions)`).
2. **BigInt serialization.** `Asset.fileSize` is a `BigInt`. Always pass Prisma results through `serializeBigInt()` (`src/lib/utils.ts`) before returning JSON from an API route.
3. **3D components are client-only.** Dynamically import `ModelViewer` / `ARViewer` / `PanoramaViewer` with `{ ssr: false }` and wrap them in `ThreeErrorBoundary` — Three.js breaks under SSR.
4. **`relationMode = "prisma"`.** Referential integrity is enforced by the ORM, not the DB. There are no FK constraints in Postgres; the `@@index` declarations carry query performance — maintain them deliberately.
5. **Env access via `@/env`.** Import validated env from `src/env.ts`, not `process.env` directly.
6. **Verify before claiming done.** Run `npm run type-check` and `npm run lint` (and `npm run build` for Goal 1) and read the output. Evidence before assertions.

---

## How to use this kit

1. Read `CLAUDE.md` (architecture + conventions) and skim `docs/` (design system, schema, security, scaling).
2. Run the prompts **in order**:
   - `prompts/01-make-it-work.md` → Goal 1
   - `prompts/02-beautiful-ui.md` → Goal 2
   - `prompts/05-vr-model-in-panorama.md` → Goal 3 (the immersive VR view)
   - `prompts/03-system-dev-feature.md` → builds a reusable dev workflow into `system/`
   - `prompts/04-skill-library.md` → distills everything into `.claude/skills/`
3. `system/` and `.claude/skills/` start empty — they are **outputs** produced by prompts 03 and 04.

---

## Ground-truth-only rule

Every factual claim about this project must trace to a file in this repo (`CLAUDE.md`, `docs/`, `prisma/schema.prisma`, source) or to the user's direct answer. **Label anything you infer as inference.** A confidently wrong statement is worse than an admitted unknown.
