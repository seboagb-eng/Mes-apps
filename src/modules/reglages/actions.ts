"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getContexte } from "@/lib/auth";

/** Crée un produit/service du catalogue. */
export async function creerProduit(formData: FormData) {
  const { company, lectureSeule } = await getContexte();
  if (lectureSeule) return { erreur: "Action non autorisée (lecture seule)." };

  const nom = String(formData.get("nom") || "").trim();
  const prix_vente = parseInt(String(formData.get("prix_vente") || "0"), 10) || 0;
  const prix_achat = formData.get("prix_achat")
    ? parseInt(String(formData.get("prix_achat")), 10)
    : null;
  const unite = String(formData.get("unite") || "").trim() || null;
  if (!nom) return { erreur: "Le nom du produit est obligatoire." };

  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .insert({ company_id: company.id, nom, prix_vente, prix_achat, unite });
  if (error) return { erreur: error.message };

  revalidatePath("/app/reglages");
  revalidatePath("/app/demarrage");
  return { ok: true };
}

/** Met à jour les informations de l'entreprise. */
export async function majEntreprise(formData: FormData) {
  const { company, utilisateur } = await getContexte();
  if (utilisateur.role !== "admin") return { erreur: "Réservé à l'administrateur." };

  const nom = String(formData.get("nom") || "").trim();
  const secteur = String(formData.get("secteur") || "").trim() || null;
  if (!nom) return { erreur: "Le nom de l'entreprise est obligatoire." };

  const supabase = createClient();
  const { error } = await supabase
    .from("companies")
    .update({ nom, secteur })
    .eq("id", company.id);
  if (error) return { erreur: error.message };

  revalidatePath("/app");
  return { ok: true };
}

/** Invite/crée un utilisateur de l'équipe (placeholder MVP : crée le profil). */
export async function inviterUtilisateur(formData: FormData) {
  const { utilisateur } = await getContexte();
  if (utilisateur.role !== "admin") return { erreur: "Réservé à l'administrateur." };
  // L'invitation complète (envoi d'email + création auth) viendra en phase 2.
  return {
    erreur:
      "Invitation d'équipe disponible en phase 2. Pour l'instant, partagez vos identifiants ou contactez le support.",
  };
}
