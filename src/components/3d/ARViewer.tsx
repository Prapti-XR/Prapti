/**
 * AR Experience Component
 * WebXR-based AR viewer for heritage sites
 * Must be client-side only
 */

'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import {
    useGLTF,
    Html,
    Environment,
    Center
} from '@react-three/drei';
import * as THREE from 'three';

interface ARViewerProps {
    modelUrl: string;
    title?: string;
    scale?: number;
    onLoad?: () => void;
    onError?: (error: Error) => void;
}

interface ARModelProps {
    url: string;
    scale?: number;
    onLoad?: () => void;
    onError?: (error: Error) => void;
}

function ARModel({ url, scale = 1, onLoad, onError }: ARModelProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [rotation, setRotation] = useState(0);

    try {
        const { scene } = useGLTF(url);

        // Clone the scene to avoid issues with multiple instances
        const clonedScene = scene.clone();

        useEffect(() => {
            if (onLoad) {
                onLoad();
            }
        }, [onLoad]);

        const handleClick = () => {
            // Rotate model on interaction
            setRotation(prev => prev + Math.PI / 4);
        };

        return (
            <group
                ref={groupRef}
                position={[0, 0, -2]}
                rotation={[0, rotation, 0]}
                scale={scale}
                onClick={handleClick}
            >
                <Center>
                    <primitive object={clonedScene} dispose={null} />
                </Center>
            </group>
        );
    } catch (error) {
        console.error('Error loading AR model:', error);
        if (onError) {
            onError(error as Error);
        }
        return null;
    }
}

function LoadingPlaceholder() {
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center p-6 text-white rounded-lg bg-black/50 backdrop-blur-sm">
                <div className="w-12 h-12 mb-3 border-b-2 border-white rounded-full animate-spin"></div>
                <p className="text-sm">Loading AR Model...</p>
            </div>
        </Html>
    );
}

function ErrorPlaceholder({ message }: { message: string }) {
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center max-w-md p-6 text-white rounded-lg bg-red-900/50 backdrop-blur-sm">
                <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mb-1 text-sm font-semibold">Failed to Load AR Model</p>
                <p className="text-xs text-center opacity-90">{message}</p>
            </div>
        </Html>
    );
}

export function ARViewer({
    modelUrl,
    title,
    scale = 0.5,
    onLoad,
    onError
}: ARViewerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isARSupported, setIsARSupported] = useState(true);

    const handleLoad = () => {
        setIsLoading(false);
        if (onLoad) onLoad();
    };

    const handleError = (err: Error) => {
        setIsLoading(false);
        setError(err.message);
        if (onError) onError(err);
    };

    // Create XR store
    const store = createXRStore();

    // Check WebXR support
    useEffect(() => {
        const checkARSupport = async () => {
            if (typeof navigator === 'undefined' || !navigator.xr) {
                setIsARSupported(false);
                return;
            }

            try {
                const supported = await navigator.xr.isSessionSupported('immersive-ar');
                setIsARSupported(supported);
            } catch (err) {
                console.error('WebXR check failed:', err);
                setIsARSupported(false);
            }
        };

        checkARSupport();
    }, []);

    if (!isARSupported) {
        return (
            <div className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg overflow-hidden shadow-xl flex items-center justify-center">
                <div className="flex flex-col items-center justify-center max-w-md p-8 mx-4 text-white rounded-lg bg-yellow-900/50 backdrop-blur-sm">
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="mb-2 text-xl font-bold">AR Not Supported</h3>
                    <p className="mb-4 text-sm text-center">
                        Your browser doesn't support WebXR for AR experiences.
                    </p>
                    <p className="text-xs text-center opacity-90">
                        Try using Chrome on Android or Safari on iOS with AR support.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg overflow-hidden shadow-xl">
            {/* Header */}
            {title && (
                <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
                    <h3 className="mb-1 text-xl font-bold text-white">{title}</h3>
                    <p className="text-sm text-gray-200">Tap "Start AR" to begin</p>
                </div>
            )}

            {/* AR Button */}
            <div className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                <button
                    onClick={() => store.enterAR()}
                    className="px-8 py-4 text-lg font-bold text-white transition-colors bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700"
                >
                    Start AR Experience
                </button>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-slate-900/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 mb-4 border-b-2 border-white rounded-full animate-spin"></div>
                        <p className="text-lg font-semibold text-white">Preparing AR...</p>
                    </div>
                </div>
            )}

            {/* Canvas */}
            <Canvas
                className="w-full h-full"
                gl={{ antialias: true }}
            >
                <XR store={store}>
                    {/* Lighting */}
                    <ambientLight intensity={0.7} />
                    <directionalLight
                        position={[5, 5, 5]}
                        intensity={1}
                        castShadow
                    />
                    <hemisphereLight
                        args={['#ffffff', '#60a5fa', 0.4]}
                        position={[0, 50, 0]}
                    />

                    {/* Environment */}
                    <Environment preset="city" />

                    {/* AR Model */}
                    <Suspense fallback={<LoadingPlaceholder />}>
                        {error ? (
                            <ErrorPlaceholder message={error} />
                        ) : (
                            <ARModel
                                url={modelUrl}
                                scale={scale}
                                onLoad={handleLoad}
                                onError={handleError}
                            />
                        )}
                    </Suspense>
                </XR>
            </Canvas>

            {/* Help Text */}
            <div className="absolute z-10 max-w-xs p-3 text-xs text-white rounded-lg bottom-4 left-4 bg-black/50 backdrop-blur-sm">
                <p className="mb-1 font-semibold">AR Instructions:</p>
                <ul className="space-y-1 opacity-90">
                    <li>📱 Point camera at a flat surface</li>
                    <li>👆 Tap to place the model</li>
                    <li>🔄 Tap model to rotate</li>
                    <li>🚶 Walk around to view from all angles</li>
                </ul>
            </div>

            {/* AR Badge */}
            <div className="absolute z-10 px-3 py-2 text-xs font-bold text-white rounded-full bottom-4 right-4 bg-purple-600/80 backdrop-blur-sm">
                AR Ready
            </div>
        </div>
    );
}
