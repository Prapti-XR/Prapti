---
name: prapti-3d-viewers
description: Use when touching anything 3D/XR in Prapti — src/components/3d/ (ModelViewer, PanoramaViewer, ARViewer, ImmersiveViewer), WebXR sessions, GLTF/panorama loading, or adding a new viewer or viewer mode to a page. Contains the composable recipes (panorama sphere, centered model, XR store) and the SSR/hooks traps that have already bitten this repo.
---

# Prapti 3D/XR Viewer Recipes

_Last verified: 2026-07-07 against `src/components/3d/*` on the pinned stack: `three 0.169.0`, `@react-three/fiber 8.17.10`, `@react-three/drei 9.115.0`, `@react-three/xr 6.6.26`, React 18._

## Loading a viewer into a page (always exactly this)

```tsx
const ModelViewer = dynamic(
  () => import('@/components/3d/ModelViewer').then(mod => ({ default: mod.ModelViewer })),
  { ssr: false }
);
// ...rendered inside <ThreeErrorBoundary> ... </ThreeErrorBoundary>
```

Three.js breaks under SSR; `ThreeErrorBoundary` (`src/components/error/ThreeErrorBoundary.tsx`) is the error state for load failures. Exemplar: `src/app/site/[id]/page.tsx`.

## The three composable recipes

1. **Panorama surround** (from `PanoramaViewer.tsx`): a `<mesh scale={[-1,1,1]}>` with `sphereGeometry args={[500, 60, 40]}` and `meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false}`. Texture via drei `useTexture`, configured `EquirectangularReflectionMapping` + `SRGBColorSpace` + linear filters. Unlit — needs no lights.
2. **Focal model** (from `ModelViewer.tsx`): `useGLTF(url)` → `<Center><primitive object={scene} dispose={null} /></Center>`. Needs the lighting rig: ambient 0.5–0.6 + two directionals + a hemisphere light. Camera: `PerspectiveCamera makeDefault` fov 50–60.
3. **XR session** (from `ARViewer.tsx` / `ImmersiveViewer.tsx`, v6 API — do NOT use older `<VRButton>` APIs):
   - `const [store] = useState(() => createXRStore())` — **once per mount**; recreating per render resets XR state (past bug, `system/defect-log.md` R2).
   - `<Canvas><XR store={store}>…</XR></Canvas>`, entered via `store.enterAR()` / `store.enterVR()`.
   - Support check: `navigator.xr?.isSessionSupported('immersive-ar' | 'immersive-vr')` in a `useEffect`; render a clearly-worded fallback when unsupported (see ARViewer's "AR Not Supported" panel / ImmersiveViewer's inline chip + orbit fallback).

`ImmersiveViewer` composes 1+2+3: model centered at `modelPosition` (default `[0, 1, -2.5]`, in front of the VR spawn at eye height), panorama as the world, `OrbitControls target={modelPosition}` as the non-VR fallback, drei `<Environment preset="sunset" background />` when the panorama is missing, panorama-alone when the model is missing — never crash on missing assets.

## Traps (all have bitten this repo — see `system/defect-log.md`)

- **Never call `useGLTF`/`useTexture`/`useEffect` inside `try/catch`.** They suspend by throwing a Promise; catching it breaks Suspense and violates rules-of-hooks (defect R1). Error handling belongs to `<Suspense fallback>` + `ThreeErrorBoundary`.
- Clone GLTF scenes you mount more than once (`useMemo(() => scene.clone(), [scene])` — ARViewer does this).
- `onLoad` callbacks: guard with a `useRef` flag so they fire once (`ModelViewer`'s `hasCalledOnLoad`).

## Viewer chrome standard (see `prapti-design-system` for tokens)

Dark well `from-heritage-dark to-heritage-dark-deep rounded-xl`, `font-serif` overlay title, `border-heritage-primary` spinner, `heritage-accent/80` capability badge ("360°", "AR Ready", "VR View"), heritage-primary pill CTA, 44×44 controls with `aria-label` + focus-visible rings, and a bottom-left controls help card.

## Assets & CORS

Model/panorama URLs come from `Asset.storageUrl` (Cloudflare R2, public `r2.dev` bucket). `src/lib/r2.ts` exports `getProxiedAssetUrl()` which, under `NEXT_PUBLIC_USE_ASSET_PROXY=true`, rewrites URLs to `/api/proxy-asset` — **but that route does not exist as of 2026-07-07** (verified: no `src/app/api/proxy-asset/`), so enabling the flag would 404; implement the route first if CORS forces you there (`CLAUDE.md` describes the intent). Pages pick assets by type: `assets.find(a => a.type === 'MODEL_3D')` / `'PANORAMA_360'` — the field is **`storageUrl`**, not `url`.

## When NOT to use this skill

Non-3D UI (use `prapti-design-system`) or asset upload/storage backend work (use `prapti-api-routes` / `prapti-data-model`).

**How to re-verify this:** read `src/components/3d/ImmersiveViewer.tsx` top-to-bottom (it exercises every recipe) and confirm the pinned versions in `package.json`.
