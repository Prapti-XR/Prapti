'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button, Search } from '@/components';
import { ThreeErrorBoundary } from '@/components/error/ThreeErrorBoundary';
import dynamic from 'next/dynamic';
import Link from 'next/link';

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
        description: 'Ancient Shiva temple with Hoysala-influenced architecture',
        tags: ['temple', 'ancient', 'hoysala'],
        era: 'Ancient',
        yearBuilt: 850,
    },
];

export default function ModelsPage() {
    const [selectedModel, setSelectedModel] = useState<typeof siteModels[0] | null>(null);
    const [filterTag, setFilterTag] = useState<string>('all');
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
                <section className="sticky z-10 px-4 py-6 border-b border-gray-100 md:py-8 md:px-6 bg-gray-50 top-16">
                    <div className="max-w-6xl mx-auto space-y-4">
                        <Search
                            placeholder="Search 3D models..."
                            size="md"
                            className="max-w-xl"
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
                                        model={model}
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

interface ModelCardProps {
    model: typeof siteModels[0];
    onClick: () => void;
}

function ModelCard({ model, onClick }: ModelCardProps) {
    return (
        <div className="group">
            <div
                className="mb-4 overflow-hidden transition-all duration-200 border border-gray-200 rounded-lg cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50 aspect-square hover:border-blue-500 hover:shadow-xl"
                onClick={onClick}
            >
                <div className="flex flex-col items-center justify-center w-full h-full p-6">
                    <div className="flex items-center justify-center w-20 h-20 mb-4 transition-transform rounded-full bg-gradient-to-br from-blue-500 to-purple-600 group-hover:scale-110">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 rounded-full bg-white/80 backdrop-blur-sm">
                            {model.era} • {model.yearBuilt}
                        </span>
                    </div>
                </div>
            </div>
            <div className="space-y-3">
                <h3 className="text-lg font-semibold transition-colors text-slate-900 group-hover:text-blue-600">
                    {model.name}
                </h3>
                <p className="text-sm text-slate-600">{model.location}</p>
                <p className="text-xs text-slate-500 line-clamp-2">{model.description}</p>
                <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        3D Model
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                        AR Ready
                    </span>
                </div>

                {/* Check AR Button */}
                <Link
                    href={`/site/${model.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="block"
                >
                    <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <span>📱</span>
                            <span>Check AR</span>
                        </span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}
