import Link from "next/link";
import { getContexte } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TitreSection, EtatVide } from "@/components/ui";
import { formatFCFA } from "@/lib/format";
import InfosEntreprise from "@/modules/reglages/InfosEntreprise";
import SaisieProduit from "@/modules/reglages/SaisieProduit";
import ChangerMotDePasse from "@/modules/reglages/ChangerMotDePasse";
import { PLANS } from "@/lib/constantes";
import type { Produit } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReglagesPage() {
  const { company, utilisateur } = await getContexte();
  const supabase = createClient();
  const { data: produits } = await supabase.from("products").select("*").order("nom");
  const liste = (produits ?? []) as Produit[];

  return (
    <div className="space-y-6">
      <TitreSection>Réglages</TitreSection>

      <section className="card">
        <h3 className="mb-3 font-bold">Informations de l'entreprise</h3>
        <InfosEntreprise company={company} />
      </section>

      <section className="card">
        <h3 className="mb-3 font-bold">Mon compte</h3>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Nom</dt>
            <dd className="font-medium">{utilisateur.nom}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium">{utilisateur.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Rôle</dt>
            <dd className="font-medium capitalize">{utilisateur.role}</dd>
          </div>
        </dl>
        <div className="mt-4">
          <ChangerMotDePasse />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold">Catalogue produits</h3>
        </div>
        <div className="mb-3">
          <SaisieProduit />
        </div>
        {liste.length === 0 ? (
          <EtatVide texte="Aucun produit." />
        ) : (
          <ul className="divide-y divide-gray-100 rounded-2xl bg-white ring-1 ring-gray-100">
            {liste.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{p.nom}</div>
                  {p.unite ? <div className="text-xs text-gray-400">par {p.unite}</div> : null}
                </div>
                <div className="text-sm font-semibold tabular-nums">{formatFCFA(p.prix_vente)}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h3 className="mb-1 font-bold">Abonnement</h3>
        <p className="mb-3 text-sm text-gray-500">
          Plan actuel : <span className="font-semibold capitalize">{company.plan}</span> ·{" "}
          {PLANS[company.plan]?.prix ? `${formatFCFA(PLANS[company.plan].prix)}/mois` : "essai"}
        </p>
        <Link href="/app/reglages/abonnement" className="btn-secondary w-full">
          Gérer mon abonnement
        </Link>
      </section>
    </div>
  );
}
