# AR real-world scale and anchored placement

**Date:** 2026-09-02
**Status:** approved for planning
**Scope:** `ARViewer` and the data/API/admin surface that feeds it

## Problem

Two defects and one missing capability, all in mobile AR.

**1. Every model renders at the same wrong size.** `ARModel` normalizes each GLTF to a
1 m bounding box via `computeNormalizedScale` (`src/lib/model-sizing.ts`) and multiplies by a
`calibration` factor defaulting to 0.5. The normalization deliberately discards the model's
authored units, so a temple carving and a fort both appear ~0.5 m across.

**2. The models carry no real-world scale to recover.** Measured authored bounding boxes of the
example assets:

| model | authored W x H x D (units) | max dim |
|---|---|---|
| `sahasralinga.glb` | 1.74 x 0.49 x 1.52 | 1.74 |
| `somasagara.glb` | 1.48 x 0.77 x 1.44 | 1.48 |
| `sonda-fort.glb` | 2.44 x 1.18 x 2.75 | 2.75 |

Sonda Fort is a real fort authored as 2.75 units across. These are photogrammetry scans at
arbitrary units. **True scale cannot be derived from the asset** — it has to be supplied per model
and found by experiment.

**3. The model is not world-anchored and drifts.** `ARModel` sits at a fixed scene coordinate
(`position={[0, 0, -2]}`), not attached to any tracked real-world feature, so it slides relative to
the room as ARCore's pose estimate evolves. There is also no way to place it: the help card claims
"Tap to place the model", but the tap handler only rotates the model 45 degrees.

## Non-goals

- **Model download weight.** Not a concern here on two counts. Uploads are already Draco-compressed
  with WebP textures server-side before reaching R2 (`src/app/api/upload/route.ts` ->
  `src/lib/optimize.ts`), turning a ~120 MB photogrammetry source into a few MB download; the
  122.9 MB `sonda-fort.glb` measured below is the uncompressed *source* in the gitignored
  `docs/example-data/`, not the delivered asset. And this work is a render-time multiplier that
  changes no stored bytes either way. drei wires the Draco and Meshopt decoders into `useGLTF` by
  default, so no decoder setup is required.
- **Phase 2 work:** the four touch gestures (drag, pinch, twist, dolly) and the lock button.
- **Phase 3 work:** setting scale at upload time in the existing upload flow.

## Design

### 1. Data model

Add to `Asset` in `prisma/schema.prisma`:

```prisma
realScaleFactor Float?  // multiplier from authored units to metres; null = unknown
```

Semantics: **world size = authored size x realScaleFactor**, replacing bounding-box normalization
entirely when real-scale mode is on. For a 30 m Sonda Fort at 2.75 authored units, the factor is
~10.9.

`null` is meaningful and must stay nullable: it means "true scale not yet determined", and the UI
must render the real-scale control as disabled rather than silently showing a wrong size.

No migration risk from `relationMode = "prisma"` — this is a scalar column on an existing table.
`/api/sites/[id]` includes assets with `include`, not `select`, so the new column reaches the viewer
with no serializer change.

### 2. API

**`PATCH /api/admin/assets/[id]`** — new route. Follows the existing admin conventions
(`src/app/api/admin/users/route.ts` is the exemplar for an admin PATCH):

- `getServerSession(authOptions)`; 401 when absent.
- Re-query the DB for role; 403 unless `ADMIN`. Deliberately stricter than the general admin-panel
  convention (which admits `MODERATOR`), matching `PATCH /api/admin/users`: real-world scale is a
  published presentation property, and a wrong value misrepresents the heritage site to every
  visitor.
- Validate `realScaleFactor` before touching the DB: must be a finite number `> 0`, or explicitly
  `null` to clear it. 400 with a specific message otherwise.
- Response `{ success: true, data: <asset> }` passed through `serializeBigInt()` — `Asset` rows carry
  `fileSize: BigInt` and will 500 in production without it.
- On success, invalidate the cached list keys with `cache.delPattern` (`src/lib/redis.ts:241`) so
  `/api/models` and `/api/sites` do not serve a stale scale. `cache` degrades to a no-op when the
  `UPSTASH_REDIS_REST_*` vars are absent, so this is safe with or without Redis configured.

**`GET /api/admin/assets?type=MODEL_3D`** — new route, same auth gate. Returns 3D model assets with
their site name and current `realScaleFactor`. A dedicated route rather than reusing `/api/models`,
because that endpoint is public, filtered to `isPublished` sites, and cached for 5 minutes — all
three are wrong for an admin editing screen.

### 3. Admin UI

New page `/admin/scale`, reachable from a card on the admin dashboard. A single table of 3D models:
site name, asset title, current factor, a numeric input, and save-per-row with inline success/error
feedback. Deliberately not a general asset CRUD screen — this exists to serve one workflow, finding
the scale number by experiment.

**The experiment loop this is built around:** open AR on the phone, switch to real-scale mode,
fine-trim with the existing +/- calibration until the size looks right, read the resulting effective
factor off the AR overlay, then enter it on `/admin/scale`. To close that loop the AR overlay must
display the current effective factor numerically, not just a percentage.

### 4. Viewer: scale modes

`ARViewer` gains two modes rather than replacing the current behaviour:

- **`preview`** (default, today's behaviour): normalized to 1 m, multiplied by the calibration
  factor. The right default for a tabletop look and for models with no `realScaleFactor` yet.
- **`real`**: authored size x `realScaleFactor`, with the existing +/- calibration acting as a
  fine-trim on top so the factor can be converged on in-session.

A dedicated toggle button appears in both the pre-session panel and the in-session `XRDomOverlay`.
It renders disabled, with an explanatory label, when `realScaleFactor` is `null`. The selected mode
persists per model in `localStorage` alongside the existing `ar-scale:{modelUrl}` calibration key.

### 5. Viewer: anchored placement (`useARPlacement`)

New hook owning the placement lifecycle, so `ARViewer` stays presentational and the placement logic
can be reasoned about on its own.

- `createXRStore({ hitTest: true, anchors: true, domOverlay: true })` — all three are supported
  options on the pinned `@react-three/xr` 6.6.26.
- `useXRHitTest(cb, 'viewer', ['plane', 'mesh'])` drives a reticle rendered on the detected floor
  while unplaced.
- Tap to place calls `createAnchor({ relativeTo: 'hit-test-result', hitTestResult })` from
  `useXRAnchor()`.
- The model renders inside `<XRSpace space={anchor.anchorSpace}>`. **This is the fix for the drift**
  — the model becomes tracked by ARCore against a real-world feature instead of sitting at a fixed
  scene coordinate.
- State machine: `scanning -> ready -> placed`. The help card text follows the state, replacing the
  current static list whose "Tap to place the model" line describes behaviour that does not exist.

**Fallback:** if the session grants neither `hit-test` nor `anchors`, fall back to today's fixed
`[0, 0, -2]` placement. Weaker devices must not regress to a broken screen.

## Risks

- **`db:push` was recorded as blocked in this project in an earlier session.** If still true, the
  migration is the first thing that fails and must be sorted before any other step.
- **AR behaviour cannot be verified in the development environment** — no WebXR. Floor detection,
  anchoring, and whether a given scale factor looks right require an Android device with ARCore.
  This is owner-verified ground truth, not something the implementation can self-certify.
- **`XRDomOverlay` touch behaviour** is the foundation Phase 2's gestures build on. Phase 1 uses it
  only for buttons; if it proves unreliable for raw touch tracking, Phase 2's approach changes.

## Verification

Automated, and runnable here: `npm run type-check`, `npm run lint`, `npm run build`. There is no test
framework in this repo — these are the gate.

API contract checks against a running dev server: `PATCH /api/admin/assets/[id]` returns 401
unauthenticated, 403 as a `USER`, 400 for a negative or non-numeric factor, 200 for a valid one.

On-device, by the owner: model lands on the real floor; it stays put when walking around it; the
real-scale toggle produces a plausible size; the value set in `/admin/scale` is what the viewer uses.

## Phase 2 (not designed here)

`useARGestures` — one-finger drag to move along the anchor plane, pinch to resize, two-finger twist
to rotate, vertical drag for distance — plus the lock button that freezes the transform and ignores
further gesture input.
