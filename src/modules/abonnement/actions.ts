"use server";

import { revalidatePath } from "next/cache";
import { getContexte } from "@/lib/auth";
import { PLANS } from "@/lib/constantes";
import { creerLienAbonnement, activerAbonnement } from "@/lib/fedapay";
import type { Plan } from "@/lib/types";

/**
 * Souscrit (ou change) un plan d'abonnement.
 * • Clés FedaPay présentes : renvoie l'URL de paiement Mobile Money.
 * • Mode démo (sans clés) : active directement l'abonnement.
 * Réservé à l'administrateur.
 */
export async function souscrire(
  plan: Plan
): Promise<{ url?: string; ok?: boolean; erreur?: string }> {
  const { company, utilisateur } = await getContexte();
  if (utilisateur.role !== "admin") return { erreur: "Réservé à l'administrateur." };
  if (!PLANS[plan]) return { erreur: "Plan invalide." };

  const montant = PLANS[plan].prix;

  try {
    const url = await creerLienAbonnement(company.id, plan, montant);
    if (url) return { url };

    // Mode démo : activation immédiate.
    await activerAbonnement({ companyId: company.id, plan, montant });
    revalidatePath("/app/reglages/abonnement");
    revalidatePath("/app", "layout");
    return { ok: true };
  } catch (e) {
    return { erreur: e instanceof Error ? e.message : "Souscription impossible." };
  }
}
