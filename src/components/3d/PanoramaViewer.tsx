/**
 * 360° Panorama Viewer Component
 * Displays panoramic images of heritage sites
 */

'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface PanoramaViewerProps {
    imageUrl: string;
    title?: string;
    description?: string;
    autoRotate?: boolean;
    initialFov?: number;
    onLoad?: () => void;
    onError?: (error: Error) => void;
}

interface PanoramaSphereProps {
    imageUrl: string;
    onLoad?: () => void;
    onError?: (error: Error) => void;
}

function PanoramaSphere({ imageUrl, onLoad, onError }: PanoramaSphereProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { gl } = useThree();

    const texture = useTexture(imageUrl, (loadedTexture) => {
        // Configure texture for panoramas
        loadedTexture.mapping = THREE.EquirectangularReflectionMapping;
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.minFilter = THREE.LinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;

        if (onLoad) onLoad();
    });

    useEffect(() => {
        // Error handling for texture loading
        const handleError = (error: ErrorEvent) => {
            console.error('Panorama texture loading error:', error);
            if (onError) {
                onError(new Error('Failed to load panorama image'));
            }
        };

        gl.domElement.addEventListener('error', handleError);
        return () => gl.domElement.removeEventListener('error', handleError);
    }, [gl, onError]);

    return (
        <mesh ref={meshRef} scale={[-1, 1, 1]}>
            <sphereGeometry args={[500, 60, 40]} />
            <meshBasicMaterial
                map={texture}
                side={THREE.BackSide}
                toneMapped={false}
            />
        </mesh>
    );
}

function LoadingPlaceholder() {
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center p-6 bg-black/50 backdrop-blur-sm rounded-lg text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-3"></div>
                <p className="text-sm">Loading Panorama...</p>
            </div>
        </Html>
    );
}

function ErrorPlaceholder({ message }: { message: string }) {
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center p-6 bg-red-900/50 backdrop-blur-sm rounded-lg text-white max-w-md">
                <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-semibold mb-1">Failed to Load Panorama</p>
                <p className="text-xs text-center opacity-90">{message}</p>
            </div>
        </Html>
    );
}

export function PanoramaViewer({
    imageUrl,
    title,
    description,
    autoRotate = true,
    initialFov = 75,
    onLoad,
    onError
}: PanoramaViewerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentFov, setCurrentFov] = useState(initialFov);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleLoad = () => {
        setIsLoading(false);
        if (onLoad) onLoad();
    };

    const handleError = (err: Error) => {
        setIsLoading(false);
        setError(err.message);
        if (onError) onError(err);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement && containerRef.current) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleZoomIn = () => {
        setCurrentFov(prev => Math.max(30, prev - 10));
    };

    const handleZoomOut = () => {
        setCurrentFov(prev => Math.min(120, prev + 10));
    };

    const handleResetView = () => {
        setCurrentFov(initialFov);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full min-h-[500px] bg-black rounded-lg overflow-hidden shadow-xl"
        >
            {/* Header */}
            {(title || description) && (
                <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4">
                    {title && (
                        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
                    )}
                    {description && (
                        <p className="text-sm text-gray-200">{description}</p>
                    )}
                </div>
            )}

            {/* Controls */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                    onClick={handleZoomIn}
                    className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-lg transition-colors"
                    title="Zoom In"
                    disabled={currentFov <= 30}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                </button>
                <button
                    onClick={handleZoomOut}
                    className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-lg transition-colors"
                    title="Zoom Out"
                    disabled={currentFov >= 120}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                    </svg>
                </button>
                <button
                    onClick={handleResetView}
                    className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-lg transition-colors"
                    title="Reset View"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
                <button
                    onClick={toggleFullscreen}
                    className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-lg transition-colors"
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                    {isFullscreen ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
                        <p className="text-white text-lg font-semibold">Loading 360° Panorama...</p>
                    </div>
                </div>
            )}

            {/* Canvas */}
            <Canvas
                camera={{ fov: currentFov, position: [0, 0, 0.1] }}
                dpr={[1, 2]}
                gl={{ antialias: true }}
                className="w-full h-full"
            >
                {/* Panorama Sphere */}
                <Suspense fallback={<LoadingPlaceholder />}>
                    {error ? (
                        <ErrorPlaceholder message={error} />
                    ) : (
                        <PanoramaSphere
                            imageUrl={imageUrl}
                            onLoad={handleLoad}
                            onError={handleError}
                        />
                    )}
                </Suspense>

                {/* Camera Controls */}
                <OrbitControls
                    autoRotate={autoRotate}
                    autoRotateSpeed={0.5}
                    enableDamping
                    dampingFactor={0.05}
                    enableZoom={true}
                    enablePan={false}
                    rotateSpeed={-0.5}
                    minDistance={0.1}
                    maxDistance={0.1}
                />
            </Canvas>

            {/* Help Text */}
            <div className="absolute bottom-4 left-4 z-10 bg-black/50 backdrop-blur-sm text-white text-xs p-3 rounded-lg">
                <p className="font-semibold mb-1">Controls:</p>
                <ul className="space-y-1 opacity-90">
                    <li>🖱️ Click + Drag: Look Around</li>
                    <li>🎡 Scroll: Zoom In/Out</li>
                    <li>📱 Touch: Swipe to Look</li>
                </ul>
            </div>

            {/* 360° Badge */}
            <div className="absolute bottom-4 right-4 z-10 bg-blue-600/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 rounded-full">
                360°
            </div>
        </div>
    );
}
