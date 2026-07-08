# Prompt 08 — XR Flagship Polish: fast, comfortable, shareable immersive views

**Phase 3 of `ROADMAP.md`. Run after Prompt 07. The `.claude/skills/prapti-asset-delivery-plan` and `prapti-3d-viewers` skills are the spec — this prompt operationalizes them.**

---

You are the XR performance engineer on **Prapti**. The immersive view (3D model centered inside its 360° panorama — `src/components/3d/ImmersiveViewer.tsx`) is the brand. It must reach first-render in **< 5 seconds on a throttled "Fast 3G + 4× CPU" profile** on every seeded site.

## Step 0 — Load context

1. `.claude/skills/prapti-asset-delivery-plan/SKILL.md` — the staged plan of record; follow its order. `prapti-3d-viewers` — the recipes and traps (hooks are unconditional; XR store once per mount; pinned stack, **no version bumps**).
2. Ground truth to verify before acting: `/api/proxy-asset` does **not** exist even though `CLAUDE.md` mentions it (`getProxiedAssetUrl` in `src/lib/r2.ts:37` would 404). Assets serve from a public `r2.dev` URL.

## Build — in the plan's stage order

1. **Measure.** Instrument load timing via the viewers' existing `onLoad` callbacks + the Performance API; log per-asset `fileSize` vs. load ms. Produce a table for all seeded sites (throttled). This table is the baseline — paste it in your final report.
2. **Headers & CORS.** Document (and apply if credentials allow) R2 object `Cache-Control: public, max-age=31536000, immutable` and bucket CORS for the app origins. Then either **implement `/api/proxy-asset`** (streaming GET proxy, whitelist to the R2 public host, correct content-type passthrough) or delete `getProxiedAssetUrl` + the `NEXT_PUBLIC_USE_ASSET_PROXY` env flag and the `CLAUDE.md` mention — half-built is not an option. Ask the user which; recommend implementing the proxy as a CORS fallback.
3. **Compress models.** Add a glTF optimization step (`@gltf-transform/core` + Draco or Meshopt) to `src/lib/upload.ts`/`scripts/upload-assets.ts`/`scripts/import-sites.ts`; set `isProcessed=true`, update `fileSize`/`polygonCount`. Loader side: enable the matching decoder path in `useGLTF` — **verify decoder support against the pinned drei 9.115.0 docs, not memory**. Re-process the seeded assets (R2 writes need user consent).
4. **Panorama tiers.** Generate 2K + 4K variants at upload (`sharp`); viewers pick by device (`devicePixelRatio`/screen width); store dimensions in the existing `width`/`height` fields.
5. **VR comfort in `ImmersiveViewer`:** in-canvas load progress (drei `useProgress` + `Html`), per-site `modelScale`/`modelPosition` read from site/asset data instead of hardcoded defaults (schema addition needs consent), and optional panorama hotspots (annotation sprites with title/text, keyboard-accessible fallback list below the canvas).

Stages 1–2 are mandatory; 3–5 in order as time allows — each independently shippable, gate after each.

## Verify

- The gate (`prapti-verification`) after every stage: `type-check` / `lint` / `build` clean, all pages 200.
- Before/after timing table (stage 1 vs. post-stage-3/4) — the < 5s target measured, not asserted.
- XR regression: `/ar?site=sonda-fort` and `site/[id]` → VR Experience still render; missing-asset degradation still graceful; `store.enterVR()` still wired (headset step remains manual — say so).

## Definition of Done

- [ ] Baseline + after timing tables pasted; < 5s first-render on throttled profile for all seeded sites (or the measured gap + the next bottleneck named).
- [ ] Proxy decision executed (implemented or fully removed) — no half-built path remains.
- [ ] Compression + tiers integrated into every upload path (wizard, bulk import, script).
- [ ] No version-lock violations; verification gate output pasted.
