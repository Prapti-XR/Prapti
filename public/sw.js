/**
 * Prapti service worker — offline reading for visited site pages.
 *
 * Strategy:
 *  - App shell + static assets (_next/static, icons, pagesrc): stale-while-revalidate
 *  - Pages + /api/sites* GETs: network-first with cache fallback
 *  - R2 photos/panoramas <= 3 MB: cache-first with LRU cap (they're immutable)
 *  - NEVER cached: .glb models (too big — XR is online-only for now),
 *    /api/auth/*, /admin/*, non-GET requests
 */

const VERSION = 'prapti-v1';
const SHELL_CACHE = `${VERSION}-shell`;
const PAGE_CACHE = `${VERSION}-pages`;
const MEDIA_CACHE = `${VERSION}-media`;
const MEDIA_LIMIT = 60;
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll([OFFLINE_URL, '/manifest.json'])).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function trimCache(name, limit) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length > limit) {
    await cache.delete(keys[0]);
    await trimCache(name, limit);
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never touch auth, admin, or 3D models
  if (
    url.pathname.startsWith('/api/auth') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.endsWith('.glb') ||
    url.pathname.endsWith('.gltf')
  ) {
    return;
  }

  // Immutable media from R2: cache-first with LRU cap
  if (url.hostname.endsWith('.r2.dev')) {
    event.respondWith(
      caches.open(MEDIA_CACHE).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        const len = Number(res.headers.get('content-length') || 0);
        if (res.ok && len > 0 && len <= 3 * 1024 * 1024) {
          cache.put(request, res.clone());
          trimCache(MEDIA_CACHE, MEDIA_LIMIT);
        }
        return res;
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Static build assets + icons: stale-while-revalidate
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons') ||
    url.pathname.startsWith('/pagesrc')
  ) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const hit = await cache.match(request);
        const refresh = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => hit);
        return hit || refresh;
      })
    );
    return;
  }

  // Pages and site data: network-first, cache fallback, offline page last
  const isPage = request.mode === 'navigate';
  const isSiteData = url.pathname.startsWith('/api/sites');
  if (isPage || isSiteData) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            caches.open(PAGE_CACHE).then((cache) => cache.put(request, res.clone()));
          }
          return res.clone();
        })
        .catch(async () => {
          const hit = await caches.match(request);
          if (hit) return hit;
          if (isPage) return caches.match(OFFLINE_URL);
          return new Response(JSON.stringify({ error: 'offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        })
    );
  }
});
