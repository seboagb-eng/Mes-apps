import { createClient } from "@/lib/supabase/server";
import { getContexte } from "@/lib/auth";
import { StatCard, EtatVide, TitreSection } from "@/components/ui";
import { formatFCFA, ancienneteJours, trancheAnciennete, formatDateCourte } from "@/lib/format";
import Relancer from "@/modules/recouvrement/Relancer";
import Encaisser from "@/modules/recouvrement/Encaisser";
import ClientCreance from "@/modules/recouvrement/ClientCreance";
import type { Client, Compte } from "@/lib/types";

export const dynamic = "force-dynamic";

const COULEUR_TRANCHE: Record<string, string> = {
  "0-30": "bg-green-50 text-success",
  "31-60": "bg-amber-50 text-warning",
  "+60": "bg-red-50 text-danger",
};

export default async function RecouvrementPage() {
  const { company } = await getContexte();
  const supabase = createClient();

  const [{ data: ventes }, { data: clients }, { data: relances }, { data: comptesData }] =
    await Promise.all([
      supabase
        .from("sales")
        .select("id, customer_id, montant_total, montant_paye, statut, echeance, date")
        .neq("statut", "payee")
        .order("echeance", { ascending: true, nullsFirst: false }),
      supabase.from("customers").select("*").order("nom"),
      supabase
        .from("reminders")
        .select("sale_id, ton, canal, date_envoi")
        .order("date_envoi", { ascending: false })
        .limit(100),
      supabase.from("accounts").select("*").order("created_at"),
    ]);

  const listeClients = (clients ?? []) as Client[];
  const comptes = (comptesData ?? []) as Compte[];
  const clientParId = new Map(listeClients.map((c) => [c.id, c]));

  const creances = (ventes ?? [])
    .map((v) => {
      const du = v.montant_total - v.montant_paye;
      const jours = v.echeance ? ancienneteJours(v.echeance) : ancienneteJours(v.date);
      return { ...v, du, jours, tranche: trancheAnciennete(Math.max(0, jours)) };
    })
    .filter((v) => v.du > 0);

  const totalDu = creances.reduce((s, v) => s + v.du, 0);
  const parTranche = {
    "0-30": creances.filter((c) => c.tranche === "0-30").reduce((s, c) => s + c.du, 0),
    "31-60": creances.filter((c) => c.tranche === "31-60").reduce((s, c) => s + c.du, 0),
    "+60": creances.filter((c) => c.tranche === "+60").reduce((s, c) => s + c.du, 0),
  };

  // Dernière relance + nombre de relances par vente.
  const derniereRelance = new Map<string, { ton: string; date_envoi: string | null }>();
  const nbRelances = new Map<string, number>();
  for (const r of relances ?? []) {
    if (!derniereRelance.has(r.sale_id)) {
      derniereRelance.set(r.sale_id, { ton: r.ton, date_envoi: r.date_envoi });
    }
    nbRelances.set(r.sale_id, (nbRelances.get(r.sale_id) ?? 0) + 1);
  }

  return (
    <div className="space-y-5">
      <TitreSection>Créances à recouvrer</TitreSection>

      <div className="card bg-warning/10">
        <div className="text-xs font-medium text-warning">Total dû par les clients</div>
        <div className="mt-1 text-2xl font-extrabold tabular-nums text-warning">
          {formatFCFA(totalDu)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="0–30 jours" montant={parTranche["0-30"]} accent="text-success" />
        <StatCard label="31–60 jours" montant={parTranche["31-60"]} accent="text-warning" />
        <StatCard label="+60 jours" montant={parTranche["+60"]} accent="text-danger" />
      </div>

      {creances.length === 0 ? (
        <EtatVide texte="Aucune créance en cours. Tout est encaissé 🎉" />
      ) : (
        <ul className="space-y-3">
          {creances.map((c) => {
            const client = c.customer_id ? clientParId.get(c.customer_id) : null;
            const rel = derniereRelance.get(c.id);
            return (
              <li key={c.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold">{client?.nom ?? "Client non renseigné"}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                      <span className={`badge ${COULEUR_TRANCHE[c.tranche]}`}>
                        {c.jours > 0 ? `${c.jours} j de retard` : "à échéance"}
                      </span>
                      {c.echeance ? <span>échéance {formatDateCourte(c.echeance)}</span> : null}
                    </div>
                    <div className="mt-1">
                      <ClientCreance saleId={c.id} client={client ?? null} clients={listeClients} />
                    </div>
                    {rel ? (
                      <div className="mt-1 text-xs text-gray-400">
                        Relancé {nbRelances.get(c.id) ?? 1}×
                        {" · dernière "}
                        {rel.date_envoi ? formatDateCourte(rel.date_envoi) : "—"} ({rel.ton})
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-gray-300">Jamais relancé</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold tabular-nums">{formatFCFA(c.du)}</div>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap justify-end gap-2">
                  <Encaisser
                    saleId={c.id}
                    resteDu={c.du}
                    comptes={comptes}
                    nomEntreprise={company.nom}
                    nomClient={client?.nom ?? "cher client"}
                    telephoneClient={client?.telephone ?? null}
                  />
                  <Relancer
                    saleId={c.id}
                    nomEntreprise={company.nom}
                    nomClient={client?.nom ?? "cher client"}
                    telephoneClient={client?.telephone ?? null}
                    montantDu={c.du}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
