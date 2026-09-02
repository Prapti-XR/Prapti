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
                                    onChange={(e) => setDrafts((d) => ({ ...d, [row.id]: e.target.value }))}
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
                                    <span className="w-full text-xs text-heritage-dark/70" role="status">
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
