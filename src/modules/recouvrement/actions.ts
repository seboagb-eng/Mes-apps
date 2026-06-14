"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getContexte } from "@/lib/auth";
import { creerLienPaiement } from "@/lib/fedapay";
import type { CanalRelance, TonRelance } from "@/lib/types";

/**
 * Enregistre une relance dans l'historique et, si demandé, génère un lien
 * de paiement FedaPay rattaché à la facture. Retourne le lien éventuel pour
 * que le client puisse l'insérer dans le message WhatsApp/SMS.
 */
export async function preparerRelance(formData: FormData): Promise<{
  erreur?: string;
  ok?: boolean;
  lien_paiement?: string | null;
}> {
  const { company, lectureSeule } = await getContexte();
  if (lectureSeule) return { erreur: "Action non autorisée (lecture seule)." };

  const sale_id = String(formData.get("sale_id") || "");
  const canal = (String(formData.get("canal") || "whatsapp") as CanalRelance) || "whatsapp";
  const ton = (String(formData.get("ton") || "courtois") as TonRelance) || "courtois";
  const avecPaiement = String(formData.get("avec_paiement") || "") === "1";

  if (!sale_id) return { erreur: "Vente introuvable." };

  let lien_paiement: string | null = null;
  if (avecPaiement) {
    try {
      lien_paiement = await creerLienPaiement(sale_id);
    } catch (e) {
      // On n'empêche pas la relance si le lien échoue : on relance sans lien.
      lien_paiement = null;
    }
  }

  const supabase = createClient();
  const { error } = await supabase.from("reminders").insert({
    company_id: company.id,
    sale_id,
    canal,
    ton,
    statut: "envoyee",
    date_envoi: new Date().toISOString(),
    lien_paiement,
  });
  if (error) return { erreur: error.message };

  revalidatePath("/app/recouvrement");
  return { ok: true, lien_paiement };
}
