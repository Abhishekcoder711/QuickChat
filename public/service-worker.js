const cacheName = 'quickchat-cache-v1';
const assets = [
  '/',
  '/index.html',
  '/style.css',
  '/socket.io/socket.io.js',
  '/logo.png'
];

// Install event
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Activate event
self.addEventListener('activate', e => {
  console.log('Service Worker Activated');
});

// Fetch event
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
