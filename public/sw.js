// GASS-KNUST Official Student Portal Service Worker
// Enables offline access for the app shell, static assets, and cached API responses.

const CACHE_NAME = 'gass-portal-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/img/logo.png',
  '/img/nav-home.png',
  '/img/nav-courses.png',
  '/img/nav-skills.png',
  '/img/nav-search.png',
  '/img/nav-saved.png',
  '/img/hero-banner.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('SW pre-cache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // 1. Static Assets & App Shell (Stale-While-Revalidate)
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/img/') || url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/portal')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // 2. Read-only Academic API endpoints (Network First with Cache Fallback)
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(JSON.stringify({ success: false, error: 'Offline - data not cached' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }
});
