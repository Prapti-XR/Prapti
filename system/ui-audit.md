# UI Audit — Prompt 02 (Elevate the UI)

> Audit of every page/component against `docs/DESIGN_SYSTEM.md` (2026-07-07).
> Method: full-source scan for off-palette utilities, raw `<button>`s bypassing `src/components/ui`, missing serif headings, ARIA/focus coverage, animation usage — plus file-level review of hotspots.

## Priority 1 — Identity violations (off-palette color)

| File | Divergence |
|------|-----------|
| `app/admin/contributions/page.tsx` | 16 off-palette chips (`yellow/blue/purple/indigo-100/800` status badges), 5 raw buttons, no `Button`/`Badge` usage |
| `components/ar/QRCodeModal.tsx` | amber/orange gradient panel, `bg-blue-600` CTA, blue info box; `h1` without `font-serif` |
| `components/3d/ARViewer.tsx` | `slate-900/800` viewer well, `bg-blue-600` "Start AR" CTA, `bg-purple-600` "AR Ready" badge, `yellow-900` warning panel |
| `app/ar/page.tsx` | `amber-900/orange-900` hero gradients, `yellow-500` badge, `blue-500` chip; `h1` without `font-serif` |
| `app/admin/users/page.tsx` | purple/blue role chips |
| `app/trivia/page.tsx` | orange/blue level chips; 28 gray-* usages |
| `app/map/page.tsx` | blue-50/700 chips; 5 raw buttons |
| `components/cards/ActivityItem.tsx` | yellow-100/600 icon chip |
| `components/3d/ModelViewer.tsx` / `PanoramaViewer.tsx` | slate well / `bg-blue-600` reset control |
| `app/models/page.tsx`, `app/site/[id]/page.tsx` | `bg-slate-900` viewer wells |

## Priority 2 — Component-layer gaps

- **No `Badge` component** — every status/role/count chip is ad-hoc markup with off-system colors. The design system §Badges defines exactly four variants; nobody can use them.
- **`Skeleton` exists but is not exported** from `components/ui/index.ts` — pages hand-roll `animate-pulse` gray blocks.
- Admin pages (`sites/new`, `upload`, `users`, `contributions`, `analytics`) use zero shared components — raw buttons, gray palette (39/24/24/19/13 gray-* uses).
- `Navbar.tsx`: 7 raw `<button>`s, no `aria-label` on icon-only buttons (mobile menu, profile).

## Priority 3 — Missing states

- **No root `app/error.tsx`** — a thrown runtime error renders Next's unstyled default.
- **No `app/not-found.tsx`** — 404s are unstyled.
- No `loading.tsx` for `admin/*`, `ar`, `profile`, `auth/*` (client pages have inline spinners; acceptable, but inconsistent skeleton language).

## Priority 4 — Muted-palette drift (gray-*)

Spec says muted text = `heritage-dark/70`, borders = `heritage-light/20–40`. Actual: ~250 `gray-*` utilities across pages. Worst: `admin/sites/new` (39), trivia (28), map (23–24), profile (17).

## Priority 5 — A11y & motion

- `aria-*` nearly absent app-wide (11 total occurrences across 40+ files).
- Focus rings exist in `Button` + form pages only; raw buttons have none.
- Motion: public pages use `fade-in`/`slide-up` sparsely; `about`, `doc`, `auth/*`, `admin/*` have none.

## Fix plan (impact order)

1. **`ui/Badge.tsx`** (new, cva, heritage variants incl. semantic success/error mapped to the system's form colors) + export `Skeleton` from the barrel.
2. **Viewer surfaces** (`ModelViewer`, `PanoramaViewer`, `ARViewer`, `ar/page`, models/site wells): heritage-dark gradient wells, heritage-primary CTAs, heritage-accent badges, serif headings.
3. **`QRCodeModal`** → heritage tokens + serif.
4. **Status/role/level chips** (`admin/contributions`, `admin/users`, `trivia`, `map`, `ActivityItem`) → `Badge`.
5. **Root `error.tsx` + `not-found.tsx`** in the heritage voice.
6. **Navbar a11y**: aria-labels, focus-visible rings.
7. **Gray sweep** on public pages → heritage muted tokens (mechanical, rule-based).
8. **Motion**: `fade-in`/`slide-up` on page headers missing it; keep calm.

Everything verified afterwards with `npm run type-check` + `npm run lint` + page smoke.

## Result (2026-07-07 pass)

All eight fix-plan items applied:

1. **`ui/Badge.tsx` created** — cva variants `primary/secondary/accent/neutral/outline/success/error`, exported from the `ui` barrel along with the previously unexported `Skeleton`.
2. **Viewers unified**: `ModelViewer`/`PanoramaViewer`/`ARViewer` wells are now `from-heritage-dark to-heritage-dark-deep` gradients (new sanctioned shade token in `tailwind.config.js`), spinners `heritage-primary`, titles `font-serif`, controls 44×44 with `aria-label` + focus-visible rings, "360°"/"AR Ready" badges `heritage-accent`, "Start AR" CTA `heritage-primary` pill.
3. **`QRCodeModal`** fully re-tokened (heritage panel, primary/secondary/accent action buttons, serif heading, `role="dialog"` + `aria-modal`).
4. **Chips → heritage**: contribution status/type chips use `Badge`; role chips (`admin/users`), trivia difficulty/explanation, map era chip, `ActivityItem` warning all mapped to heritage tokens (semantic green/red kept for success/error per the design system's form palette).
5. **`app/error.tsx` + `app/not-found.tsx` added** — heritage-voice error/404 pages with recovery actions. AR page also gained explicit empty/error states (was an infinite spinner when `?site=` was missing or fetch failed).
6. **Navbar**: `aria-label`/`aria-expanded` on account + hamburger buttons, 44px targets, focus-visible rings.
7. **Gray sweep**: ~315 `gray-*` utilities across `src/app` + shared components replaced with `heritage-dark/NN` text and `heritage-light/NN` surfaces per the spec's muted rules. Zero `gray-*` remaining in scope (3d/ar components excluded by design — dark-context whites).
8. **Motion**: `animate-fade-in` on the 7 page headers that had none (about + admin ×6… admin index, users, upload, contributions, analytics, sites/new); `animate-slide-up` on both auth cards. Calm, load-time only.

Design-system change proposed & made (allowed by the "tints/shades" rule): added `heritage-dark-deep #241713` (viewer wells) and `heritage-primary-soft #FFE3C2` (highlights on dark) to `tailwind.config.js`.

Verification: `type-check` 0 errors · `lint` 0 errors · build + page smoke below.
