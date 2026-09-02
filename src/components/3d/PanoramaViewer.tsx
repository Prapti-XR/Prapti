/**
 * 360° Panorama Viewer Component
 * Displays panoramic images of heritage sites
 */

'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useTexture, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

const MIN_FOV = 30;
const MAX_FOV = 120;

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

/** Applies `fov` to the live camera every time it changes — the Canvas
 * `camera` prop only sets the initial FOV at creation, so this is required
 * for the zoom controls to have any visible effect. */
function FovController({ fov }: { fov: number }) {
    const { camera } = useThree();

    useEffect(() => {
        if (camera instanceof THREE.PerspectiveCamera) {
            camera.fov = fov;
            camera.updateProjectionMatrix();
        }
    }, [camera, fov]);

    return null;
}

/** Exponential smoothing rate for the gyro camera, in units of 1/second.
 * Higher is more responsive and less smooth; ~12 settles in roughly 80ms,
 * which damps sensor noise without feeling laggy when you turn your head. */
const GYRO_SMOOTHING_RATE = 12;
/** Drives the camera's look direction directly from device orientation
 * readings while gyro mode is active. Mounted only in gyro mode so it never
 * fights OrbitControls for control of the camera transform. */
function GyroCameraController({
    subscribe
}: {
    subscribe: (listener: (quaternion: THREE.Quaternion) => void) => () => void;
}) {
    const { camera } = useThree();
    const targetQuaternion = useRef<THREE.Quaternion | null>(null);
    const hasSnapped = useRef(false);

    useEffect(() => {
        return subscribe((quaternion) => {
            // The hook reuses one quaternion instance across events, so copy
            // rather than alias it — otherwise the smoothing target mutates
            // underneath the slerp between frames.
            if (targetQuaternion.current === null) {
                targetQuaternion.current = quaternion.clone();
            } else {
                targetQuaternion.current.copy(quaternion);
            }
        });
    }, [subscribe]);

    useFrame((_state, delta) => {
        const target = targetQuaternion.current;
        if (!target) return;

        // Snap on the first reading; easing in from the identity quaternion
        // would swing the view across the scene on entry.
        if (!hasSnapped.current) {
            camera.quaternion.copy(target);
            hasSnapped.current = true;
            return;
        }

        // Raw deviceorientation readings carry visible sensor noise, and
        // copying them straight onto the camera transmits every bit of it.
        // Exponential smoothing is frame-rate independent, so the damping
        // feels identical at 60fps and 120fps; delta is clamped so a stalled
        // frame cannot produce a jump.
        const t = 1 - Math.exp(-GYRO_SMOOTHING_RATE * Math.min(delta, 0.1));
        camera.quaternion.slerp(target, t);
    });

    return null;
}

function LoadingPlaceholder() {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center p-6 bg-black/50 backdrop-blur-sm rounded-lg text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heritage-primary mb-3"></div>
                <p className="text-sm whitespace-nowrap">Loading Panorama... {progress.toFixed(0)}%</p>
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

function touchDistance(touches: TouchList): number {
    const a = touches[0];
    const b = touches[1];
    if (!a || !b) return 0;
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
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
    const [controlMode, setControlMode] = useState<'gyro' | 'drag'>('drag');
    const [hasManualOverride, setHasManualOverride] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const pinchStartDistanceRef = useRef<number | null>(null);

    const {
        isSupported: gyroSupported,
        permissionState: gyroPermissionState,
        requestPermission: requestGyroPermission,
        subscribe: subscribeGyro
    } = useDeviceOrientation();

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

    const adjustFov = useCallback((delta: number) => {
        setCurrentFov((prev) => Math.min(MAX_FOV, Math.max(MIN_FOV, prev + delta)));
    }, []);

    const handleZoomIn = () => adjustFov(-10);
    const handleZoomOut = () => adjustFov(10);

    const handleResetView = () => {
        setCurrentFov(initialFov);
    };

    // Auto-enable gyro look-around once it's confirmed available, unless the
    // user has explicitly picked a mode via the toggle button.
    useEffect(() => {
        if (hasManualOverride) return;
        if (gyroSupported && (gyroPermissionState === 'granted' || gyroPermissionState === 'unnecessary')) {
            setControlMode('gyro');
        }
    }, [gyroSupported, gyroPermissionState, hasManualOverride]);

    const toggleControlMode = () => {
        setHasManualOverride(true);
        setControlMode((prev) => (prev === 'gyro' ? 'drag' : 'gyro'));
    };

    const handleEnableMotion = async () => {
        const granted = await requestGyroPermission();
        if (granted) {
            setHasManualOverride(false);
            setControlMode('gyro');
        }
    };

    // Pinch-to-zoom: track two-finger touch distance and translate deltas
    // into FOV changes, clamped the same way the zoom buttons are.
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return undefined;

        const handleTouchStart = (event: TouchEvent) => {
            if (event.touches.length === 2) {
                pinchStartDistanceRef.current = touchDistance(event.touches);
            }
        };

        const handleTouchMove = (event: TouchEvent) => {
            if (event.touches.length === 2 && pinchStartDistanceRef.current !== null) {
                event.preventDefault();
                const newDistance = touchDistance(event.touches);
                const delta = pinchStartDistanceRef.current - newDistance;
                if (Math.abs(delta) > 4) {
                    adjustFov(delta > 0 ? 5 : -5);
                    pinchStartDistanceRef.current = newDistance;
                }
            }
        };

        const handleTouchEnd = (event: TouchEvent) => {
            if (event.touches.length < 2) {
                pinchStartDistanceRef.current = null;
            }
        };

        el.addEventListener('touchstart', handleTouchStart, { passive: true });
        el.addEventListener('touchmove', handleTouchMove, { passive: false });
        el.addEventListener('touchend', handleTouchEnd, { passive: true });
        el.addEventListener('touchcancel', handleTouchEnd, { passive: true });

        return () => {
            el.removeEventListener('touchstart', handleTouchStart);
            el.removeEventListener('touchmove', handleTouchMove);
            el.removeEventListener('touchend', handleTouchEnd);
            el.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [adjustFov]);

    const handleWheel = (event: React.WheelEvent) => {
        adjustFov(event.deltaY > 0 ? 5 : -5);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-heritage-dark to-heritage-dark-deep rounded-xl overflow-hidden shadow-xl"
            onWheel={handleWheel}
        >
            {/* Header */}
            {(title || description) && (
                <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4">
                    {title && (
                        <h3 className="font-serif text-xl font-bold text-white mb-1">{title}</h3>
                    )}
                    {description && (
                        <p className="text-sm text-gray-200">{description}</p>
                    )}
                </div>
            )}

            {/* Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-wrap justify-end gap-2 max-w-[220px]">
                <button
                    onClick={handleZoomIn}
                    className="flex items-center justify-center w-11 h-11 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary disabled:opacity-40"
                    title="Zoom In"
                    aria-label="Zoom in"
                    disabled={currentFov <= MIN_FOV}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                </button>
                <button
                    onClick={handleZoomOut}
                    className="flex items-center justify-center w-11 h-11 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary disabled:opacity-40"
                    title="Zoom Out"
                    aria-label="Zoom out"
                    disabled={currentFov >= MAX_FOV}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                    </svg>
                </button>
                <button
                    onClick={handleResetView}
                    className="flex items-center justify-center w-11 h-11 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary disabled:opacity-40"
                    title="Reset View"
                    aria-label="Reset view"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
                {gyroPermissionState === 'prompt' && (
                    <button
                        onClick={handleEnableMotion}
                        className="flex items-center justify-center w-11 h-11 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary"
                        title="Enable Motion Look-Around"
                        aria-label="Enable motion look-around"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                        </svg>
                    </button>
                )}
                {gyroSupported && gyroPermissionState !== 'prompt' && (
                    <button
                        onClick={toggleControlMode}
                        className="flex items-center justify-center w-11 h-11 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary"
                        title={controlMode === 'gyro' ? 'Switch to Drag Mode' : 'Switch to Motion Mode'}
                        aria-label={controlMode === 'gyro' ? 'Switch to drag mode' : 'Switch to motion mode'}
                        aria-pressed={controlMode === 'gyro'}
                    >
                        {controlMode === 'gyro' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V9a5 5 0 0110 0v2.5M5 13.5h14l-1 7a2 2 0 01-2 1.5H8a2 2 0 01-2-1.5l-1-7z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="2" width="12" height="20" rx="2" strokeWidth={2} />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01" />
                            </svg>
                        )}
                    </button>
                )}
                <button
                    onClick={toggleFullscreen}
                    className="flex items-center justify-center w-11 h-11 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary disabled:opacity-40"
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
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
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-heritage-primary mb-4"></div>
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

                <FovController fov={currentFov} />

                {/* Camera Controls */}
                {controlMode === 'drag' ? (
                    <OrbitControls
                        autoRotate={autoRotate}
                        autoRotateSpeed={0.5}
                        enableDamping
                        dampingFactor={0.05}
                        enableZoom={false}
                        enablePan={false}
                        rotateSpeed={-0.5}
                        minDistance={0.1}
                        maxDistance={0.1}
                    />
                ) : (
                    <GyroCameraController subscribe={subscribeGyro} />
                )}
            </Canvas>

            {/* Help Text */}
            <div className="absolute bottom-4 left-4 z-10 bg-black/50 backdrop-blur-sm text-white text-xs p-3 rounded-lg">
                <p className="font-semibold mb-1">Controls:</p>
                <ul className="space-y-1 opacity-90">
                    {controlMode === 'gyro' ? (
                        <li>🧭 Move Phone: Look Around</li>
                    ) : (
                        <>
                            <li>🖱️ Click + Drag: Look Around</li>
                            <li>📱 Touch: Swipe to Look</li>
                        </>
                    )}
                    <li>🎡 Scroll / Pinch: Zoom In/Out</li>
                </ul>
            </div>

            {/* 360° Badge */}
            <div className="absolute bottom-4 right-4 z-10 bg-heritage-accent/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 rounded-full">
                360°
            </div>
        </div>
    );
}
