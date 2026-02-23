/* sw.js — production PWA cache with update flow (improved) */
const CACHE_VERSION = "v4"; // ⬅️ bump this when you push a major update
const CACHE_NAME = `ramanujan-magic-square-${CACHE_VERSION}`;

const ASSETS = [
  "./",
  "./index.html",
  "./404.html",
  "./site.webmanifest",
  "./assets/favicon.svg",
  "./assets/apple-touch-icon.png",
  "./assets/og-image.png",
];

// Install: cache core assets (do not fail install if one asset is missing)
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // cache.addAll fails if ANY asset 404s; use individual adds instead
    await Promise.allSettled(
      ASSETS.map(async (path) => {
        try {
          const req = new Request(path, { cache: "reload" });
          const res = await fetch(req);
          if (res && res.ok) await cache.put(req, res);
        } catch {
          // ignore
        }
      })
    );
  })());
  // No skipWaiting — we'll prompt user to refresh
});

// Activate: delete old caches
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k.startsWith("ramanujan-magic-square-") && k !== CACHE_NAME)
        .map((k) => caches.delete(k))
    );

    await self.clients.claim();

    // Optional: notify open pages that a new SW is active
    const clients = await self.clients.matchAll({ type: "window" });
    for (const c of clients) {
      c.postMessage({ type: "SW_ACTIVATED", version: CACHE_VERSION });
    }
  })());
});

// Messaging: allow page to request update
self.addEventListener("message", (event) => {
  if (!event.data) return;
  if (event.data.type === "SKIP_WAITING") self.skipWaiting();
});

// Fetch strategy:
// - Navigation (HTML): network-first → fallback cache
// - Static assets: cache-first → fallback network
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  const accept = req.headers.get("accept") || "";
  const isHTML = req.mode === "navigate" || accept.includes("text/html");

  // Normalize HTML requests to cache the "clean" URL as well
  const htmlCacheKey = isHTML ? new Request(url.pathname, { headers: req.headers }) : req;

  if (isHTML) {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);

        // Only cache successful HTML
        if (res && res.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(htmlCacheKey, res.clone());
        }
        return res;
      } catch {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(htmlCacheKey) || await cache.match("./index.html");
        return cached || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
      }
    })());
    return;
  }

  // Assets: cache-first
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;

    try {
      const res = await fetch(req);
      if (res && res.ok) await cache.put(req, res.clone());
      return res;
    } catch {
      return cached || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
    }
  })());
});
