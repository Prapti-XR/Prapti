---
name: prapti-asset-delivery-plan
description: Use when working on 3D/360° asset performance, R2 storage, CORS failures, slow model/panorama loads, mobile performance, or planning asset-pipeline improvements in Prapti. Contains the plan of record for the hardest open problem — fast, reliable delivery of heavy R2 assets to mobile WebGL — with inference clearly labeled.
---

# Hardest Open Problem: R2 Asset Delivery at Mobile-Quality Speed

_Written 2026-07-07. Problem identification grounded in `CLAUDE.md` (proxy/CORS note), `docs/scaling/caching_strategies.md` and `PERFORMANCE_OPTIMIZATIONS.md` (multi-layer caching is designed but asset-payload optimization is not), and measured facts below. The staged plan is **inference** — a proposed order, not user-confirmed roadmap._

## The problem, grounded

- Assets are served straight from a public R2 dev bucket (`https://pub-….r2.dev/sites/{siteId}/…`) — verified 2026-07-07: panoramas return `200 image/jpeg` (~3.5 MB each per seeded `fileSize`), models `model/gltf-binary`.
- **Fact:** there is no GLB compression (no Draco/Meshopt in the loaders — `useGLTF` is used bare), no LOD, no progressive/resized panorama variants, and no image transformation layer. A mid-range phone on 4G downloads full-size assets before anything renders.
- **Fact:** CORS is a live risk and the documented escape hatch is **half-built**: `getProxiedAssetUrl()` exists (`src/lib/r2.ts:37`) and `CLAUDE.md` describes routing loads through `/api/proxy-asset` under `NEXT_PUBLIC_USE_ASSET_PROXY=true` — but no `src/app/api/proxy-asset/` route exists (verified 2026-07-07). Enabling the flag today would 404 every asset. The proxy, once implemented, trades CORS safety for server bandwidth + latency (**inference**).
- **Fact:** schema already carries the metadata needed for optimization decisions: `Asset.polygonCount`, `textureCount`, `width`, `height`, `isProcessed` (`prisma/schema.prisma`) — `isProcessed` implies an intended processing pipeline that does not exist yet (**inference from the field's existence; no pipeline code found in `src/` or `scripts/`**).

## Plan of record (staged; each stage independently shippable)

1. **Measure first.** Add simple timing (Performance API around `useGLTF`/`useTexture` load, reported via the existing `onLoad` callbacks) and record per-asset `fileSize` vs. load time on a throttled connection. Exit criteria: a table of worst offenders. No architecture changes.
2. **Serve correct headers from R2.** Long-lived `Cache-Control: public, max-age=31536000, immutable` on asset objects (keys are timestamped → content-addressed enough). Configure bucket CORS to allow the production origin so the proxy stays off in production. (Aligns with Layer-1/2 of `docs/scaling/caching_strategies.md`.)
3. **Compress models at upload time.** Extend `src/lib/upload.ts` / `scripts/upload-assets.ts` to run glTF optimization (Draco or Meshopt via `gltf-transform`) before `PutObject`, set `isProcessed=true` and record new `fileSize`/`polygonCount`. Loader side: drei's `useGLTF` supports a Draco decoder path — verify against the pinned drei 9.115.0 before relying on it (**do not bump versions for this; see `prapti-ground-rules`**).
4. **Resize panoramas into tiers.** Generate 2K/4K variants at upload (sharp), store both keys; viewers pick by `window.devicePixelRatio`/screen size; store dims in the existing `width`/`height` fields.
5. **Custom domain / CDN in front of R2** (Cloudflare CDN per `docs/ARCHITECTURE.md` "Why Cloudflare R2") replacing the `r2.dev` dev URL — enables edge caching + purging per `docs/scaling/caching_strategies.md` Layer 2.
6. **Only if 1–5 are insufficient:** LOD/progressive loading (e.g. drei `<Detailed>`), KTX2 texture compression.

## Constraints on any implementation

Pinned 3D stack versions (no upgrades), `ssr:false` discipline, `serializeBigInt` when new asset fields flow through APIs, and R2 key convention `sites/{siteId}/{assetType}/{timestamp}-{filename}` (source: `CLAUDE.md`).

## When NOT to use this skill

Ordinary viewer feature work where assets already load acceptably (→ `prapti-3d-viewers`), or generic caching of *API responses* (→ `prapti-api-routes`, Redis pattern).

**How to re-verify this:** `HEAD` a seeded asset's `storageUrl` and inspect `content-length`/`cache-control`; grep `src/` and `scripts/` for `draco|meshopt|sharp` (still absent = plan still open); re-read `docs/scaling/caching_strategies.md`.
