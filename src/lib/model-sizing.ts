/**
 * Derives a consistent, deterministic scale for a loaded GLTF scene from its
 * own bounding box, so models exported at wildly different real-world units
 * still appear at a sensible, fixed size instead of whatever raw scale they
 * were authored at.
 */

import * as THREE from 'three';

export function computeNormalizedScale(object: THREE.Object3D, targetSize = 1): number {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);
    return maxDimension > 0 ? targetSize / maxDimension : 1;
}
