import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TitreSection } from "@/components/ui";
import FormulairesTresorerie from "@/modules/tresorerie/Formulaires";
import SaisieClient from "@/modules/ventes/SaisieClient";
import SaisieProduit from "@/modules/reglages/SaisieProduit";
import type { Compte } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Assistant de démarrage : 3 étapes pour configurer l'entreprise. */
export default async function DemarragePage() {
  const supabase = createClient();
  const [{ data: comptes }, { count: nbClients }, { count: nbProduits }] = await Promise.all([
    supabase.from("accounts").select("*").order("created_at"),
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
  ]);

  const liste = (comptes ?? []) as Compte[];
  const etape1 = liste.length > 0;
  const etape2 = (nbClients ?? 0) > 0;
  const etape3 = (nbProduits ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Bienvenue sur PILOT 👋</h1>
        <p className="text-sm text-gray-600">
          Trois étapes rapides pour démarrer. Vous pourrez tout modifier ensuite.
        </p>
      </div>

      <section>
        <TitreSection>
          {etape1 ? "✅" : "1️⃣"} Vos comptes de trésorerie
        </TitreSection>
        <p className="mb-3 text-sm text-gray-500">
          Créez votre caisse, votre Mobile Money et votre banque avec leurs soldes actuels.
        </p>
        <FormulairesTresorerie comptes={liste} />
      </section>

      <section>
        <TitreSection>{etape2 ? "✅" : "2️⃣"} Vos premiers clients</TitreSection>
        <p className="mb-3 text-sm text-gray-500">Ajoutez au moins 3 clients réguliers.</p>
        <SaisieClient />
      </section>

      <section>
        <TitreSection>{etape3 ? "✅" : "3️⃣"} Vos produits / services</TitreSection>
        <p className="mb-3 text-sm text-gray-500">Ajoutez 3 produits avec leur prix de vente.</p>
        <SaisieProduit />
      </section>

      <Link href="/app" className="btn-primary w-full">
        {etape1 && etape2 && etape3 ? "Terminer — aller au tableau de bord" : "Passer pour l'instant"}
      </Link>
    </div>
  );
}
