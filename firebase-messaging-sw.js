importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyArFPaaF04sxtCvqAMtvLCjdgO2i8l33K8",
  authDomain: "projeto-mais-clareza.firebaseapp.com",
  projectId: "projeto-mais-clareza",
  storageBucket: "projeto-mais-clareza.appspot.com",
  messagingSenderId: "785772047805",
  appId: "1:785772047805:web:25148daad54b194111b6d4"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Configuração para desenvolvimento local
if (self.location.hostname === "localhost") {
  messaging.usePublicVapidKey("SUA_CHAVE_VAPID_AQUI");
}

// Manipulador de mensagens em background
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Mensagem recebida:', payload);
  
  const notificationTitle = payload.notification?.title || 'Nova mensagem';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/logo.png',
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manipulador de instalação
self.addEventListener('install', (event) => {
  console.log('[SW] Instalado com sucesso');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Ativado e pronto para controlar clients');
  event.waitUntil(clients.claim());
});