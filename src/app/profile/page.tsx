'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Button, Badge, type BadgeProps } from '@/components';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-white">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="w-8 h-8 border-4 border-heritage-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                </main>
            </>
        );
    }

    if (!session) {
        return null;
    }

    const userInitial = session.user.name?.charAt(0)?.toUpperCase() || session.user.email?.charAt(0)?.toUpperCase() || 'U';

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Header */}
                <header className="pt-24 md:pt-32 pb-12 md:pb-16 px-4 md:px-6 border-b border-heritage-light/30">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-heritage-primary/20 rounded-full flex items-center justify-center">
                                <span className="text-3xl md:text-4xl font-bold text-heritage-dark">
                                    {userInitial}
                                </span>
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl md:text-4xl font-bold text-heritage-dark font-serif mb-2">
                                    {session.user.name || 'User'}
                                </h1>
                                <p className="text-heritage-dark/70">{session.user.email}</p>
                                {session.user.role && (
                                    <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-heritage-primary/20 text-heritage-dark capitalize">
                                        {session.user.role.toLowerCase()}
                                    </span>
                                )}
                            </div>
                            <Button variant="default" size="md" className="w-full md:w-auto">
                                Edit Profile
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="px-4 md:px-6 py-12 md:py-16">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Stats */}
                        <section className="grid grid-cols-3 gap-4">
                            <StatCard label="Sites Visited" value="0" />
                            <StatCard label="Favorites" value="0" />
                            <StatCard label="Points" value="0" />
                        </section>

                        {/* Recent Activity */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-heritage-dark font-serif">
                                Recent Activity
                            </h2>
                            <div className="bg-heritage-light/20 rounded-lg p-8 text-center border border-heritage-light/40">
                                <svg className="w-12 h-12 text-heritage-dark/20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-heritage-dark/70">No recent activity</p>
                                <p className="text-sm text-heritage-dark/60 mt-2">Start exploring heritage sites to see your activity here</p>
                            </div>
                        </section>

                        {/* My Contributions */}
                        <MyContributions />

                        {/* Favorites */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-heritage-dark font-serif">
                                Favorite Sites
                            </h2>
                            <div className="bg-heritage-light/20 rounded-lg p-8 text-center border border-heritage-light/40">
                                <svg className="w-12 h-12 text-heritage-dark/20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <p className="text-heritage-dark/70">No favorites yet</p>
                                <p className="text-sm text-heritage-dark/60 mt-2">Save your favorite heritage sites for quick access</p>
                            </div>
                        </section>

                        {/* Settings */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold text-heritage-dark font-serif">
                                Settings
                            </h2>
                            <div className="space-y-3">
                                <SettingItem label="Email Notifications" />
                                <SettingItem label="AR Mode by Default" />
                                <SettingItem label="Show Location on Map" />
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
}

interface MyContribution {
    id: string;
    title: string;
    type: string;
    status: string;
    createdAt: string;
    rejectionReason: string | null;
}

function MyContributions() {
    const [items, setItems] = useState<MyContribution[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetch('/api/contributions')
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((d) => setItems(d.data || []))
            .catch(() => setItems([]))
            .finally(() => setLoaded(true));
    }, []);

    const statusVariant = (s: string): BadgeProps['variant'] =>
        s === 'PENDING' ? 'primary'
            : s === 'UNDER_REVIEW' ? 'accent'
                : s === 'APPROVED' ? 'success'
                    : s === 'REJECTED' ? 'error'
                        : s === 'MERGED' ? 'secondary'
                            : 'neutral';

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-heritage-dark font-serif">
                    My Contributions
                </h2>
                <Link
                    href="/contribute"
                    className="px-4 py-2 min-h-[44px] inline-flex items-center rounded-full bg-heritage-primary/20 text-heritage-secondary text-sm font-medium hover:bg-heritage-primary/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary"
                >
                    + Suggest a place
                </Link>
            </div>
            {!loaded ? (
                <div className="h-20 rounded-lg bg-heritage-light/30 animate-pulse" />
            ) : items.length === 0 ? (
                <div className="bg-heritage-light/20 rounded-lg p-8 text-center border border-heritage-light/40">
                    <p className="text-heritage-dark/70">No contributions yet</p>
                    <p className="text-sm text-heritage-dark/60 mt-2">
                        Know a hidden heritage place? Suggest it and moderators will review it.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((c) => (
                        <div key={c.id} className="flex items-center gap-3 p-4 bg-white border border-heritage-light/40 rounded-lg">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-heritage-dark truncate">{c.title}</p>
                                <p className="text-xs text-heritage-dark/60">
                                    {c.type.replace('_', ' ')} · {new Date(c.createdAt).toLocaleDateString()}
                                    {c.status === 'REJECTED' && c.rejectionReason ? ` · ${c.rejectionReason}` : ''}
                                </p>
                            </div>
                            <Badge variant={statusVariant(c.status)} size="sm">{c.status.replace('_', ' ')}</Badge>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white p-4 md:p-6 rounded-lg border border-heritage-light/40 text-center">
            <div className="text-2xl md:text-3xl font-bold text-heritage-dark mb-1">{value}</div>
            <div className="text-xs md:text-sm text-heritage-dark/70">{label}</div>
        </div>
    );
}

function SettingItem({ label }: { label: string }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-heritage-light/40">
            <span className="text-heritage-dark/80">{label}</span>
            <button className="w-12 h-6 bg-heritage-light/50 rounded-full relative transition-colors">
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></span>
            </button>
        </div>
    );
}
