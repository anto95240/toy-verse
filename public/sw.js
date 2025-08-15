// Nom du cache
const CACHE_NAME = 'toy-verse-v1';
const RUNTIME_CACHE = 'runtime-cache-v1';

// Fichiers statiques à pré-cacher
const PRECACHE_URLS = [
  '/',
  '/auth',
  '/home',
  '/images/logo.webp',
  '/manifest.json'
];

// Installation du service worker et pré-cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activation : suppression des anciens caches
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

// Gestion des requêtes : Network First avec fallback sur cache
self.addEventListener('fetch', (event) => {
  // On ignore les requêtes externes si besoin
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Ne mettre en cache que les GET et si la réponse est OK
          if (event.request.method === 'GET' && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE)
              .then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            if (event.request.destination === 'document') {
              return caches.match('/'); // fallback page d'accueil
            }
          });
        })
    );
  }
});

// Optionnel : nettoyage périodique des caches dynamiques
self.addEventListener('message', (event) => {
  if (event.data === 'cleanCaches') {
    caches.keys().then((cacheNames) =>
      cacheNames.forEach((cacheName) => {
        if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
          caches.delete(cacheName);
        }
      })
    );
  }
});
