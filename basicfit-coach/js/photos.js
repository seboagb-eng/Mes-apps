/*
 * photos.js — Photos de progression, stockées localement via IndexedDB.
 * Les images sont compressées (max 1080 px, JPEG) avant stockage pour
 * ménager l'espace, et ne quittent jamais le téléphone.
 */
const Photos = {
  db: null,
  DB_NOM: "coach-bf-photos",
  STORE: "photos",

  ouvrir() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) return reject(new Error("IndexedDB indisponible"));
      const req = indexedDB.open(this.DB_NOM, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(this.STORE))
          db.createObjectStore(this.STORE, { keyPath: "id" });
      };
      req.onsuccess = () => { this.db = req.result; resolve(this.db); };
      req.onerror = () => reject(req.error);
    });
  },

  _tx(mode) {
    return this.db.transaction(this.STORE, mode).objectStore(this.STORE);
  },

  /* Compresse un fichier image -> dataURL JPEG */
  compresser(fichier, maxDim = 1080, qualite = 0.82) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(fichier);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width: w, height: h } = img;
        if (w > h && w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim; }
        else if (h > maxDim) { w = Math.round(w * maxDim / h); h = maxDim; }
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL("image/jpeg", qualite));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image illisible")); };
      img.src = url;
    });
  },

  async ajouter(fichier, meta = {}) {
    await this.ouvrir();
    const dataUrl = await this.compresser(fichier);
    const photo = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      date: new Date().toISOString(),
      poids: meta.poids || "",
      note: meta.note || "",
      img: dataUrl,
    };
    return new Promise((resolve, reject) => {
      const r = this._tx("readwrite").add(photo);
      r.onsuccess = () => resolve(photo);
      r.onerror = () => reject(r.error);
    });
  },

  async lister() {
    await this.ouvrir();
    return new Promise((resolve, reject) => {
      const r = this._tx("readonly").getAll();
      r.onsuccess = () => resolve((r.result || []).sort((a, b) => new Date(b.date) - new Date(a.date)));
      r.onerror = () => reject(r.error);
    });
  },

  async supprimer(id) {
    await this.ouvrir();
    return new Promise((resolve, reject) => {
      const r = this._tx("readwrite").delete(id);
      r.onsuccess = () => resolve();
      r.onerror = () => reject(r.error);
    });
  },
};
