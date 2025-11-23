/**
 * AR Landing Page
 * Entry point for mobile AR experiences via QR code
 * Detects device capabilities and loads appropriate viewer
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ThreeErrorBoundary } from '@/components/error/ThreeErrorBoundary';

const ARViewer = dynamic(
    () => import('@/components/3d/ARViewer').then(mod => ({ default: mod.ARViewer })),
    { ssr: false }
);

const ModelViewer = dynamic(
    () => import('@/components/3d/ModelViewer').then(mod => ({ default: mod.ModelViewer })),
    { ssr: false }
);

interface SiteData {
    name: string;
    description: string;
    modelUrl: string;
}

function ARPageContent() {
    const searchParams = useSearchParams();
    const siteId = searchParams.get('site') || '';

    const [site, setSite] = useState<SiteData | null>(null);
    const [isARSupported, setIsARSupported] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewerMode, setViewerMode] = useState<'ar' | '3d'>('ar');

    // Fetch site data from database
    useEffect(() => {
        async function fetchSiteData() {
            if (!siteId) return;

            try {
                const response = await fetch(`/api/sites/${siteId}`);
                if (!response.ok) throw new Error('Failed to fetch site');

                const result = await response.json();
                const siteData = result.data;

                // Find the 3D model asset
                const modelAsset = siteData.assets?.find((a: any) => a.type === 'MODEL_3D');

                if (modelAsset) {
                    setSite({
                        name: siteData.name,
                        description: siteData.description,
                        modelUrl: modelAsset.storageUrl,
                    });
                }
            } catch (error) {
                console.error('Error fetching site data:', error);
            }
        }

        fetchSiteData();
    }, [siteId]);

    useEffect(() => {
        // Check if AR is supported
        const checkARSupport = async () => {
            setIsLoading(true);

            if ('xr' in navigator) {
                try {
                    const supported = await (navigator as any).xr?.isSessionSupported?.('immersive-ar');
                    setIsARSupported(supported);
                    setViewerMode(supported ? 'ar' : '3d');
                } catch (error) {
                    console.error('AR support check failed:', error);
                    setIsARSupported(false);
                    setViewerMode('3d');
                }
            } else {
                setIsARSupported(false);
                setViewerMode('3d');
            }

            setIsLoading(false);
        };

        checkARSupport();
    }, []);

    if (isLoading || !site) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-amber-900 via-orange-900 to-red-900">
                <div className="text-center">
                    <div className="mb-4">
                        <div className="inline-block w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                    <p className="text-white text-lg font-medium">Loading AR Experience...</p>
                    {site && <p className="text-white/70 text-sm mt-2">{site.name}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-white text-xl font-bold">{site.name}</h1>
                        <p className="text-white/80 text-sm">{site.description}</p>
                    </div>
                    <a
                        href="/"
                        className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-sm font-medium">Home</span>
                    </a>
                </div>
            </div>

            {/* AR/3D Viewer */}
            <ThreeErrorBoundary>
                <Suspense fallback={
                    <div className="flex items-center justify-center h-screen">
                        <div className="text-white text-center">
                            <div className="mb-4">
                                <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            </div>
                            <p>Loading model...</p>
                        </div>
                    </div>
                }>
                    {viewerMode === 'ar' && isARSupported ? (
                        <ARViewer
                            modelUrl={site.modelUrl}
                            title={site.name}
                            scale={1}
                        />
                    ) : (
                        <ModelViewer
                            modelUrl={site.modelUrl}
                            title={site.name}
                        />
                    )}
                </Suspense>
            </ThreeErrorBoundary>

            {/* Controls Footer */}
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center justify-between">
                    {/* Mode Toggle */}
                    <div className="flex gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
                        <button
                            onClick={() => setViewerMode('ar')}
                            disabled={!isARSupported}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewerMode === 'ar'
                                ? 'bg-white text-black'
                                : 'text-white hover:bg-white/10'
                                } ${!isARSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            AR View
                        </button>
                        <button
                            onClick={() => setViewerMode('3d')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewerMode === '3d'
                                ? 'bg-white text-black'
                                : 'text-white hover:bg-white/10'
                                }`}
                        >
                            3D View
                        </button>
                    </div>

                    {/* Info */}
                    <div className="flex items-center gap-2 text-white/70 text-xs">
                        {isARSupported === false && (
                            <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-200 px-3 py-1 rounded-full">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>AR not supported on this device</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Instructions */}
                {viewerMode === 'ar' && isARSupported && (
                    <div className="mt-3 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg p-3">
                        <p className="text-white text-xs">
                            <strong>AR Instructions:</strong> Point your device at a flat surface. Tap to place the model. Pinch to resize, drag to move.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ARPage() {
    return (
        <Suspense fallback={
            <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-amber-900 via-orange-900 to-red-900">
                <div className="text-white text-xl">Loading...</div>
            </div>
        }>
            <ARPageContent />
        </Suspense>
    );
}
