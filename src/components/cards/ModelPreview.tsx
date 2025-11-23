/**
 * Optimized 3D Model Preview Component
 * Lightweight preview for card displays with performance optimizations
 * Uses frameloop="demand" to prevent WebGL context loss
 */

'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { Suspense, useEffect, useRef } from 'react';

interface ModelPreviewProps {
    modelUrl: string;
}

function Model({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    // Clone scene to avoid shared state issues between multiple cards
    const clonedScene = useRef(scene.clone()).current;
    return <primitive object={clonedScene} scale={1.5} />;
}

export function ModelPreview({ modelUrl }: ModelPreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Cleanup WebGL context on unmount to prevent context loss
    useEffect(() => {
        return () => {
            if (containerRef.current) {
                const canvas = containerRef.current.querySelector('canvas');
                if (canvas) {
                    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
                    if (gl) {
                        const loseContextExt = gl.getExtension('WEBGL_lose_context');
                        loseContextExt?.loseContext();
                    }
                }
            }
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full">
            <Canvas
                camera={{ position: [0, 2, 5], fov: 50 }}
                gl={{
                    antialias: false,
                    powerPreference: "low-power",
                    preserveDrawingBuffer: false,
                }}
                dpr={[1, 1.5]}
                frameloop="demand" // Only render when needed - prevents context loss
            >
                <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={0.8} />
                    <Model url={modelUrl} />
                    <Environment preset="apartment" />
                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        autoRotate
                        autoRotateSpeed={2}
                        maxPolarAngle={Math.PI / 2}
                        minPolarAngle={Math.PI / 3}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
