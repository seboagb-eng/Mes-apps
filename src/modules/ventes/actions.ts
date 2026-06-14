"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getContexte } from "@/lib/auth";
import type { LigneVente, MoyenPaiement, StatutVente } from "@/lib/types";

/**
 * Crée une vente rapide. Mode « montant libre » (une désignation + un total)
 * ou liste de lignes encodées en JSON dans le champ « lignes ».
 * Si un montant est payé immédiatement, on enregistre le paiement via RPC
 * (qui crédite le compte de trésorerie choisi).
 */
export async function creerVente(formData: FormData) {
  const { company, lectureSeule } = await getContexte();
  if (lectureSeule) return { erreur: "Action non autorisée (lecture seule)." };

  const customer_id = String(formData.get("customer_id") || "") || null;
  const designation = String(formData.get("designation") || "Vente").trim() || "Vente";
  const montant_total = parseInt(String(formData.get("montant_total") || "0"), 10) || 0;
  const montant_paye = Math.min(
    parseInt(String(formData.get("montant_paye") || "0"), 10) || 0,
    montant_total
  );
  const date = String(formData.get("date") || "") || new Date().toISOString().slice(0, 10);
  const echeance = String(formData.get("echeance") || "") || null;
  const account_id = String(formData.get("account_id") || "") || null;
  const moyen = (String(formData.get("moyen") || "especes") as MoyenPaiement) || "especes";

  if (montant_total <= 0) return { erreur: "Le montant total doit être positif." };
  if (montant_paye > 0 && !account_id) {
    return { erreur: "Choisissez le compte qui reçoit le paiement." };
  }

  const lignes: LigneVente[] = [
    { produit_id: null, designation, quantite: 1, prix_unitaire: montant_total },
  ];
  const statut: StatutVente =
    montant_paye >= montant_total ? "payee" : montant_paye > 0 ? "partielle" : "impayee";

  const supabase = createClient();
  // 1) Créer la vente sans le paiement (montant_paye recalculé par la RPC).
  const { data: vente, error } = await supabase
    .from("sales")
    .insert({
      company_id: company.id,
      customer_id,
      date,
      lignes,
      montant_total,
      montant_paye: 0,
      statut: "impayee",
      echeance,
    })
    .select("id")
    .single();
  if (error || !vente) return { erreur: error?.message ?? "Création impossible." };

  // 2) Enregistrer le paiement initial éventuel (crédite la trésorerie).
  if (montant_paye > 0 && account_id) {
    const { error: errPaiement } = await supabase.rpc("enregistrer_paiement", {
      p_sale_id: vente.id,
      p_account_id: account_id,
      p_montant: montant_paye,
      p_moyen: moyen,
      p_date: date,
    });
    if (errPaiement) return { erreur: "Vente créée mais paiement échoué : " + errPaiement.message };
  } else {
    // Pas de paiement : on fige le statut calculé.
    await supabase.from("sales").update({ statut }).eq("id", vente.id);
  }

  revalidatePath("/app/ventes");
  revalidatePath("/app/recouvrement");
  revalidatePath("/app");
  return { ok: true };
}

/** Encaisse un montant sur une vente existante (créance). */
export async function encaisser(formData: FormData) {
  const { lectureSeule } = await getContexte();
  if (lectureSeule) return { erreur: "Action non autorisée (lecture seule)." };

  const sale_id = String(formData.get("sale_id") || "");
  const account_id = String(formData.get("account_id") || "");
  const montant = parseInt(String(formData.get("montant") || "0"), 10) || 0;
  const moyen = (String(formData.get("moyen") || "especes") as MoyenPaiement) || "especes";
  const date = new Date().toISOString().slice(0, 10);

  if (!account_id) return { erreur: "Choisissez un compte." };
  if (montant <= 0) return { erreur: "Montant invalide." };

  const supabase = createClient();
  const { error } = await supabase.rpc("enregistrer_paiement", {
    p_sale_id: sale_id,
    p_account_id: account_id,
    p_montant: montant,
    p_moyen: moyen,
    p_date: date,
  });
  if (error) return { erreur: error.message };

  revalidatePath("/app/ventes");
  revalidatePath("/app/recouvrement");
  revalidatePath("/app");
  return { ok: true };
}

/** Crée un client. */
export async function creerClient(formData: FormData) {
  const { company, lectureSeule } = await getContexte();
  if (lectureSeule) return { erreur: "Action non autorisée (lecture seule)." };

  const nom = String(formData.get("nom") || "").trim();
  const telephone = String(formData.get("telephone") || "").trim() || null;
  const email = String(formData.get("email") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  if (!nom) return { erreur: "Le nom du client est obligatoire." };

  const supabase = createClient();
  const { error } = await supabase
    .from("customers")
    .insert({ company_id: company.id, nom, telephone, email, notes });
  if (error) return { erreur: error.message };

  revalidatePath("/app/clients");
  revalidatePath("/app/ventes");
  return { ok: true };
}
