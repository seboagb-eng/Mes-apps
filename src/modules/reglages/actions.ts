"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getContexte } from "@/lib/auth";
import type { RoleUtilisateur } from "@/lib/types";

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

/** Change le mot de passe de l'utilisateur connecté. */
export async function changerMotDePasse(formData: FormData) {
  const actuel = String(formData.get("actuel") || "");
  const nouveau = String(formData.get("nouveau") || "");
  const confirmation = String(formData.get("confirmation") || "");

  if (nouveau.length < 8) return { erreur: "Le nouveau mot de passe doit faire au moins 8 caractères." };
  if (nouveau !== confirmation) return { erreur: "Les mots de passe ne correspondent pas." };

  const supabase = createClient();

  // Vérifier le mot de passe actuel en tentant une connexion.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { erreur: "Session expirée. Reconnectez-vous." };

  const { error: errVerif } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: actuel,
  });
  if (errVerif) return { erreur: "Mot de passe actuel incorrect." };

  const { error } = await supabase.auth.updateUser({ password: nouveau });
  if (error) return { erreur: error.message };

  return { ok: true };
}

/** Génère un mot de passe temporaire lisible (≥ 10 caractères). */
function motDePasseTemporaire(): string {
  const lettres = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
  const chiffres = "23456789";
  const pick = (s: string, n: number) =>
    Array.from({ length: n }, () => s[Math.floor(Math.random() * s.length)]).join("");
  // Forme : 6 lettres + 3 chiffres + « ! » (toujours ≥ 8 et conforme à la politique).
  return pick(lettres, 6) + pick(chiffres, 3) + "!";
}

/**
 * Crée un membre d'équipe : compte d'authentification + profil rattaché à
 * l'entreprise de l'admin. Renvoie un mot de passe temporaire à partager
 * (pas d'envoi d'email — l'admin transmet les identifiants).
 * Réservé à l'administrateur.
 */
export async function inviterUtilisateur(formData: FormData): Promise<{
  ok?: boolean;
  erreur?: string;
  identifiants?: { email: string; motDePasse: string };
}> {
  const { company, utilisateur } = await getContexte();
  if (utilisateur.role !== "admin") return { erreur: "Réservé à l'administrateur." };

  const nom = String(formData.get("nom") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const telephone = String(formData.get("telephone") || "").trim() || null;
  const roleSaisi = String(formData.get("role") || "gestionnaire");
  const role: RoleUtilisateur = (["gestionnaire", "lecture", "admin"] as const).includes(
    roleSaisi as RoleUtilisateur
  )
    ? (roleSaisi as RoleUtilisateur)
    : "gestionnaire";

  if (!nom) return { erreur: "Le nom du membre est obligatoire." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { erreur: "Email invalide." };

  const admin = createAdminClient();
  const motDePasse = motDePasseTemporaire();

  // 1) Créer le compte d'authentification (email déjà confirmé).
  const { data: creation, error: errAuth } = await admin.auth.admin.createUser({
    email,
    password: motDePasse,
    email_confirm: true,
    user_metadata: { nom, telephone },
  });
  if (errAuth || !creation?.user) {
    const msg = errAuth?.message ?? "";
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
      return { erreur: "Cet email a déjà un compte." };
    }
    return { erreur: "Création du compte impossible : " + (msg || "erreur inconnue") };
  }

  // 2) Créer le profil rattaché à l'entreprise de l'admin.
  const { error: errProfil } = await admin.from("users").insert({
    id: creation.user.id,
    company_id: company.id,
    nom,
    telephone,
    email,
    role,
  });
  if (errProfil) {
    // Rollback : supprimer le compte auth orphelin.
    await admin.auth.admin.deleteUser(creation.user.id);
    return { erreur: "Création du profil impossible : " + errProfil.message };
  }

  revalidatePath("/app/reglages");
  return { ok: true, identifiants: { email, motDePasse } };
}

/** Retire un membre de l'équipe (compte auth + profil). Admin uniquement. */
export async function retirerMembre(formData: FormData) {
  const { company, utilisateur } = await getContexte();
  if (utilisateur.role !== "admin") return { erreur: "Réservé à l'administrateur." };

  const id = String(formData.get("id") || "");
  if (!id) return { erreur: "Membre introuvable." };
  if (id === utilisateur.id) return { erreur: "Vous ne pouvez pas vous retirer vous-même." };

  const admin = createAdminClient();
  // Vérifier que le membre appartient bien à l'entreprise de l'admin.
  const { data: membre } = await admin
    .from("users")
    .select("id, company_id")
    .eq("id", id)
    .maybeSingle();
  if (!membre || membre.company_id !== company.id) {
    return { erreur: "Membre introuvable dans votre entreprise." };
  }

  // La suppression du compte auth supprime le profil en cascade (FK on delete cascade).
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { erreur: "Suppression impossible : " + error.message };

  revalidatePath("/app/reglages");
  return { ok: true };
}
