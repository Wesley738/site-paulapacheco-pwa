const CACHE_NAME = "meu-app-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/logo.png",
  "/favicon-32x32.png",
  "/apple-touch-icon.png",
  "/favicon.icon",
  "/icon-192x192.png",
  "/icon-512x512.png"
];

// Instala o Service Worker e cacheia os recursos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Responde com recursos cacheados (ou busca na rede)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});