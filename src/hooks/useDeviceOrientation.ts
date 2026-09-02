/**
 * Device orientation (gyroscope) hook.
 * Converts raw alpha/beta/gamma readings into a camera-ready quaternion and
 * handles the iOS 13+ user-gesture permission flow. Android/other browsers
 * need no permission call; support is confirmed by actually receiving an
 * event, since some desktop/emulator browsers expose the API but never fire it.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type PermissionState = 'unnecessary' | 'prompt' | 'granted' | 'denied' | 'unsupported';

type OrientationListener = (quaternion: THREE.Quaternion) => void;

interface DeviceOrientationEventConstructorWithPermission {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

const zAxis = new THREE.Vector3(0, 0, 1);
const halfTurnAroundX = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
const screenTransform = new THREE.Quaternion();
const workingEuler = new THREE.Euler();

function screenOrientationAngle(): number {
  if (typeof window === 'undefined') return 0;
  if (window.screen?.orientation?.angle !== undefined) return window.screen.orientation.angle;
  const legacyOrientation = (window as unknown as { orientation?: number }).orientation;
  return legacyOrientation ?? 0;
}

function computeCameraQuaternion(
  target: THREE.Quaternion,
  alpha: number,
  beta: number,
  gamma: number,
  screenAngle: number
) {
  const x = THREE.MathUtils.degToRad(beta);
  const y = THREE.MathUtils.degToRad(gamma);
  const z = THREE.MathUtils.degToRad(alpha);
  const orient = THREE.MathUtils.degToRad(screenAngle);

  workingEuler.set(x, y, -z, 'YXZ');
  target.setFromEuler(workingEuler);
  target.multiply(halfTurnAroundX);
  target.multiply(screenTransform.setFromAxisAngle(zAxis, -orient));
}

export function useDeviceOrientation() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');
  const listenersRef = useRef(new Set<OrientationListener>());
  const quaternionRef = useRef(new THREE.Quaternion());

  useEffect(() => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setIsSupported(false);
      setPermissionState('unsupported');
      return;
    }

    const requestFn = (
      DeviceOrientationEvent as unknown as DeviceOrientationEventConstructorWithPermission
    ).requestPermission;

    if (typeof requestFn === 'function') {
      // iOS 13+: support can't be confirmed until the user grants permission
      // via a tap-triggered requestPermission() call.
      setPermissionState('prompt');
      return;
    }

    setPermissionState('unnecessary');

    let received = false;
    const timeout = window.setTimeout(() => {
      if (!received) setIsSupported(false);
    }, 1500);

    const probe = (event: DeviceOrientationEvent) => {
      if (event.alpha === null && event.beta === null && event.gamma === null) return;
      received = true;
      setIsSupported(true);
      window.clearTimeout(timeout);
    };

    window.addEventListener('deviceorientation', probe);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('deviceorientation', probe);
    };
  }, []);

  useEffect(() => {
    if (permissionState !== 'granted' && permissionState !== 'unnecessary') return undefined;
    if (typeof window === 'undefined') return undefined;

    const handle = (event: DeviceOrientationEvent) => {
      if (event.alpha === null || event.beta === null || event.gamma === null) return;
      computeCameraQuaternion(
        quaternionRef.current,
        event.alpha,
        event.beta,
        event.gamma,
        screenOrientationAngle()
      );
      listenersRef.current.forEach((listener) => listener(quaternionRef.current));
    };

    window.addEventListener('deviceorientation', handle);
    return () => window.removeEventListener('deviceorientation', handle);
  }, [permissionState]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return false;

    const requestFn = (
      DeviceOrientationEvent as unknown as DeviceOrientationEventConstructorWithPermission
    ).requestPermission;

    if (typeof requestFn !== 'function') {
      setPermissionState('unnecessary');
      setIsSupported(true);
      return true;
    }

    try {
      const result = await requestFn();
      const granted = result === 'granted';
      setPermissionState(granted ? 'granted' : 'denied');
      setIsSupported(granted);
      return granted;
    } catch (err) {
      console.error('Device orientation permission request failed:', err);
      setPermissionState('denied');
      setIsSupported(false);
      return false;
    }
  }, []);

  const subscribe = useCallback((listener: OrientationListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  return { isSupported, permissionState, requestPermission, subscribe };
}
