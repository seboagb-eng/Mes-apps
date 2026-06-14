import { formatFCFA } from "@/lib/format";
import type { TonRelance } from "@/lib/types";

export const LIBELLE_TON: Record<TonRelance, string> = {
  courtois: "Courtois",
  ferme: "Ferme",
  dernier_avis: "Dernier avis",
};

/**
 * Construit le message de relance selon le ton choisi.
 * Inclut le montant dû et, si fourni, le lien de paiement Mobile Money.
 */
export function messageRelance(params: {
  ton: TonRelance;
  nomEntreprise: string;
  nomClient: string;
  montantDu: number;
  lienPaiement?: string | null;
}): string {
  const { ton, nomEntreprise, nomClient, montantDu, lienPaiement } = params;
  const montant = formatFCFA(montantDu);
  const lien = lienPaiement ? `\n\nPayez en 1 clic (Mobile Money) : ${lienPaiement}` : "";

  const corps: Record<TonRelance, string> = {
    courtois: `Bonjour ${nomClient}, j'espère que vous allez bien. Petit rappel amical : un solde de ${montant} reste à régler concernant votre commande. Merci d'avance pour votre règlement.${lien}\n\n${nomEntreprise}`,
    ferme: `Bonjour ${nomClient}, votre solde de ${montant} est arrivé à échéance. Merci de procéder au règlement dans les meilleurs délais afin d'éviter toute interruption de service.${lien}\n\n${nomEntreprise}`,
    dernier_avis: `${nomClient}, DERNIER RAPPEL : votre solde de ${montant} est en retard. Sans règlement sous 48h, nous serons contraints de suspendre nos prestations et d'engager les démarches de recouvrement.${lien}\n\n${nomEntreprise}`,
  };

  return corps[ton];
}

/** Construit un lien wa.me pré-rempli (gratuit, zéro friction). */
export function lienWhatsApp(telephone: string | null | undefined, message: string): string {
  // wa.me attend un numéro international sans « + » ni espaces.
  const numero = (telephone ?? "").replace(/[^\d]/g, "");
  const texte = encodeURIComponent(message);
  return numero
    ? `https://wa.me/${numero}?text=${texte}`
    : `https://wa.me/?text=${texte}`;
}

/** Construit un lien sms: pré-rempli. */
export function lienSMS(telephone: string | null | undefined, message: string): string {
  const numero = (telephone ?? "").replace(/[^\d+]/g, "");
  return `sms:${numero}?&body=${encodeURIComponent(message)}`;
}
