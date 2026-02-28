const CACHE_NAME = 'autopulse-v1';
const TILE_CACHE = 'autopulse-tiles-v1';

// App shell files to cache
const APP_SHELL = [
  '/',
  '/index.html',
  '/emergency',
  '/diagnose',
  '/predict',
  '/safety',
  '/timeline',
  '/community',
];

// Install — cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('🔧 AutoPulse SW: Caching app shell');
      return cache.addAll(APP_SHELL).catch(() => {
        // Some routes may fail in dev, that's ok
        console.log('🔧 AutoPulse SW: Partial cache (dev mode)');
      });
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== TILE_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache, cache map tiles
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache Mapbox tiles for offline map access
  if (url.hostname.includes('api.mapbox.com') || url.hostname.includes('tiles.mapbox.com')) {
    event.respondWith(
      caches.open(TILE_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request)
            .then((response) => {
              if (response.ok) {
                cache.put(event.request, response.clone());
              }
              return response;
            })
            .catch(() => cached || new Response('', { status: 503 }));
        })
      )
    );
    return;
  }

  // Network-first for API calls, with offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful API responses
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => {
          // Serve cached API response when offline
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return new Response(JSON.stringify({ offline: true, error: 'No cached data' }), {
              headers: { 'Content-Type': 'application/json' },
            });
          });
        })
    );
    return;
  }

  // Cache-first for app assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            if (response.ok && event.request.method === 'GET') {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => {
            // Fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            return new Response('Offline', { status: 503 });
          })
      );
    })
  );
});
