'use client';

/**
 * Add a Site — guided wizard (ROADMAP Phase 1)
 * Details → Story → Media → Trivia → Review & Publish
 * One flow from empty page to a live site: creates the site, uploads assets
 * (server-side optimized: Draco/WebP models, recompressed panoramas/photos)
 * with per-file progress, then adds trivia.
 */

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Badge } from '@/components/ui';

const STEPS = ['Details', 'Story', 'Media', 'Trivia', 'Review'] as const;

interface TriviaDraft {
    question: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    category: string;
    answers: { answerText: string; isCorrect: boolean }[];
}

interface UploadItem {
    label: string;
    status: 'pending' | 'uploading' | 'done' | 'error';
    pct: number;
    error?: string;
}

const inputCls =
    'w-full px-4 py-2 border border-heritage-light/60 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent text-heritage-dark';
const labelCls = 'block text-sm font-medium text-heritage-dark/80 mb-1';

function emptyTrivia(): TriviaDraft {
    return {
        question: '',
        difficulty: 'EASY',
        category: 'History',
        answers: [
            { answerText: '', isCorrect: true },
            { answerText: '', isCorrect: false },
            { answerText: '', isCorrect: false },
            { answerText: '', isCorrect: false },
        ],
    };
}

/** Upload one file through POST /api/upload with real progress (XHR). */
function uploadWithProgress(
    file: File,
    siteId: string,
    assetType: 'models' | 'panoramas' | 'images',
    title: string,
    onProgress: (pct: number) => void
): Promise<void> {
    return new Promise((resolve, reject) => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('siteId', siteId);
        fd.append('assetType', assetType);
        fd.append('title', title);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload');
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else {
                try {
                    reject(new Error(JSON.parse(xhr.responseText).error || `Upload failed (${xhr.status})`));
                } catch {
                    reject(new Error(`Upload failed (${xhr.status})`));
                }
            }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(fd);
    });
}

async function validateModelFile(file: File): Promise<string | null> {
    if (file.size > 300 * 1024 * 1024) return 'Model larger than 300 MB — trim it before uploading.';
    if (!/\.(glb|gltf)$/i.test(file.name)) return 'Only .glb / .gltf files are supported.';
    if (/\.glb$/i.test(file.name)) {
        const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
        const magic = String.fromCharCode(...head);
        if (magic !== 'glTF') return 'This file is not a valid GLB (missing glTF header).';
    }
    return null;
}

function validatePanoramaFile(file: File): Promise<string | null> {
    if (file.size > 60 * 1024 * 1024) return Promise.resolve('Panorama larger than 60 MB.');
    if (!/\.(jpe?g|png|webp)$/i.test(file.name)) return Promise.resolve('Panoramas must be JPG/PNG/WebP.');
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            const ratio = img.width / img.height;
            resolve(
                Math.abs(ratio - 2) > 0.3
                    ? `Expected an equirectangular 2:1 image — this one is ${ratio.toFixed(2)}:1.`
                    : null
            );
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve('Could not read this image.');
        };
        img.src = url;
    });
}

export default function AddSiteWizard() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [error, setError] = useState('');

    // Step 1 — Details
    const [details, setDetails] = useState({
        name: '', location: '', latitude: '', longitude: '',
        country: 'India', city: '', era: '', yearBuilt: '',
    });
    // Step 2 — Story
    const [story, setStory] = useState({
        description: '', culturalContext: '', historicalFacts: '', source: '',
        visitingInfo: '', accessibility: '',
    });
    // Step 3 — Media
    const [model, setModel] = useState<File | null>(null);
    const [panorama, setPanorama] = useState<File | null>(null);
    const [photos, setPhotos] = useState<File[]>([]);
    const [mediaError, setMediaError] = useState('');
    // Step 4 — Trivia
    const [trivia, setTrivia] = useState<TriviaDraft[]>([]);
    // Step 5 — Review & submit
    const [isPublished, setIsPublished] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [uploads, setUploads] = useState<UploadItem[]>([]);
    const createdSiteId = useRef<string | null>(null);

    const detailsValid =
        details.name.trim() && details.location.trim() && details.country.trim() &&
        details.latitude !== '' && !isNaN(Number(details.latitude)) &&
        details.longitude !== '' && !isNaN(Number(details.longitude));
    const storyValid = story.description.trim().length >= 20;

    const setUpload = (i: number, patch: Partial<UploadItem>) =>
        setUploads((u) => u.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));

    const handlePickModel = async (file: File | undefined) => {
        setMediaError('');
        if (!file) return;
        const err = await validateModelFile(file);
        if (err) { setMediaError(err); return; }
        setModel(file);
    };

    const handlePickPanorama = async (file: File | undefined) => {
        setMediaError('');
        if (!file) return;
        const err = await validatePanoramaFile(file);
        if (err) { setMediaError(err); return; }
        setPanorama(file);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');

        try {
            // 1. Create the site (once — retries reuse the id)
            if (!createdSiteId.current) {
                const facts = story.source.trim()
                    ? `${story.historicalFacts.trim()}\n\nSource: ${story.source.trim()}`
                    : story.historicalFacts.trim();
                const res = await fetch('/api/admin/sites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: details.name.trim(),
                        description: story.description.trim(),
                        location: details.location.trim(),
                        latitude: Number(details.latitude),
                        longitude: Number(details.longitude),
                        country: details.country.trim(),
                        city: details.city.trim() || null,
                        era: details.era.trim() || null,
                        yearBuilt: details.yearBuilt ? Number(details.yearBuilt) : null,
                        culturalContext: story.culturalContext.trim() || null,
                        historicalFacts: facts || null,
                        visitingInfo: story.visitingInfo.trim() || null,
                        accessibility: story.accessibility.trim() || null,
                        isPublished,
                    }),
                });
                const body = await res.json();
                if (!res.ok) throw new Error(body.error || 'Failed to create site');
                createdSiteId.current = body.data.id;
            }
            const siteId = createdSiteId.current!;

            // 2. Upload media with progress (site survives partial failures — retry re-runs pending/error items)
            const jobs: { label: string; run: (i: number) => Promise<void> }[] = [];
            if (model) jobs.push({
                label: `3D model — ${model.name}`,
                run: (i) => uploadWithProgress(model, siteId, 'models', `${details.name} 3D Model`, (pct) => setUpload(i, { pct })),
            });
            if (panorama) jobs.push({
                label: `360° panorama — ${panorama.name}`,
                run: (i) => uploadWithProgress(panorama, siteId, 'panoramas', `${details.name} 360 Panorama`, (pct) => setUpload(i, { pct })),
            });
            photos.forEach((p, n) => jobs.push({
                label: `Photo — ${p.name}`,
                run: (i) => uploadWithProgress(p, siteId, 'images', `${details.name} photo ${n + 1}`, (pct) => setUpload(i, { pct })),
            }));

            const previous = uploads;
            const items: UploadItem[] = jobs.map((j, i) =>
                previous[i]?.status === 'done'
                    ? previous[i]!
                    : { label: j.label, status: 'pending', pct: 0 }
            );
            setUploads(items);

            let failed = 0;
            for (let i = 0; i < jobs.length; i++) {
                if (items[i]?.status === 'done') continue;
                setUpload(i, { status: 'uploading', pct: 0 });
                try {
                    await jobs[i]!.run(i);
                    items[i] = { ...items[i]!, status: 'done', pct: 100 };
                    setUpload(i, { status: 'done', pct: 100 });
                } catch (e) {
                    failed++;
                    setUpload(i, { status: 'error', error: e instanceof Error ? e.message : 'failed' });
                }
            }

            // 3. Trivia
            for (const q of trivia) {
                if (!q.question.trim()) continue;
                const answers = q.answers.filter((a) => a.answerText.trim());
                if (answers.length < 2) continue;
                const res = await fetch('/api/admin/trivia', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ siteId, question: q.question.trim(), difficulty: q.difficulty, category: q.category, answers }),
                });
                if (!res.ok) failed++;
            }

            if (failed > 0) {
                setError(`${failed} item(s) failed — press the finish button again to retry just those.`);
                setSubmitting(false);
                return;
            }

            router.push(`/site/${siteId}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Something went wrong');
            setSubmitting(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                <header className="pt-24 md:pt-32 pb-8 px-4 md:px-6 border-b border-heritage-light/30 animate-fade-in">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-4xl font-bold text-heritage-dark font-serif mb-2">Add a Heritage Site</h1>
                        <p className="text-heritage-dark/70">One guided flow — details, story, media, trivia, publish.</p>
                    </div>
                </header>

                <div className="px-4 md:px-6 py-8">
                    <div className="max-w-3xl mx-auto">
                        {/* Stepper */}
                        <nav aria-label="Progress" className="flex flex-wrap gap-2 mb-8">
                            {STEPS.map((label, i) => (
                                <button
                                    key={label}
                                    onClick={() => i < step && setStep(i)}
                                    disabled={i > step}
                                    className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2 ${i === step
                                        ? 'bg-heritage-primary text-heritage-dark'
                                        : i < step
                                            ? 'bg-heritage-light/60 text-heritage-dark hover:bg-heritage-light'
                                            : 'bg-heritage-light/20 text-heritage-dark/40 cursor-not-allowed'
                                        }`}
                                >
                                    {i + 1}. {label}
                                </button>
                            ))}
                        </nav>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
                        )}

                        {/* Step 1 — Details */}
                        {step === 0 && (
                            <section className="space-y-4 animate-fade-in">
                                <div>
                                    <label htmlFor="name" className={labelCls}>Site name *</label>
                                    <input id="name" className={inputCls} value={details.name}
                                        onChange={(e) => setDetails({ ...details, name: e.target.value })}
                                        placeholder="e.g. Sonda Fort" />
                                </div>
                                <div>
                                    <label htmlFor="location" className={labelCls}>Location (address / area) *</label>
                                    <input id="location" className={inputCls} value={details.location}
                                        onChange={(e) => setDetails({ ...details, location: e.target.value })}
                                        placeholder="Sonda, Sirsi taluk, Uttara Kannada" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="latitude" className={labelCls}>Latitude *</label>
                                        <input id="latitude" className={inputCls} value={details.latitude} inputMode="decimal"
                                            onChange={(e) => setDetails({ ...details, latitude: e.target.value })}
                                            placeholder="14.7206" />
                                    </div>
                                    <div>
                                        <label htmlFor="longitude" className={labelCls}>Longitude *</label>
                                        <input id="longitude" className={inputCls} value={details.longitude} inputMode="decimal"
                                            onChange={(e) => setDetails({ ...details, longitude: e.target.value })}
                                            placeholder="74.8141" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="country" className={labelCls}>Country *</label>
                                        <input id="country" className={inputCls} value={details.country}
                                            onChange={(e) => setDetails({ ...details, country: e.target.value })} />
                                    </div>
                                    <div>
                                        <label htmlFor="city" className={labelCls}>City / district</label>
                                        <input id="city" className={inputCls} value={details.city}
                                            onChange={(e) => setDetails({ ...details, city: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="era" className={labelCls}>Era</label>
                                        <input id="era" className={inputCls} value={details.era}
                                            onChange={(e) => setDetails({ ...details, era: e.target.value })}
                                            placeholder="Vijayanagara, Hoysala…" />
                                    </div>
                                    <div>
                                        <label htmlFor="yearBuilt" className={labelCls}>Year built</label>
                                        <input id="yearBuilt" className={inputCls} value={details.yearBuilt} inputMode="numeric"
                                            onChange={(e) => setDetails({ ...details, yearBuilt: e.target.value })}
                                            placeholder="1560" />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Step 2 — Story */}
                        {step === 1 && (
                            <section className="space-y-4 animate-fade-in">
                                <div>
                                    <label htmlFor="description" className={labelCls}>Description * (min 20 chars)</label>
                                    <textarea id="description" rows={3} className={inputCls} value={story.description}
                                        onChange={(e) => setStory({ ...story, description: e.target.value })}
                                        placeholder="What is this place, in two or three sentences?" />
                                </div>
                                <div>
                                    <label htmlFor="culturalContext" className={labelCls}>Cultural significance</label>
                                    <textarea id="culturalContext" rows={3} className={inputCls} value={story.culturalContext}
                                        onChange={(e) => setStory({ ...story, culturalContext: e.target.value })}
                                        placeholder="Why does this place matter culturally?" />
                                </div>
                                <div>
                                    <label htmlFor="historicalFacts" className={labelCls}>History</label>
                                    <textarea id="historicalFacts" rows={4} className={inputCls} value={story.historicalFacts}
                                        onChange={(e) => setStory({ ...story, historicalFacts: e.target.value })}
                                        placeholder="Dates, dynasties, events…" />
                                </div>
                                <div>
                                    <label htmlFor="source" className={labelCls}>Source for historical claims (book, ASI page, local records…)</label>
                                    <input id="source" className={inputCls} value={story.source}
                                        onChange={(e) => setStory({ ...story, source: e.target.value })}
                                        placeholder="Gazetteer of Uttara Kannada, 1985, p. 214" />
                                    <p className="mt-1 text-xs text-heritage-dark/60">
                                        Every historical claim needs a source — it is stored with the history text.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="visitingInfo" className={labelCls}>Visiting information</label>
                                        <textarea id="visitingInfo" rows={3} className={inputCls} value={story.visitingInfo}
                                            onChange={(e) => setStory({ ...story, visitingInfo: e.target.value })}
                                            placeholder="Timings, entry, best season…" />
                                    </div>
                                    <div>
                                        <label htmlFor="accessibility" className={labelCls}>Accessibility</label>
                                        <textarea id="accessibility" rows={3} className={inputCls} value={story.accessibility}
                                            onChange={(e) => setStory({ ...story, accessibility: e.target.value })}
                                            placeholder="Road access, steps, terrain…" />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Step 3 — Media */}
                        {step === 2 && (
                            <section className="space-y-6 animate-fade-in">
                                {mediaError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{mediaError}</div>
                                )}
                                <div>
                                    <label htmlFor="model-file" className={labelCls}>3D model (.glb) — optimized automatically on upload</label>
                                    <input id="model-file" type="file" accept=".glb,.gltf" className={inputCls}
                                        onChange={(e) => handlePickModel(e.target.files?.[0])} />
                                    {model && <Badge variant="success" size="sm" className="mt-2">{model.name} · {(model.size / 1e6).toFixed(1)} MB ✓</Badge>}
                                </div>
                                <div>
                                    <label htmlFor="pano-file" className={labelCls}>360° panorama (equirectangular, ~2:1)</label>
                                    <input id="pano-file" type="file" accept="image/*" className={inputCls}
                                        onChange={(e) => handlePickPanorama(e.target.files?.[0])} />
                                    {panorama && <Badge variant="success" size="sm" className="mt-2">{panorama.name} · {(panorama.size / 1e6).toFixed(1)} MB ✓</Badge>}
                                </div>
                                <div>
                                    <label htmlFor="photo-files" className={labelCls}>Photos (any number)</label>
                                    <input id="photo-files" type="file" accept="image/*" multiple className={inputCls}
                                        onChange={(e) => setPhotos(Array.from(e.target.files ?? []))} />
                                    {photos.length > 0 && (
                                        <p className="mt-2 text-sm text-heritage-dark/70">{photos.length} photo(s) selected</p>
                                    )}
                                </div>
                                <p className="text-xs text-heritage-dark/60">
                                    Both the immersive VR view and the AR mode need a model; the VR surround needs a panorama.
                                    You can add media later from Admin → Upload if you skip this now.
                                </p>
                            </section>
                        )}

                        {/* Step 4 — Trivia */}
                        {step === 3 && (
                            <section className="space-y-6 animate-fade-in">
                                {trivia.map((q, qi) => (
                                    <div key={qi} className="p-4 border border-heritage-light/40 rounded-xl space-y-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <label htmlFor={`q-${qi}`} className={labelCls}>Question {qi + 1}</label>
                                            <button
                                                onClick={() => setTrivia(trivia.filter((_, i) => i !== qi))}
                                                className="text-sm text-red-600 hover:text-red-700 min-h-[44px] px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary rounded"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <input id={`q-${qi}`} className={inputCls} value={q.question}
                                            onChange={(e) => setTrivia(trivia.map((t, i) => i === qi ? { ...t, question: e.target.value } : t))}
                                            placeholder="Which dynasty built this fort?" />
                                        <div className="grid grid-cols-2 gap-3">
                                            <select
                                                aria-label="Difficulty"
                                                className={inputCls}
                                                value={q.difficulty}
                                                onChange={(e) => setTrivia(trivia.map((t, i) => i === qi ? { ...t, difficulty: e.target.value as TriviaDraft['difficulty'] } : t))}
                                            >
                                                <option value="EASY">Easy</option>
                                                <option value="MEDIUM">Medium</option>
                                                <option value="HARD">Hard</option>
                                            </select>
                                            <input aria-label="Category" className={inputCls} value={q.category}
                                                onChange={(e) => setTrivia(trivia.map((t, i) => i === qi ? { ...t, category: e.target.value } : t))}
                                                placeholder="History / Architecture / Culture" />
                                        </div>
                                        <div className="space-y-2">
                                            {q.answers.map((a, ai) => (
                                                <div key={ai} className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name={`correct-${qi}`}
                                                        checked={a.isCorrect}
                                                        onChange={() => setTrivia(trivia.map((t, i) => i === qi
                                                            ? { ...t, answers: t.answers.map((x, j) => ({ ...x, isCorrect: j === ai })) }
                                                            : t))}
                                                        aria-label={`Mark answer ${ai + 1} correct`}
                                                        className="w-4 h-4 accent-[#FEC683]"
                                                    />
                                                    <input className={inputCls} value={a.answerText}
                                                        onChange={(e) => setTrivia(trivia.map((t, i) => i === qi
                                                            ? { ...t, answers: t.answers.map((x, j) => j === ai ? { ...x, answerText: e.target.value } : x) }
                                                            : t))}
                                                        placeholder={`Answer ${ai + 1}${a.isCorrect ? ' (correct)' : ''}`} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setTrivia([...trivia, emptyTrivia()])}
                                    className="px-4 py-2 min-h-[44px] rounded-full bg-heritage-light/40 text-heritage-dark text-sm font-medium hover:bg-heritage-light/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2"
                                >
                                    + Add a question
                                </button>
                                <p className="text-xs text-heritage-dark/60">Optional — you can skip this step entirely.</p>
                            </section>
                        )}

                        {/* Step 5 — Review */}
                        {step === 4 && (
                            <section className="space-y-6 animate-fade-in">
                                <div className="p-5 border border-heritage-light/40 rounded-xl space-y-2">
                                    <h2 className="font-serif text-xl font-semibold text-heritage-dark">{details.name || 'Unnamed site'}</h2>
                                    <p className="text-sm text-heritage-dark/70">{details.location} · {details.latitude}, {details.longitude}</p>
                                    <p className="text-sm text-heritage-dark/70 line-clamp-3">{story.description}</p>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <Badge variant={model ? 'success' : 'neutral'} size="sm">{model ? '3D model ✓' : 'no 3D model'}</Badge>
                                        <Badge variant={panorama ? 'success' : 'neutral'} size="sm">{panorama ? '360° panorama ✓' : 'no panorama'}</Badge>
                                        <Badge variant={photos.length ? 'success' : 'neutral'} size="sm">{photos.length} photos</Badge>
                                        <Badge variant={trivia.length ? 'success' : 'neutral'} size="sm">{trivia.length} trivia</Badge>
                                        <Badge variant={story.source ? 'success' : 'outline'} size="sm">{story.source ? 'source recorded' : 'no source given'}</Badge>
                                    </div>
                                </div>

                                <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
                                    <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)}
                                        className="w-5 h-5 accent-[#FEC683]" />
                                    <span className="text-heritage-dark font-medium">Publish immediately</span>
                                    <span className="text-sm text-heritage-dark/60">(unchecked = saved as draft)</span>
                                </label>

                                {uploads.length > 0 && (
                                    <div className="space-y-2">
                                        {uploads.map((u, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm">
                                                <span className="flex-1 truncate text-heritage-dark/80">{u.label}</span>
                                                {u.status === 'uploading' && <span className="text-heritage-dark/60 w-12 text-right">{u.pct}%</span>}
                                                {u.status === 'done' && <Badge variant="success" size="sm">done</Badge>}
                                                {u.status === 'error' && <Badge variant="error" size="sm">{u.error || 'failed'}</Badge>}
                                                {u.status === 'pending' && <Badge variant="neutral" size="sm">queued</Badge>}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="w-full px-6 py-4 min-h-[44px] rounded-full bg-heritage-primary text-heritage-dark font-semibold text-lg shadow-sm hover:shadow-md hover:bg-heritage-primary/90 transition-all disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2"
                                >
                                    {submitting ? 'Working… (assets are optimized on the server)' : isPublished ? 'Finish & publish' : 'Finish & save draft'}
                                </button>
                            </section>
                        )}

                        {/* Prev / Next */}
                        {step < 4 && (
                            <div className="flex justify-between mt-8">
                                <button
                                    onClick={() => setStep(Math.max(0, step - 1))}
                                    disabled={step === 0}
                                    className="px-6 py-2 min-h-[44px] rounded-full bg-heritage-light/40 text-heritage-dark font-medium hover:bg-heritage-light/60 transition-colors disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(step + 1)}
                                    disabled={(step === 0 && !detailsValid) || (step === 1 && !storyValid)}
                                    className="px-6 py-2 min-h-[44px] rounded-full bg-heritage-primary text-heritage-dark font-semibold hover:bg-heritage-primary/90 transition-colors disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
