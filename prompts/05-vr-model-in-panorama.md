# Prompt 05 — Immersive VR View: 3D Model Inside the 360° Environment

**Paste this to Fable in a fresh session in this repo. Best run after `01-make-it-work.md` (needs the app working) and ideally after `02-beautiful-ui.md`.**

---

You are the XR engineer on **Prapti**, a heritage AR/VR platform (Next.js 14 + React Three Fiber v8 + `@react-three/xr` v6). Build **Goal 3** from `goals.md`: an **immersive VR view** where a heritage site's **3D model is centered as the focal object** and its **360° panorama forms the surrounding environment** around it, enterable in **VR** (WebXR `immersive-vr`), with a normal look-around fallback on desktop/mobile.

## Step 0 — Load context

Read, in this order:
1. `goals.md` → "Goal 3" (the acceptance criteria are there).
2. `CLAUDE.md` → the 3D ground rules (version locks, `ssr:false` + `ThreeErrorBoundary`).
3. The three components you will compose — **read them; reuse their patterns, don't reinvent**:
   - `src/components/3d/PanoramaViewer.tsx` — the inverted equirectangular sphere (the surround).
   - `src/components/3d/ModelViewer.tsx` — the centered GLTF via drei `<Center>` (the focal model).
   - `src/components/3d/ARViewer.tsx` — the `createXRStore()` XR session pattern + the "unsupported device" fallback UX.
4. `src/app/ar/page.tsx` — how a page fetches `/api/sites/[id]`, picks the `MODEL_3D` asset, and toggles viewer modes. `prisma/schema.prisma` → `AssetType` (`MODEL_3D`, `PANORAMA_360`).

## What to build

**A new client component** — suggested `src/components/3d/ImmersiveViewer.tsx` — that renders, inside a single `<Canvas>`:
- the **panorama sphere** as the environment (reuse `PanoramaViewer`'s sphere: radius ~500, `THREE.BackSide`, `EquirectangularReflectionMapping`, `SRGBColorSpace`, `toneMapped={false}`),
- the **centered 3D model** (reuse `ModelViewer`'s `useGLTF` + `<Center>` + lighting),
- wrapped in `<XR store={store}>` with an **"Enter VR"** button calling `store.enterVR()`.

**Props (suggested):** `modelUrl: string`, `panoramaUrl?: string`, `title?: string`, plus optional `modelScale` / `modelPosition`. Keep the prop and callback shape (`onLoad` / `onError`) consistent with the sibling viewers.

**Behavior:**
- **VR support check** — mirror `ARViewer` but for VR: `navigator.xr?.isSessionSupported('immersive-vr')`. If unsupported, still render the scene with the non-VR fallback and show a clearly-worded notice (reuse `ARViewer`'s unsupported-state styling).
- **Non-VR fallback** — `OrbitControls` so desktop/mobile users orbit/look around the centered model against the panorama backdrop. Include loading + error states matching the other viewers (`Suspense` fallback, error placeholder).
- **Framing** — the model reads as the centered focal point with the panorama filling the background; pick a comfortable default camera distance and model scale (start from `ModelViewer`'s `cameraPosition` / `Center` and tune).
- **Missing assets** — if `panoramaUrl` is absent, fall back to a drei `<Environment>` or solid backdrop; if `modelUrl` is absent, show the panorama alone. Never crash.

**Surface it in the product** — add a **"VR View"** mode to the existing AR/3D toggle in `src/app/ar/page.tsx` (fetch the site's `PANORAMA_360` asset the same way the page already fetches `MODEL_3D`), OR add an equivalent entry point on `site/[id]`. Load the component with `dynamic(() => import(...), { ssr: false })` inside `ThreeErrorBoundary`, exactly like `ARViewer`/`ModelViewer` are loaded today.

## Ground rules (do not violate — from CLAUDE.md)

- Keep the pinned stack: `@react-three/fiber 8.17.10`, `@react-three/drei 9.115.0`, `@react-three/xr 6.6.26`, `three 0.169.0`, React 18. Use the **v6 `@react-three/xr` API** (`createXRStore`, `<XR store={...}>`, `store.enterVR()`) — it differs from older `<VRButton>`/`<XR>` APIs; verify against the installed version, not memory.
- Component is `'use client'`, dynamically imported with `{ ssr: false }`, wrapped in `ThreeErrorBoundary`.
- If it loads assets from R2, remember the CORS/proxy note in `src/lib/r2.ts` (`getProxiedAssetUrl`, `NEXT_PUBLIC_USE_ASSET_PROXY`) — panorama textures and GLB models must be fetchable cross-origin.

## Verify (evidence, not assertion)

- `npm run type-check` and `npm run lint` stay clean.
- `npm run dev`: the new mode renders — model centered, panorama surrounding, loading/error states work, and a site missing a panorama or model degrades gracefully.
- On a non-VR browser: the unsupported notice shows and the orbit fallback still works.
- If a WebXR device/emulator is available, confirm "Enter VR" opens an immersive session; if not, state that VR entry is verified only up to the `enterVR()` call and needs a headset to confirm end-to-end.
- If the `verify` or `run` skill exists in this environment, use it to drive the flow rather than assuming.

## Definition of Done

- [ ] `ImmersiveViewer` renders the centered model inside the panorama environment in one `<Canvas>`.
- [ ] `ssr:false` + `ThreeErrorBoundary`; pinned XR stack; v6 XR API used correctly.
- [ ] "Enter VR" wired via `store.enterVR()`; graceful, clear fallback when `immersive-vr` is unsupported.
- [ ] Non-VR orbit fallback + loading/empty/error states matching sibling viewers.
- [ ] Degrades gracefully when the panorama and/or model asset is missing.
- [ ] Reachable in the product (AR-page mode toggle or `site/[id]` entry point).
- [ ] `type-check` + `lint` clean; behavior verified in the browser.

Finish with: what you built, which existing patterns you reused, and exactly what still needs a real VR headset to confirm.
