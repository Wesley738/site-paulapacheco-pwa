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

// SISTEMA DE NOTIFICAÇÕES
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyArFPaaF04sxtCvqAMtvLCjdgO2i8l33K8",
  authDomain: "projeto-mais-clareza.firebaseapp.com",
  projectId: "projeto-mais-clareza",
  storageBucket: "projeto-mais-clareza.firebasestorage.app",
  messagingSenderId: "785772047805",
  appId: "1:785772047805:web:25148daad54b194111b6d4"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Notificação recebida em background:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});