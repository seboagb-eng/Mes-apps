"use client";

import { useEffect } from "react";

/** Enregistre le service worker PWA côté client. */
export default function EnregistrerSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Échec silencieux : l'app fonctionne sans PWA.
      });
    }
  }, []);
  return null;
}
