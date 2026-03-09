/* sw.js — safe production PWA cache with update flow */
const CACHE_VERSION = "v13";
const CACHE_NAME = `ramanujan-magic-square-${CACHE_VERSION}`;

const ASSETS = [
  "./",
  "./index.html",
  "./404.html",
  "./site.webmanifest",
  "./assets/favicon.svg",
  "./assets/apple-touch-icon.png",
  "./assets/og-image.png"
];

// Install: warm cache, but don't fail if one asset is missing
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    await Promise.allSettled(
      ASSETS.map(async (path) => {
        try {
          const req = new Request(path, { cache: "reload" });
          const res = await fetch(req);
          if (res && res.ok) {
            await cache.put(req, res);
          }
        } catch {
          // ignore missing/broken asset
        }
      })
    );
  })());
});

// Activate: remove old caches, take control
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter((k) => k.startsWith("ramanujan-magic-square-") && k !== CACHE_NAME)
        .map((k) => caches.delete(k))
    );

    await self.clients.claim();

    const clients = await self.clients.matchAll({ type: "window" });
    for (const client of clients) {
      client.postMessage({ type: "SW_ACTIVATED", version: CACHE_VERSION });
    }
  })());
});

// Allow page to promote waiting worker
self.addEventListener("message", (event) => {
  if (!event.data) return;
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch strategy:
// - HTML/navigation: network-first, cache fallback
// - Static assets: cache-first, network fallback
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  const accept = req.headers.get("accept") || "";
  const isHTML = req.mode === "navigate" || accept.includes("text/html");

  const htmlCacheKey = isHTML
    ? new Request(url.pathname, { headers: req.headers })
    : req;

  if (isHTML) {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);

        if (res && res.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(htmlCacheKey, res.clone());
        }

        return res;
      } catch {
        const cache = await caches.open(CACHE_NAME);
        const cached =
          await cache.match(htmlCacheKey) ||
          await cache.match("./index.html");

        return cached || new Response("Offline", {
          status: 503,
          headers: { "Content-Type": "text/plain" }
        });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;

    try {
      const res = await fetch(req);
      if (res && res.ok) {
        await cache.put(req, res.clone());
      }
      return res;
    } catch {
      return cached || new Response("Offline", {
        status: 503,
        headers: { "Content-Type": "text/plain" }
      });
    }
  })());
});
