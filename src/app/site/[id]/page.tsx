'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components';
import { ThreeErrorBoundary } from '@/components/error/ThreeErrorBoundary';
import { QRCodeModal } from '@/components/ar/QRCodeModal';
import Link from 'next/link';
import dynamic from 'next/dynamic';

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
                <div className="relative w-full h-64 bg-gray-200 md:h-96">
                    <div className="absolute inset-0 flex items-end bg-gradient-to-b from-transparent to-black/50">
                        <div className="w-full max-w-6xl px-4 pb-8 mx-auto md:px-6">
                            <div className="inline-flex items-center gap-2 mb-2 text-sm text-white/80">
                                <Link href="/map" className="hover:text-white">Map</Link>
                                <span>/</span>
                                <span>Site Details</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
                        <svg className="w-20 h-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>

                {/* Content */}
                <article className="px-4 py-12 md:px-6 md:py-16">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <header className="pb-8 mb-12 border-b border-gray-100">
                            <h1 className="mb-6 font-serif text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-heritage-dark">
                                {site.name}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{site.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{site.era} Era • Built in {site.yearBuilt}</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {site.tags.map((tag: string) => (
                                    <span key={tag} className="px-3 py-1 text-xs font-medium text-blue-700 rounded-full bg-blue-50">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </header>

                        {/* Description */}
                        <section className="mb-12 prose prose-lg max-w-none">
                            <p className="mb-4 text-lg leading-relaxed text-gray-700">
                                {site.description}
                            </p>
                            <p className="leading-relaxed text-gray-700">
                                {site.culturalContext}
                            </p>
                        </section>

                        {/* Quick Actions */}
                        <section className="grid gap-4 mb-12 sm:grid-cols-3">
                            <ActionButton
                                icon="📦"
                                label="View 3D Model"
                                onClick={() => setViewerMode('3d')}
                            />
                            <ActionButton
                                icon="🖼️"
                                label="360° Panorama"
                                onClick={() => setViewerMode('panorama')}
                            />
                            <ActionButton
                                icon="📱"
                                label="View in AR"
                                onClick={() => setShowQRModal(true)}
                            />
                        </section>

                        {/* Details Grid */}
                        <section className="mb-12 space-y-6">
                            <h2 className="font-serif text-2xl font-semibold md:text-3xl text-heritage-dark">
                                Details
                            </h2>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <DetailItem label="Era" value={site.era} />
                                <DetailItem label="Year Built" value={site.yearBuilt.toString()} />
                                <DetailItem label="City" value={site.city} />
                                <DetailItem label="Country" value={site.country} />
                            </div>
                        </section>

                        {/* Historical Facts */}
                        <section className="p-6 mb-12 space-y-4 border border-blue-100 rounded-lg bg-blue-50 md:p-8">
                            <h3 className="text-xl font-semibold text-blue-900">
                                📜 Historical Facts
                            </h3>
                            <p className="leading-relaxed text-blue-800">
                                {site.historicalFacts}
                            </p>
                        </section>

                        {/* Visiting Information */}
                        <section className="grid gap-6 mb-12 md:grid-cols-2">
                            <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                    🕒 Visiting Information
                                </h3>
                                <p className="text-sm leading-relaxed text-gray-700">
                                    {site.visitingInfo}
                                </p>
                            </div>
                            <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                    ♿ Accessibility
                                </h3>
                                <p className="text-sm leading-relaxed text-gray-700">
                                    {site.accessibility}
                                </p>
                            </div>
                        </section>
                    </div>
                </article>

                {/* 3D Viewer Modal */}
                {viewerMode && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                        onClick={() => setViewerMode(null)}
                    >
                        <div
                            className="w-full max-w-7xl h-[85vh] bg-slate-900 rounded-lg overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative h-full">
                                <button
                                    onClick={() => setViewerMode(null)}
                                    className="absolute z-10 p-2 text-white transition-colors rounded-lg bg-black/50 top-4 right-4 hover:bg-black/70 backdrop-blur-sm"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    icon: string;
    label: string;
    onClick: () => void;
}

function ActionButton({ icon, label, onClick }: ActionButtonProps) {
    return (
        <Button
            variant="default"
            size="lg"
            className="flex-col h-auto py-6 transition-all hover:bg-blue-50 hover:border-blue-500"
            onClick={onClick}
        >
            <span className="mb-2 text-3xl">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
        </Button>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500">{label}</div>
            <div className="text-lg text-heritage-dark">{value}</div>
        </div>
    );
}
