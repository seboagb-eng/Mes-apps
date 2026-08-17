/*
 * store.js — Couche de données locale (offline-first)
 * -----------------------------------------------------
 * Toutes les données sont stockées sur le téléphone (localStorage).
 * Aucune connexion internet n'est nécessaire pour travailler.
 * Une sauvegarde (export/import JSON) permet de ne jamais rien perdre.
 */

const DB_KEY = "gc_data_v1";

// Structure par défaut de la base de données locale
function baseVide() {
  return {
    version: 1,
    reglages: {
      entreprise: "Ma Boutique",
      telephone: "",
      adresse: "",
      ville: "Cotonou",
      devise: "FCFA",
      logo: "", // data URL éventuelle
      magasinierNom: "",
      magasinierTel: "", // format international sans +, ex: 22997000000
      piedFacture: "Merci pour votre confiance.",
      prefixeCommande: "CMD",
      prefixeFacture: "FAC",
      compteurCommande: 0,
      compteurFacture: 0,
    },
    produits: [],
    clients: [],
    commandes: [],
  };
}

let _cache = null;

function charger() {
  if (_cache) return _cache;
  try {
    const brut = localStorage.getItem(DB_KEY);
    if (brut) {
      _cache = Object.assign(baseVide(), JSON.parse(brut));
      // fusion défensive des réglages (nouvelles clés)
      _cache.reglages = Object.assign(baseVide().reglages, _cache.reglages || {});
    } else {
      _cache = baseVide();
      demarrerAvecExemples(_cache);
      sauver();
    }
  } catch (e) {
    console.error("Erreur de lecture des données, réinitialisation.", e);
    _cache = baseVide();
  }
  return _cache;
}

function sauver() {
  if (!_cache) return;
  localStorage.setItem(DB_KEY, JSON.stringify(_cache));
}

// Identifiant unique simple
function nouvelId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ------------------------- RÉGLAGES ------------------------- */
const Reglages = {
  get() {
    return charger().reglages;
  },
  maj(patch) {
    Object.assign(charger().reglages, patch);
    sauver();
  },
};

/* ------------------------- PRODUITS ------------------------- */
const Produits = {
  liste() {
    return charger().produits;
  },
  get(id) {
    return charger().produits.find((p) => p.id === id);
  },
  ajouter(p) {
    const produit = {
      id: nouvelId(),
      nom: p.nom || "Sans nom",
      categorie: p.categorie || "",
      unite: p.unite || "pièce",
      prixAchat: Number(p.prixAchat) || 0,
      prixVente: Number(p.prixVente) || 0,
      stock: Number(p.stock) || 0,
      seuilAlerte: Number(p.seuilAlerte) || 0,
      dateArrivage: p.dateArrivage || "", // AAAA-MM-JJ
      datePeremption: p.datePeremption || "", // AAAA-MM-JJ (pour congelé/périssable)
      actif: true,
      creeLe: Date.now(),
    };
    charger().produits.push(produit);
    sauver();
    return produit;
  },
  maj(id, patch) {
    const p = Produits.get(id);
    if (!p) return;
    ["nom", "categorie", "unite", "dateArrivage", "datePeremption"].forEach((k) => {
      if (patch[k] !== undefined) p[k] = patch[k];
    });
    ["prixAchat", "prixVente", "stock", "seuilAlerte"].forEach((k) => {
      if (patch[k] !== undefined) p[k] = Number(patch[k]) || 0;
    });
    if (patch.actif !== undefined) p.actif = !!patch.actif;
    sauver();
    return p;
  },
  // Ajuste le stock (positif = entrée/réapprovisionnement, négatif = sortie)
  bougerStock(id, delta) {
    const p = Produits.get(id);
    if (!p) return;
    p.stock = Math.max(0, (Number(p.stock) || 0) + Number(delta));
    sauver();
  },
  supprimer(id) {
    const db = charger();
    db.produits = db.produits.filter((p) => p.id !== id);
    sauver();
  },
  enAlerte() {
    return Produits.liste().filter(
      (p) => p.actif && p.stock <= p.seuilAlerte
    );
  },
  valeurStock() {
    return Produits.liste().reduce(
      (s, p) => s + (Number(p.prixAchat) || 0) * (Number(p.stock) || 0),
      0
    );
  },
  // Produits périssables dont la date de péremption approche ou est dépassée
  peremptionProche(jours) {
    const seuil = jours == null ? 14 : jours;
    const jav = window.Fmt ? window.Fmt.joursAvant : () => null;
    return Produits.liste()
      .filter((p) => p.actif && p.datePeremption)
      .map((p) => ({ produit: p, jours: jav(p.datePeremption) }))
      .filter((x) => x.jours !== null && x.jours <= seuil)
      .sort((a, b) => a.jours - b.jours);
  },
};

/* ------------------------- CLIENTS ------------------------- */
const Clients = {
  liste() {
    return charger().clients;
  },
  get(id) {
    return charger().clients.find((c) => c.id === id);
  },
  ajouter(c) {
    const client = {
      id: nouvelId(),
      nom: c.nom || "Client",
      telephone: c.telephone || "",
      adresse: c.adresse || "",
      note: c.note || "",
      creeLe: Date.now(),
    };
    charger().clients.push(client);
    sauver();
    return client;
  },
  maj(id, patch) {
    const c = Clients.get(id);
    if (!c) return;
    Object.assign(c, patch);
    sauver();
    return c;
  },
  supprimer(id) {
    const db = charger();
    db.clients = db.clients.filter((c) => c.id !== id);
    sauver();
  },
};

/* ------------------------- COMMANDES ------------------------- */
const Commandes = {
  liste() {
    return charger()
      .commandes.slice()
      .sort((a, b) => b.date - a.date);
  },
  get(id) {
    return charger().commandes.find((o) => o.id === id);
  },
  numeroSuivant() {
    const r = Reglages.get();
    return `${r.prefixeCommande}-${String(r.compteurCommande + 1).padStart(4, "0")}`;
  },
  creer(data) {
    const r = Reglages.get();
    r.compteurCommande += 1;
    const cmd = {
      id: nouvelId(),
      numero: `${r.prefixeCommande}-${String(r.compteurCommande).padStart(4, "0")}`,
      date: data.date || Date.now(),
      clientId: data.clientId || "",
      clientNom: data.clientNom || "",
      clientTel: data.clientTel || "",
      lignes: data.lignes || [], // {produitId, nom, unite, qte, prixUnitaire}
      remise: Number(data.remise) || 0,
      modePaiement: data.modePaiement || "especes",
      montantPaye: Number(data.montantPaye) || 0,
      statut: "validee", // validee | livree | annulee
      note: data.note || "",
      stockDeduit: false,
      factureNumero: "",
      factureDate: 0,
    };
    charger().commandes.push(cmd);
    sauver();
    return cmd;
  },
  maj(id, patch) {
    const o = Commandes.get(id);
    if (!o) return;
    Object.assign(o, patch);
    sauver();
    return o;
  },
  supprimer(id) {
    const o = Commandes.get(id);
    if (o && o.stockDeduit) {
      // On restitue le stock si la commande était livrée
      o.lignes.forEach((l) => {
        if (l.produitId) Produits.bougerStock(l.produitId, l.qte);
      });
    }
    const db = charger();
    db.commandes = db.commandes.filter((c) => c.id !== id);
    sauver();
  },
  // Marque comme livrée et déduit le stock une seule fois
  livrer(id) {
    const o = Commandes.get(id);
    if (!o || o.stockDeduit || o.statut === "annulee") return o;
    o.lignes.forEach((l) => {
      if (l.produitId) Produits.bougerStock(l.produitId, -Math.abs(l.qte));
    });
    o.stockDeduit = true;
    o.statut = "livree";
    sauver();
    return o;
  },
  annuler(id) {
    const o = Commandes.get(id);
    if (!o) return;
    if (o.stockDeduit) {
      o.lignes.forEach((l) => {
        if (l.produitId) Produits.bougerStock(l.produitId, Math.abs(l.qte));
      });
      o.stockDeduit = false;
    }
    o.statut = "annulee";
    sauver();
    return o;
  },
  enregistrerPaiement(id, montant, mode) {
    const o = Commandes.get(id);
    if (!o) return;
    o.montantPaye = Math.max(0, (Number(o.montantPaye) || 0) + Number(montant));
    if (mode) o.modePaiement = mode;
    sauver();
    return o;
  },
  genererFacture(id) {
    const o = Commandes.get(id);
    if (!o) return;
    if (!o.factureNumero) {
      const r = Reglages.get();
      r.compteurFacture += 1;
      o.factureNumero = `${r.prefixeFacture}-${String(r.compteurFacture).padStart(4, "0")}`;
      o.factureDate = Date.now();
      sauver();
    }
    return o;
  },
};

/* ------------------------- CALCULS ------------------------- */
const Calc = {
  sousTotal(o) {
    return o.lignes.reduce(
      (s, l) => s + (Number(l.qte) || 0) * (Number(l.prixUnitaire) || 0),
      0
    );
  },
  total(o) {
    return Math.max(0, Calc.sousTotal(o) - (Number(o.remise) || 0));
  },
  reste(o) {
    return Math.max(0, Calc.total(o) - (Number(o.montantPaye) || 0));
  },
};

/* ------------------------- SAUVEGARDE ------------------------- */
const Sauvegarde = {
  exporter() {
    return JSON.stringify(charger(), null, 2);
  },
  importer(json) {
    const data = JSON.parse(json);
    if (!data || !Array.isArray(data.produits)) throw new Error("Fichier invalide");
    _cache = Object.assign(baseVide(), data);
    _cache.reglages = Object.assign(baseVide().reglages, _cache.reglages || {});
    sauver();
  },
  reinitialiser() {
    _cache = baseVide();
    sauver();
  },
};

/* ------------------------- DONNÉES D'EXEMPLE ------------------------- */
function demarrerAvecExemples(db) {
  db.reglages.entreprise = "Ma Boutique";
  // Exemples adaptés à un commerce de poisson + articles divers (à modifier/supprimer)
  const p = [
    { nom: "Carton de chinchard congelé", categorie: "Poisson congelé", unite: "carton", prixAchat: 18000, prixVente: 22000, stock: 15, seuilAlerte: 4, dateArrivage: "2026-08-10", datePeremption: "2026-12-15" },
    { nom: "Carton de maquereau", categorie: "Poisson congelé", unite: "carton", prixAchat: 20000, prixVente: 25000, stock: 10, seuilAlerte: 3, dateArrivage: "2026-08-12", datePeremption: "2027-01-20" },
    { nom: "Poisson fumé", categorie: "Poisson fumé", unite: "kg", prixAchat: 2500, prixVente: 3500, stock: 30, seuilAlerte: 8 },
    { nom: "Tilapia frais", categorie: "Poisson frais", unite: "kg", prixAchat: 1500, prixVente: 2200, stock: 25.5, seuilAlerte: 10 },
    { nom: "Crevettes séchées", categorie: "Poisson séché", unite: "kg", prixAchat: 4000, prixVente: 5500, stock: 6, seuilAlerte: 5 },
    { nom: "Bidon d'huile 5L", categorie: "Divers", unite: "bidon", prixAchat: 4500, prixVente: 6000, stock: 12, seuilAlerte: 4 },
    { nom: "Sac de riz 25kg", categorie: "Divers", unite: "sac", prixAchat: 12000, prixVente: 15000, stock: 8, seuilAlerte: 3 },
    { nom: "Boîte de tomate (carton)", categorie: "Divers", unite: "carton", prixAchat: 9000, prixVente: 11000, stock: 3, seuilAlerte: 4 },
  ];
  p.forEach((x) => db.produits.push(Object.assign({ id: nouvelId(), actif: true, creeLe: Date.now() }, x)));
  db.clients.push({ id: nouvelId(), nom: "Mama Adjovi", telephone: "22997000000", adresse: "Marché Dantokpa", note: "Revendeuse de poisson", creeLe: Date.now() });
}

// Expose au reste de l'application
window.Store = { Reglages, Produits, Clients, Commandes, Calc, Sauvegarde, charger };
