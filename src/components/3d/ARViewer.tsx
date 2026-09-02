/**
 * AR Experience Component
 * WebXR-based AR viewer for heritage sites
 * Must be client-side only
 */

'use client';

import {
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
    type RefObject
} from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, XRDomOverlay, XRSpace, createXRStore } from '@react-three/xr';
import {
    useGLTF,
    Html,
    Environment,
    Center
} from '@react-three/drei';
import * as THREE from 'three';
import { useARSupport } from '@/hooks/useARSupport';
import { useARPlacement } from '@/hooks/useARPlacement';
import { computeNormalizedScale } from '@/lib/model-sizing';

const AR_TARGET_SIZE = 1;
const CALIBRATION_MIN = 0.25;
const CALIBRATION_MAX = 3;
const CALIBRATION_STEP = 0.1;

export type ARScaleMode = 'preview' | 'real';

/** Preview trim and real-scale trim are stored separately on purpose. Preview
 * defaults to the call site's `scale` (0.5 on the site page) for a tabletop
 * look; real scale must default to 1.0 or a "true scale" toggle would silently
 * render at half size. Sharing one key would corrupt whichever mode was set second. */
function previewStorageKey(modelUrl: string) {
    return `ar-scale:${modelUrl}`;
}
function realTrimStorageKey(modelUrl: string) {
    return `ar-real-trim:${modelUrl}`;
}
function modeStorageKey(modelUrl: string) {
    return `ar-scale-mode:${modelUrl}`;
}

function loadStoredNumber(key: string, fallback: number): number {
    if (typeof window === 'undefined') return fallback;
    try {
        const raw = window.localStorage.getItem(key);
        const parsed = raw !== null ? parseFloat(raw) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    } catch {
        return fallback;
    }
}

function loadStoredMode(modelUrl: string): ARScaleMode {
    if (typeof window === 'undefined') return 'preview';
    try {
        return window.localStorage.getItem(modeStorageKey(modelUrl)) === 'real' ? 'real' : 'preview';
    } catch {
        return 'preview';
    }
}

function persist(key: string, value: string) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(key, value);
    } catch (err) {
        console.error('Failed to persist AR scale setting:', err);
    }
}

interface ARViewerProps {
    modelUrl: string;
    title?: string;
    /** Fixed default size multiplier for this call site, applied on top of
     * the model's own bounding-box-normalized scale. Acts as the "reset"
     * target for the in-AR size calibration control. */
    scale?: number;
    /** Multiplier from the model's authored units to real-world metres, from
     * `Asset.realScaleFactor`. null/undefined means the model has not been
     * calibrated, which disables the real-scale control. */
    realScaleFactor?: number | null;
    onLoad?: () => void;
    onError?: (error: Error) => void;
}

interface ARModelProps {
    url: string;
    /** Fine-trim multiplier applied in both modes. */
    calibration: number;
    scaleMode: ARScaleMode;
    realScaleFactor: number | null;
    onLoad?: () => void;
    onError?: (error: Error) => void;
}

function ARModel({ url, calibration, scaleMode, realScaleFactor, onLoad }: ARModelProps) {
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

    // preview: normalize the model to AR_TARGET_SIZE so every site looks like a
    // tabletop object. real: ignore the bounding box entirely and use the
    // measured authored-units-to-metres factor, so the model appears at life size.
    const effectiveScale =
        scaleMode === 'real' && realScaleFactor !== null
            ? realScaleFactor * calibration
            : baseScale * calibration;

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
            rotation={[0, rotation, 0]}
            scale={effectiveScale}
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
    scaleMode,
    realScaleFactor,
    onDecrease,
    onIncrease,
    onReset,
    onToggleMode
}: {
    calibration: number;
    scaleMode: ARScaleMode;
    realScaleFactor: number | null;
    onDecrease: () => void;
    onIncrease: () => void;
    onReset: () => void;
    onToggleMode: () => void;
}) {
    const canUseRealScale = realScaleFactor !== null;
    // The number to transcribe into /admin/scale once the size looks right.
    const effectiveFactor = canUseRealScale ? realScaleFactor * calibration : null;

    return (
        <div className="flex flex-col gap-2 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg pointer-events-auto">
            <div className="flex items-center gap-2">
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

            <button
                onClick={onToggleMode}
                disabled={!canUseRealScale}
                aria-pressed={scaleMode === 'real'}
                title={
                    canUseRealScale
                        ? 'Toggle real-world scale'
                        : 'This model has no real-world scale set yet (Admin -> Real-World Scale)'
                }
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary disabled:opacity-40"
            >
                {scaleMode === 'real' ? '📐 Real scale: ON' : '📐 Real scale: OFF'}
            </button>

            {scaleMode === 'real' && effectiveFactor !== null && (
                <span className="opacity-90">
                    Effective factor <strong>{effectiveFactor.toFixed(3)}</strong> — enter this in
                    Admin → Real-World Scale
                </span>
            )}
        </div>
    );
}

/** Renders the hit-test reticle and, once placed, the model inside the
 * anchor's tracked space. Falls back to the original fixed position so
 * devices without hit-test/anchor support still see the model. */
function ARPlacement({
    anchor,
    reticleRef,
    children
}: {
    anchor: XRAnchor | undefined;
    reticleRef: RefObject<THREE.Group>;
    children: ReactNode;
}) {
    return (
        <>
            <group ref={reticleRef} visible={false}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.12, 0.15, 32]} />
                    <meshBasicMaterial color="#ffffff" toneMapped={false} />
                </mesh>
            </group>

            {anchor ? (
                <XRSpace space={anchor.anchorSpace}>{children}</XRSpace>
            ) : (
                // Unplaced, or anchors unsupported: keep the pre-existing behaviour
                // so the model is always visible rather than waiting on a surface.
                <group position={[0, 0, -2]}>{children}</group>
            )}
        </>
    );
}

/** Owns the placement lifecycle. Lives inside <XR> because useARPlacement
 * calls R3F hooks, and renders the in-session overlay alongside the 3D
 * content so both read the same placement state. */
function ARScene({
    modelUrl,
    calibration,
    scaleMode,
    realScaleFactor,
    error,
    onLoad,
    onError,
    controls
}: {
    modelUrl: string;
    calibration: number;
    scaleMode: ARScaleMode;
    realScaleFactor: number | null;
    error: string | null;
    onLoad: () => void;
    onError: (err: Error) => void;
    controls: ReactNode;
}) {
    const { state, anchor, reticleRef, place, reset } = useARPlacement();

    const hint =
        state === 'scanning'
            ? 'Point your camera at the floor to find a surface'
            : state === 'ready'
              ? 'Tap Place to put the model on the surface'
              : 'Placed - walk around to view it';

    return (
        <>
            <ARPlacement anchor={anchor} reticleRef={reticleRef}>
                <Suspense fallback={<LoadingPlaceholder />}>
                    {error ? (
                        <ErrorPlaceholder message={error} />
                    ) : (
                        <ARModel
                            url={modelUrl}
                            calibration={calibration}
                            scaleMode={scaleMode}
                            realScaleFactor={realScaleFactor}
                            onLoad={onLoad}
                            onError={onError}
                        />
                    )}
                </Suspense>
            </ARPlacement>

            <XRDomOverlay>
                <div className="absolute inset-x-0 flex justify-center bottom-28">
                    <p className="px-3 py-2 text-xs text-white rounded-lg bg-black/60 backdrop-blur-sm">
                        {hint}
                    </p>
                </div>
                <div className="absolute flex flex-col items-end gap-2 bottom-6 right-4">
                    {controls}
                    {state === 'placed' ? (
                        <button
                            onClick={reset}
                            className="px-4 py-2 text-sm font-semibold rounded-lg pointer-events-auto text-heritage-dark bg-heritage-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary"
                        >
                            Move
                        </button>
                    ) : (
                        <button
                            onClick={place}
                            disabled={state !== 'ready'}
                            className="px-4 py-2 text-sm font-semibold rounded-lg pointer-events-auto text-heritage-dark bg-heritage-primary disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary"
                        >
                            Place
                        </button>
                    )}
                </div>
            </XRDomOverlay>
        </>
    );
}

export function ARViewer({
    modelUrl,
    title,
    scale = 0.5,
    realScaleFactor = null,
    onLoad,
    onError
}: ARViewerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showOptions, setShowOptions] = useState(false);
    const [scaleMode, setScaleMode] = useState<ARScaleMode>(() => loadStoredMode(modelUrl));
    const [previewTrim, setPreviewTrim] = useState(() =>
        loadStoredNumber(previewStorageKey(modelUrl), scale)
    );
    const [realTrim, setRealTrim] = useState(() => loadStoredNumber(realTrimStorageKey(modelUrl), 1));
    const { isSupported: isARSupported } = useARSupport();

    useEffect(() => {
        setScaleMode(loadStoredMode(modelUrl));
        setPreviewTrim(loadStoredNumber(previewStorageKey(modelUrl), scale));
        setRealTrim(loadStoredNumber(realTrimStorageKey(modelUrl), 1));
    }, [modelUrl, scale]);

    // A model with no calibration must never sit in real mode - it would render
    // at the raw authored units, which are arbitrary.
    useEffect(() => {
        if (realScaleFactor === null && scaleMode === 'real') {
            setScaleMode('preview');
        }
    }, [realScaleFactor, scaleMode]);

    const calibration = scaleMode === 'real' ? realTrim : previewTrim;

    const updateCalibration = useCallback(
        (value: number) => {
            const clamped = Math.min(CALIBRATION_MAX, Math.max(CALIBRATION_MIN, value));
            if (scaleMode === 'real') {
                setRealTrim(clamped);
                persist(realTrimStorageKey(modelUrl), String(clamped));
            } else {
                setPreviewTrim(clamped);
                persist(previewStorageKey(modelUrl), String(clamped));
            }
        },
        [modelUrl, scaleMode]
    );

    const handleToggleMode = useCallback(() => {
        setScaleMode((prev) => {
            const next: ARScaleMode = prev === 'real' ? 'preview' : 'real';
            persist(modeStorageKey(modelUrl), next);
            return next;
        });
    }, [modelUrl]);

    const handleCalibrateDecrease = () => updateCalibration(calibration - CALIBRATION_STEP);
    const handleCalibrateIncrease = () => updateCalibration(calibration + CALIBRATION_STEP);
    const handleCalibrateReset = () => updateCalibration(scaleMode === 'real' ? 1 : scale);

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
    const [store] = useState(() =>
        createXRStore({ hitTest: true, anchors: true, domOverlay: true })
    );

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
                        scaleMode={scaleMode}
                        realScaleFactor={realScaleFactor}
                        onDecrease={handleCalibrateDecrease}
                        onIncrease={handleCalibrateIncrease}
                        onReset={handleCalibrateReset}
                        onToggleMode={handleToggleMode}
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

                    {/* Placement, model and in-session overlay */}
                    <ARScene
                        modelUrl={modelUrl}
                        calibration={calibration}
                        scaleMode={scaleMode}
                        realScaleFactor={realScaleFactor}
                        error={error}
                        onLoad={handleLoad}
                        onError={handleError}
                        controls={
                            <CalibrationControls
                                calibration={calibration}
                                scaleMode={scaleMode}
                                realScaleFactor={realScaleFactor}
                                onDecrease={handleCalibrateDecrease}
                                onIncrease={handleCalibrateIncrease}
                                onReset={handleCalibrateReset}
                                onToggleMode={handleToggleMode}
                            />
                        }
                    />
                </XR>
            </Canvas>

            {/* Help Text */}
            <div className="absolute z-10 max-w-xs p-3 text-xs text-white rounded-lg bottom-4 left-4 bg-black/50 backdrop-blur-sm">
                <p className="mb-1 font-semibold">AR Instructions:</p>
                <ul className="space-y-1 opacity-90">
                    <li>📱 Point the camera at a flat surface</li>
                    <li>🎯 Tap Place when the ring appears</li>
                    <li>📐 Use Real scale for true size</li>
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
