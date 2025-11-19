'use client';

import { useState } from 'react';
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

// Sample data - in production, this would come from the database
const sitesData: Record<string, any> = {
    'sonda-fort': {
        name: 'Sonda Fort',
        description: 'An ancient hill fort located near Sonda on Yellapur Road, known for its historic ruins and scenic surroundings. Built during the Vijayanagara period, this fort stands as a testament to the architectural prowess of the Sonda Nayakas.',
        location: 'Yellapur Road, Sonda, Uttara Kannada, Karnataka',
        country: 'India',
        city: 'Sonda',
        era: 'Medieval',
        yearBuilt: 1500,
        culturalContext: 'Built by the Sonda Nayakas during the Vijayanagara Empire, this fort served as an important military outpost and administrative center in the Western Ghats region.',
        historicalFacts: 'The fort was strategically positioned to control trade routes through the dense forests. It features unique architectural elements combining Dravidian and local Kannada styles.',
        visitingInfo: 'Open daily from 6 AM to 6 PM. Best visited during cooler months (October to February). Wear comfortable shoes for climbing.',
        accessibility: 'Moderate difficulty. Requires climbing steps. Not wheelchair accessible. Parking available at the base.',
        modelUrl: '/models/sonda-fort.glb',
        panoramaUrl: '/360-images/sonda-fort-1.jpg',
        tags: ['fort', 'medieval', 'vijayanagara', 'karnataka', 'temple']
    },
    'sahasralinga': {
        name: 'Sahasralinga',
        description: 'A unique pilgrimage site near Somasagara village on the Shalmala river with thousands of Shiva lingas carved on rocks. During the monsoon, the river flows over these carvings, creating a mesmerizing spiritual experience.',
        location: 'Yellapur Road, near Somasagara, Sirsi, Uttara Kannada, Karnataka',
        country: 'India',
        city: 'Sirsi',
        era: 'Ancient',
        yearBuilt: 900,
        culturalContext: 'A sacred site dedicated to Lord Shiva, featuring thousands of lingams carved on riverbed rocks. The site represents the deep Shaivite traditions of the region and has been a pilgrimage destination for over a millennium.',
        historicalFacts: "The name 'Sahasralinga' literally means 'thousand lingas'. Local legends suggest these were carved by devotees over centuries. The site becomes particularly spectacular during monsoons when water flows over the carvings.",
        visitingInfo: 'Best visited during monsoon season (June-September) to see water flowing over the lingas. Open year-round. Early morning visits recommended for peaceful atmosphere.',
        accessibility: 'Moderate accessibility. Involves walking on uneven riverbed rocks. Use caution during monsoons due to water flow. Limited parking available.',
        modelUrl: '/models/sahasralinga.glb',
        panoramaUrl: '/360-images/sahasra-linga.jpg',
        tags: ['temple', 'pilgrimage', 'shiva', 'river', 'ancient', 'karnataka']
    },
    'somasagara-temple': {
        name: 'Somasagara Shiva Temple',
        description: 'A serene Shiva temple known for its peaceful setting near Sahasralinga, surrounded by dense forests and streams. This ancient temple showcases beautiful stone architecture and intricate carvings.',
        location: 'Somasagara, Sirsi, Uttara Kannada, Karnataka',
        country: 'India',
        city: 'Sirsi',
        era: 'Ancient',
        yearBuilt: 850,
        culturalContext: 'An important Shaivite temple nestled in the Western Ghats forests. The temple has been a center of devotion and learning for centuries, attracting pilgrims and scholars alike.',
        historicalFacts: 'The temple features Hoysala-influenced architecture despite predating the Hoysala period. It served as a major religious center during the Kadamba dynasty. The temple complex includes several smaller shrines and a sacred pond.',
        visitingInfo: 'Temple timings: 6 AM - 12 PM and 4 PM - 8 PM. Modest dress required. Photography allowed in outer areas only. Special pujas during Shivaratri.',
        accessibility: 'Good accessibility with paved pathways. Wheelchair accessible main areas. Parking available. Basic facilities like restrooms and drinking water provided.',
        modelUrl: '/models/somasagara.glb',
        panoramaUrl: '/360-images/somasagara.jpg',
        tags: ['temple', 'shiva', 'ancient', 'hoysala', 'karnataka', 'pilgrimage']
    }
};

type ViewerMode = '3d' | 'panorama' | 'ar' | null;

export default function SiteInfoPage({ params }: { params: { id: string } }) {
    const [viewerMode, setViewerMode] = useState<ViewerMode>(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const site = sitesData[params.id] || sitesData['sonda-fort'];
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
                        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12">
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
                                <DetailItem label="Era" value={site.era} />
                                <DetailItem label="Year Built" value={site.yearBuilt.toString()} />
                                <DetailItem label="City" value={site.city} />
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
                                {site.historicalFacts}
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
                                content={site.visitingInfo}
                            />
                            <InfoCard
                                title="Accessibility"
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                }
                                content={site.accessibility}
                            />
                        </section>
                    </div>
                </article>

                {/* 3D Viewer Modal */}
                {viewerMode && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-sm"
                        onClick={() => setViewerMode(null)}
                    >
                        <div
                            className="w-full max-w-7xl h-[90vh] sm:h-[85vh] bg-slate-900 rounded-lg sm:rounded-xl overflow-hidden"
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
                                    {viewerMode === '3d' && (
                                        <ModelViewer
                                            modelUrl={site.modelUrl}
                                            title={`${site.name} - 3D Model`}
                                            description={site.description}
                                            showGrid={true}
                                            autoRotate={true}
                                            environmentPreset="sunset"
                                        />
                                    )}
                                    {viewerMode === 'panorama' && (
                                        <PanoramaViewer
                                            imageUrl={site.panoramaUrl}
                                            title={`${site.name} - 360° View`}
                                            description={site.description}
                                            autoRotate={true}
                                            initialFov={75}
                                        />
                                    )}
                                    {viewerMode === 'ar' && (
                                        <ARViewer
                                            modelUrl={site.modelUrl}
                                            title={`${site.name} - AR Experience`}
                                            scale={0.5}
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
