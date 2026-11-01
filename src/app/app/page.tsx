import Link from "next/link";
import { chargerDashboard } from "@/modules/dashboard/queries";
import { getContexte } from "@/lib/auth";
import CarteVerdict from "@/components/CarteVerdict";
import BarreRepartition from "@/components/BarreRepartition";
import { Icone } from "@/components/Icone";
import { formatFCFA } from "@/lib/format";

export const dynamic = "force-dynamic";

const JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function formatDateEntete(): string {
  const d = new Date();
  return `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`;
}

function abrev(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M`;
  if (n >= 1_000) return `${(n / 1_000).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} k`;
  return n.toLocaleString("fr-FR");
}

export default async function DashboardPage() {
  const [d, { company }] = await Promise.all([chargerDashboard(), getContexte()]);

  const moisNom = MOIS[new Date().getMonth()];
  const totalArgent = d.cashTotal + d.totalCreances;

  return (
    <div className="flex flex-col gap-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-muted">{formatDateEntete()}</span>
          <span className="font-display text-[22px] font-extrabold leading-tight">{company.nom}</span>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-success-tint px-2.5 py-1.5 text-xs font-bold text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          En direct
        </span>
      </div>

      {/* Verdict */}
      <CarteVerdict etat={d.verdict.etat} phrase={d.verdict.phrase} />

      {/* Où est mon argent ? */}
      <section
        aria-labelledby="tres"
        className="flex flex-col gap-3.5 rounded-[22px] bg-surface p-[18px]"
      >
        <div className="flex flex-col gap-1">
          <h2 id="tres" className="text-sm font-bold text-muted">
            Où est mon argent ?
          </h2>
          <span className="font-display text-[38px] font-extrabold leading-none tracking-tight tabular-nums">
            {totalArgent.toLocaleString("fr-FR")}{" "}
            <span className="text-base font-bold text-muted">FCFA</span>
          </span>
        </div>
        <BarreRepartition
          segments={[
            { cle: "banque", label: "Banque", montant: d.cashParType.banque },
            { cle: "mobile_money", label: "Mobile Money", montant: d.cashParType.mobile_money },
            { cle: "caisse", label: "Caisse", montant: d.cashParType.caisse },
            { cle: "clients", label: "Chez clients", montant: d.totalCreances },
          ]}
        />
      </section>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 gap-2.5">
        <Link
          href="/app/ventes/nouvelle"
          className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-primary font-extrabold text-base text-white no-underline"
        >
          <Icone nom="plus" taille={20} />
          Vente
        </Link>
        <Link
          href="/app/tresorerie/depense"
          className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl border border-line bg-surface font-extrabold text-base text-ink no-underline"
        >
          <Icone nom="moins" taille={20} />
          Dépense
        </Link>
      </div>

      {/* Stats du mois */}
      <section
        aria-labelledby="mois"
        className="flex flex-col gap-3 rounded-[22px] bg-surface p-[18px]"
      >
        <h2 id="mois" className="text-sm font-bold text-muted capitalize">
          {moisNom}, à ce jour
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-muted">Ventes</span>
            <span className="font-display text-[19px] font-bold tabular-nums">{abrev(d.caMois)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-muted">Dépenses</span>
            <span className="font-display text-[19px] font-bold tabular-nums">{abrev(d.depensesMois)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-muted">Marge</span>
            <span
              className={`font-display text-[19px] font-bold tabular-nums ${
                d.margeMois >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {d.margeMois >= 0 ? "+" : ""}
              {abrev(d.margeMois)}
            </span>
          </div>
        </div>
      </section>

      {/* Relances */}
      {d.topRelances.length > 0 ? (
        <section
          aria-labelledby="rel"
          className="flex flex-col gap-3 rounded-[22px] bg-surface p-[18px]"
        >
          <div className="flex items-center justify-between">
            <h2 id="rel" className="text-sm font-bold text-muted">
              À relancer aujourd'hui
            </h2>
            <Link
              href="/app/recouvrement"
              className="py-2 text-sm font-extrabold text-primary"
            >
              Tout voir
            </Link>
          </div>
          <div className="flex flex-col gap-0.5">
            {d.topRelances.map((r, i) => (
              <Link
                key={i}
                href="/app/recouvrement"
                className="flex min-h-[48px] items-center gap-3 text-ink no-underline"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-late-tint text-sm font-extrabold text-late-text">
                  {r.initiales}
                </span>
                <span className="flex flex-1 flex-col">
                  <b className="text-[15px]">{r.nom}</b>
                  <span className="text-xs font-bold text-late-text">
                    {r.joursRetard} jour{r.joursRetard !== 1 ? "s" : ""} de retard
                  </span>
                </span>
                <b className="text-[15px] tabular-nums">
                  {formatFCFA(r.montantDu)}
                </b>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Alertes */}
      {d.alertes.length > 0 ? (
        <div className="flex flex-col gap-2">
          {d.alertes.map((a, i) => (
            <div
              key={i}
              className={`rounded-xl px-3 py-2 text-sm ${
                a.type === "danger" ? "bg-red-50 text-danger" : "bg-late-tint text-late-text"
              }`}
            >
              {a.texte}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
