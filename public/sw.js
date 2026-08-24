/*
 * Service worker.
 *
 * Stale-while-revalidate over same-origin GETs. Vite fingerprints its output, so
 * a hashed asset is immutable and caching it aggressively is safe; the HTML entry
 * point is the only thing that changes at a stable URL, and revalidating in the
 * background keeps it fresh without ever blocking a launch on the network.
 *
 * The practical goal is that a session works on a plane, on a subway, and on a
 * bad hotel connection. All the content ships in the bundle and all progress is
 * local, so there is nothing here that needs a server.
 */
const CACHE = 'hablo-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // Individual failures must not abort the install; a missing optional asset
      // should not leave the app without a worker.
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            void caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      // Navigations fall back to the cached shell so a cold offline launch works.
      if (request.mode === 'navigate') {
        return network.catch(() => caches.match('./index.html'));
      }
      return cached || network;
    }),
  );
});
