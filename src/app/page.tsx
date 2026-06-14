import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Page d'accueil publique. Redirige vers l'app si déjà connecté. */
export default async function AccueilPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/app");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-2 text-4xl font-extrabold tracking-tight text-primary">PILOT</div>
      <h1 className="mb-3 text-2xl font-bold leading-snug">
        Pilotez votre entreprise. Récupérez votre argent.
      </h1>
      <p className="mb-8 text-gray-600">
        Suivez vos ventes, vos dépenses et votre trésorerie. Relancez vos clients par WhatsApp
        avec un lien de paiement Mobile Money. Conçu pour les PME du Bénin.
      </p>

      <div className="space-y-3">
        <Link href="/inscription" className="btn-primary w-full">
          Créer mon compte — 14 jours gratuits
        </Link>
        <Link href="/connexion" className="btn-secondary w-full">
          J'ai déjà un compte
        </Link>
      </div>

      <ul className="mt-10 space-y-3 text-sm text-gray-600">
        <li>✓ Vue claire : « Comment va ma boîte ? » et « Où est mon argent ? »</li>
        <li>✓ Recouvrement par WhatsApp et Mobile Money</li>
        <li>✓ Tout en FCFA, en français, rapide même en 3G</li>
      </ul>
    </main>
  );
}
