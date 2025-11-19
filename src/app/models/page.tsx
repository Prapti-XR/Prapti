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

const siteModels = [
    {
        id: 'sonda-fort',
        name: 'Sonda Fort',
        location: 'Sonda, Uttara Kannada, Karnataka',
        modelUrl: '/models/sonda-fort.glb',
        thumbnail: '/360-images/sonda-fort-1.jpg',
        description: 'Ancient hill fort from the Vijayanagara period',
        tags: ['fort', 'medieval', 'vijayanagara'],
        era: 'Medieval',
        yearBuilt: 1500,
    },
    {
        id: 'sahasralinga',
        name: 'Sahasralinga',
        location: 'Sirsi, Uttara Kannada, Karnataka',
        modelUrl: '/models/sahasralinga.glb',
        thumbnail: '/360-images/sahasra-linga.jpg',
        description: 'Riverbed with thousands of carved Shiva lingas',
        tags: ['temple', 'pilgrimage', 'ancient'],
        era: 'Ancient',
        yearBuilt: 900,
    },
    {
        id: 'somasagara-temple',
        name: 'Somasagara Temple',
        location: 'Somasagara, Sirsi, Karnataka',
        modelUrl: '/models/somasagara.glb',
        thumbnail: '/360-images/somasagara.jpg',
        description: 'Ancient Shiva temple with Hoysala-influenced architecture',
        tags: ['temple', 'ancient', 'hoysala'],
        era: 'Ancient',
        yearBuilt: 850,
    },
];

export default function ModelsPage() {
    const [selectedModel, setSelectedModel] = useState<typeof siteModels[0] | null>(null);
    const [filterTag, setFilterTag] = useState<string>('all');

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
                                        description={selectedModel.description}
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
