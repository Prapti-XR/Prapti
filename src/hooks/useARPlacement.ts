/**
 * WebXR floor placement for AR.
 * Runs a continuous hit test from the viewer, drives a reticle on the detected
 * surface, and on request creates an XRAnchor at that hit. Rendering the model
 * inside the anchor's space is what stops it drifting: an object at a fixed
 * scene coordinate is not attached to anything the device is tracking, so it
 * slides as ARCore refines its pose estimate.
 *
 * Must be called from a component rendered inside <XR>.
 */

'use client';

import { useCallback, useRef, useState } from 'react';
import * as THREE from 'three';
import { useXRAnchor, useXRHitTest } from '@react-three/xr';

export type ARPlacementState = 'scanning' | 'ready' | 'placed';

export function useARPlacement() {
  const [state, setState] = useState<ARPlacementState>('scanning');
  const [anchor, createAnchor] = useXRAnchor();
  const reticleRef = useRef<THREE.Group>(null);
  const latestHit = useRef<XRHitTestResult | null>(null);
  const matrix = useRef(new THREE.Matrix4());

  useXRHitTest(
    (results, getWorldMatrix) => {
      // Once anchored, the anchor owns the transform; stop moving the reticle.
      if (state === 'placed') return;

      const hit = results[0];
      if (!hit) {
        latestHit.current = null;
        if (reticleRef.current) reticleRef.current.visible = false;
        setState((prev) => (prev === 'scanning' ? prev : 'scanning'));
        return;
      }

      latestHit.current = hit;

      if (reticleRef.current && getWorldMatrix(matrix.current, hit)) {
        reticleRef.current.visible = true;
        matrix.current.decompose(
          reticleRef.current.position,
          reticleRef.current.quaternion,
          reticleRef.current.scale
        );
        // The hit matrix can carry a non-unit scale; the reticle must not inherit it.
        reticleRef.current.scale.setScalar(1);
      }

      setState((prev) => (prev === 'ready' ? prev : 'ready'));
    },
    'viewer',
    ['plane', 'mesh']
  );

  const place = useCallback(async () => {
    const hit = latestHit.current;
    if (!hit) return;
    const created = await createAnchor({ relativeTo: 'hit-test-result', hitTestResult: hit });
    if (created) {
      if (reticleRef.current) reticleRef.current.visible = false;
      setState('placed');
    }
  }, [createAnchor]);

  const reset = useCallback(() => setState('scanning'), []);

  return { state, anchor, reticleRef, place, reset };
}
