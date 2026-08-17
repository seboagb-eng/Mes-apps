/*
 * format.js — Fonctions utilitaires d'affichage et partage
 */

// Montant en FCFA : "1 250 000 FCFA" (entiers, séparateur espace)
function fmtMontant(n, devise) {
  const d = devise || (window.Store ? window.Store.Reglages.get().devise : "FCFA");
  const val = Math.round(Number(n) || 0);
  const s = val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${s} ${d}`;
}

// Nombre simple avec séparateurs (pour quantités/stock)
function fmtNombre(n) {
  return (Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

function fmtDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtDateHeure(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${fmtDate(ts)} à ${hh}:${mm}`;
}

// Début du jour / du mois (timestamps)
function debutJour(ts) {
  const d = new Date(ts || Date.now());
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function debutMois(ts) {
  const d = new Date(ts || Date.now());
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// Nettoie un numéro de téléphone au format international (chiffres uniquement)
function telWhatsApp(numero) {
  let n = (numero || "").replace(/[^\d]/g, "");
  // Numéro local béninois (8 chiffres) -> préfixe 229
  if (n.length === 8) n = "229" + n;
  // Retire un éventuel 00 initial
  n = n.replace(/^00/, "");
  return n;
}

// Ouvre WhatsApp avec un message pré-rempli (fonctionne sur mobile et Web)
function ouvrirWhatsApp(numero, message) {
  const n = telWhatsApp(numero);
  const txt = encodeURIComponent(message || "");
  const url = n
    ? `https://wa.me/${n}?text=${txt}`
    : `https://wa.me/?text=${txt}`;
  window.open(url, "_blank");
}

const LIBELLE_PAIEMENT = {
  especes: "Espèces",
  momo: "MTN MoMo",
  moov: "Moov Money",
  virement: "Virement",
  credit: "Crédit (à payer)",
};

const LIBELLE_STATUT = {
  validee: "Validée",
  livree: "Livrée",
  annulee: "Annulée",
};

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

window.Fmt = {
  fmtMontant,
  fmtNombre,
  fmtDate,
  fmtDateHeure,
  debutJour,
  debutMois,
  telWhatsApp,
  ouvrirWhatsApp,
  LIBELLE_PAIEMENT,
  LIBELLE_STATUT,
  escapeHtml,
};
