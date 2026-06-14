import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FormulaireEntreprise from "./Formulaire";

export const dynamic = "force-dynamic";

/**
 * Page de récupération d'onboarding pour un utilisateur connecté SANS entreprise.
 * Volontairement HORS du layout /app (qui exige déjà une entreprise) pour
 * éviter toute boucle de redirection.
 */
export default async function DemarrageEntreprisePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  // Si l'utilisateur a déjà une entreprise, rien à faire ici.
  const { data: profil } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (profil) redirect("/app");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-2 text-2xl font-extrabold text-primary">PILOT</div>
      <h1 className="mb-1 text-xl font-bold">Finalisons votre inscription</h1>
      <p className="mb-6 text-sm text-gray-600">
        Votre compte est créé. Il ne reste qu'à enregistrer votre entreprise.
      </p>
      <FormulaireEntreprise nomParDefaut={(user.user_metadata as any)?.nom ?? ""} />
    </main>
  );
}
