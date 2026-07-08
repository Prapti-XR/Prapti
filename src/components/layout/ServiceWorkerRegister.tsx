'use client';

import { useEffect } from 'react';

/**
 * Registers /sw.js in production so visited site pages read offline.
 * Skipped in development — the SW would fight Next's HMR.
 */
export function ServiceWorkerRegister() {
    useEffect(() => {
        if (
            typeof window === 'undefined' ||
            !('serviceWorker' in navigator) ||
            process.env.NODE_ENV !== 'production'
        ) {
            return;
        }
        navigator.serviceWorker.register('/sw.js').catch((err) => {
            console.error('Service worker registration failed:', err);
        });
    }, []);

    return null;
}
