'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button, Search, ImageCard } from '@/components';
import { ThreeErrorBoundary } from '@/components/error/ThreeErrorBoundary';
import dynamic from 'next/dynamic';

const PanoramaViewer = dynamic(
    () => import('@/components/3d/PanoramaViewer').then(mod => ({ default: mod.PanoramaViewer })),
    { ssr: false }
);

interface Panorama {
    id: string;
    name: string;
    location: string;
    imageUrl: string;
    description: string;
    capturedYear: number;
    site: string;
}

export default function ImagesPage() {
    const [panoramas, setPanoramas] = useState<Panorama[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPanorama, setSelectedPanorama] = useState<Panorama | null>(null);

    // Fetch panoramas from database
    useEffect(() => {
        async function fetchPanoramas() {
            try {
                setLoading(true);
                const response = await fetch('/api/images?limit=100');
                if (!response.ok) throw new Error('Failed to fetch images');

                const result = await response.json();
                const sites = result.data || [];

                // Extract panoramas from sites
                const allPanoramas: Panorama[] = [];
                sites.forEach((site: any) => {
                    const panoramaAssets = site.assets?.filter((a: any) =>
                        a.type === 'PANORAMA_360' || a.type === 'PANORAMA_180'
                    ) || [];

                    panoramaAssets.forEach((asset: any) => {
                        allPanoramas.push({
                            id: asset.id,
                            name: asset.title || `${site.name} - Panorama`,
                            location: site.location,
                            imageUrl: asset.storageUrl,
                            description: asset.description || site.description,
                            capturedYear: new Date(asset.createdAt).getFullYear(),
                            site: site.name,
                        });
                    });
                });

                setPanoramas(allPanoramas);
            } catch (error) {
                console.error('Error fetching panoramas:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchPanoramas();
    }, []);
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
                <section className="px-4 py-6 bg-white border-b border-gray-200 md:py-8 md:px-6">
                    <div className="max-w-6xl mx-auto space-y-4">
                        <Search
                            placeholder="Search 360° images..."
                            size="md"
                            containerClassName="max-w-2xl"
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
                        {loading ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="h-6 w-48 bg-heritage-light/30 rounded animate-pulse" />
                                    <div className="h-9 w-36 bg-heritage-light/30 rounded-full animate-pulse" />
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <div key={i} className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                                            <div className="aspect-[16/9] w-full bg-heritage-light/30 animate-pulse" />
                                            <div className="p-3 space-y-2">
                                                <div className="h-5 w-3/4 bg-heritage-light/30 rounded animate-pulse" />
                                                <div className="h-3 w-1/2 bg-heritage-light/30 rounded animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                                    <p className="text-gray-600">Loading 360° images...</p>
                                </div>
                </div>
                ) : panoramas.length === 0 ? (
                <div className="py-16 text-center">
                    <p className="text-gray-600">No 360° images found.</p>
                </div>
                ) : (
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
                        )}
            </div>
        </section >

            {/* Panorama Viewer Modal */ }
    {
        selectedPanorama && (
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
        )
    }
            </main >
        </>
    );
}
