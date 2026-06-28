// Service worker.
//
// The recipe data and the app's HTML use a *network-first* strategy: when the
// device is online they're fetched fresh and the cache is refreshed in the
// background, so edits to recipes.json / index.html reach already-installed
// apps on the next load — no need to clear site data. When offline they fall
// back to the last cached copy, so the app still works fully offline.
//
// Everything else (manifest, icon, the Tailwind CDN, …) stays *cache-first*
// for instant loads.
//
// Saved data (favorites, week plan, shopping list) lives in localStorage, which
// is never touched here, so updates never wipe the user's own data.
const CACHE = "recept-v4";
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

// Same-origin navigations and the recipe data should stay current, so try the
// network first and fall back to cache only when offline.
function isFreshFirst(req, url) {
  if (url.origin !== self.location.origin) return false;
  return (
    req.mode === "navigate" ||
    url.pathname.endsWith("/recipes.json") ||
    url.pathname.endsWith("/index.html") ||
    url.pathname === "/" ||
    url.pathname.endsWith("/")
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Network-first for content that changes (data + app shell HTML).
  if (isFreshFirst(req, url)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match("index.html"))
        )
    );
    return;
  }

  // Cache-first for everything else. On a miss, fetch and stash a copy (covers
  // cross-origin assets like the Tailwind CDN, available offline next time).
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
