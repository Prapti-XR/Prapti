---
name: prapti-design-system
description: Use for ANY UI work in Prapti — creating or editing pages, components, styles, loading/empty/error states, or reviewing visual changes. Encodes the heritage design system (locked palette and fonts), the sanctioned tint/shade tokens, the gray→heritage muted mapping, motion rules, the WCAG AA accessibility bar, and which files exemplify the quality bar.
---

# Prapti Design System — elevate, never replace

_Last verified: 2026-07-07 against `docs/DESIGN_SYSTEM.md` v1.1 and `tailwind.config.js`._

**The one governing rule (from `goals.md` Goal 2): keep the identity, elevate the execution.** No new primary colors, no font swaps. If the system genuinely blocks a better result, propose the change with rationale to the user *before* making it.

## Tokens (Tailwind, `tailwind.config.js`)

| Token | Hex | Use |
|---|---|---|
| `heritage-primary` | `#FEC683` | CTAs, active states, highlights. **Text on it must be `heritage-dark`** (5.2:1); white on it fails contrast. |
| `heritage-secondary` | `#8B4513` | Secondary actions, ADMIN badges; white text OK (6.2:1). |
| `heritage-accent` | `#96ADC8` | Info badges, calm highlights, "360°"/"VR" chips; white text. |
| `heritage-dark` | `#3E2723` | All text and headings on light backgrounds (12.5:1 on white). |
| `heritage-light` | `#DAE0F2` | Backgrounds, subtle fills, borders (at /20–/60 opacity). |
| `heritage-dark-deep` | `#241713` | Sanctioned *shade* (added 2026-07-07): viewer wells, immersive surfaces — `bg-gradient-to-b from-heritage-dark to-heritage-dark-deep`. |
| `heritage-primary-soft` | `#FFE3C2` | Sanctioned *tint*: highlight text on dark surfaces. |

Semantic colors (forms/status only, per the spec): error red `#DC2626` family, success green `#059669` family. Never use blue/purple/yellow/slate/amber Tailwind palettes — those were purged repo-wide on 2026-07-07 (see `system/ui-audit.md`).

**Muted mapping (never `gray-*`):** muted text = `text-heritage-dark/70` (or /60, /80); borders = `border-heritage-light/30`–`/60`; subtle fills = `bg-heritage-light/20`–`/50`; disabled/faint = `/40`, watermark icons = `/20`. On dark surfaces use `text-white/80` etc., not gray.

## Type

- Headings/display/logo: **Playfair Display** → `font-serif`, bold(700) for H1/H2, semibold(600) for H3–H6. Every `h1`–`h3` gets `font-serif` — including viewer overlay titles.
- Body/UI: **Inter** → `font-sans`, 400 body / 500 labels+buttons / 600 emphasis.
- Scale: H1 `text-5xl md:text-6xl lg:text-7xl tracking-tight`; body `text-base leading-relaxed`. Full scale in `docs/DESIGN_SYSTEM.md` §Typography.

## Components — reuse before you create

`src/components/ui`: `Button` (cva variants `default/primary/secondary/accent/ghost/outline`, sizes `sm/md/lg/xl/icon` — has focus-visible ring built in), `Badge` (variants `primary/secondary/accent/neutral/outline/success/error`), `Search`, `Skeleton` (+ `SkeletonCard/Grid/List/...`). `src/components/cards`: `Card`, `FeatureCard`, `MediaCard`, `ModelCard`, `ImageCard`, `StatCard`, `ActivityItem`, `ActionCard`. Status/role chips: use `Badge`, mapping PENDING→`primary`, UNDER_REVIEW→`accent`, APPROVED→`success`, REJECTED→`error`, MERGED→`secondary` (example: `src/app/admin/contributions/page.tsx`).

## Motion — calm, load-time, never busy

Only `animate-fade-in` (0.5s) and `animate-slide-up` (0.5s) from `tailwind.config.js`, plus `transition-*` duration-200 hovers. Pattern: one `animate-fade-in` on a page header, `animate-slide-up` on a focal card (see `src/app/auth/signin/page.tsx`). The philosophy is "Soft & Calm" (`docs/DESIGN_SYSTEM.md` §Design Philosophy) — if a reviewer would notice the animation itself, it's too much.

## Accessibility bar (WCAG AA — `goals.md` Goal 2)

- Tap targets ≥ **44×44px** (`w-11 h-11` or `min-h-[44px]`).
- Every interactive element: `focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary` (+ `ring-offset-2`; on dark add `ring-offset-heritage-dark`).
- Icon-only buttons get `aria-label`; toggles get `aria-expanded`; modals get `role="dialog" aria-modal="true"` (example: `src/components/ar/QRCodeModal.tsx`).
- Every async surface has loading / empty / error treatment. Route-level: `loading.tsx` files exist for public pages; `src/app/error.tsx` and `src/app/not-found.tsx` are the global error/404 states — match their voice ("This page is lost to history").

## Quality-bar exemplars (meet or beat these)

- Viewer chrome: `src/components/3d/PanoramaViewer.tsx` (dark heritage well, 44px controls with aria + focus rings, branded spinner, accent badge).
- Full-state client page: `src/app/ar/page.tsx` (loading, explicit error/empty states with recovery links, heritage gradients).
- Error page voice: `src/app/not-found.tsx`.
- What "fell short" looked like before 2026-07-07: ad-hoc `bg-blue-600` CTAs, `slate-900` wells, yellow/purple status chips, `p-2` icon buttons with no labels — all catalogued in `system/ui-audit.md`.

## When NOT to use this skill

Backend-only work (API logic, Prisma queries, scripts) with zero rendered output; use `prapti-api-routes` or `prapti-data-model` instead.

**How to re-verify this:** diff this file against `docs/DESIGN_SYSTEM.md` and `tailwind.config.js`; grep `src/` for `gray-\d` and off-palette utilities (should stay ~zero outside semantic red/green).
