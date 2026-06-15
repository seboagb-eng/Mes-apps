"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getContexte } from "@/lib/auth";
import type { TypeCompte, TypeMouvement } from "@/lib/types";

/** Crée un compte de trésorerie avec un solde initial. */
export async function creerCompte(formData: FormData) {
  const { company, lectureSeule } = await getContexte();
  if (lectureSeule) return { erreur: "Action non autorisée (lecture seule)." };

  const nom = String(formData.get("nom") || "").trim();
  const type = String(formData.get("type") || "caisse") as TypeCompte;
  const solde = parseInt(String(formData.get("solde_initial") || "0"), 10) || 0;
  if (!nom) return { erreur: "Le nom du compte est obligatoire." };

  const supabase = createClient();
  const { error } = await supabase
    .from("accounts")
    .insert({ company_id: company.id, nom, type, solde_courant: solde });
  if (error) return { erreur: error.message };

  revalidatePath("/app/tresorerie");
  return { ok: true };
}

/** Ajoute une entrée ou une sortie d'argent (le trigger met à jour le solde). */
export async function ajouterMouvement(formData: FormData) {
  const { company, lectureSeule } = await getContexte();
  if (lectureSeule) return { erreur: "Action non autorisée (lecture seule)." };

  const account_id = String(formData.get("account_id") || "");
  const type = String(formData.get("type") || "sortie") as TypeMouvement;
  const categorie = String(formData.get("categorie") || "autres").trim() || "autres";
  const montant = parseInt(String(formData.get("montant") || "0"), 10) || 0;
  const date = String(formData.get("date") || "") || new Date().toISOString().slice(0, 10);
  const description = String(formData.get("description") || "").trim() || null;

  if (!account_id) return { erreur: "Choisissez un compte." };
  if (montant <= 0) return { erreur: "Le montant doit être positif." };

  const supabase = createClient();
  const { error } = await supabase.from("transactions").insert({
    company_id: company.id,
    account_id,
    type,
    categorie,
    montant,
    date,
    description,
  });
  if (error) return { erreur: error.message };

  revalidatePath("/app/tresorerie");
  revalidatePath("/app");
  return { ok: true };
}

/** Exporte les mouvements de trésorerie en CSV (archives / comptable). */
export async function exporterTransactionsCSV(): Promise<{
  csv?: string;
  nom?: string;
  erreur?: string;
}> {
  await getContexte();
  const { genererCsv } = await import("@/lib/exportCsv");
  const supabase = createClient();

  const [{ data: mouvements }, { data: comptes }] = await Promise.all([
    supabase
      .from("transactions")
      .select("date, type, categorie, montant, description, account_id")
      .order("date", { ascending: false }),
    supabase.from("accounts").select("id, nom"),
  ]);

  const nomCompte = new Map((comptes ?? []).map((c) => [c.id, c.nom]));
  const lignes = (mouvements ?? []).map((m) => [
    m.date,
    m.type,
    nomCompte.get(m.account_id) ?? "",
    m.categorie,
    m.montant,
    m.description ?? "",
  ]);

  const csv = genererCsv(
    ["date", "type", "compte", "categorie", "montant", "description"],
    lignes
  );
  return { csv, nom: `tresorerie-${new Date().toISOString().slice(0, 10)}.csv` };
}

/** Transfert d'argent entre deux comptes (RPC atomique). */
export async function transferer(formData: FormData) {
  const { lectureSeule } = await getContexte();
  if (lectureSeule) return { erreur: "Action non autorisée (lecture seule)." };

  const source = String(formData.get("source") || "");
  const destination = String(formData.get("destination") || "");
  const montant = parseInt(String(formData.get("montant") || "0"), 10) || 0;
  const date = String(formData.get("date") || "") || new Date().toISOString().slice(0, 10);

  const supabase = createClient();
  const { error } = await supabase.rpc("transferer_tresorerie", {
    p_source: source,
    p_destination: destination,
    p_montant: montant,
    p_date: date,
    p_description: "Transfert entre comptes",
  });
  if (error) return { erreur: error.message };

  revalidatePath("/app/tresorerie");
  return { ok: true };
}
