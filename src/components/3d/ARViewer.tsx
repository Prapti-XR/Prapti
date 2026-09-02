/**
 * AR Experience Component
 * WebXR-based AR viewer for heritage sites
 * Must be client-side only
 */

'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, XRDomOverlay, createXRStore } from '@react-three/xr';
import {
    useGLTF,
    Html,
    Environment,
    Center
} from '@react-three/drei';
import * as THREE from 'three';
import { useARSupport } from '@/hooks/useARSupport';
import { computeNormalizedScale } from '@/lib/model-sizing';

const AR_TARGET_SIZE = 1;
const CALIBRATION_MIN = 0.25;
const CALIBRATION_MAX = 3;
const CALIBRATION_STEP = 0.1;

function calibrationStorageKey(modelUrl: string) {
    return `ar-scale:${modelUrl}`;
}

function loadStoredCalibration(modelUrl: string, fallback: number): number {
    if (typeof window === 'undefined') return fallback;
    try {
        const raw = window.localStorage.getItem(calibrationStorageKey(modelUrl));
        const parsed = raw !== null ? parseFloat(raw) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    } catch {
        return fallback;
    }
}

interface ARViewerProps {
    modelUrl: string;
    title?: string;
    /** Fixed default size multiplier for this call site, applied on top of
     * the model's own bounding-box-normalized scale. Acts as the "reset"
     * target for the in-AR size calibration control. */
    scale?: number;
    onLoad?: () => void;
    onError?: (error: Error) => void;
}

interface ARModelProps {
    url: string;
    calibration: number;
    onLoad?: () => void;
    onError?: (error: Error) => void;
}

function ARModel({ url, calibration, onLoad }: ARModelProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [rotation, setRotation] = useState(0);

    // Hooks must be unconditional — load errors suspend/throw and are
    // handled by the surrounding <Suspense> and ThreeErrorBoundary.
    const { scene } = useGLTF(url);

    // Clone the scene to avoid issues with multiple instances
    const clonedScene = useMemo(() => scene.clone(), [scene]);

    // Fixed baseline size derived from the model's own bounding box; the
    // user-adjustable `calibration` multiplier is layered on top of it.
    const baseScale = useMemo(
        () => computeNormalizedScale(clonedScene, AR_TARGET_SIZE),
        [clonedScene]
    );

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
            scale={baseScale * calibration}
            onClick={handleClick}
        >
            <Center>
                <primitive object={clonedScene} dispose={null} />
            </Center>
        </group>
    );
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

function CalibrationControls({
    calibration,
    onDecrease,
    onIncrease,
    onReset
}: {
    calibration: number;
    onDecrease: () => void;
    onIncrease: () => void;
    onReset: () => void;
}) {
    return (
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg pointer-events-auto">
            <button
                onClick={onDecrease}
                className="flex items-center justify-center w-8 h-8 bg-white/10 hover:bg-white/20 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary disabled:opacity-40"
                aria-label="Decrease AR model size"
                disabled={calibration <= CALIBRATION_MIN}
            >
                −
            </button>
            <span className="min-w-[3.5ch] text-center font-semibold">
                {Math.round(calibration * 100)}%
            </span>
            <button
                onClick={onIncrease}
                className="flex items-center justify-center w-8 h-8 bg-white/10 hover:bg-white/20 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary disabled:opacity-40"
                aria-label="Increase AR model size"
                disabled={calibration >= CALIBRATION_MAX}
            >
                +
            </button>
            <button
                onClick={onReset}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary"
                aria-label="Reset AR model size"
            >
                Reset
            </button>
        </div>
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
    const [showOptions, setShowOptions] = useState(false);
    const [calibration, setCalibration] = useState(() => loadStoredCalibration(modelUrl, scale));
    const { isSupported: isARSupported } = useARSupport();

    useEffect(() => {
        setCalibration(loadStoredCalibration(modelUrl, scale));
    }, [modelUrl, scale]);

    const updateCalibration = useCallback(
        (value: number) => {
            const clamped = Math.min(CALIBRATION_MAX, Math.max(CALIBRATION_MIN, value));
            setCalibration(clamped);
            if (typeof window !== 'undefined') {
                try {
                    window.localStorage.setItem(calibrationStorageKey(modelUrl), String(clamped));
                } catch (err) {
                    console.error('Failed to persist AR size calibration:', err);
                }
            }
        },
        [modelUrl]
    );

    const handleCalibrateDecrease = () => updateCalibration(calibration - CALIBRATION_STEP);
    const handleCalibrateIncrease = () => updateCalibration(calibration + CALIBRATION_STEP);
    const handleCalibrateReset = () => updateCalibration(scale);

    const handleLoad = () => {
        setIsLoading(false);
        if (onLoad) onLoad();
    };

    const handleError = (err: Error) => {
        setIsLoading(false);
        setError(err.message);
        if (onError) onError(err);
    };

    // Create XR store once per mount (recreating it every render resets XR state)
    const [store] = useState(() => createXRStore());

    if (isARSupported === false) {
        return (
            <div className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-heritage-dark to-heritage-dark-deep rounded-xl overflow-hidden shadow-xl flex items-center justify-center">
                <div className="flex flex-col items-center justify-center max-w-md p-8 mx-4 text-white rounded-xl bg-heritage-secondary/40 backdrop-blur-sm border border-heritage-primary/30">
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="mb-2 text-xl font-bold">AR Not Supported</h3>
                    <p className="mb-4 text-sm text-center">
                        Your browser doesn't support WebXR for AR experiences.
                    </p>
                    <p className="text-xs text-center opacity-90">
                        AR requires a WebXR-compatible browser, such as Chrome on Android with ARCore support.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-heritage-dark to-heritage-dark-deep rounded-xl overflow-hidden shadow-xl">
            {/* Header */}
            {title && (
                <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
                    <h3 className="mb-1 font-serif text-xl font-bold text-white">{title}</h3>
                    <p className="text-sm text-gray-200">Tap "Start AR" to begin</p>
                </div>
            )}

            {/* Size Calibration */}
            <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
                <button
                    onClick={() => setShowOptions((prev) => !prev)}
                    className="flex items-center justify-center w-11 h-11 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary"
                    title="Calibrate Size"
                    aria-label="Calibrate AR model size"
                    aria-expanded={showOptions}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
                {showOptions && (
                    <CalibrationControls
                        calibration={calibration}
                        onDecrease={handleCalibrateDecrease}
                        onIncrease={handleCalibrateIncrease}
                        onReset={handleCalibrateReset}
                    />
                )}
            </div>

            {/* AR Button */}
            <div className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                <button
                    onClick={() => store.enterAR()}
                    className="px-8 py-4 text-lg font-bold text-heritage-dark transition-all bg-heritage-primary rounded-full shadow-lg hover:bg-heritage-primary/90 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2 focus-visible:ring-offset-heritage-dark"
                >
                    Start AR Experience
                </button>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-heritage-dark/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 mb-4 border-b-2 border-heritage-primary rounded-full animate-spin"></div>
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
                                calibration={calibration}
                                onLoad={handleLoad}
                                onError={handleError}
                            />
                        )}
                    </Suspense>

                    {/* In-session size calibration, shown via the WebXR DOM overlay */}
                    <XRDomOverlay>
                        <div className="absolute bottom-6 right-4">
                            <CalibrationControls
                                calibration={calibration}
                                onDecrease={handleCalibrateDecrease}
                                onIncrease={handleCalibrateIncrease}
                                onReset={handleCalibrateReset}
                            />
                        </div>
                    </XRDomOverlay>
                </XR>
            </Canvas>

            {/* Help Text */}
            <div className="absolute z-10 max-w-xs p-3 text-xs text-white rounded-lg bottom-4 left-4 bg-black/50 backdrop-blur-sm">
                <p className="mb-1 font-semibold">AR Instructions:</p>
                <ul className="space-y-1 opacity-90">
                    <li>📱 Point camera at a flat surface</li>
                    <li>👆 Tap to place the model</li>
                    <li>🔄 Tap model to rotate</li>
                    <li>⚙️ Use the size control to calibrate scale</li>
                    <li>🚶 Walk around to view from all angles</li>
                </ul>
            </div>

            {/* AR Badge */}
            <div className="absolute z-10 px-3 py-2 text-xs font-bold text-white rounded-full bottom-4 right-4 bg-heritage-accent/80 backdrop-blur-sm">
                AR Ready
            </div>
        </div>
    );
}
