import { formatFCFA, formatDate } from "@/lib/format";
import { LIBELLE_MOYEN } from "@/lib/constantes";
import type { MoyenPaiement } from "@/lib/types";

/**
 * Construit le texte d'un reçu de paiement à partager (WhatsApp/SMS).
 * Volontairement court et lisible sur mobile, sans dépendance PDF.
 */
export function messageRecu(params: {
  nomEntreprise: string;
  nomClient: string;
  montant: number;
  moyen: MoyenPaiement;
  resteApres: number;
  date?: Date;
}): string {
  const { nomEntreprise, nomClient, montant, moyen, resteApres } = params;
  const date = params.date ?? new Date();
  const lignes = [
    "🧾 REÇU DE PAIEMENT",
    nomEntreprise,
    "",
    `Client : ${nomClient}`,
    `Montant reçu : ${formatFCFA(montant)}`,
    `Mode : ${LIBELLE_MOYEN[moyen] ?? moyen}`,
    `Date : ${formatDate(date.toISOString())}`,
    resteApres > 0 ? `Reste à payer : ${formatFCFA(resteApres)}` : "Facture soldée ✅",
    "",
    "Merci de votre confiance.",
  ];
  return lignes.join("\n");
}
