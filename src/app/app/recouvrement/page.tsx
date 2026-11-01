import { createClient } from "@/lib/supabase/server";
import { getContexte } from "@/lib/auth";
import { ancienneteJours } from "@/lib/format";
import RecouvrementUI from "@/modules/recouvrement/RecouvrementUI";
import type { Compte, Client } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RecouvrementPage() {
  const { company } = await getContexte();
  const supabase = createClient();

  const [{ data: ventes }, { data: clients }, { data: comptesData }] = await Promise.all([
    supabase
      .from("sales")
      .select("id, customer_id, montant_total, montant_paye, statut, echeance, date")
      .neq("statut", "payee")
      .order("echeance", { ascending: true, nullsFirst: false }),
    supabase.from("customers").select("id, nom, telephone").order("nom"),
    supabase.from("accounts").select("*").order("created_at"),
  ]);

  const listeClients = (clients ?? []) as Pick<Client, "id" | "nom" | "telephone">[];
  const comptes = (comptesData ?? []) as Compte[];
  const clientParId = new Map(listeClients.map((c) => [c.id, c]));

  const aujourdHui = new Date().toISOString().slice(0, 10);

  const creances = (ventes ?? [])
    .map((v) => {
      const du = v.montant_total - v.montant_paye;
      const refDate = v.echeance ?? v.date;
      const jours = Math.max(0, ancienneteJours(refDate));
      const enRetard = !!v.echeance && v.echeance < aujourdHui;
      const client = v.customer_id ? clientParId.get(v.customer_id) : null;
      return { id: v.id, du, jours, enRetard, client };
    })
    .filter((v) => v.du > 0);

  const totalDu = creances.reduce((s, c) => s + c.du, 0);
  const enRetardTotal = creances.filter((c) => c.enRetard).reduce((s, c) => s + c.du, 0);

  const creanceItems = creances.map((c) => ({
    id: c.id,
    nomClient: c.client?.nom ?? "Client",
    telephone: c.client?.telephone ?? null,
    joursRetard: c.jours,
    montantDu: c.du,
    enRetard: c.enRetard,
  }));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-[26px] font-extrabold text-ink">Relances</h1>
      <RecouvrementUI
        creances={creanceItems}
        totalDu={totalDu}
        enRetardTotal={enRetardTotal}
        nomEntreprise={company.nom}
        comptes={comptes}
      />
    </div>
  );
}
