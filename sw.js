
/* Ramanujan Magic Square - PWA Service Worker */

const CACHE_VERSION = "v18";
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

// Install
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
          // Ignore missing assets
        }
      })
    );
  })());
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter(
          (key) =>
            key.startsWith("ramanujan-magic-square-") &&
            key !== CACHE_NAME
        )
        .map((key) => caches.delete(key))
    );

    await self.clients.claim();

    const clients = await self.clients.matchAll({
      type: "window"
    });

    for (const client of clients) {
      client.postMessage({
        type: "SW_ACTIVATED",
        version: CACHE_VERSION
      });
    }
  })());
});

// Message
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  const accept = req.headers.get("accept") || "";
  const isHTML =
    req.mode === "navigate" ||
    accept.includes("text/html");

  // HTML: Network first
  if (isHTML) {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);

        if (res && res.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(
            new Request(url.pathname, { headers: req.headers }),
            res.clone()
          );
        }

        return res;
      } catch {
        const cache = await caches.open(CACHE_NAME);

        return (
          await cache.match(
            new Request(url.pathname, { headers: req.headers })
          )
        ) || await cache.match("./index.html") ||
          new Response("Offline", { status: 503 });
      }
    })());

    return;
  }

  // JavaScript and CSS: Network first
  // This prevents outdated admin-panel.js from being served.
  if (req.destination === "script" ||
      req.destination === "style") {

    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);

      try {
        const networkRequest = new Request(req, {
          cache: "no-cache"
        });

        const res = await fetch(networkRequest);

        if (res && res.ok) {
          await cache.put(req, res.clone());
        }

        return res;
      } catch {
        return (
          await cache.match(req)
        ) || new Response("Offline", {
          status: 503
        });
      }
    })());

    return;
  }

  // Other static assets: Cache first
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
      return new Response("Offline", {
        status: 503
      });
    }
  })());
});
