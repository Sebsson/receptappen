// Service worker — cache-first with runtime caching so the app works fully offline.
const CACHE = "recept-v1";
const ASSETS = [
  "./",
  "index.html",
  "recipes.json",
  "manifest.json",
  "icon.svg",
];

// Precache the app shell on install.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Drop old caches on activate.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first. On a miss, fetch and stash a copy (covers cross-origin assets
// like the Tailwind CDN, which are then available offline on subsequent loads).
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match("index.html")); // offline navigation fallback
    })
  );
});
