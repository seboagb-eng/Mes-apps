/*
 * sw.js — Service Worker
 * Objectif : l'application reste utilisable hors ligne, MAIS affiche
 * toujours la dernière version dès qu'il y a du réseau.
 * Stratégie : "réseau d'abord, cache en secours" pour nos fichiers.
 */
const CACHE = "gc-cache-v3";
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
  if (new URL(req.url).origin !== self.location.origin) return;

  // Réseau d'abord : on récupère la version à jour, on met le cache à jour,
  // et on bascule sur le cache uniquement si le réseau est indisponible.
  e.respondWith(
    fetch(req)
      .then((rep) => {
        const copie = rep.clone();
        caches.open(CACHE).then((c) => c.put(req, copie)).catch(() => {});
        return rep;
      })
      .catch(() =>
        caches.match(req).then((cache) => cache || caches.match("./index.html"))
      )
  );
});
