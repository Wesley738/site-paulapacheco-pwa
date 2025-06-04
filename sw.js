const CACHE_NAME = "calreza-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/script.js",
  "/manifest.json",
  "/sw.js",
  "/logo.png",
  "/favicon-16x16.png",
  "/favicon-32x32.png",
  "/apple-touch-icon.png",
  "/favicon.ico",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/badge.png",
  "/firebase-messaging-sw.js"
];

// Instala o Service Worker e cacheia os recursos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        const promises = ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => {
            console.warn(`Não foi possível cachear ${url}:`, err);
          });
        });
        await Promise.all(promises);
        console.log('Cache completo');
      })
  );
});

// Responde com recursos cacheados (ou busca na rede)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se existir
        if (response) return response;
        
        // Caso contrário, busca na rede
        return fetch(event.request)
          .then(networkResponse => {
            // Opcional: cacheia novos recursos dinamicamente
            if (event.request.url.startsWith('http') && !networkResponse.url.includes('chrome-extension')) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return networkResponse;
          })
          .catch(() => {
            // Fallback offline (ex: página padrão)
            return caches.match('/offline.html'); // Crie este arquivo se quiser
          });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      const cachesToDelete = cacheNames.filter(name => name !== CACHE_NAME);
      return Promise.all(
        cachesToDelete.map(oldCache => caches.delete(oldCache))
      );
    })
  );
});
