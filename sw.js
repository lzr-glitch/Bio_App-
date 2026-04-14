const CACHE_NAME = 'revisio-ibo-cache-v2';
const ASSETS = [
  '.',
  'index.html',
  'styles.css',
  'app.js',
  'manifest.json',
  'icon.svg',
  'images/reading.svg',
  'images/flashcards.svg',
  'images/quiz.svg',
  'images/badge.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  const isCoreAsset =
    requestUrl.pathname.endsWith('/index.html') ||
    requestUrl.pathname.endsWith('/styles.css') ||
    requestUrl.pathname.endsWith('/app.js') ||
    requestUrl.pathname.endsWith('/manifest.json');

  // Keep core files fresh so UI fixes are visible right away.
  if (isCoreAsset) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      return caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, response.clone());
        return response;
      });
    })).catch(() => caches.match('index.html'))
  );
});
