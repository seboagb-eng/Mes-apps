import type { Plan } from "@/lib/types";

/** Catégories de dépenses par défaut (personnalisables en réglages). */
export const CATEGORIES_DEPENSE = [
  "achats",
  "loyer",
  "salaires",
  "transport",
  "electricite",
  "eau",
  "communication",
  "impots",
  "autres",
];

/** Libellés des moyens de paiement. */
export const LIBELLE_MOYEN: Record<string, string> = {
  especes: "Espèces",
  momo: "Mobile Money",
  banque: "Banque",
  virement: "Virement",
};

export const LIBELLE_TYPE_COMPTE: Record<string, string> = {
  caisse: "Caisse",
  banque: "Banque",
  mobile_money: "Mobile Money",
};

/** Offres d'abonnement (montants mensuels en FCFA). */
export const PLANS: Record<Plan, { nom: string; prix: number; description: string }> = {
  starter: { nom: "Starter", prix: 5000, description: "1 utilisateur, modules de base" },
  business: { nom: "Business", prix: 15000, description: "5 utilisateurs, recouvrement + relances" },
  entreprise: { nom: "Entreprise", prix: 35000, description: "Utilisateurs illimités, multi-sites" },
};

export const DUREE_ESSAI_JOURS = 14;
