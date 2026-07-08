# Prompt 09 — PWA: installable, offline-capable Prapti

**Phase 4 of `ROADMAP.md`. Run after Prompt 08 (smaller assets make offline viable). Feasibility already confirmed — this is a completion job, not a greenfield one.**

---

You are making **Prapti** a Progressive Web App: installable on phones, core content readable offline. Heritage sites are often in low-connectivity areas — offline reading is a real user need, not a checkbox.

## Current state (verified 2026-07-08 — re-verify before building)

- `public/manifest.json` exists and is already referenced from `src/app/layout.tsx` (`manifest: '/manifest.json'`), with on-brand `theme_color: #8B4513`, `display: standalone` — **but `icons: []` and `screenshots: []` are empty**, which fails installability.
- `public/icons/` has only `icon.svg`. No service worker exists. Stack is version-locked: **React 18 / Next 14.2 — do not upgrade anything core** (`prapti-ground-rules` skill).

## Build

1. **Icons & manifest completion.** Generate the icon set from `public/icons/icon.svg`: 192×192, 512×512, plus maskable variants (and `apple-touch-icon`). Use `sharp` in a small `scripts/generate-icons.ts` (run with `npx tsx`) so regeneration is repeatable. Fill `icons`, add at least 2 `screenshots` (capture from the running app), keep name/colors as-is.
2. **Service worker.** Preferred: `@ducanh2912/next-pwa` (supports Next 14 App Router; verify its peer range against next 14.2.x before installing — if it conflicts, hand-roll `public/sw.js` + a small register component instead; do NOT touch React/Next versions). Caching strategy:
   - App shell + static assets: stale-while-revalidate.
   - `GET /api/sites*` responses: network-first with cache fallback (short max entries).
   - Site photos (R2 `IMAGE` assets): cache-first with an LRU cap (~50 entries).
   - **Exclude** `.glb` and panorama files from automatic caching — they are tens of MB (offline XR is opt-in, phase 5+ scope).
   - Exclude `/api/auth/*` and `/admin/*` from caching entirely.
3. **Offline fallback page.** `src/app/~offline` (or the plugin's convention): heritage-voice message matching `src/app/not-found.tsx`'s tone, listing cached site pages if the plugin supports it.
4. **Metadata polish while you're in `layout.tsx`:** correct `metadataBase`, per-site OG tags if Prompt 07 didn't add them, `sitemap.ts` + `robots.ts` (App Router conventions).

Design rules for anything visible: `prapti-design-system` skill (heritage tokens, serif headings, focus rings).

## Verify (evidence, not assertion)

- Gate: `type-check` / `lint` / `build` clean — note `next-pwa` wraps `next.config.js`; the existing webpack rule for `.glb` and `fs/net/tls` fallbacks must survive (paste the merged config).
- `npm run build && npm start`, then Lighthouse (Chrome DevTools) → PWA/installability audit passes; paste the summary.
- Offline drill: load home + one site page → DevTools offline → reload both → site info + photos render; XR viewers show a clear "you're offline" state rather than hanging (add one if missing).
- Install prompt appears on Android Chrome (or state it's verified only via Lighthouse if no device).

## Definition of Done

- [ ] Installable: manifest complete with real icons/screenshots; Lighthouse passes.
- [ ] Service worker with the exact caching strategy above; heavy 3D assets excluded.
- [ ] Offline: previously-visited site pages readable in airplane mode; graceful offline states elsewhere.
- [ ] `next.config.js` webpack customizations intact; no version-lock violations; gate output pasted.
