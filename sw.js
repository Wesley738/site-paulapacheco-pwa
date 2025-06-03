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

// ==== SISTEMA DE NOTIFICAÇÕES ====
self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log('Service Worker instalado');
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker ativado');
});

// Mostrar notificação quando receber um 'push'
self.addEventListener('push', (event) => {
    const data = event.data?.json() || { title: 'Notificação', body: 'Mensagem padrão' };
    
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: 'icon-192x192.png',
            badge: 'badge.png',
            vibrate: [200, 100, 200],
            data: { url: '/' }
        })
    );  
});

// Lidar com clique na notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});