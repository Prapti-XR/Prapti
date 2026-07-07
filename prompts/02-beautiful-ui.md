# Prompt 02 — Elevate Prapti's UI

**Paste this to Fable in a fresh session in this repo. Run only after `01-make-it-work.md` is done.**

---

You are a senior product designer *and* front-end engineer on **Prapti**, a heritage AR/VR platform. Your job is Goal 2 in `goals.md`: make the UI **beautiful** — polished, cohesive, and distinctive — by **elevating the existing heritage design system**, not replacing it.

## Step 0 — Load context

Read, in this order:
1. `goals.md` (repo root).
2. `CLAUDE.md` (repo root) — conventions, path aliases, the `ssr:false` rule for 3D.
3. `docs/DESIGN_SYSTEM.md` — the authoritative design spec. Also `docs/styling/` and `docs/components/`.
4. `tailwind.config.js` — the actual tokens (`heritage-*` colors, `font-serif`/`font-sans`, `fade-in`/`slide-up`).

## The one rule that governs everything here

**Keep the identity. Elevate the execution.**
- Palette stays: `#FEC683` gold, `#8B4513` saddle brown, `#96ADC8` blue-gray, `#3E2723` dark, `#DAE0F2` light.
- Fonts stay: Playfair Display (headings) + Inter (body).
- You MAY: add tints/shades of these tokens, refine spacing/shadow/radius scales, add tasteful motion, and richen the 3D/360 presentation.
- You MAY NOT: introduce a new primary color, swap the fonts, or contradict `docs/DESIGN_SYSTEM.md`. If the system is genuinely blocking a better result, propose the change and its rationale to the user before making it.

## Step 1 — Audit the current UI against the system

Go page by page (home, `models`, `images`, `map`, `trivia`, `about`, `ar`, `profile`, `site/[id]`, `admin/*`, `auth/*`). For each, list where the current UI **diverges** from `docs/DESIGN_SYSTEM.md` or is simply unpolished:
- Inconsistent color/type/spacing/radius/shadow usage.
- Ad-hoc styling that should be a shared component (`src/components/ui`, `src/components/cards`).
- Missing loading / empty / error states.
- Weak responsive behavior or accessibility gaps.

Capture this as a prioritized audit (write to `system/ui-audit.md` if `system/` exists, else inline).

## Step 2 — Elevate

Working from the audit, most-impactful first:
- **Unify the component layer.** Make `src/components/ui` (Button, Search, Skeleton, …) and `src/components/cards` the single source of truth; replace one-off markup with them.
- **Motion.** Apply purposeful transitions (section reveals, hover, focus) using `fade-in`/`slide-up` or well-chosen extensions. Keep it calm — the system's philosophy is "soft & calm."
- **3D / 360° presentation.** Give `ModelViewer` / `PanoramaViewer` / `ARViewer` polished framing, controls, and loading states. Respect `{ ssr: false }` + `ThreeErrorBoundary`.
- **States.** Every async surface gets loading / empty / error treatment (there are `loading.tsx` files already — make them cohesive).
- **Responsive & a11y.** Verify `sm/md/lg/xl`; ensure WCAG AA contrast, 44px tap targets, visible focus rings, keyboard nav, ARIA labels.

Match existing code style and use path aliases (`@/components/...`). Reuse before you create.

## Step 3 — Verify

- Visually review every page against `docs/DESIGN_SYSTEM.md`.
- Check each breakpoint (`640 / 768 / 1024 / 1280`).
- Spot-check accessibility (contrast, focus, keyboard).
- Run `npm run type-check` and `npm run lint` — must stay clean.
- If the `verify` or `run` skill is available in this environment, use it to drive the app and observe the result rather than assuming.

## Definition of Done

- [ ] Every page conforms to `docs/DESIGN_SYSTEM.md`.
- [ ] Shared components used consistently; no contradicting one-off styles.
- [ ] Purposeful, calm motion present.
- [ ] 3D/360 viewers polished with proper loading states.
- [ ] Loading / empty / error states everywhere async.
- [ ] Responsive at all four breakpoints; WCAG AA met.
- [ ] `type-check` + `lint` clean.

Finish with: a before/after summary per page, and any design-system change you had to propose (with rationale).
