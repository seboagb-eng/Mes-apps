import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatCard, BadgeStatut, EtatVide, TitreSection } from "@/components/ui";
import { formatFCFA, formatDateCourte } from "@/lib/format";
import SaisieVente from "@/modules/ventes/SaisieVente";
import ImportCSV from "@/modules/ventes/ImportCSV";
import Encaisser from "@/modules/recouvrement/Encaisser";
import type { Client, Compte } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUTS = [
  { k: "", label: "Toutes" },
  { k: "impayee", label: "Impayées" },
  { k: "partielle", label: "Partielles" },
  { k: "payee", label: "Payées" },
];

export default async function VentesPage({
  searchParams,
}: {
  searchParams: { statut?: string };
}) {
  const supabase = createClient();
  const statut = searchParams.statut || "";

  let q = supabase
    .from("sales")
    .select("id, date, lignes, montant_total, montant_paye, statut, echeance, customer_id")
    .order("date", { ascending: false })
    .limit(50);
  if (statut) q = q.eq("statut", statut);

  const [{ data: ventes }, { data: clients }, { data: comptes }] = await Promise.all([
    q,
    supabase.from("customers").select("*").order("nom"),
    supabase.from("accounts").select("*").order("created_at"),
  ]);

  const listeClients = (clients ?? []) as Client[];
  const nomClient = new Map(listeClients.map((c) => [c.id, c.nom]));
  const totalImpaye = (ventes ?? [])
    .filter((v) => v.statut !== "payee")
    .reduce((s, v) => s + (v.montant_total - v.montant_paye), 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Ventes affichées" montant={(ventes ?? []).reduce((s, v) => s + v.montant_total, 0)} />
        <StatCard label="Reste à encaisser" montant={totalImpaye} accent="text-warning" />
      </div>

      <SaisieVente clients={listeClients} comptes={(comptes ?? []) as Compte[]} />
      <ImportCSV comptes={(comptes ?? []) as Compte[]} />

      <div>
        <div className="mb-3 flex gap-2 overflow-x-auto">
          {STATUTS.map((s) => (
            <Link
              key={s.k}
              href={s.k ? `/app/ventes?statut=${s.k}` : "/app/ventes"}
              className={`badge whitespace-nowrap ${
                statut === s.k ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>

        {!ventes || ventes.length === 0 ? (
          <EtatVide texte="Aucune vente. Enregistrez votre première vente ci-dessus." />
        ) : (
          <ul className="divide-y divide-gray-100 rounded-2xl bg-white ring-1 ring-gray-100">
            {ventes.map((v) => {
              const designation =
                Array.isArray(v.lignes) && v.lignes[0]?.designation
                  ? v.lignes[0].designation
                  : "Vente";
              return (
                <li key={v.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {v.customer_id ? nomClient.get(v.customer_id) ?? "Client" : designation}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDateCourte(v.date)}
                        {v.montant_paye > 0 && v.statut !== "payee"
                          ? ` · payé ${formatFCFA(v.montant_paye)}`
                          : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold tabular-nums">
                        {formatFCFA(v.montant_total)}
                      </div>
                      <BadgeStatut statut={v.statut} />
                    </div>
                  </div>
                  {v.statut !== "payee" ? (
                    <div className="mt-2 flex justify-end">
                      <Encaisser
                        saleId={v.id}
                        resteDu={v.montant_total - v.montant_paye}
                        comptes={(comptes ?? []) as Compte[]}
                      />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
