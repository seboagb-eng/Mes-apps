/*
 * sw.js — Service Worker du Coach Basic Fit.
 * Stratégie : « réseau d'abord, cache en secours ».
 * L'app reste utilisable hors ligne (salle en sous-sol, réseau faible…)
 * tout en récupérant la dernière version dès qu'il y a du réseau.
 */
const CACHE = "coach-bf-v2";
const FICHIERS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/data.js",
  "./js/illustrations.js",
  "./js/store.js",
  "./js/photos.js",
  "./js/coach.js",
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
