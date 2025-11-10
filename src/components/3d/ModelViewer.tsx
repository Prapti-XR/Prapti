/**
 * 3D Model Viewer Component
 * Uses React Three Fiber to display GLTF/GLB models
 * Must be dynamically imported to avoid SSR issues
 */

'use client';

import { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
    OrbitControls,
    PerspectiveCamera,
    Environment,
    Grid,
    useGLTF,
    Html,
    Center
} from '@react-three/drei';
import * as THREE from 'three';

interface ModelViewerProps {
    modelUrl: string;
    title?: string;
    description?: string;
    showGrid?: boolean;
    autoRotate?: boolean;
    environmentPreset?: 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'city' | 'park' | 'lobby';
    cameraPosition?: [number, number, number];
    onLoad?: () => void;
    onError?: (error: Error) => void;
}

interface ModelProps {
    url: string;
    onLoad?: () => void;
    onError?: (error: Error) => void;
}

function Model({ url, onLoad, onError }: ModelProps) {
    const groupRef = useRef<THREE.Group>(null);

    try {
        const { scene } = useGLTF(url);

        // Call onLoad when model is ready
        if (onLoad) {
            onLoad();
        }

        return (
            <Center>
                <primitive
                    ref={groupRef}
                    object={scene}
                    dispose={null}
                />
            </Center>
        );
    } catch (error) {
        console.error('Error loading model:', error);
        if (onError) {
            onError(error as Error);
        }
        return null;
    }
}

function LoadingPlaceholder() {
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center p-6 bg-black/50 backdrop-blur-sm rounded-lg text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-3"></div>
                <p className="text-sm">Loading 3D Model...</p>
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
                <p className="text-sm font-semibold mb-1">Failed to Load Model</p>
                <p className="text-xs text-center opacity-90">{message}</p>
            </div>
        </Html>
    );
}

export function ModelViewer({
    modelUrl,
    title,
    description,
    showGrid = false,
    autoRotate = true,
    environmentPreset = 'sunset',
    cameraPosition = [5, 3, 5],
    onLoad,
    onError
}: ModelViewerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
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

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg overflow-hidden shadow-xl"
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
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
                        <p className="text-white text-lg font-semibold">Loading 3D Model...</p>
                    </div>
                </div>
            )}

            {/* Canvas */}
            <Canvas
                shadows
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1
                }}
                className="w-full h-full"
            >
                <PerspectiveCamera
                    makeDefault
                    position={cameraPosition}
                    fov={50}
                />

                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                />
                <directionalLight
                    position={[-10, 10, -5]}
                    intensity={0.5}
                />
                <hemisphereLight
                    args={['#ffffff', '#60a5fa', 0.4]}
                    position={[0, 50, 0]}
                />

                {/* Environment */}
                <Environment preset={environmentPreset} />

                {/* Grid */}
                {showGrid && (
                    <Grid
                        args={[20, 20]}
                        cellSize={1}
                        cellThickness={0.5}
                        cellColor="#6b7280"
                        sectionSize={5}
                        sectionThickness={1}
                        sectionColor="#9ca3af"
                        fadeDistance={25}
                        fadeStrength={1}
                        followCamera={false}
                    />
                )}

                {/* Model */}
                <Suspense fallback={<LoadingPlaceholder />}>
                    {error ? (
                        <ErrorPlaceholder message={error} />
                    ) : (
                        <Model
                            url={modelUrl}
                            onLoad={handleLoad}
                            onError={handleError}
                        />
                    )}
                </Suspense>

                {/* Controls */}
                <OrbitControls
                    autoRotate={autoRotate}
                    autoRotateSpeed={0.5}
                    enableDamping
                    dampingFactor={0.05}
                    minDistance={2}
                    maxDistance={50}
                    maxPolarAngle={Math.PI / 2}
                />
            </Canvas>

            {/* Help Text */}
            <div className="absolute bottom-4 left-4 z-10 bg-black/50 backdrop-blur-sm text-white text-xs p-3 rounded-lg">
                <p className="font-semibold mb-1">Controls:</p>
                <ul className="space-y-1 opacity-90">
                    <li>🖱️ Left Click + Drag: Rotate</li>
                    <li>🖱️ Right Click + Drag: Pan</li>
                    <li>🎡 Scroll: Zoom</li>
                </ul>
            </div>
        </div>
    );
}
