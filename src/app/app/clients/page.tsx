import { createClient } from "@/lib/supabase/server";
import { EtatVide, TitreSection } from "@/components/ui";
import SaisieClient from "@/modules/ventes/SaisieClient";
import ClientItem from "@/modules/ventes/ClientItem";
import type { Client } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const supabase = createClient();
  const [{ data: clients }, { data: ventes }] = await Promise.all([
    supabase.from("customers").select("*").order("nom"),
    supabase.from("sales").select("customer_id, montant_total, montant_paye, statut"),
  ]);

  // Solde dû par client.
  const duParClient = new Map<string, number>();
  for (const v of ventes ?? []) {
    if (v.customer_id && v.statut !== "payee") {
      duParClient.set(
        v.customer_id,
        (duParClient.get(v.customer_id) ?? 0) + (v.montant_total - v.montant_paye)
      );
    }
  }

  const liste = (clients ?? []) as Client[];

  return (
    <div className="space-y-5">
      <TitreSection>Clients</TitreSection>
      <SaisieClient />

      {liste.length === 0 ? (
        <EtatVide texte="Aucun client. Ajoutez votre premier client ci-dessus." />
      ) : (
        <ul className="divide-y divide-gray-100 rounded-2xl bg-white ring-1 ring-gray-100">
          {liste.map((c) => (
            <ClientItem key={c.id} client={c} du={duParClient.get(c.id) ?? 0} />
          ))}
        </ul>
      )}
    </div>
  );
}
