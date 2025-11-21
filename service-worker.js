const CACHE_NAME = 'skyreach-shell-v1';
const FILES = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  '/js/pilot-hub.js',
  '/about.html',
  '/pilot-hub.html',
  '/academy.html',
  '/contact.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => {
      if(k !== CACHE_NAME) return caches.delete(k);
    })))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
      return resp;
    }).catch(() => caches.match('/index.html')))
  );
});
