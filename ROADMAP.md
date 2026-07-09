# Prapti Roadmap — the flagship plan

> **Vision:** Prapti is _Google Maps for India's cultural heritage_ — but where Maps gives you a pin and a photo, Prapti gives you the place: its history and significance, its photographs, and an **XR immersive view** where the site's 360° panorama surrounds its 3D model. The differentiator is depth over breadth: **hidden, culturally rich places** that mainstream maps ignore, documented properly.
>
> Last updated: 2026-07-08. Execution model: each phase has a ready-to-run prompt in `prompts/` written for cheaper models, backed by the operating manual in `.claude/skills/` (which loads automatically). Run phases **in order** — each assumes the previous is done.

## Where we are (baseline, verified 2026-07-07)

- ✅ App fully working & deployable: type-check/lint/build clean, all pages + APIs verified, both auth providers configured.
- ✅ Heritage design system enforced end-to-end (see `system/ui-audit.md`).
- ✅ The headline XR feature exists: `ImmersiveViewer` (3D model centered inside its 360° panorama, Enter-VR + orbit fallback) on `/ar` and `site/[id]`.
- ⚠️ Only ~3 seeded sites (Karnataka: Sonda Fort, Sahasralinga, Somasagara). Content is the bottleneck.
- ⚠️ Adding a site requires admin forms + a hand-run upload script. Contribution workflow exists in the schema/API but has weak UX.
- ✅ **Asset delivery fixed (2026-07-08):** `scripts/optimize-assets.ts` (Draco + WebP + recompressed panoramas) applied to all seeded assets — total payload 185.1 MB → **10.2 MB (-95%)**, sonda-fort model 122.9 MB/30.7 s → **3.6 MB/1.4 s**; immutable cache headers set; viewers show real load percentages and models preload from the site page. Phase-3 leftovers: panorama size tiers, CDN domain, VR hotspots, per-site XR tuning.
- ⚠️ PWA half-started: `public/manifest.json` exists and is wired in the layout, but `icons: []` is empty and there is no service worker.

## Phase 1 — Content pipeline: make adding a place a 10-minute job

**Prompt:** `prompts/06-content-pipeline.md` · **Why first:** every later phase multiplies with content; today content entry is the bottleneck.

- One-command bulk import: `scripts/import-sites.ts` reading a `data.json` folder convention (extend `docs/example-data/` format) — creates sites, uploads assets to R2, links trivia/tags, idempotent re-runs.
- Admin "Add a Site" wizard: single guided flow (details → photos → 3D/360 assets → trivia → publish) replacing the split forms; drag-drop uploads with progress; client-side GLB/panorama validation (size, format, aspect).
- Site content template: a documented markdown/JSON authoring template (history, significance, visiting info, sources) so researchers without dev skills can contribute data files.

**Done when:** a brand-new site with model + panorama + 5 trivia questions goes from files-on-disk to live page in ≤ 10 minutes, via either the wizard or one script run.

> **STATUS ✅ done 2026-07-08:** `scripts/import-sites.ts` (dry-run verified against `docs/example-data/`), 5-step wizard at `admin/sites/new` (validation, per-file progress, retry-safe, trivia via new `POST /api/admin/trivia`), `docs/CONTENT_TEMPLATE.md`. **Asset optimization is built into every path** — `src/lib/optimize.ts` runs Draco/WebP/JPEG compression inside `POST /api/upload` and the import script, with immutable cache headers.

## Phase 2 — Discovery: the "better than Maps" experience

**Prompt:** `prompts/07-discovery-map.md` · **Why:** with content flowing, the map must make hidden places findable.

- Map upgrades: marker clustering, era/type/region filters surfaced on-map, "Hidden Gems" collection (low-traffic, high-significance flag on `HeritageSite`), route-from-me deep link to Google Maps directions.
- Search that understands heritage: by dynasty/era, deity, architectural style (tags), district; results ranked featured-first.
- Site page as a destination: photo gallery (all `IMAGE` assets, lightbox), "Significance" and "History" sections rendered from the richer content fields, nearby-sites strip, share cards (OpenGraph images).

**Done when:** a user who has never heard of Sonda Fort finds it from the map or search in under 30 seconds, reads why it matters, and jumps into the XR view from the same page.

> **STATUS ✅ done 2026-07-09:** heritage-aware search (`/api/sites?q=&era=&tag=&hiddenGem=`), nearby-sites strip + Get Directions, **Hidden Gems** (`isHiddenGem` column pushed; wizard toggle, `scripts/set-hidden-gem.ts` CLI, home-page "Places the maps forgot" strip, site-page badge; sonda-fort is the first gem), heritage-styled **marker clustering** (`MarkerClustererF`, zero new deps), **photo gallery + keyboard lightbox** on `site/[id]`, **OG/Twitter share cards** via `site/[id]/layout.tsx` `generateMetadata` (verified in rendered HTML). On-map filter *chips* remain a nice-to-have (map already clusters; search covers discovery).

## Phase 3 — XR flagship polish: fast, comfortable, shareable

**Prompt:** `prompts/08-xr-performance.md` · **Why:** the immersive view is the brand; it must load fast on mid-range phones.

- Execute the staged plan in `.claude/skills/prapti-asset-delivery-plan`: measure → R2 cache headers/CORS (retire the unimplemented proxy or build it) → Draco/Meshopt GLB compression at upload → 2K/4K panorama tiers → CDN domain.
- VR comfort: loading progress inside the canvas, initial-orientation tuning, optional hotspots (annotations anchored in the panorama that explain what you're looking at).
- Per-site XR tuning fields: `modelScale`/`modelPosition` stored on the asset/site instead of hardcoded defaults.

**Done when:** the immersive view reaches first-render in < 5s on a throttled "Fast 3G + 4x CPU" profile for every seeded site, with zero regressions in the verification gate.

## Phase 4 — Reach: PWA, offline, installable

**Prompt:** `prompts/09-pwa.md` · **Feasibility: confirmed** — manifest already wired in `src/app/layout.tsx`; gaps are icons, a service worker, and offline strategy. Compatible with the version-locked stack via `@ducanh2912/next-pwa` (Next 14 support) or a hand-rolled service worker; **no React/Next upgrades needed or allowed.**

- Installability: real icon set (192/512 + maskable, from `public/icons/icon.svg`), screenshots, theme colors already on-brand (`#8B4513`).
- Offline: cache app shell + visited site pages + their photos; "saved for offline" toggle per site (assets are large — offline XR is opt-in per site, not automatic).
- Re-engagement basics: proper OG/social metadata, sitemap, per-site canonical URLs.

**Done when:** Lighthouse PWA audit passes, the app installs on Android/iOS, and a visited site page (info + photos) opens in airplane mode.

> **STATUS ◐ built 2026-07-08:** placeholder icon set generated from `public/icons/icon.svg` via `scripts/generate-icons.ts` (192/512 + maskable + apple-touch — regenerate after swapping the SVG), manifest completed, hand-rolled `public/sw.js` (shell SWR, pages/site-data network-first, R2 media ≤3 MB cache-first LRU, `.glb`/auth/admin excluded), `offline.html`, registration via `ServiceWorkerRegister` (production only). **Remaining manual:** Lighthouse audit + on-device install check + manifest screenshots.

## Phase 5 — Community: contributions at scale

**Prompt:** `prompts/10-community.md` · **Why last:** needs the pipeline (1), discovery surface (2), and trust in the review flow.

- Contributor UX: public "Suggest a place" flow creating `Contribution` records (schema already supports `NEW_SITE`/`ADD_ASSET`/`FIX_INFO`…); status tracking on the profile page.
- Reviewer UX: side-by-side diff view of proposed vs. current content in `admin/contributions`; one-click merge actually writing `HeritageSite`/`Asset` rows (today merge is a status change only — verify against `src/app/api/admin/contributions/route.ts` before building).
- Recognition: contributor credits on site pages (`attribution` fields exist on `Asset`), simple leaderboard from `_count.contributions`.

**Done when:** an external contributor can propose a hidden place with photos, a moderator approves it from the admin panel, and it appears on the map — no developer involved.

> **STATUS ✅ done 2026-07-09** (text contributions): real transactional merge (2026-07-08), **public "Suggest a Place" flow** at `/contribute` (navbar → About; role-aware messaging, source-required-with-history), **reviewer diff view** in `admin/contributions` (proposed content table; current→proposed with changed-row highlight for edits), **contributor status tracking** on `/profile` (My Contributions with status badges + rejection reasons), **media credits** on site pages from asset `attribution`. **Remaining:** photo/asset uploads inside the contribution flow (needs a contributor-scoped upload endpoint — today `/api/upload` is ADMIN/MODERATOR only).

## Standing rules for every phase

1. Read `CLAUDE.md` + the relevant `.claude/skills/prapti-*` skill before coding (they auto-load on matching work).
2. The verification gate (`.claude/skills/prapti-verification`) passes before any phase is called done.
3. Version locks are absolute (React 18 / Next 14 / pinned 3D stack / NextAuth v4 / eslint 8).
4. Content claims about heritage sites need a source recorded in the site's `historicalFacts`/attribution fields — no invented history.
5. `docs/DEVELOPER_GUIDE.md` tells you what to update when you add things (routes, schema, docs, skills).
