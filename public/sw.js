// PILOT — Service Worker v2
// Stratégie : network-first pour les pages, cache-first pour les assets statiques.
// Conçu pour la 3G instable du Bénin : les pages app restent accessibles hors-ligne.
const CACHE_STATIC = "pilot-static-v2";
const CACHE_PAGES = "pilot-pages-v2";

const ASSETS_STATIQUES = [
  "/manifest.webmanifest",
  "/icons/icon.svg",
  "/offline",
];

const PAGES_APP = [
  "/app",
  "/app/tresorerie",
  "/app/ventes",
  "/app/recouvrement",
  "/app/clients",
  "/app/reglages",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_STATIC).then((c) => c.addAll(ASSETS_STATIQUES).catch(() => {})),
      caches.open(CACHE_PAGES).then((c) => c.addAll(PAGES_APP).catch(() => {})),
    ])
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const actuels = new Set([CACHE_STATIC, CACHE_PAGES]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !actuels.has(k)).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Assets statiques (JS, CSS, images, fonts) : cache-first.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".webmanifest")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_STATIC).then((c) => c.put(request, copy));
          return res;
        });
      })
    );
    return;
  }

  // Pages de navigation : network-first, repli sur cache, sinon page offline.
  if (request.mode === "navigate" || url.pathname.startsWith("/app")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_PAGES).then((c) => c.put(request, copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached ?? (await caches.match("/offline")) ?? new Response("Hors-ligne", { status: 503 });
        })
    );
    return;
  }

  // API Supabase et autres requêtes réseau : network-only (pas de cache de données sensibles).
  if (url.hostname.includes("supabase")) return;

  // Tout le reste : network-first silencieux.
  event.respondWith(
    fetch(request).catch(() => caches.match(request).then((r) => r ?? new Response("", { status: 503 })))
  );
});
