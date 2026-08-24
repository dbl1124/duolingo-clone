/*
 * Service worker.
 *
 * Two different strategies, because the two kinds of request want opposite things.
 *
 * **Navigations are network-first.** index.html lives at a stable URL and is the
 * file that points at the current hashed bundle, so serving it from cache first
 * means a new build does not arrive until the *second* launch after it ships —
 * you fix something, the user reopens the app, and nothing has changed. It is
 * about 1KB, so trying the network costs almost nothing, and the cached copy is
 * still there when there is no network.
 *
 * **Everything else is stale-while-revalidate.** Vite fingerprints its output, so
 * a hashed asset is immutable: if the URL matches, the bytes match, and serving
 * from cache is always correct.
 *
 * The goal is that a session works on a plane, on a subway, and on a bad hotel
 * connection. All the content ships in the bundle and all progress is local, so
 * nothing here needs a server.
 */
const CACHE = 'hablo-v2';
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

/** Network first, falling back to whatever was cached. For HTML. */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const copy = response.clone();
      void caches.open(CACHE).then((cache) => cache.put(request, copy));
    }
    return response;
  } catch {
    const cached = (await caches.match(request)) || (await caches.match('./index.html'));
    if (cached) return cached;
    throw new Error('offline and nothing cached');
  }
}

/** Serve the cached copy immediately, refresh it in the background. For assets. */
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) {
        const copy = response.clone();
        void caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation =
    request.mode === 'navigate' || (request.destination === '' && request.headers.get('accept')?.includes('text/html'));

  event.respondWith(isNavigation ? networkFirst(request) : staleWhileRevalidate(request));
});
