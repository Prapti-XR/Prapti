'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components';
import { ThreeErrorBoundary } from '@/components/error/ThreeErrorBoundary';
import { QRCodeModal } from '@/components/ar/QRCodeModal';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const ModelViewer = dynamic(
    () => import('@/components/3d/ModelViewer').then(mod => ({ default: mod.ModelViewer })),
    { ssr: false }
);

const PanoramaViewer = dynamic(
    () => import('@/components/3d/PanoramaViewer').then(mod => ({ default: mod.PanoramaViewer })),
    { ssr: false }
);

const ARViewer = dynamic(
    () => import('@/components/3d/ARViewer').then(mod => ({ default: mod.ARViewer })),
    { ssr: false }
);

const ImmersiveViewer = dynamic(
    () => import('@/components/3d/ImmersiveViewer').then(mod => ({ default: mod.ImmersiveViewer })),
    { ssr: false }
);

interface SiteData {
    id: string;
    name: string;
    description: string;
    location: string;
    latitude: number;
    longitude: number;
    country: string;
    city: string | null;
    era: string | null;
    yearBuilt: number | null;
    culturalContext: string | null;
    historicalFacts: string | null;
    visitingInfo: string | null;
    accessibility: string | null;
    modelUrl: string | null;
    panoramaUrl: string | null;
    tags: string[];
}

type ViewerMode = '3d' | 'panorama' | 'ar' | 'vr' | null;

export default function SiteInfoPage({ params }: { params: { id: string } }) {
    const [viewerMode, setViewerMode] = useState<ViewerMode>(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [site, setSite] = useState<SiteData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch site data from database
    useEffect(() => {
        async function fetchSite() {
            try {
                setLoading(true);
                const response = await fetch(`/api/sites/${params.id}`);
                if (!response.ok) throw new Error('Site not found');

                const result = await response.json();
                const dbSite = result.data;

                // Transform database site to component format
                const modelAsset = dbSite.assets?.find((a: any) => a.type === 'MODEL_3D');
                const panoramaAsset = dbSite.assets?.find((a: any) => a.type === 'PANORAMA_360');
                const tags = dbSite.tags?.map((t: any) => t.tag?.name).filter(Boolean) || [];

                setSite({
                    id: dbSite.id,
                    name: dbSite.name,
                    description: dbSite.description,
                    location: dbSite.location,
                    latitude: dbSite.latitude,
                    longitude: dbSite.longitude,
                    country: dbSite.country,
                    city: dbSite.city,
                    era: dbSite.era,
                    yearBuilt: dbSite.yearBuilt,
                    culturalContext: dbSite.culturalContext,
                    historicalFacts: dbSite.historicalFacts,
                    visitingInfo: dbSite.visitingInfo,
                    accessibility: dbSite.accessibility,
                    modelUrl: modelAsset?.storageUrl || null,
                    panoramaUrl: panoramaAsset?.storageUrl || null,
                    tags,
                });

                // Warm the GLTF loader cache so the viewers open without a download wait.
                // Dynamic import keeps three.js out of SSR and the initial bundle.
                if (typeof window !== 'undefined' && modelAsset?.storageUrl) {
                    const url = modelAsset.storageUrl;
                    import('@react-three/drei')
                        .then(({ useGLTF }) => useGLTF.preload(url))
                        .catch(() => { /* preload is best-effort */ });
                }
            } catch (err) {
                console.error('Error fetching site:', err);
                setError(err instanceof Error ? err.message : 'Failed to load site');
            } finally {
                setLoading(false);
            }
        }

        fetchSite();
    }, [params.id]);

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-white flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-heritage-primary mx-auto mb-4"></div>
                        <p className="text-heritage-dark/70 font-medium">Loading site details...</p>
                    </div>
                </main>
            </>
        );
    }

    if (error || !site) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-white flex items-center justify-center">
                    <div className="text-center max-w-md p-8">
                        <svg className="w-16 h-16 text-red-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-heritage-dark/70 font-medium mb-2">Site Not Found</p>
                        <p className="text-sm text-heritage-dark/60 mb-6">{error || 'The requested heritage site could not be found.'}</p>
                        <Link href="/site">
                            <Button variant="primary">View All Sites</Button>
                        </Link>
                    </div>
                </main>
            </>
        );
    }
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Hero Image */}
                <div className="relative w-full h-56 sm:h-64 md:h-80 lg:h-96 bg-gradient-to-br from-heritage-light/30 to-heritage-accent/20">
                    <div className="absolute inset-0 flex items-end bg-gradient-to-b from-transparent via-transparent to-heritage-dark/60">
                        <div className="w-full max-w-7xl px-4 sm:px-6 pb-4 sm:pb-6 mx-auto">
                            <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/90 mb-2">
                                <Link href="/map" className="hover:text-heritage-primary transition-colors">Map</Link>
                                <span>/</span>
                                <span>Site Details</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center w-full h-full">
                        <svg className="w-16 h-16 sm:w-20 sm:h-20 text-heritage-secondary/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                </div>

                {/* Content */}
                <article className="px-4 sm:px-6 py-8 sm:py-12 md:py-16">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <header className="pb-6 sm:pb-8 mb-8 sm:mb-12 border-b border-heritage-light/30">
                            <h1 className="mb-4 sm:mb-6 font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-heritage-dark">
                                {site.name}
                            </h1>
                            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4 text-heritage-dark/70 text-sm sm:text-base">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-heritage-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="line-clamp-2">{site.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-heritage-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{site.era} Era • {site.yearBuilt}</span>
                                </div>
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] text-sm font-medium rounded-full bg-heritage-light/40 text-heritage-dark hover:bg-heritage-light/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary"
                                >
                                    <svg className="w-4 h-4 text-heritage-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    Get Directions
                                </a>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {site.tags.map((tag: string) => (
                                    <span key={tag} className="px-2.5 py-1 text-xs font-medium rounded-full bg-heritage-light/40 text-heritage-dark">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </header>

                        {/* Quick Actions */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
                            <ActionButton
                                icon={
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                }
                                label="3D Model"
                                onClick={() => setViewerMode('3d')}
                            />
                            <ActionButton
                                icon={
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                }
                                label="360° View"
                                onClick={() => setViewerMode('panorama')}
                            />
                            <ActionButton
                                icon={
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                }
                                label="View in AR"
                                onClick={() => setShowQRModal(true)}
                            />
                            <ActionButton
                                icon={
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                }
                                label="VR Experience"
                                onClick={() => setViewerMode('vr')}
                            />
                        </section>

                        {/* Description */}
                        <section className="mb-8 sm:mb-12 space-y-4">
                            <p className="text-base sm:text-lg leading-relaxed text-heritage-dark/80">
                                {site.description}
                            </p>
                            <p className="text-sm sm:text-base leading-relaxed text-heritage-dark/70">
                                {site.culturalContext}
                            </p>
                        </section>

                        {/* Details Grid */}
                        <section className="mb-8 sm:mb-12 space-y-4 sm:space-y-6">
                            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-semibold text-heritage-dark">
                                Details
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 sm:gap-6">
                                <DetailItem label="Era" value={site.era || 'Unknown'} />
                                <DetailItem label="Year Built" value={site.yearBuilt ? site.yearBuilt.toString() : 'Unknown'} />
                                <DetailItem label="City" value={site.city || 'Unknown'} />
                                <DetailItem label="Country" value={site.country} />
                            </div>
                        </section>

                        {/* Historical Facts */}
                        <section className="p-4 sm:p-6 md:p-8 mb-8 sm:mb-12 space-y-3 sm:space-y-4 border border-heritage-accent/30 rounded-xl bg-heritage-accent/5">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-heritage-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-lg sm:text-xl font-semibold text-heritage-dark">
                                    Historical Facts
                                </h3>
                            </div>
                            <p className="text-sm sm:text-base leading-relaxed text-heritage-dark/70">
                                {site.historicalFacts || 'No historical facts available.'}
                            </p>
                        </section>

                        {/* Visiting Information */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
                            <InfoCard
                                title="Visiting Information"
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                }
                                content={site.visitingInfo || 'No visiting information available.'}
                            />
                            <InfoCard
                                title="Accessibility"
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                }
                                content={site.accessibility || 'No accessibility information available.'}
                            />
                        </section>

                        {/* Nearby Sites */}
                        <NearbySites
                            currentId={site.id}
                            latitude={site.latitude}
                            longitude={site.longitude}
                        />
                    </div>
                </article>

                {/* 3D Viewer Modal */}
                {viewerMode && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-sm"
                        onClick={() => setViewerMode(null)}
                    >
                        <div
                            className="w-full max-w-7xl h-[90vh] sm:h-[85vh] bg-heritage-dark-deep rounded-lg sm:rounded-xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative h-full">
                                <button
                                    onClick={() => setViewerMode(null)}
                                    className="absolute z-10 p-2 text-white transition-colors rounded-lg bg-black/50 top-2 right-2 sm:top-4 sm:right-4 hover:bg-black/70 backdrop-blur-sm"
                                    aria-label="Close viewer"
                                >
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <ThreeErrorBoundary>
                                    {viewerMode === '3d' && site.modelUrl && (
                                        <ModelViewer
                                            modelUrl={site.modelUrl}
                                            title={`${site.name} - 3D Model`}
                                            description={site.description}
                                            showGrid={true}
                                            autoRotate={true}
                                            environmentPreset="sunset"
                                        />
                                    )}
                                    {viewerMode === 'panorama' && site.panoramaUrl && (
                                        <PanoramaViewer
                                            imageUrl={site.panoramaUrl}
                                            title={`${site.name} - 360° View`}
                                            description={site.description}
                                            autoRotate={true}
                                            initialFov={75}
                                        />
                                    )}
                                    {viewerMode === 'ar' && site.modelUrl && (
                                        <ARViewer
                                            modelUrl={site.modelUrl}
                                            title={`${site.name} - AR Experience`}
                                            scale={0.5}
                                        />
                                    )}
                                    {viewerMode === 'vr' && (
                                        <ImmersiveViewer
                                            modelUrl={site.modelUrl}
                                            panoramaUrl={site.panoramaUrl}
                                            title={`${site.name} - VR Experience`}
                                        />
                                    )}
                                </ThreeErrorBoundary>
                            </div>
                        </div>
                    </div>
                )}

                {/* QR Code Modal */}
                <QRCodeModal
                    siteId={params.id}
                    siteName={site.name}
                    isOpen={showQRModal}
                    onClose={() => setShowQRModal(false)}
                />
            </main>
        </>
    );
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}

function ActionButton({ icon, label, onClick }: ActionButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center gap-2 sm:gap-3",
                "p-4 sm:p-5 md:p-6 rounded-xl",
                "border-2 border-heritage-light/30 bg-white",
                "transition-all duration-200",
                "hover:border-heritage-primary hover:shadow-lg hover:-translate-y-0.5",
                "active:scale-95",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2"
            )}
        >
            <div className="text-heritage-secondary">{icon}</div>
            <span className="text-xs sm:text-sm font-medium text-heritage-dark">{label}</span>
        </button>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="p-3 sm:p-4 rounded-xl border border-heritage-light/30 bg-heritage-light/10">
            <div className="text-xs sm:text-sm font-medium text-heritage-dark/60 mb-1">{label}</div>
            <div className="text-base sm:text-lg font-semibold text-heritage-dark">{value}</div>
        </div>
    );
}

interface InfoCardProps {
    title: string;
    icon: React.ReactNode;
    content: string;
}

function InfoCard({ title, icon, content }: InfoCardProps) {
    return (
        <div className="p-4 sm:p-6 border border-heritage-light/30 rounded-xl bg-heritage-light/10">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="text-heritage-secondary">{icon}</div>
                <h3 className="text-base sm:text-lg font-semibold text-heritage-dark">
                    {title}
                </h3>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-heritage-dark/70">
                {content}
            </p>
        </div>
    );
}

interface NearbySite {
    id: string;
    name: string;
    city: string | null;
    era: string | null;
    distance?: number;
    assets?: { storageUrl: string }[];
}

function NearbySites({ currentId, latitude, longitude }: { currentId: string; latitude: number; longitude: number }) {
    const [sites, setSites] = useState<NearbySite[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNearby() {
            try {
                const res = await fetch(`/api/sites/nearby?lat=${latitude}&lon=${longitude}&radius=150`);
                if (!res.ok) throw new Error('nearby fetch failed');
                const data = await res.json();
                const nearby = (data.sites || [])
                    .filter((s: NearbySite) => s.id !== currentId)
                    .slice(0, 3);
                setSites(nearby);
            } catch (err) {
                console.error('Error fetching nearby sites:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchNearby();
    }, [currentId, latitude, longitude]);

    if (!loading && sites.length === 0) return null;

    return (
        <section className="mb-8 sm:mb-12 space-y-4 sm:space-y-6">
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-semibold text-heritage-dark">
                Nearby Heritage Sites
            </h2>
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-28 rounded-xl bg-heritage-light/30 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {sites.map((s) => (
                        <Link
                            key={s.id}
                            href={`/site/${s.id}`}
                            className="group p-4 sm:p-5 border border-heritage-light/30 rounded-xl bg-white hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary"
                        >
                            <h3 className="font-serif text-base sm:text-lg font-semibold text-heritage-dark group-hover:text-heritage-secondary transition-colors mb-1 line-clamp-1">
                                {s.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-heritage-dark/60 mb-2">
                                {[s.city, s.era].filter(Boolean).join(' • ') || 'Heritage site'}
                            </p>
                            {typeof s.distance === 'number' && (
                                <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-heritage-accent/20 text-heritage-dark">
                                    {s.distance < 1 ? '< 1' : Math.round(s.distance)} km away
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
