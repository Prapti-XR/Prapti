/**
 * Immersive VR Viewer Component
 * Renders a heritage site's 3D model centered as the focal object inside its
 * 360° panorama environment, enterable in VR (WebXR immersive-vr) with an
 * orbit/look-around fallback on desktop and mobile.
 * Must be client-side only (dynamic import with ssr:false + ThreeErrorBoundary).
 */

'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import {
    OrbitControls,
    PerspectiveCamera,
    Environment,
    useGLTF,
    useTexture,
    Html,
    Center
} from '@react-three/drei';
import * as THREE from 'three';

interface ImmersiveViewerProps {
    modelUrl?: string | null;
    panoramaUrl?: string | null;
    title?: string;
    modelScale?: number;
    /** Where the model sits in the scene. Default is in front of the VR spawn point at eye height. */
    modelPosition?: [number, number, number];
    onLoad?: () => void;
    onError?: (error: Error) => void;
}

interface PanoramaSurroundProps {
    imageUrl: string;
    onLoad?: () => void;
}

/** The surround: inverted equirectangular sphere, same recipe as PanoramaViewer. */
function PanoramaSurround({ imageUrl, onLoad }: PanoramaSurroundProps) {
    const texture = useTexture(imageUrl, (loadedTexture) => {
        loadedTexture.mapping = THREE.EquirectangularReflectionMapping;
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.minFilter = THREE.LinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;

        if (onLoad) onLoad();
    });

    return (
        <mesh scale={[-1, 1, 1]}>
            <sphereGeometry args={[500, 60, 40]} />
            <meshBasicMaterial
                map={texture}
                side={THREE.BackSide}
                toneMapped={false}
            />
        </mesh>
    );
}

interface FocalModelProps {
    url: string;
    scale: number;
    position: [number, number, number];
    onLoad?: () => void;
}

/** The focal object: centered GLTF, same recipe as ModelViewer. */
function FocalModel({ url, scale, position, onLoad }: FocalModelProps) {
    const hasCalledOnLoad = useRef(false);

    // Hooks must be unconditional — load errors suspend/throw and are
    // handled by the surrounding <Suspense> and ThreeErrorBoundary.
    const { scene } = useGLTF(url);

    if (scene && onLoad && !hasCalledOnLoad.current) {
        hasCalledOnLoad.current = true;
        onLoad();
    }

    return (
        <group position={position} scale={scale}>
            <Center>
                <primitive object={scene} dispose={null} />
            </Center>
        </group>
    );
}

function LoadingPlaceholder() {
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center p-6 bg-black/50 backdrop-blur-sm rounded-lg text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heritage-primary mb-3"></div>
                <p className="text-sm whitespace-nowrap">Loading Immersive View...</p>
            </div>
        </Html>
    );
}

export function ImmersiveViewer({
    modelUrl,
    panoramaUrl,
    title,
    modelScale = 1,
    modelPosition = [0, 1, -2.5],
    onLoad,
    onError
}: ImmersiveViewerProps) {
    const [isLoading, setIsLoading] = useState(Boolean(modelUrl || panoramaUrl));
    const [isVRSupported, setIsVRSupported] = useState<boolean | null>(null);

    // Create XR store once per mount (recreating it every render resets XR state)
    const [store] = useState(() => createXRStore());

    const handleLoad = () => {
        setIsLoading(false);
        if (onLoad) onLoad();
    };

    // Check WebXR immersive-vr support (mirrors ARViewer's immersive-ar check)
    useEffect(() => {
        const checkVRSupport = async () => {
            if (typeof navigator === 'undefined' || !navigator.xr) {
                setIsVRSupported(false);
                return;
            }

            try {
                const supported = await navigator.xr.isSessionSupported('immersive-vr');
                setIsVRSupported(supported);
            } catch (err) {
                console.error('WebXR VR check failed:', err);
                setIsVRSupported(false);
            }
        };

        checkVRSupport();
    }, []);

    // Report texture/model failures upward without crashing the page
    useEffect(() => {
        if (!modelUrl && !panoramaUrl && onError) {
            onError(new Error('No 3D model or panorama available for this site'));
        }
    }, [modelUrl, panoramaUrl, onError]);

    // Comfortable default framing: camera offset from the focal model
    const cameraPosition: [number, number, number] = [
        modelPosition[0] + 2,
        modelPosition[1] + 0.8,
        modelPosition[2] + 2.5,
    ];

    if (!modelUrl && !panoramaUrl) {
        return (
            <div className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-heritage-dark to-heritage-dark-deep rounded-xl overflow-hidden shadow-xl flex items-center justify-center">
                <div className="flex flex-col items-center justify-center max-w-md p-8 mx-4 text-white rounded-xl bg-heritage-secondary/40 backdrop-blur-sm border border-heritage-primary/30 text-center">
                    <h3 className="mb-2 font-serif text-xl font-bold">Nothing to show yet</h3>
                    <p className="text-sm opacity-90">
                        This site has no 3D model or 360° panorama. Check back once assets are added.
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
                    <p className="text-sm text-white/80">
                        {isVRSupported
                            ? 'Put on your headset and press Enter VR'
                            : 'Drag to look around the site'}
                    </p>
                </div>
            )}

            {/* Enter VR / unsupported notice */}
            <div className="absolute z-10 flex flex-col items-center gap-2 -translate-x-1/2 bottom-6 left-1/2">
                {isVRSupported ? (
                    <button
                        onClick={() => store.enterVR()}
                        className="px-8 py-4 text-lg font-bold text-heritage-dark transition-all bg-heritage-primary rounded-full shadow-lg hover:bg-heritage-primary/90 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-primary focus-visible:ring-offset-2 focus-visible:ring-offset-heritage-dark"
                    >
                        Enter VR
                    </button>
                ) : isVRSupported === false ? (
                    <div className="flex items-center gap-2 px-4 py-2 text-xs text-heritage-primary-soft rounded-full bg-heritage-primary/20 backdrop-blur-sm">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>VR headset not detected — explore in 360° with drag and scroll</span>
                    </div>
                ) : null}
            </div>

            {/* Loading Indicator */}
            {isLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-heritage-dark/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 mb-4 border-b-2 border-heritage-primary rounded-full animate-spin"></div>
                        <p className="text-lg font-semibold text-white">Preparing Immersive View...</p>
                    </div>
                </div>
            )}

            {/* Canvas */}
            <Canvas
                className="w-full h-full"
                dpr={[1, 2]}
                gl={{ antialias: true }}
            >
                <XR store={store}>
                    <PerspectiveCamera makeDefault position={cameraPosition} fov={60} />

                    {/* Lighting (the panorama sphere is unlit; the model needs this rig) */}
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <directionalLight position={[-10, 10, -5]} intensity={0.4} />
                    <hemisphereLight args={['#ffffff', '#96ADC8', 0.4]} position={[0, 50, 0]} />

                    <Suspense fallback={<LoadingPlaceholder />}>
                        {/* The surround: panorama sphere, or an Environment backdrop when absent */}
                        {panoramaUrl ? (
                            <PanoramaSurround
                                imageUrl={panoramaUrl}
                                onLoad={modelUrl ? undefined : handleLoad}
                            />
                        ) : (
                            <Environment preset="sunset" background />
                        )}

                        {/* The focal object: centered model (skipped gracefully when absent) */}
                        {modelUrl && (
                            <FocalModel
                                url={modelUrl}
                                scale={modelScale}
                                position={modelPosition}
                                onLoad={handleLoad}
                            />
                        )}
                    </Suspense>

                    {/* Non-VR fallback: orbit around the focal point */}
                    <OrbitControls
                        target={modelPosition}
                        enableDamping
                        dampingFactor={0.05}
                        minDistance={1}
                        maxDistance={40}
                        autoRotate={!modelUrl}
                        autoRotateSpeed={0.3}
                    />
                </XR>
            </Canvas>

            {/* Help Text */}
            <div className="absolute z-10 max-w-xs p-3 text-xs text-white rounded-lg bottom-4 left-4 bg-black/50 backdrop-blur-sm hidden sm:block">
                <p className="mb-1 font-semibold">Controls:</p>
                <ul className="space-y-1 opacity-90">
                    <li>🖱️ Drag: Look around</li>
                    <li>🔍 Scroll: Zoom</li>
                    {isVRSupported && <li>🥽 Enter VR: Step inside</li>}
                </ul>
            </div>

            {/* VR Badge */}
            <div className="absolute z-10 px-3 py-2 text-xs font-bold text-white rounded-full top-4 right-4 bg-heritage-accent/80 backdrop-blur-sm">
                VR View
            </div>
        </div>
    );
}
