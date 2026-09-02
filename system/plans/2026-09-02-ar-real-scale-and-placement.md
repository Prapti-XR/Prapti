# AR Real-World Scale and Anchored Placement — Implementation Plan (Phase 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an admin set a per-model real-world scale factor, let the AR viewer render at that true scale, and anchor the model to the real floor so it stops drifting.

**Architecture:** A nullable `Asset.realScaleFactor` column supplies the multiplier that turns authored GLTF units into metres. An ADMIN-only route pair reads and writes it; a focused `/admin/scale` page edits it. `ARViewer` gains a second scale mode that uses the factor instead of bounding-box normalization, and a `useARPlacement` hook that hit-tests the real floor and pins the model inside a WebXR anchor's tracked space.

**Tech Stack:** Next.js 14 App Router, Prisma 5.22 + Neon Postgres (`relationMode = "prisma"`), NextAuth v4, React 18.3.1, three 0.169.0, @react-three/fiber 8.17.10, @react-three/drei 9.115.0, @react-three/xr 6.6.26, Tailwind.

**Spec:** `system/specs/2026-09-02-ar-real-scale-and-placement-design.md`

## Global Constraints

- **Do not upgrade any dependency.** The 3D/XR stack is version-locked to a mutually compatible set: react 18.3.1, next 14.2.x, three 0.169.0, @react-three/fiber 8.17.10, @react-three/drei 9.115.0, @react-three/xr 6.6.26. Do not move to React 19.
- **NextAuth is v4**, not v5. Use `getServerSession(authOptions)`.
- **There is no test framework in this repo.** `npm run type-check`, `npm run lint`, and `npm run build` are the automated gate. Do not add a test framework as part of this plan.
- **Any API route returning `Asset` rows must pass through `serializeBigInt()`** (`src/lib/utils.ts:88`) or `jsonResponse()` (`:117`). `Asset.fileSize` is a `BigInt` and will 500 in production otherwise.
- **API response contract:** success `{ success: true, data: <payload> }`; failure `{ error: '<user-safe message>' }` with the correct status. Never leak stack traces — `console.error` server-side, return a generic message.
- **Status codes:** 200 success, 400 invalid input (validate before touching the DB), 401 no session, 403 wrong role, 500 unexpected inside `try/catch`.
- **`relationMode = "prisma"`** — no DB foreign keys. Index changes are deliberate; this plan adds no relations so none are needed.
- **TypeScript is strict**, including `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`. Prefix intentionally unused params with `_`.
- **Path aliases:** use `@/...`, never `../../` chains.
- **3D components are `'use client'`** and must be dynamically imported with `{ ssr: false }` and wrapped in `ThreeErrorBoundary`. Never call `useGLTF`/`useTexture`/`useEffect` inside `try/catch` — they suspend by throwing a Promise.
- **Redis is optional.** `cache` from `src/lib/redis.ts` degrades to a no-op when `UPSTASH_REDIS_REST_*` are absent. Never assume it exists.
- **Semantics of the factor:** `world size in metres = authored GLTF size × realScaleFactor`. `null` means "not calibrated yet" and must render the real-scale control disabled, never a wrong size.

---

### Task 1: Add `Asset.realScaleFactor` to the schema

**Files:**
- Modify: `prisma/schema.prisma` (the `Asset` model, in the "3D Model specific" block)

**Interfaces:**
- Consumes: nothing.
- Produces: `Asset.realScaleFactor: number | null` on the generated Prisma client, and on every API payload that returns assets via `include`.

- [ ] **Step 1: Add the column**

In `prisma/schema.prisma`, find the `Asset` model's `// 3D Model specific` block:

```prisma
  // 3D Model specific
  format       String? // e.g., "GLTF", "GLB"
  polygonCount Int?
  textureCount Int?
```

Change it to:

```prisma
  // 3D Model specific
  format       String? // e.g., "GLTF", "GLB"
  polygonCount Int?
  textureCount Int?
  // Multiplier from the model's authored GLTF units to real-world metres:
  // world size = authored size * realScaleFactor. Photogrammetry scans are
  // exported at arbitrary units (sonda-fort.glb is 2.75 units across for a
  // real fort), so true scale cannot be derived from the asset and must be
  // measured by experiment. null = not calibrated yet, which makes the AR
  // real-scale control render disabled rather than show a wrong size.
  realScaleFactor Float?
```

- [ ] **Step 2: Validate the schema**

Run: `npx prisma validate`
Expected: `The schema at prisma\schema.prisma is valid 🚀`. A `relationMode = "prisma"` advisory warning is pre-existing and expected — it is not an error.

- [ ] **Step 3: Regenerate the client**

Run: `npx prisma generate`
Expected: `✔ Generated Prisma Client (v5.22.0)`.

- [ ] **Step 4: Push the column to the database**

Run: `npm run db:push`
Expected: the column is added; Prisma reports the database is in sync.

**If this step fails:** a previous session recorded `db:push` as blocked on this project. Do not work around it by editing the generated client or by skipping to Task 2 — every later task depends on this column existing. Stop, report the exact error, and resolve connectivity first. `DATABASE_URL`/`DIRECT_URL` live in `.env`; `npx prisma db pull` is a safe read-only probe of whether the database is reachable at all.

- [ ] **Step 5: Confirm the field exists on the client**

Run:
```bash
node -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.asset.findFirst({select:{id:true,realScaleFactor:true}}).then(r=>{console.log('OK, field selectable:',r);return p.\$disconnect()}).catch(e=>{console.error('FAIL:',e.message.split('\n')[0]);process.exit(1)})"
```
Expected: prints `OK, field selectable:` followed by a row (or `null` if the table is empty). Any Prisma error about an unknown field means Step 4 did not take effect.

- [ ] **Step 6: Type-check**

Run: `npm run type-check`
Expected: exit 0, no output beyond the npm banner.

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(schema): add Asset.realScaleFactor for AR real-world scale"
```

---

### Task 2: ADMIN-only assets API route

**Files:**
- Create: `src/app/api/admin/assets/route.ts`

**Interfaces:**
- Consumes: `Asset.realScaleFactor` from Task 1.
- Produces:
  - `GET /api/admin/assets?type=MODEL_3D` → `{ success: true, data: AdminAssetRow[] }` where
    `AdminAssetRow = { id: string; title: string; type: string; storageUrl: string; realScaleFactor: number | null; site: { id: string; name: string } }`
  - `PATCH /api/admin/assets` with body `{ assetId: string; realScaleFactor: number | null }` → `{ success: true, data: AdminAssetRow }`

- [ ] **Step 1: Write the route**

Create `src/app/api/admin/assets/route.ts`. This mirrors `src/app/api/admin/users/route.ts`, with the role gate tightened to ADMIN on **both** methods:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/redis';
import { serializeBigInt } from '@/lib/utils';

/** Shape returned to the admin scale screen. Kept narrow on purpose: this
 * route exists to calibrate real-world scale, not to be a general asset API. */
const ADMIN_ASSET_SELECT = {
    id: true,
    title: true,
    type: true,
    storageUrl: true,
    realScaleFactor: true,
    site: { select: { id: true, name: true } },
} as const;

/** Both methods are ADMIN-only — deliberately stricter than the general
 * admin-panel convention that also admits MODERATOR. realScaleFactor is a
 * published presentation property: a wrong value misrepresents the physical
 * size of a heritage site to every visitor. */
async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }
    const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { role: true },
    });
    if (!user || user.role !== 'ADMIN') {
        return { error: NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 }) };
    }
    return { error: null };
}

export async function GET(request: NextRequest) {
    try {
        const gate = await requireAdmin();
        if (gate.error) return gate.error;

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        const assets = await prisma.asset.findMany({
            where: type ? { type: type as never } : undefined,
            select: ADMIN_ASSET_SELECT,
            orderBy: { createdAt: 'desc' },
        });

        // Not cached: this screen must reflect a write immediately.
        return NextResponse.json({ success: true, data: serializeBigInt(assets) });
    } catch (error) {
        console.error('Failed to fetch admin assets:', error);
        return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const gate = await requireAdmin();
        if (gate.error) return gate.error;

        const data = await request.json();

        if (typeof data.assetId !== 'string' || data.assetId.length === 0) {
            return NextResponse.json({ error: 'Missing assetId' }, { status: 400 });
        }

        // null is a valid, meaningful value: it clears the calibration back to
        // "unknown". Anything else must be a finite positive number — zero or
        // negative would collapse or mirror the model.
        const raw = data.realScaleFactor;
        let realScaleFactor: number | null;
        if (raw === null) {
            realScaleFactor = null;
        } else if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
            realScaleFactor = raw;
        } else {
            return NextResponse.json(
                { error: 'realScaleFactor must be a positive number, or null to clear it' },
                { status: 400 }
            );
        }

        const existing = await prisma.asset.findUnique({
            where: { id: data.assetId },
            select: { id: true },
        });
        if (!existing) {
            return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
        }

        const updated = await prisma.asset.update({
            where: { id: data.assetId },
            data: { realScaleFactor },
            select: ADMIN_ASSET_SELECT,
        });

        // Public list endpoints cache site/model payloads that embed assets, so
        // a stale entry would serve the old scale. cache is a no-op when Redis
        // is not configured, so this is safe either way.
        await cache.delPattern('models:list:*');
        await cache.delPattern('sites:*');

        return NextResponse.json({ success: true, data: serializeBigInt(updated) });
    } catch (error) {
        console.error('Failed to update asset scale:', error);
        return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
    }
}
```

- [ ] **Step 2: Type-check and lint**

Run: `npm run type-check && npm run lint`
Expected: both exit 0. If `type as never` is rejected, import `AssetType` from `@prisma/client` and cast to that instead — do not widen the `where` clause to `any`.

- [ ] **Step 3: Verify the status-code contract against a running server**

Start the dev server in one terminal: `npm run dev`

Then, unauthenticated:
```bash
curl -s -o /dev/null -w "GET  unauth -> %{http_code}\n" http://localhost:3000/api/admin/assets
curl -s -o /dev/null -w "PATCH unauth -> %{http_code}\n" -X PATCH http://localhost:3000/api/admin/assets \
  -H "Content-Type: application/json" -d '{"assetId":"x","realScaleFactor":1}'
```
Expected: both print `401`.

- [ ] **Step 4: Verify validation while signed in as ADMIN**

Sign in at `http://localhost:3000/auth/signin` with the Google account that holds the ADMIN role, then run these from the browser devtools console (so the session cookie is attached):

```js
const call = (body) => fetch('/api/admin/assets', {
  method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
}).then(r => console.log(r.status, body));

await call({ realScaleFactor: 1 });                       // expect 400 (missing assetId)
await call({ assetId: 'nope', realScaleFactor: 1 });      // expect 404
await call({ assetId: 'nope', realScaleFactor: -3 });     // expect 400
await call({ assetId: 'nope', realScaleFactor: 'big' });  // expect 400
```
Expected: `400`, `404`, `400`, `400` — in that order. Validation must reject before the DB lookup for bad input, which is why the `-3` case returns 400 and not 404.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/assets/route.ts
git commit -m "feat(api): add ADMIN-only assets route for real-scale calibration"
```

---

### Task 3: `/admin/scale` page and dashboard entry

**Files:**
- Create: `src/app/admin/scale/page.tsx`
- Modify: `src/app/admin/page.tsx` (add an `ActionCard` in the Quick Actions grid)

**Interfaces:**
- Consumes: `GET`/`PATCH /api/admin/assets` from Task 2.
- Produces: no code interface; a UI surface at `/admin/scale`.

- [ ] **Step 1: Create the page**

Create `src/app/admin/scale/page.tsx`. Note the 4-space indentation used by the other admin pages, and the heritage tokens (`heritage-dark`, `heritage-primary`) rather than raw greys:

```tsx
'use client';

import { useCallback, useEffect, useState } from 'react';

interface AdminAssetRow {
    id: string;
    title: string;
    type: string;
    storageUrl: string;
    realScaleFactor: number | null;
    site: { id: string; name: string };
}

export default function AdminScalePage() {
    const [rows, setRows] = useState<AdminAssetRow[]>([]);
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [savingId, setSavingId] = useState<string | null>(null);
    const [status, setStatus] = useState<Record<string, string>>({});
    const [loadError, setLoadError] = useState('');
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/assets?type=MODEL_3D');
            const body = await res.json();
            if (!res.ok) {
                setLoadError(body.error ?? 'Failed to load models');
                return;
            }
            const data: AdminAssetRow[] = body.data;
            setRows(data);
            setDrafts(
                Object.fromEntries(
                    data.map((r) => [r.id, r.realScaleFactor === null ? '' : String(r.realScaleFactor)])
                )
            );
            setLoadError('');
        } catch {
            setLoadError('Failed to load models');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const save = async (id: string) => {
        const raw = drafts[id] ?? '';
        // An empty box means "clear the calibration", which the API accepts as null.
        const parsed = raw.trim() === '' ? null : Number(raw);
        if (parsed !== null && (!Number.isFinite(parsed) || parsed <= 0)) {
            setStatus((s) => ({ ...s, [id]: 'Must be a positive number, or empty to clear' }));
            return;
        }

        setSavingId(id);
        setStatus((s) => ({ ...s, [id]: '' }));
        try {
            const res = await fetch('/api/admin/assets', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assetId: id, realScaleFactor: parsed }),
            });
            const body = await res.json();
            if (!res.ok) {
                setStatus((s) => ({ ...s, [id]: body.error ?? 'Save failed' }));
                return;
            }
            setRows((prev) => prev.map((r) => (r.id === id ? body.data : r)));
            setStatus((s) => ({ ...s, [id]: 'Saved' }));
        } catch {
            setStatus((s) => ({ ...s, [id]: 'Save failed' }));
        } finally {
            setSavingId(null);
        }
    };

    return (
        <main className="min-h-screen p-6 bg-heritage-light">
            <div className="max-w-4xl mx-auto space-y-6">
                <header>
                    <h1 className="font-serif text-3xl font-bold text-heritage-dark">Real-World Scale</h1>
                    <p className="mt-2 text-sm text-heritage-dark/70">
                        World size = the model&apos;s authored size × this factor. Models are exported at
                        arbitrary units, so find the value by experiment: open the site in AR, switch to
                        real scale, trim with the ± buttons until it looks right, then enter the effective
                        factor the overlay shows. Leave the box empty to mark a model uncalibrated.
                    </p>
                </header>

                {loading && <p className="text-sm text-heritage-dark/70">Loading models…</p>}
                {loadError && (
                    <p className="p-3 text-sm text-white rounded-lg bg-red-900/80" role="alert">
                        {loadError}
                    </p>
                )}

                {!loading && !loadError && rows.length === 0 && (
                    <p className="text-sm text-heritage-dark/70">No 3D models uploaded yet.</p>
                )}

                {rows.length > 0 && (
                    <ul className="space-y-3">
                        {rows.map((row) => (
                            <li
                                key={row.id}
                                className="flex flex-wrap items-center gap-3 p-4 bg-white border rounded-xl border-heritage-dark/10"
                            >
                                <div className="flex-1 min-w-[12rem]">
                                    <p className="font-semibold text-heritage-dark">{row.site.name}</p>
                                    <p className="text-xs text-heritage-dark/60">{row.title}</p>
                                </div>
                                <label htmlFor={`scale-${row.id}`} className="sr-only">
                                    Real scale factor for {row.title}
                                </label>
                                <input
                                    id={`scale-${row.id}`}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    inputMode="decimal"
                                    value={drafts[row.id] ?? ''}
                                    onChange={(e) =>
                                        setDrafts((d) => ({ ...d, [row.id]: e.target.value }))
                                    }
                                    placeholder="uncalibrated"
                                    className="w-32 px-3 py-2 border rounded-lg border-heritage-dark/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary"
                                />
                                <button
                                    onClick={() => save(row.id)}
                                    disabled={savingId === row.id}
                                    className="px-4 py-2 font-semibold rounded-lg text-heritage-dark bg-heritage-primary hover:bg-heritage-primary/90 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary"
                                >
                                    {savingId === row.id ? 'Saving…' : 'Save'}
                                </button>
                                {status[row.id] && (
                                    <span
                                        className="w-full text-xs text-heritage-dark/70"
                                        role="status"
                                    >
                                        {status[row.id]}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}
```

- [ ] **Step 2: Add the dashboard entry**

In `src/app/admin/page.tsx`, inside the Quick Actions grid, immediately after the `Upload 3D Model` `ActionCard`, add:

```tsx
                                <ActionCard
                                    title="Real-World Scale"
                                    description="Calibrate AR size for 3D models"
                                    icon="📐"
                                    href="/admin/scale"
                                />
```

- [ ] **Step 3: Type-check, lint, build**

Run: `npm run type-check && npm run lint && npm run build`
Expected: all exit 0. The build must list `/admin/scale` in the route table.

- [ ] **Step 4: Verify in the browser**

With `npm run dev` running and signed in as ADMIN, open `http://localhost:3000/admin/scale`.
Expected: the models list renders; entering `10.9` and pressing Save shows `Saved`; reloading the page shows `10.9` still in the box; clearing the box and saving shows the `uncalibrated` placeholder again.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/scale/page.tsx src/app/admin/page.tsx
git commit -m "feat(admin): add real-world scale calibration screen"
```

---

### Task 4: Plumb `realScaleFactor` through to `ARViewer`

**Files:**
- Modify: `src/components/3d/ARViewer.tsx` (props only)
- Modify: `src/app/site/[id]/page.tsx:418-422`
- Modify: `src/app/ar/page.tsx:168-172`

**Interfaces:**
- Consumes: `Asset.realScaleFactor` (Task 1), already present on `/api/sites/[id]` responses because that route uses `include`, not `select`, for assets — no API change is needed.
- Produces: `ARViewerProps.realScaleFactor?: number | null`.

- [ ] **Step 1: Add the prop**

In `src/components/3d/ARViewer.tsx`, extend `ARViewerProps`:

```tsx
interface ARViewerProps {
    modelUrl: string;
    title?: string;
    /** Fixed default size multiplier for this call site, applied on top of
     * the model's own bounding-box-normalized scale. Acts as the "reset"
     * target for the in-AR size calibration control. */
    scale?: number;
    /** Multiplier from the model's authored units to real-world metres, from
     * `Asset.realScaleFactor`. null/undefined means the model has not been
     * calibrated, which disables the real-scale control. */
    realScaleFactor?: number | null;
    onLoad?: () => void;
    onError?: (error: Error) => void;
}
```

Accept it in the signature (it is used in Task 5; until then, prefix is not needed because it is a destructured prop with a default, which `noUnusedLocals` does not flag on object patterns — if lint does complain, complete Task 5 before committing):

```tsx
export function ARViewer({
    modelUrl,
    title,
    scale = 0.5,
    realScaleFactor = null,
    onLoad,
    onError
}: ARViewerProps) {
```

- [ ] **Step 2: Pass it from the site page**

In `src/app/site/[id]/page.tsx`, the site state is built around line 88 with
`const modelAsset = dbSite.assets?.find((a: any) => a.type === 'MODEL_3D');`. Carry the factor onto the
site object alongside `modelUrl` (add to whatever object literal receives `modelAsset.storageUrl`):

```tsx
                    modelRealScaleFactor: modelAsset?.realScaleFactor ?? null,
```

Then at the `ARViewer` call site (around line 418):

```tsx
                                        <ARViewer
                                            modelUrl={site.modelUrl}
                                            title={`${site.name} - AR Experience`}
                                            scale={0.5}
                                            realScaleFactor={site.modelRealScaleFactor}
                                        />
```

Add `modelRealScaleFactor: number | null;` to the local site type/interface that page declares.

- [ ] **Step 3: Pass it from the standalone AR page**

In `src/app/ar/page.tsx`, the model asset is found around line 62. Mirror the same change, then at the call site (around line 168):

```tsx
                        <ARViewer
                            modelUrl={site.modelUrl}
                            title={site.name}
                            scale={1}
                            realScaleFactor={site.modelRealScaleFactor}
                        />
```

- [ ] **Step 4: Type-check and lint**

Run: `npm run type-check && npm run lint`
Expected: both exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/3d/ARViewer.tsx src/app/site/\[id\]/page.tsx src/app/ar/page.tsx
git commit -m "feat(ar): pass realScaleFactor from site data into ARViewer"
```

---

### Task 5: Real-scale mode and toggle in `ARViewer`

**Files:**
- Modify: `src/components/3d/ARViewer.tsx`

**Interfaces:**
- Consumes: `ARViewerProps.realScaleFactor` (Task 4).
- Produces: `type ARScaleMode = 'preview' | 'real'` used by `ARModel`; the AR overlay renders the effective factor as a number.

- [ ] **Step 1: Add the mode type, storage keys, and effective-scale maths**

Replace the storage helpers near the top of `src/components/3d/ARViewer.tsx` (currently `calibrationStorageKey` / `loadStoredCalibration`) with:

```tsx
export type ARScaleMode = 'preview' | 'real';

const AR_TARGET_SIZE = 1;
const CALIBRATION_MIN = 0.25;
const CALIBRATION_MAX = 3;
const CALIBRATION_STEP = 0.1;

/** Preview trim and real-scale trim are stored separately on purpose. Preview
 * defaults to the call site's `scale` (0.5 on the site page) for a tabletop
 * look; real scale must default to 1.0 or a "true scale" toggle would silently
 * render at half size. Sharing one key would corrupt whichever mode was set second. */
function previewStorageKey(modelUrl: string) {
    return `ar-scale:${modelUrl}`;
}
function realTrimStorageKey(modelUrl: string) {
    return `ar-real-trim:${modelUrl}`;
}
function modeStorageKey(modelUrl: string) {
    return `ar-scale-mode:${modelUrl}`;
}

function loadStoredNumber(key: string, fallback: number): number {
    if (typeof window === 'undefined') return fallback;
    try {
        const raw = window.localStorage.getItem(key);
        const parsed = raw !== null ? parseFloat(raw) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    } catch {
        return fallback;
    }
}

function loadStoredMode(modelUrl: string): ARScaleMode {
    if (typeof window === 'undefined') return 'preview';
    try {
        return window.localStorage.getItem(modeStorageKey(modelUrl)) === 'real' ? 'real' : 'preview';
    } catch {
        return 'preview';
    }
}

function persist(key: string, value: string) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(key, value);
    } catch (err) {
        console.error('Failed to persist AR scale setting:', err);
    }
}
```

- [ ] **Step 2: Teach `ARModel` about the two modes**

Replace the `ARModelProps` interface and the scale computation inside `ARModel`:

```tsx
interface ARModelProps {
    url: string;
    /** Fine-trim multiplier applied in both modes. */
    calibration: number;
    scaleMode: ARScaleMode;
    realScaleFactor: number | null;
    onLoad?: () => void;
    onError?: (error: Error) => void;
}
```

and inside the component, after `baseScale`:

```tsx
    // preview: normalize the model to AR_TARGET_SIZE so every site looks like a
    // tabletop object. real: ignore the bounding box entirely and use the
    // measured authored-units-to-metres factor, so the model appears at life size.
    const effectiveScale =
        scaleMode === 'real' && realScaleFactor !== null
            ? realScaleFactor * calibration
            : baseScale * calibration;
```

and change the group's `scale` prop from `scale={baseScale * calibration}` to `scale={effectiveScale}`.

- [ ] **Step 3: Extend the controls to show mode and effective factor**

Replace `CalibrationControls` with a version that carries the mode toggle and the copyable number:

```tsx
function CalibrationControls({
    calibration,
    scaleMode,
    realScaleFactor,
    onDecrease,
    onIncrease,
    onReset,
    onToggleMode
}: {
    calibration: number;
    scaleMode: ARScaleMode;
    realScaleFactor: number | null;
    onDecrease: () => void;
    onIncrease: () => void;
    onReset: () => void;
    onToggleMode: () => void;
}) {
    const canUseRealScale = realScaleFactor !== null;
    // The number to transcribe into /admin/scale once the size looks right.
    const effectiveFactor = canUseRealScale ? realScaleFactor * calibration : null;

    return (
        <div className="flex flex-col gap-2 px-3 py-2 text-xs text-white rounded-lg bg-black/60 backdrop-blur-sm pointer-events-auto">
            <div className="flex items-center gap-2">
                <button
                    onClick={onDecrease}
                    className="flex items-center justify-center w-8 h-8 rounded-md bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary disabled:opacity-40"
                    aria-label="Decrease AR model size"
                    disabled={calibration <= CALIBRATION_MIN}
                >
                    −
                </button>
                <span className="min-w-[3.5ch] text-center font-semibold">
                    {Math.round(calibration * 100)}%
                </span>
                <button
                    onClick={onIncrease}
                    className="flex items-center justify-center w-8 h-8 rounded-md bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary disabled:opacity-40"
                    aria-label="Increase AR model size"
                    disabled={calibration >= CALIBRATION_MAX}
                >
                    +
                </button>
                <button
                    onClick={onReset}
                    className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary"
                    aria-label="Reset AR model size"
                >
                    Reset
                </button>
            </div>

            <button
                onClick={onToggleMode}
                disabled={!canUseRealScale}
                aria-pressed={scaleMode === 'real'}
                title={
                    canUseRealScale
                        ? 'Toggle real-world scale'
                        : 'This model has no real-world scale set yet (Admin → Real-World Scale)'
                }
                className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary disabled:opacity-40"
            >
                {scaleMode === 'real' ? '📐 Real scale: ON' : '📐 Real scale: OFF'}
            </button>

            {scaleMode === 'real' && effectiveFactor !== null && (
                <span className="opacity-90">
                    Effective factor <strong>{effectiveFactor.toFixed(3)}</strong> — enter this in
                    Admin → Real-World Scale
                </span>
            )}
        </div>
    );
}
```

- [ ] **Step 4: Wire the state in `ARViewer`**

Replace the calibration state block in `ARViewer` with mode-aware state:

```tsx
    const [scaleMode, setScaleMode] = useState<ARScaleMode>(() => loadStoredMode(modelUrl));
    const [previewTrim, setPreviewTrim] = useState(() =>
        loadStoredNumber(previewStorageKey(modelUrl), scale)
    );
    const [realTrim, setRealTrim] = useState(() =>
        loadStoredNumber(realTrimStorageKey(modelUrl), 1)
    );

    useEffect(() => {
        setScaleMode(loadStoredMode(modelUrl));
        setPreviewTrim(loadStoredNumber(previewStorageKey(modelUrl), scale));
        setRealTrim(loadStoredNumber(realTrimStorageKey(modelUrl), 1));
    }, [modelUrl, scale]);

    // A model with no calibration must never sit in real mode — it would render
    // at the raw authored units, which are arbitrary.
    useEffect(() => {
        if (realScaleFactor === null && scaleMode === 'real') {
            setScaleMode('preview');
        }
    }, [realScaleFactor, scaleMode]);

    const calibration = scaleMode === 'real' ? realTrim : previewTrim;

    const updateCalibration = useCallback(
        (value: number) => {
            const clamped = Math.min(CALIBRATION_MAX, Math.max(CALIBRATION_MIN, value));
            if (scaleMode === 'real') {
                setRealTrim(clamped);
                persist(realTrimStorageKey(modelUrl), String(clamped));
            } else {
                setPreviewTrim(clamped);
                persist(previewStorageKey(modelUrl), String(clamped));
            }
        },
        [modelUrl, scaleMode]
    );

    const handleToggleMode = useCallback(() => {
        setScaleMode((prev) => {
            const next: ARScaleMode = prev === 'real' ? 'preview' : 'real';
            persist(modeStorageKey(modelUrl), next);
            return next;
        });
    }, [modelUrl]);

    const handleCalibrateDecrease = () => updateCalibration(calibration - CALIBRATION_STEP);
    const handleCalibrateIncrease = () => updateCalibration(calibration + CALIBRATION_STEP);
    const handleCalibrateReset = () => updateCalibration(scaleMode === 'real' ? 1 : scale);
```

Then pass `scaleMode`, `realScaleFactor` and `onToggleMode` to **both** `CalibrationControls` usages (the pre-session panel and the `XRDomOverlay` one), and pass `scaleMode` + `realScaleFactor` to `<ARModel>`.

- [ ] **Step 5: Type-check, lint, build**

Run: `npm run type-check && npm run lint && npm run build`
Expected: all exit 0.

- [ ] **Step 6: Verify on an ARCore Android device (owner)**

This cannot be verified in the dev environment — there is no WebXR here.
Expected on device: with a calibrated model, the toggle flips between tabletop and life size; ± trims it; the overlay shows an effective factor that, when entered in `/admin/scale`, reproduces the same size with the trim back at 100%. With an uncalibrated model the toggle is disabled and explains why.

- [ ] **Step 7: Commit**

```bash
git add src/components/3d/ARViewer.tsx
git commit -m "feat(ar): add real-world scale mode with per-mode trim and factor readout"
```

---

### Task 6: Anchored floor placement (`useARPlacement`)

**Files:**
- Create: `src/hooks/useARPlacement.ts`
- Modify: `src/hooks/index.ts` (barrel export)
- Modify: `src/components/3d/ARViewer.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `useARPlacement(): { state: ARPlacementState; anchor: XRAnchor | undefined; reticleRef: RefObject<THREE.Group>; place: () => Promise<void>; reset: () => void }` where `type ARPlacementState = 'scanning' | 'ready' | 'placed'`.

- [ ] **Step 1: Create the hook**

Create `src/hooks/useARPlacement.ts` (2-space indent, matching the other hooks):

```ts
/**
 * WebXR floor placement for AR.
 * Runs a continuous hit test from the viewer, drives a reticle on the detected
 * surface, and on request creates an XRAnchor at that hit. Rendering the model
 * inside the anchor's space is what stops it drifting: an object at a fixed
 * scene coordinate is not attached to anything the device is tracking, so it
 * slides as ARCore refines its pose estimate.
 *
 * Must be called from a component rendered inside <XR>.
 */

'use client';

import { useCallback, useRef, useState } from 'react';
import * as THREE from 'three';
import { useXRAnchor, useXRHitTest } from '@react-three/xr';

export type ARPlacementState = 'scanning' | 'ready' | 'placed';

export function useARPlacement() {
  const [state, setState] = useState<ARPlacementState>('scanning');
  const [anchor, createAnchor] = useXRAnchor();
  const reticleRef = useRef<THREE.Group>(null);
  const latestHit = useRef<XRHitTestResult | null>(null);
  const matrix = useRef(new THREE.Matrix4());

  useXRHitTest(
    (results, getWorldMatrix) => {
      // Once anchored, the anchor owns the transform; stop moving the reticle.
      if (state === 'placed') return;

      const hit = results[0];
      if (!hit) {
        latestHit.current = null;
        if (reticleRef.current) reticleRef.current.visible = false;
        setState((prev) => (prev === 'scanning' ? prev : 'scanning'));
        return;
      }

      latestHit.current = hit;

      if (reticleRef.current && getWorldMatrix(matrix.current, hit)) {
        reticleRef.current.visible = true;
        matrix.current.decompose(
          reticleRef.current.position,
          reticleRef.current.quaternion,
          reticleRef.current.scale
        );
        // The hit matrix can carry a non-unit scale; the reticle must not inherit it.
        reticleRef.current.scale.setScalar(1);
      }

      setState((prev) => (prev === 'ready' ? prev : 'ready'));
    },
    'viewer',
    ['plane', 'mesh']
  );

  const place = useCallback(async () => {
    const hit = latestHit.current;
    if (!hit) return;
    const created = await createAnchor({ relativeTo: 'hit-test-result', hitTestResult: hit });
    if (created) {
      if (reticleRef.current) reticleRef.current.visible = false;
      setState('placed');
    }
  }, [createAnchor]);

  const reset = useCallback(() => setState('scanning'), []);

  return { state, anchor, reticleRef, place, reset };
}
```

- [ ] **Step 2: Export it from the barrel**

In `src/hooks/index.ts`, alongside the existing `useDeviceOrientation` export, add:

```ts
export { useARPlacement } from './useARPlacement';
export type { ARPlacementState } from './useARPlacement';
```

- [ ] **Step 3: Request the XR features**

In `src/components/3d/ARViewer.tsx`, change the store creation so the session actually asks for hit-testing and anchors — without these the hook silently never produces results:

```tsx
    // Create XR store once per mount (recreating it every render resets XR state)
    const [store] = useState(() =>
        createXRStore({ hitTest: true, anchors: true, domOverlay: true })
    );
```

- [ ] **Step 4: Add the placement component inside `<XR>`**

Still in `ARViewer.tsx`, add this component above `ARViewer`. It owns the reticle and the anchored subtree, and degrades to the old fixed position when the device grants no anchor:

```tsx
/** Renders the hit-test reticle and, once placed, the model inside the
 * anchor's tracked space. Falls back to the original fixed position so
 * devices without hit-test/anchor support still see the model. */
function ARPlacement({
    anchor,
    reticleRef,
    children
}: {
    anchor: XRAnchor | undefined;
    reticleRef: RefObject<THREE.Group>;
    children: ReactNode;
}) {
    return (
        <>
            <group ref={reticleRef} visible={false}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.12, 0.15, 32]} />
                    <meshBasicMaterial color="#ffffff" toneMapped={false} />
                </mesh>
            </group>

            {anchor ? (
                <XRSpace space={anchor.anchorSpace}>{children}</XRSpace>
            ) : (
                // Unplaced, or anchors unsupported: keep the pre-existing behaviour
                // so the model is always visible rather than waiting on a surface.
                <group position={[0, 0, -2]}>{children}</group>
            )}
        </>
    );
}
```

Import the additions at the top of the file. `ARViewer` imports named React exports only — there is no `React` namespace binding in this file, so `RefObject`/`ReactNode` must be imported by name:

```tsx
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { XR, XRDomOverlay, XRSpace, createXRStore } from '@react-three/xr';
import { useARPlacement } from '@/hooks';
```

Remove `position={[0, 0, -2]}` from the `<group>` inside `ARModel` — placement is now the wrapper's job, and leaving it would offset the model inside the anchor.

- [ ] **Step 5: Drive it from inside the XR tree**

`useARPlacement` calls R3F hooks, so it must run inside the `<Canvas>`. Add a component that owns the hook and renders both the 3D content and the overlay, then render it inside `<XR>` in place of the current `<Suspense>` + `<XRDomOverlay>` blocks:

```tsx
function ARScene({
    modelUrl,
    calibration,
    scaleMode,
    realScaleFactor,
    error,
    onLoad,
    onError,
    controls
}: {
    modelUrl: string;
    calibration: number;
    scaleMode: ARScaleMode;
    realScaleFactor: number | null;
    error: string | null;
    onLoad: () => void;
    onError: (err: Error) => void;
    controls: ReactNode;
}) {
    const { state, anchor, reticleRef, place, reset } = useARPlacement();

    const hint =
        state === 'scanning'
            ? 'Point your camera at the floor to find a surface'
            : state === 'ready'
              ? 'Tap Place to put the model on the surface'
              : 'Placed — walk around to view it';

    return (
        <>
            <ARPlacement anchor={anchor} reticleRef={reticleRef}>
                <Suspense fallback={<LoadingPlaceholder />}>
                    {error ? (
                        <ErrorPlaceholder message={error} />
                    ) : (
                        <ARModel
                            url={modelUrl}
                            calibration={calibration}
                            scaleMode={scaleMode}
                            realScaleFactor={realScaleFactor}
                            onLoad={onLoad}
                            onError={onError}
                        />
                    )}
                </Suspense>
            </ARPlacement>

            <XRDomOverlay>
                <div className="absolute inset-x-0 flex justify-center bottom-28">
                    <p className="px-3 py-2 text-xs text-white rounded-lg bg-black/60 backdrop-blur-sm">
                        {hint}
                    </p>
                </div>
                <div className="absolute flex flex-col items-end gap-2 bottom-6 right-4">
                    {controls}
                    {state === 'placed' ? (
                        <button
                            onClick={reset}
                            className="px-4 py-2 text-sm font-semibold rounded-lg pointer-events-auto text-heritage-dark bg-heritage-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary"
                        >
                            Move
                        </button>
                    ) : (
                        <button
                            onClick={place}
                            disabled={state !== 'ready'}
                            className="px-4 py-2 text-sm font-semibold rounded-lg pointer-events-auto text-heritage-dark bg-heritage-primary disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary"
                        >
                            Place
                        </button>
                    )}
                </div>
            </XRDomOverlay>
        </>
    );
}
```

Then, inside `ARViewer`'s `<XR store={store}>`, delete the existing `<Suspense>…</Suspense>` block and
the existing `<XRDomOverlay>…</XRDomOverlay>` block, and render `ARScene` in their place. Keep the
lights and `<Environment preset="city" />` exactly as they are, above it:

```tsx
                    <ARScene
                        modelUrl={modelUrl}
                        calibration={calibration}
                        scaleMode={scaleMode}
                        realScaleFactor={realScaleFactor}
                        error={error}
                        onLoad={handleLoad}
                        onError={handleError}
                        controls={
                            <CalibrationControls
                                calibration={calibration}
                                scaleMode={scaleMode}
                                realScaleFactor={realScaleFactor}
                                onDecrease={handleCalibrateDecrease}
                                onIncrease={handleCalibrateIncrease}
                                onReset={handleCalibrateReset}
                                onToggleMode={handleToggleMode}
                            />
                        }
                    />
```

The pre-session `CalibrationControls` behind the gear button (outside the `<Canvas>`) stays as it is —
it is the same component with the same new props, and Task 5 already updated it.

- [ ] **Step 6: Replace the static help text**

The current help card claims `👆 Tap to place the model` and `🔄 Tap model to rotate`, neither of which is true. Replace that `<ul>` in `ARViewer` with:

```tsx
                <ul className="space-y-1 opacity-90">
                    <li>📱 Point the camera at a flat surface</li>
                    <li>🎯 Tap Place when the ring appears</li>
                    <li>📐 Use Real scale for true size</li>
                    <li>🚶 Walk around to view from all angles</li>
                </ul>
```

- [ ] **Step 7: Type-check, lint, build**

Run: `npm run type-check && npm run lint && npm run build`
Expected: all exit 0.

- [ ] **Step 8: Verify on an ARCore Android device (owner)**

Expected: a ring appears on the real floor within a few seconds of pointing at it; `Place` anchors the model there; walking around and returning finds the model in the same physical spot; `Move` releases it for re-placement. On a device that refuses the features, the model still appears 2 m ahead rather than the screen breaking.

- [ ] **Step 9: Commit**

```bash
git add src/hooks/useARPlacement.ts src/hooks/index.ts src/components/3d/ARViewer.tsx
git commit -m "feat(ar): anchor the model to a detected floor via WebXR hit-test"
```

---

## Self-review notes

- **Spec coverage:** data model → Task 1; API → Task 2; admin UI → Task 3; scale modes → Tasks 4–5; anchored placement → Task 6; honest help text → Task 6 Step 6. The spec's ADMIN-only gate is enforced on both methods in Task 2.
- **Type consistency checked:** `ARScaleMode` (Task 5) is consumed by `ARModel` and `ARScene`;
  `useARPlacement`'s return shape matches every call site; `RefObject`/`ReactNode` are imported by
  name because `ARViewer` has no `React` namespace binding.
- **Defects found and fixed during self-review:** an always-true `visible={…}` expression on the
  fallback group; `React.RefObject`/`React.ReactNode` used in a file with no default React import;
  and a missing step showing how `ARScene` is actually rendered inside `ARViewer`.
- **Not covered, by design:** Phase 2 gestures (drag / pinch / twist / dolly) and the lock button; Phase 3 setting scale at upload time.
