const CACHE = 'mac-v1';

// Static assets safe to cache indefinitely (Next.js hashes the filenames)
const STATIC_RE = /^\/_next\/static\//;
// Other cacheable assets
const ASSET_RE = /\.(png|jpg|jpeg|webp|gif|svg|ico|woff2?|ttf|otf)(\?.*)?$/;

self.addEventListener('install', (event) => {
  // Cache the app shell immediately; don't wait for old SW to go away
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(['/', '/offline']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Purge caches from previous versions
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests; skip API calls
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // Next.js hashed static bundles → cache-first (safe forever)
  if (STATIC_RE.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached ?? fetchAndCache(request)
      )
    );
    return;
  }

  // Images & fonts → cache-first, update in background (stale-while-revalidate)
  if (ASSET_RE.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fresh = fetchAndCache(request);
        return cached ?? fresh;
      })
    );
    return;
  }

  // Navigation & everything else → network-first, fall back to cache then /offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request).then((c) => c ?? caches.match('/')))
    );
  }
});

async function fetchAndCache(request) {
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE);
    cache.put(request, response.clone());
  }
  return response;
}
