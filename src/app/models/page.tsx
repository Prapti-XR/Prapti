'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button, Search, ModelCard } from '@/components';
import { ThreeErrorBoundary } from '@/components/error/ThreeErrorBoundary';
import dynamic from 'next/dynamic';

const ModelViewer = dynamic(
    () => import('@/components/3d/ModelViewer').then(mod => ({ default: mod.ModelViewer })),
    { ssr: false }
);

interface SiteModel {
    id: string;
    name: string;
    location: string;
    modelUrl: string;
    thumbnail: string;
    description: string;
    tags: string[];
    era: string;
    yearBuilt: number | undefined;
}

export default function ModelsPage() {
    const [siteModels, setSiteModels] = useState<SiteModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedModel, setSelectedModel] = useState<SiteModel | null>(null);
    const [filterTag, setFilterTag] = useState<string>('all');

    // Fetch models from database
    useEffect(() => {
        async function fetchModels() {
            try {
                setLoading(true);
                const response = await fetch('/api/sites?limit=100');
                if (!response.ok) throw new Error('Failed to fetch sites');

                const result = await response.json();
                const sites = result.data || [];

                // Filter sites that have 3D models and transform to model format
                const models: SiteModel[] = sites
                    .filter((site: any) => site.assets?.some((a: any) => a.type === 'MODEL_3D'))
                    .map((site: any) => {
                        const modelAsset = site.assets.find((a: any) => a.type === 'MODEL_3D');
                        const thumbnailAsset = site.assets.find((a: any) =>
                            a.type === 'PANORAMA_360' || a.type === 'IMAGE'
                        );
                        const tags = site.tags?.map((t: any) => t.tag?.name).filter(Boolean) || [];

                        return {
                            id: site.id,
                            name: site.name,
                            location: site.location,
                            modelUrl: modelAsset?.storageUrl || '',
                            thumbnail: thumbnailAsset?.storageUrl || '',
                            description: site.description,
                            tags,
                            era: site.era || 'Unknown',
                            yearBuilt: site.yearBuilt ?? undefined,
                        };
                    });

                setSiteModels(models);
            } catch (error) {
                console.error('Error fetching models:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchModels();
    }, []);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (selectedModel) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedModel]);

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-white">
                {/* Header */}
                <header className="px-4 pt-24 pb-12 border-b border-gray-100 md:pt-32 md:pb-16 md:px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="max-w-3xl">
                            <h1 className="mb-4 font-serif text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-heritage-dark md:mb-6">
                                3D Models Gallery
                            </h1>
                            <p className="text-lg leading-relaxed text-gray-600 md:text-xl">
                                Explore interactive 3D reconstructions of heritage sites.
                                Rotate, zoom, and examine every detail of historical monuments.
                            </p>
                        </div>
                    </div>
                </header>

                {/* Search and Filters */}
                <section className="px-4 py-6 bg-white border-b border-gray-200 md:py-8 md:px-6">
                    <div className="max-w-6xl mx-auto space-y-4">
                        <Search
                            placeholder="Search 3D models..."
                            size="md"
                            containerClassName="max-w-2xl"
                        />
                        <div className="flex gap-2 pb-2 overflow-x-auto md:gap-3 scrollbar-hide">
                            <Button
                                size="sm"
                                variant={filterTag === 'all' ? 'primary' : 'default'}
                                onClick={() => setFilterTag('all')}
                            >
                                All Models
                            </Button>
                            <Button
                                size="sm"
                                variant={filterTag === 'temple' ? 'primary' : 'default'}
                                onClick={() => setFilterTag('temple')}
                            >
                                Temples
                            </Button>
                            <Button
                                size="sm"
                                variant={filterTag === 'fort' ? 'primary' : 'default'}
                                onClick={() => setFilterTag('fort')}
                            >
                                Forts
                            </Button>
                            <Button
                                size="sm"
                                variant={filterTag === 'ancient' ? 'primary' : 'default'}
                                onClick={() => setFilterTag('ancient')}
                            >
                                Ancient
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Models Grid */}
                <section className="px-4 py-12 md:py-16 md:px-6">
                    <div className="max-w-6xl mx-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="text-center">
                                    <div className="w-12 h-12 mx-auto mb-4 border-4 rounded-full border-heritage-primary border-t-transparent animate-spin"></div>
                                    <p className="text-gray-600">Loading 3D models...</p>
                                </div>
                            </div>
                        ) : siteModels.length === 0 ? (
                            <div className="py-16 text-center">
                                <p className="text-gray-600">No 3D models found.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
                                {siteModels
                                    .filter(model => filterTag === 'all' || model.tags.includes(filterTag))
                                    .map((model) => (
                                        <ModelCard
                                            key={model.id}
                                            id={model.id}
                                            name={model.name}
                                            location={model.location}
                                            description={model.description}
                                            modelUrl={model.modelUrl}
                                            thumbnail={model.thumbnail}
                                            era={model.era}
                                            yearBuilt={model.yearBuilt}
                                            tags={model.tags}
                                            onClick={() => setSelectedModel(model)}
                                        />
                                    ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Model Viewer Modal */}
                {selectedModel && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedModel(null)}
                    >
                        <div
                            className="w-full max-w-6xl h-[80vh] bg-slate-900 rounded-lg overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative h-full">
                                <button
                                    onClick={() => setSelectedModel(null)}
                                    className="absolute z-10 p-2 text-white transition-colors rounded-lg top-4 right-4 bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <ThreeErrorBoundary>
                                    <ModelViewer
                                        modelUrl={selectedModel.modelUrl}
                                        title={selectedModel.name}
                                        showGrid={true}
                                        autoRotate={true}
                                        environmentPreset="sunset"
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
