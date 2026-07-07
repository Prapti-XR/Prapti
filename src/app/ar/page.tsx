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

const ImmersiveViewer = dynamic(
    () => import('@/components/3d/ImmersiveViewer').then(mod => ({ default: mod.ImmersiveViewer })),
    { ssr: false }
);

interface SiteData {
    name: string;
    description: string;
    modelUrl: string | null;
    panoramaUrl: string | null;
}

function ARPageContent() {
    const searchParams = useSearchParams();
    const siteId = searchParams.get('site') || '';

    const [site, setSite] = useState<SiteData | null>(null);
    const [isARSupported, setIsARSupported] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [viewerMode, setViewerMode] = useState<'ar' | '3d' | 'vr'>('ar');

    // Fetch site data from database
    useEffect(() => {
        async function fetchSiteData() {
            if (!siteId) {
                setFetchError('No site selected. Open this page from a site\'s AR link or QR code.');
                return;
            }

            try {
                const response = await fetch(`/api/sites/${siteId}`);
                if (!response.ok) throw new Error('Failed to fetch site');

                const result = await response.json();
                const siteData = result.data;

                // Find the 3D model and 360° panorama assets
                const modelAsset = siteData.assets?.find((a: any) => a.type === 'MODEL_3D');
                const panoramaAsset = siteData.assets?.find((a: any) => a.type === 'PANORAMA_360');

                if (modelAsset || panoramaAsset) {
                    setSite({
                        name: siteData.name,
                        description: siteData.description,
                        modelUrl: modelAsset?.storageUrl ?? null,
                        panoramaUrl: panoramaAsset?.storageUrl ?? null,
                    });
                } else {
                    setFetchError('This site has no 3D model or panorama yet.');
                }
            } catch (error) {
                console.error('Error fetching site data:', error);
                setFetchError('Could not load this site. Check your connection and try again.');
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

    if (fetchError) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-heritage-dark via-heritage-secondary to-heritage-dark-deep px-4">
                <div className="text-center max-w-md animate-fade-in">
                    <h1 className="font-serif text-2xl font-bold text-white mb-3">AR view unavailable</h1>
                    <p className="text-white/80 text-sm mb-6">{fetchError}</p>
                    <a
                        href="/models"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-heritage-primary text-heritage-dark font-semibold shadow-lg hover:bg-heritage-primary/90 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2 focus-visible:ring-offset-heritage-dark"
                    >
                        Browse 3D models
                    </a>
                </div>
            </div>
        );
    }

    if (isLoading || !site) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-heritage-dark via-heritage-secondary to-heritage-dark-deep">
                <div className="text-center">
                    <div className="mb-4">
                        <div className="inline-block w-16 h-16 border-4 border-white/30 border-t-heritage-primary rounded-full animate-spin"></div>
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
                        <h1 className="font-serif text-white text-xl font-bold">{site.name}</h1>
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
                    {viewerMode === 'vr' || !site.modelUrl ? (
                        <ImmersiveViewer
                            modelUrl={site.modelUrl}
                            panoramaUrl={site.panoramaUrl}
                            title={site.name}
                        />
                    ) : viewerMode === 'ar' && isARSupported ? (
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
                            disabled={!isARSupported || !site.modelUrl}
                            className={`px-4 py-2 min-h-[44px] rounded-md text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary ${viewerMode === 'ar'
                                ? 'bg-heritage-primary text-heritage-dark'
                                : 'text-white hover:bg-white/10'
                                } ${!isARSupported || !site.modelUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            AR View
                        </button>
                        <button
                            onClick={() => setViewerMode('3d')}
                            disabled={!site.modelUrl}
                            className={`px-4 py-2 min-h-[44px] rounded-md text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary ${viewerMode === '3d'
                                ? 'bg-heritage-primary text-heritage-dark'
                                : 'text-white hover:bg-white/10'
                                } ${!site.modelUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            3D View
                        </button>
                        <button
                            onClick={() => setViewerMode('vr')}
                            className={`px-4 py-2 min-h-[44px] rounded-md text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary ${viewerMode === 'vr' || !site.modelUrl
                                ? 'bg-heritage-primary text-heritage-dark'
                                : 'text-white hover:bg-white/10'
                                }`}
                        >
                            VR View
                        </button>
                    </div>

                    {/* Info */}
                    <div className="flex items-center gap-2 text-white/70 text-xs">
                        {isARSupported === false && (
                            <div className="flex items-center gap-1 bg-heritage-primary/20 text-heritage-primary-soft px-3 py-1 rounded-full">
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
                    <div className="mt-3 bg-heritage-accent/20 backdrop-blur-sm border border-heritage-accent/30 rounded-lg p-3">
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
            <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-heritage-dark via-heritage-secondary to-heritage-dark-deep">
                <div className="text-white text-xl">Loading...</div>
            </div>
        }>
            <ARPageContent />
        </Suspense>
    );
}
