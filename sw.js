// LOOME Night Ops service worker.
// On install it saves the page and its small files, so the app opens without a connection.
// While online it always asks the network first, so a new version arrives on the next visit.
const CACHE = 'loome-night-ops';
const FILES = ['./', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(new Request(req.url, { cache: 'no-cache' }))
      .then(res => { if(res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req.mode === 'navigate' ? './' : req, copy)); } return res; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || (req.mode === 'navigate' ? caches.match('./') : undefined)))
  );
});
