'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button, Search, ImageCard } from '@/components';
import { ThreeErrorBoundary } from '@/components/error/ThreeErrorBoundary';
import dynamic from 'next/dynamic';

const PanoramaViewer = dynamic(
    () => import('@/components/3d/PanoramaViewer').then(mod => ({ default: mod.PanoramaViewer })),
    { ssr: false }
);

// Using actual 360° images from public folder
const panoramas = [
    {
        id: 'sonda-fort-1',
        name: 'Sonda Fort - Main View',
        location: 'Sonda, Karnataka',
        imageUrl: '/360-images/sonda-fort-1.jpg',
        description: '360° view of the historic Sonda Fort',
        capturedYear: 2024,
        site: 'Sonda Fort',
    },
    {
        id: 'sonda-fort-2',
        name: 'Sonda Fort - Panoramic View',
        location: 'Sonda, Karnataka',
        imageUrl: '/360-images/sonda-fort-2.jpg',
        description: 'Panoramic view from the fort ramparts',
        capturedYear: 2024,
        site: 'Sonda Fort',
    },
    {
        id: 'sahasralinga-river',
        name: 'Sahasralinga - River View',
        location: 'Sirsi, Karnataka',
        imageUrl: '/360-images/sahasra-linga.jpg',
        description: '360° view of the thousand lingas on the riverbed',
        capturedYear: 2024,
        site: 'Sahasralinga',
    },
    {
        id: 'somasagara-temple',
        name: 'Somasagara Temple',
        location: 'Somasagara, Karnataka',
        imageUrl: '/360-images/somasagara.jpg',
        description: '360° view of the ancient Shiva temple',
        capturedYear: 2024,
        site: 'Somasagara Temple',
    },
];

export default function ImagesPage() {
    const [selectedPanorama, setSelectedPanorama] = useState<typeof panoramas[0] | null>(null);
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Header */}
                <header className="px-4 pt-24 pb-12 border-b border-gray-100 md:pt-32 md:pb-16 md:px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="max-w-3xl">
                            <h1 className="mb-4 font-serif text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-heritage-dark md:mb-6">
                                360° Images
                            </h1>
                            <p className="text-lg leading-relaxed text-gray-600 md:text-xl">
                                Immerse yourself in panoramic views. Experience heritage sites
                                as if you're standing right there.
                            </p>
                        </div>
                    </div>
                </header>

                {/* Search and Filters */}
                <section className="sticky z-10 px-4 py-6 border-b border-gray-100 md:py-8 md:px-6 bg-gray-50 top-16">
                    <div className="max-w-6xl mx-auto space-y-4">
                        <Search
                            placeholder="Search 360° images..."
                            size="md"
                            className="max-w-xl"
                        />
                        <div className="flex gap-2 pb-2 overflow-x-auto md:gap-3 scrollbar-hide">
                            <Button size="sm" variant="primary">
                                All Images
                            </Button>
                            <Button size="sm" variant="default">
                                Exterior
                            </Button>
                            <Button size="sm" variant="default">
                                Interior
                            </Button>
                            <Button size="sm" variant="default">
                                Aerial
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Images Grid */}
                <section className="px-4 py-12 md:py-16 md:px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid gap-6 sm:grid-cols-2 md:gap-8">
                            {panoramas.map((panorama) => (
                                <ImageCard
                                    key={panorama.id}
                                    id={panorama.id}
                                    name={panorama.name}
                                    location={panorama.location}
                                    description={panorama.description}
                                    imageUrl={panorama.imageUrl}
                                    capturedYear={panorama.capturedYear}
                                    site={panorama.site}
                                    onClick={() => setSelectedPanorama(panorama)}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Panorama Viewer Modal */}
                {selectedPanorama && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                        onClick={() => setSelectedPanorama(null)}
                    >
                        <div
                            className="w-full max-w-7xl h-[85vh] bg-black rounded-lg overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative h-full">
                                <button
                                    onClick={() => setSelectedPanorama(null)}
                                    className="absolute z-10 p-2 text-white transition-colors rounded-lg top-4 right-4 bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <ThreeErrorBoundary>
                                    <PanoramaViewer
                                        imageUrl={selectedPanorama.imageUrl}
                                        title={selectedPanorama.name}
                                        description={selectedPanorama.description}
                                        autoRotate={true}
                                        initialFov={75}
                                    />
                                </ThreeErrorBoundary>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
