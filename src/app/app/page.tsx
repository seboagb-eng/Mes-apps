import Link from "next/link";
import { chargerDashboard } from "@/modules/dashboard/queries";
import { GraphiqueCA, GraphiqueDepenses } from "@/modules/dashboard/Graphiques";
import { StatCard, TitreSection } from "@/components/ui";
import { formatFCFA } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const d = await chargerDashboard();

  return (
    <div className="space-y-6">
      {/* Alertes */}
      {d.alertes.length > 0 ? (
        <div className="space-y-2">
          {d.alertes.map((a, i) => (
            <div
              key={i}
              className={`rounded-xl px-3 py-2 text-sm ${
                a.type === "danger" ? "bg-red-50 text-danger" : "bg-amber-50 text-warning"
              }`}
            >
              ⚠️ {a.texte}
            </div>
          ))}
        </div>
      ) : null}

      {/* Indicateurs */}
      <section>
        <TitreSection>Comment va ma boîte ?</TitreSection>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="CA du mois" montant={d.caMois} accent="text-primary" />
          <StatCard label="CA du jour" montant={d.caJour} />
          <StatCard label="Dépenses du mois" montant={d.depensesMois} accent="text-danger" />
          <StatCard label="Cash disponible" montant={d.cashTotal} accent="text-success" />
        </div>
      </section>

      <section>
        <TitreSection>Où est mon argent ?</TitreSection>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/app/recouvrement" className="block">
            <StatCard
              label="Créances clients"
              montant={d.totalCreances}
              accent="text-warning"
              hint="Toucher pour relancer →"
            />
          </Link>
          <Link href="/app/tresorerie" className="block">
            <StatCard label="Trésorerie totale" montant={d.cashTotal} hint="Voir le détail →" />
          </Link>
        </div>
      </section>

      {/* Graphique CA */}
      <section className="card">
        <TitreSection>Chiffre d'affaires — 12 semaines</TitreSection>
        <GraphiqueCA data={d.serieCA} />
      </section>

      {/* Graphique dépenses */}
      <section className="card">
        <TitreSection>Répartition des dépenses du mois</TitreSection>
        <GraphiqueDepenses data={d.repartitionDepenses} />
      </section>

      {/* Top clients */}
      <section className="card">
        <TitreSection>Top 3 clients du mois</TitreSection>
        {d.topClients.length === 0 ? (
          <p className="text-sm text-gray-400">Pas encore de vente ce mois-ci.</p>
        ) : (
          <ol className="space-y-2">
            {d.topClients.map((c, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {i + 1}. {c.nom}
                </span>
                <span className="font-semibold tabular-nums">{formatFCFA(c.montant)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
