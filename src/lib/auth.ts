import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Company, Utilisateur } from "@/lib/types";

export interface ContexteApp {
  utilisateur: Utilisateur;
  company: Company;
  lectureSeule: boolean; // true si essai expiré / entreprise bloquée / rôle lecture
}

/**
 * Récupère le contexte de l'utilisateur connecté (profil + entreprise).
 * Redirige vers la connexion si pas de session, vers le démarrage si pas de profil.
 */
export async function getContexte(): Promise<ContexteApp> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profil } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single<Utilisateur>();

  if (!profil) {
    // Compte auth sans entreprise (onboarding interrompu) : on l'envoie vers la
    // page de récupération — surtout PAS vers /inscription, qui boucle avec le
    // middleware (utilisateur connecté → renvoyé vers /app → ...).
    redirect("/demarrage-entreprise");
  }

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", profil.company_id)
    .single<Company>();

  if (!company) redirect("/connexion");

  const essaiExpire =
    company.statut !== "actif" &&
    company.date_fin_essai != null &&
    new Date(company.date_fin_essai) < new Date();

  const lectureSeule =
    company.statut === "bloque" || essaiExpire || profil.role === "lecture";

  return { utilisateur: profil, company, lectureSeule };
}
