"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Connexion par email + mot de passe. */
export async function connexion(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const motDePasse = String(formData.get("mot_de_passe") || "");

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
  if (error) {
    return { erreur: "Email ou mot de passe incorrect." };
  }
  revalidatePath("/", "layout");
  redirect("/app");
}

/**
 * Inscription : crée le compte auth, puis l'entreprise et le profil admin
 * via la fonction RPC creer_entreprise (atomique, SECURITY DEFINER).
 * Prérequis MVP : confirmation d'email désactivée dans Supabase Auth.
 */
export async function inscription(_prev: unknown, formData: FormData) {
  const nomEntreprise = String(formData.get("nom_entreprise") || "").trim();
  const secteur = String(formData.get("secteur") || "").trim();
  const nomDirigeant = String(formData.get("nom_dirigeant") || "").trim();
  const telephone = String(formData.get("telephone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const motDePasse = String(formData.get("mot_de_passe") || "");

  if (!nomEntreprise || !nomDirigeant || !email || motDePasse.length < 6) {
    return { erreur: "Veuillez remplir tous les champs (mot de passe ≥ 6 caractères)." };
  }

  const supabase = createClient();
  const { error: erreurInscription } = await supabase.auth.signUp({
    email,
    password: motDePasse,
    options: { data: { nom: nomDirigeant, telephone } },
  });
  if (erreurInscription) {
    return { erreur: traduireErreurAuth(erreurInscription.message) };
  }

  // Garantir une session active (si confirmation email désactivée).
  const { error: erreurConnexion } = await supabase.auth.signInWithPassword({
    email,
    password: motDePasse,
  });
  if (erreurConnexion) {
    return {
      erreur:
        "Compte créé. Confirmez votre email puis connectez-vous (la confirmation d'email devrait être désactivée pour le MVP).",
    };
  }

  const { error: erreurEntreprise } = await supabase.rpc("creer_entreprise", {
    p_nom_entreprise: nomEntreprise,
    p_secteur: secteur || null,
    p_nom_dirigeant: nomDirigeant,
    p_telephone: telephone || null,
  });
  if (erreurEntreprise) {
    return { erreur: "Impossible de créer l'entreprise : " + erreurEntreprise.message };
  }

  revalidatePath("/", "layout");
  redirect("/app/demarrage");
}

/** Déconnexion. */
export async function deconnexion() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/connexion");
}

function traduireErreurAuth(message: string): string {
  if (message.includes("already registered")) return "Cet email est déjà utilisé.";
  if (message.includes("Password")) return "Mot de passe trop faible (6 caractères minimum).";
  return "Inscription impossible : " + message;
}
