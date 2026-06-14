/**
 * Utilitaires de formatage propres au contexte béninois (zone FCFA / XOF).
 * Règle d'or : les montants sont stockés en ENTIERS (FCFA sans décimales)
 * partout dans le code et la base. On ne formate qu'à l'affichage.
 */

/**
 * Formate un montant entier en FCFA : 1250000 -> « 1 250 000 FCFA ».
 * L'espace insécable fine est utilisée comme séparateur de milliers.
 */
export function formatFCFA(montant: number, options?: { sansSuffixe?: boolean }): string {
  const entier = Math.round(montant || 0);
  const formate = entier.toLocaleString("fr-FR").replace(/ /g, " ");
  return options?.sansSuffixe ? formate : `${formate} FCFA`;
}

/**
 * Parse une saisie utilisateur (« 1 250 000 », « 1.250.000 », « 1250000 FCFA »)
 * en entier FCFA. Retourne 0 si non interprétable.
 */
export function parseFCFA(valeur: string): number {
  if (!valeur) return 0;
  const nettoye = valeur.replace(/[^\d]/g, "");
  const n = parseInt(nettoye, 10);
  return Number.isFinite(n) ? n : 0;
}

/** Fuseau du Bénin : GMT+1, pas de changement d'heure. */
export const FUSEAU_BENIN = "Africa/Porto-Novo";

/** Affiche une date ISO/UTC en heure du Bénin : « 14 juin 2026 ». */
export function formatDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("fr-FR", {
    timeZone: FUSEAU_BENIN,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Date courte « 14/06/2026 ». */
export function formatDateCourte(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("fr-FR", {
    timeZone: FUSEAU_BENIN,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Ancienneté d'une créance en jours, à partir de la date d'échéance.
 * Négatif = pas encore échue.
 */
export function ancienneteJours(echeance: string | Date): number {
  const d = typeof echeance === "string" ? new Date(echeance) : echeance;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** Tranche d'ancienneté d'une créance, utilisée par le module recouvrement. */
export function trancheAnciennete(jours: number): "0-30" | "31-60" | "+60" {
  if (jours <= 30) return "0-30";
  if (jours <= 60) return "31-60";
  return "+60";
}
