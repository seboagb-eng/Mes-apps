/*
 * sw.js — Service Worker
 * Met en cache l'application pour un fonctionnement 100% hors ligne.
 * Stratégie : "cache d'abord" pour la coque de l'app, réseau en secours.
 */
const CACHE = "gc-cache-v1";
const FICHIERS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/store.js",
  "./js/format.js",
  "./js/documents.js",
  "./js/app.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((cles) =>
      Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  // On ne met en cache que notre propre origine
  if (new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    caches.match(req).then((cache) => {
      if (cache) return cache;
      return fetch(req)
        .then((rep) => {
          const copie = rep.clone();
          caches.open(CACHE).then((c) => c.put(req, copie)).catch(() => {});
          return rep;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
