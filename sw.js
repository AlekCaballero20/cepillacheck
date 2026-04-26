const CACHE_NAME = 'cepillacheck-v6';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/variables.css',
  './css/base.css',
  './css/components.css',
  './css/screens/login.css',
  './css/screens/dashboard.css',
  './css/screens/stats.css',
  './css/screens/settings.css',
  './css/app.css',
  './js/app.js',
  './js/config/firebase.js',
  './js/constants/users.js',
  './js/core/state.js',
  './js/core/dates.js',
  './js/core/dom.js',
  './js/core/router.js',
  './js/core/toast.js',
  './js/services/auth.service.js',
  './js/services/sessions.service.js',
  './js/services/stats.service.js',
  './js/services/settings.service.js',
  './js/features/login/login.ui.js',
  './js/features/login/login.controller.js',
  './js/features/dashboard/dashboard.ui.js',
  './js/features/dashboard/dashboard.controller.js',
  './js/features/stats/stats.ui.js',
  './js/features/stats/stats.controller.js',
  './js/features/settings/settings.ui.js',
  './js/features/settings/settings.controller.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches
        .keys()
        .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match('./index.html')))
  );
});
