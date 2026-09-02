/**
 * Shared WebXR immersive-ar support check.
 * Consolidates the navigator.xr?.isSessionSupported('immersive-ar') check
 * that used to be duplicated across ARViewer, ImmersiveViewer, and /ar.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

export function useARSupport() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const check = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !navigator.xr) {
      setIsSupported(false);
      setIsChecking(false);
      return false;
    }

    try {
      const supported = await navigator.xr.isSessionSupported('immersive-ar');
      setIsSupported(supported);
      setIsChecking(false);
      return supported;
    } catch (err) {
      console.error('WebXR AR support check failed:', err);
      setIsSupported(false);
      setIsChecking(false);
      return false;
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { isSupported, isChecking, check };
}
