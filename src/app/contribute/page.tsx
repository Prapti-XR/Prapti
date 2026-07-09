'use client';

/**
 * Suggest a Place — public contribution flow (ROADMAP Phase 5)
 * Creates a Contribution (type NEW_SITE) that moderators review and merge.
 * The payload matches the merge whitelist in /api/admin/contributions.
 */

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Badge } from '@/components/ui';

const inputCls =
    'w-full px-4 py-2 border border-heritage-light/60 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent text-heritage-dark';
const labelCls = 'block text-sm font-medium text-heritage-dark/80 mb-1';

export default function ContributePage() {
    const { data: session, status } = useSession();
    const [form, setForm] = useState({
        name: '', location: '', latitude: '', longitude: '',
        city: '', era: '', description: '', culturalContext: '',
        historicalFacts: '', source: '',
    });
    const [state, setState] = useState<'idle' | 'submitting' | 'done'>('idle');
    const [error, setError] = useState('');

    const valid =
        form.name.trim() &&
        form.location.trim() &&
        form.description.trim().length >= 20 &&
        (!form.historicalFacts.trim() || form.source.trim());

    const handleSubmit = async () => {
        setError('');
        setState('submitting');
        try {
            const facts = form.source.trim()
                ? `${form.historicalFacts.trim()}\n\nSource: ${form.source.trim()}`
                : form.historicalFacts.trim();
            const res = await fetch('/api/contributions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: `New site: ${form.name.trim()}`,
                    description: form.description.trim(),
                    type: 'NEW_SITE',
                    contributionData: {
                        name: form.name.trim(),
                        description: form.description.trim(),
                        location: form.location.trim(),
                        latitude: form.latitude ? Number(form.latitude) : null,
                        longitude: form.longitude ? Number(form.longitude) : null,
                        country: 'India',
                        city: form.city.trim() || null,
                        era: form.era.trim() || null,
                        culturalContext: form.culturalContext.trim() || null,
                        historicalFacts: facts || null,
                    },
                }),
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error || 'Could not submit your suggestion');
            setState('done');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Something went wrong');
            setState('idle');
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                <header className="pt-24 md:pt-32 pb-8 px-4 md:px-6 border-b border-heritage-light/30 animate-fade-in">
                    <div className="max-w-2xl mx-auto">
                        <h1 className="text-4xl font-bold text-heritage-dark font-serif mb-2">Suggest a Place</h1>
                        <p className="text-heritage-dark/70">
                            Know a culturally rich place the maps forgot? Tell us about it — a moderator
                            reviews every suggestion before it goes live.
                        </p>
                    </div>
                </header>

                <div className="px-4 md:px-6 py-8">
                    <div className="max-w-2xl mx-auto">
                        {status === 'unauthenticated' && (
                            <div className="p-6 border border-heritage-light/40 rounded-xl text-center space-y-4 animate-fade-in">
                                <p className="text-heritage-dark/80">Sign in to suggest a place.</p>
                                <button
                                    onClick={() => signIn()}
                                    className="px-6 py-3 min-h-[44px] rounded-full bg-heritage-primary text-heritage-dark font-semibold hover:bg-heritage-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2"
                                >
                                    Sign in
                                </button>
                            </div>
                        )}

                        {status === 'authenticated' && session.user.role === 'USER' && (
                            <div className="mb-6 p-4 bg-heritage-accent/10 border border-heritage-accent/40 rounded-lg text-sm text-heritage-dark/80">
                                Suggestions need the <Badge variant="primary" size="sm">CONTRIBUTOR</Badge> role.
                                You can fill the form, but submission will be rejected until an admin grants you access —
                                ask via your <Link href="/profile" className="underline hover:text-heritage-secondary">profile</Link>.
                            </div>
                        )}

                        {state === 'done' ? (
                            <div className="p-8 border border-green-200 bg-green-50 rounded-xl text-center space-y-3 animate-fade-in">
                                <h2 className="font-serif text-2xl font-bold text-heritage-dark">Thank you!</h2>
                                <p className="text-heritage-dark/70">
                                    Your suggestion is with the moderators. Track its status on your{' '}
                                    <Link href="/profile" className="underline hover:text-heritage-secondary">profile</Link>.
                                </p>
                            </div>
                        ) : status === 'authenticated' ? (
                            <div className="space-y-4 animate-fade-in">
                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
                                )}
                                <div>
                                    <label htmlFor="c-name" className={labelCls}>Place name *</label>
                                    <input id="c-name" className={inputCls} value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div>
                                    <label htmlFor="c-location" className={labelCls}>Where is it? * (village/area, taluk, district)</label>
                                    <input id="c-location" className={inputCls} value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="c-lat" className={labelCls}>Latitude (if known)</label>
                                        <input id="c-lat" className={inputCls} value={form.latitude} inputMode="decimal"
                                            onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
                                    </div>
                                    <div>
                                        <label htmlFor="c-lng" className={labelCls}>Longitude (if known)</label>
                                        <input id="c-lng" className={inputCls} value={form.longitude} inputMode="decimal"
                                            onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="c-city" className={labelCls}>City / district</label>
                                        <input id="c-city" className={inputCls} value={form.city}
                                            onChange={(e) => setForm({ ...form, city: e.target.value })} />
                                    </div>
                                    <div>
                                        <label htmlFor="c-era" className={labelCls}>Era (if known)</label>
                                        <input id="c-era" className={inputCls} value={form.era}
                                            onChange={(e) => setForm({ ...form, era: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="c-desc" className={labelCls}>What is this place? * (min 20 chars)</label>
                                    <textarea id="c-desc" rows={3} className={inputCls} value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })} />
                                </div>
                                <div>
                                    <label htmlFor="c-culture" className={labelCls}>Why does it matter culturally?</label>
                                    <textarea id="c-culture" rows={3} className={inputCls} value={form.culturalContext}
                                        onChange={(e) => setForm({ ...form, culturalContext: e.target.value })} />
                                </div>
                                <div>
                                    <label htmlFor="c-history" className={labelCls}>History (dates, rulers, events)</label>
                                    <textarea id="c-history" rows={3} className={inputCls} value={form.historicalFacts}
                                        onChange={(e) => setForm({ ...form, historicalFacts: e.target.value })} />
                                </div>
                                <div>
                                    <label htmlFor="c-source" className={labelCls}>
                                        Source {form.historicalFacts.trim() ? '* (required with history)' : '(book, ASI page, local records)'}
                                    </label>
                                    <input id="c-source" className={inputCls} value={form.source}
                                        onChange={(e) => setForm({ ...form, source: e.target.value })} />
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!valid || state === 'submitting'}
                                    className="w-full px-6 py-4 min-h-[44px] rounded-full bg-heritage-primary text-heritage-dark font-semibold text-lg shadow-sm hover:shadow-md hover:bg-heritage-primary/90 transition-all disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2"
                                >
                                    {state === 'submitting' ? 'Submitting…' : 'Submit suggestion'}
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </main>
        </>
    );
}
