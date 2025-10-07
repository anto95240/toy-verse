// Nom du cache
const CACHE_NAME = 'toy-verse-v2';
const RUNTIME_CACHE = 'runtime-cache-v2';

// Fichiers statiques à pré-cacher
const PRECACHE_URLS = [
  '/',
  '/auth',
  '/home',
  '/favicon.ico',
  '/manifest.json'
];

// Installation et pré-cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activation : suppression anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Gestion des requêtes : Network First avec fallback
self.addEventListener('fetch', (event) => {

  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (event.request.method === 'GET' && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE)
              .then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        }))
    );
  }
});
