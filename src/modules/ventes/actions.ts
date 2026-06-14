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

/**
 * Importe des ventes depuis un CSV (format documenté).
 * Crée les clients manquants (par nom), insère les ventes et enregistre
 * les paiements éventuels sur le compte de trésorerie choisi.
 */
export async function importerVentesCSV(formData: FormData): Promise<{
  erreur?: string;
  importees?: number;
  total?: number;
  details?: { ligne: number; message: string }[];
}> {
  const { company, lectureSeule } = await getContexte();
  if (lectureSeule) return { erreur: "Action non autorisée (lecture seule)." };

  const { parseVentesCSV } = await import("@/lib/csv");
  const csv = String(formData.get("csv") || "");
  const account_id = String(formData.get("account_id") || "") || null;
  if (!csv.trim()) return { erreur: "Fichier vide." };

  const { lignes, erreurs } = parseVentesCSV(csv);
  if (lignes.length === 0) {
    return { erreur: erreurs[0]?.message ?? "Aucune ligne valide à importer.", details: erreurs };
  }

  const supabase = createClient();
  const { data: clientsExistants } = await supabase.from("customers").select("id, nom");
  const cle = (n: string) => n.toLowerCase().trim();
  const indexClients = new Map<string, string>();
  for (const c of clientsExistants ?? []) indexClients.set(cle(c.nom), c.id);

  const details = [...erreurs];
  let importees = 0;

  for (let i = 0; i < lignes.length; i++) {
    const l = lignes[i];
    try {
      // Résolution / création du client par nom.
      let customer_id: string | null = null;
      if (l.client) {
        customer_id = indexClients.get(cle(l.client)) ?? null;
        if (!customer_id) {
          const { data, error } = await supabase
            .from("customers")
            .insert({ company_id: company.id, nom: l.client })
            .select("id")
            .single();
          if (error || !data) throw new Error("client : " + (error?.message ?? "échec"));
          const nouvelId = data.id as string;
          customer_id = nouvelId;
          indexClients.set(cle(l.client), nouvelId);
        }
      }

      // Création de la vente (montant_paye recalculé par la RPC si paiement).
      const insert: Record<string, unknown> = {
        company_id: company.id,
        customer_id,
        lignes: [{ produit_id: null, designation: l.designation, quantite: 1, prix_unitaire: l.montant_total }],
        montant_total: l.montant_total,
        montant_paye: 0,
        statut: "impayee",
        echeance: l.echeance,
      };
      if (l.date) insert.date = l.date;

      const { data: vente, error } = await supabase.from("sales").insert(insert).select("id").single();
      if (error || !vente) throw new Error(error?.message ?? "création vente échouée");

      // Paiement initial éventuel.
      if (l.montant_paye > 0) {
        if (!account_id) {
          details.push({
            ligne: i + 2,
            message: "Paiement ignoré : aucun compte de trésorerie sélectionné.",
          });
        } else {
          const { error: errP } = await supabase.rpc("enregistrer_paiement", {
            p_sale_id: vente.id,
            p_account_id: account_id,
            p_montant: l.montant_paye,
            p_moyen: l.moyen,
            p_date: l.date ?? new Date().toISOString().slice(0, 10),
          });
          if (errP) details.push({ ligne: i + 2, message: "Paiement non enregistré : " + errP.message });
        }
      }
      importees++;
    } catch (e) {
      details.push({ ligne: i + 2, message: e instanceof Error ? e.message : "erreur inconnue" });
    }
  }

  revalidatePath("/app/ventes");
  revalidatePath("/app/recouvrement");
  revalidatePath("/app");
  return { importees, total: lignes.length, details };
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

/** Modifie les coordonnées d'un client (pour les relances futures). */
export async function modifierClient(formData: FormData) {
  const { company, lectureSeule } = await getContexte();
  if (lectureSeule) return { erreur: "Action non autorisée (lecture seule)." };

  const id = String(formData.get("id") || "");
  const nom = String(formData.get("nom") || "").trim();
  const telephone = String(formData.get("telephone") || "").trim() || null;
  const email = String(formData.get("email") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  if (!id) return { erreur: "Client introuvable." };
  if (!nom) return { erreur: "Le nom du client est obligatoire." };

  const supabase = createClient();
  const { error } = await supabase
    .from("customers")
    .update({ nom, telephone, email, notes })
    .eq("id", id)
    .eq("company_id", company.id);
  if (error) return { erreur: error.message };

  revalidatePath("/app/clients");
  revalidatePath("/app/recouvrement");
  return { ok: true };
}

/**
 * Rattache un client à une vente qui n'en avait pas (ou en change).
 * Permet de récupérer les coordonnées pour les relances après coup.
 * Si « nouveau_client » est fourni, on crée le client puis on le rattache.
 */
export async function rattacherClient(formData: FormData) {
  const { company, lectureSeule } = await getContexte();
  if (lectureSeule) return { erreur: "Action non autorisée (lecture seule)." };

  const sale_id = String(formData.get("sale_id") || "");
  let customer_id = String(formData.get("customer_id") || "") || null;
  const nouveauNom = String(formData.get("nouveau_client") || "").trim();
  const nouveauTel = String(formData.get("nouveau_telephone") || "").trim() || null;
  if (!sale_id) return { erreur: "Vente introuvable." };

  const supabase = createClient();

  // Création à la volée d'un client si un nom est saisi.
  if (nouveauNom) {
    const { data, error } = await supabase
      .from("customers")
      .insert({ company_id: company.id, nom: nouveauNom, telephone: nouveauTel })
      .select("id")
      .single();
    if (error || !data) return { erreur: error?.message ?? "Création du client impossible." };
    customer_id = data.id;
  }

  if (!customer_id) return { erreur: "Choisissez un client ou saisissez un nom." };

  const { error } = await supabase
    .from("sales")
    .update({ customer_id })
    .eq("id", sale_id)
    .eq("company_id", company.id);
  if (error) return { erreur: error.message };

  revalidatePath("/app/recouvrement");
  revalidatePath("/app/ventes");
  return { ok: true };
}
