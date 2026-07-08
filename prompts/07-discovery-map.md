# Prompt 07 — Discovery: the "better than Maps" heritage experience

**Phase 2 of `ROADMAP.md`. Run after Prompt 06. Paste into a fresh Claude Code session; the `.claude/skills/prapti-*` skills are your operating manual.**

---

You are the discovery engineer on **Prapti** — *Google Maps for India's cultural heritage*. Maps gives a pin; Prapti gives the place. Your job: make hidden, culturally rich sites findable in seconds and their pages worth arriving at.

## Step 0 — Load context

1. `ROADMAP.md` Phase 2. Skills: `prapti-ground-rules`, `prapti-design-system`, `prapti-api-routes`, `prapti-data-model`.
2. Existing code to build on: `src/app/map/page.tsx` + `src/components/map/` + `src/hooks/` (`useGoogleMaps`, `useNearbySites`, `useMapFilters`, `useMapInteraction`, `useGeolocation`), `/api/sites/nearby` (bounding-box query, Redis-cached), `src/app/site/[id]/page.tsx`, the `Tag`/`SiteTag` models, `Search` component (`src/components/ui/Search.tsx`).

## Build 1 — Map that surfaces hidden places

- **Marker clustering** at low zoom (use the Google Maps `MarkerClusterer` from `@googlemaps/markerclusterer` — add only this dependency if not present; no other new deps).
- **On-map filters**: era, type (has 3D / has 360° / has both), region/state — extend `useMapFilters` and the `/api/sites/nearby` query params; keep the Redis cache key derived from all filters (see `prapti-api-routes` caching section).
- **Hidden Gems**: add `isHiddenGem Boolean @default(false)` to `HeritageSite` (add the migration/`db push` note — **DB changes need user consent**), an admin toggle, a map filter chip, and a curated strip on the home page.
- **Directions handoff**: on the site preview card and site page, a "Get Directions" link opening `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>` in a new tab.

## Build 2 — Heritage-aware search

- Extend `/api/sites` search to match name, city, era, and tag names (dynasty, deity, architectural style) — Prisma `OR` query with the existing indexes; rank `isFeatured` first. Expose it through the existing `Search` component on `/site` and `/map` with debounced suggestions (name + district + era in each row).

## Build 3 — Site page as a destination

- **Photo gallery**: render all `IMAGE` assets in a responsive grid with a keyboard-navigable lightbox (Escape closes, arrows navigate, `role="dialog"`). Reuse the `MediaCard`/`ImageCard` patterns.
- **History & Significance sections**: `historicalFacts` and `culturalContext` rendered as real sections with the heritage type scale; show a "Sources" line when present.
- **Nearby sites strip**: 3–5 closest published sites (reuse the nearby query), each linking to its page.
- **Share cards**: per-site OpenGraph tags (`generateMetadata` in `site/[id]` — it's a client page today; add metadata via a server wrapper or convert data fetching per `CLAUDE.md`'s server-fetch pattern — choose the smaller change and justify it).

## Verify

- Gate: `type-check` / `lint` / `build` clean (`prapti-verification` skill).
- Drive: map clusters at country zoom; filters change results; a Hidden Gem appears under its chip; search "fort" and an era term; site page shows gallery/lightbox/nearby strip; directions link opens correct coordinates.
- API: filtered `/api/sites/nearby` still 200s and the cache key varies with filters; all mutations still role-gated.

## Definition of Done

- [ ] Clustering + filters + Hidden Gems + directions live on the map.
- [ ] Search finds sites by era/tag/name with ranked results.
- [ ] Site page: gallery with lightbox, history/significance sections, nearby strip, OG tags.
- [ ] Schema change (if any) applied with user consent; indexes maintained (`relationMode="prisma"`).
- [ ] Verification gate output pasted.
