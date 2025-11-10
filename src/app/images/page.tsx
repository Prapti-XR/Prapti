'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button, Search } from '@/components';
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
                                    panorama={panorama}
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

interface ImageCardProps {
    panorama: typeof panoramas[0];
    onClick: () => void;
}

function ImageCard({ panorama, onClick }: ImageCardProps) {
    return (
        <div className="cursor-pointer group" onClick={onClick}>
            <div className="mb-4 overflow-hidden transition-all duration-200 border rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 aspect-video border-slate-700 hover:border-blue-500 hover:shadow-2xl">
                <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4YzAgNC40MiAxLjYgOC40OCA0LjI0IDExLjZDLjkyIDMyLjkyLjA4IDM3LjMxLjA4IDQyYzAgOS45NCA4LjA2IDE4IDE4IDE4czE4LTguMDYgMTgtMThjMC00LjY5LS44NC05LjA4LTQuMTYtMTIuNEMzNC40IDI2LjQ4IDM2IDIyLjQyIDM2IDE4eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
                    <div className="relative">
                        <div className="flex items-center justify-center w-20 h-20 mb-3 transition-transform rounded-full shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 group-hover:scale-110">
                            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <span className="inline-block px-4 py-1.5 bg-blue-500/90 backdrop-blur-sm text-white text-sm font-bold rounded-full">
                                360° Panorama
                            </span>
                        </div>
                    </div>
                    <span className="absolute px-3 py-1 text-xs font-bold text-white rounded-full shadow-lg top-3 right-3 bg-gradient-to-r from-blue-600 to-purple-600 backdrop-blur-sm">
                        360°
                    </span>
                </div>
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold transition-colors text-slate-900 group-hover:text-blue-600">
                    {panorama.name}
                </h3>
                <p className="text-sm text-slate-600">
                    {panorama.location} • Captured {panorama.capturedYear}
                </p>
                <p className="text-xs text-slate-500 line-clamp-2">
                    {panorama.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                        </svg>
                        Immersive View
                    </span>
                    <span>•</span>
                    <span>{panorama.site}</span>
                </div>
            </div>
        </div>
    );
}
