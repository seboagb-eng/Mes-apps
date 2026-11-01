import { formatFCFA } from "@/lib/format";

/** Carte d'indicateur (montant FCFA + libellé). Variante alerte : fond late.tint. */
export function StatCard({
  label,
  montant,
  accent = "text-ink",
  hint,
  alerte = false,
}: {
  label: string;
  montant: number;
  accent?: string;
  hint?: string;
  alerte?: boolean;
}) {
  return (
    <div className={`card ${alerte ? "bg-late-tint" : ""}`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className={`mt-1 font-display text-xl font-bold tabular-nums ${accent}`}>
        {formatFCFA(montant)}
      </div>
      {hint ? <div className="mt-0.5 text-xs text-muted">{hint}</div> : null}
    </div>
  );
}

/** Titre de section. */
export function TitreSection({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-base font-bold text-ink">{children}</h2>;
}

/** État vide avec message. */
export function EtatVide({ texte }: { texte: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line py-10 text-center text-sm text-muted">
      {texte}
    </div>
  );
}

const STYLES_STATUT: Record<string, string> = {
  payee: "bg-green-50 text-success",
  partielle: "bg-amber-50 text-warning",
  impayee: "bg-red-50 text-danger",
};
const LIBELLE_STATUT: Record<string, string> = {
  payee: "Payée",
  partielle: "Partielle",
  impayee: "Impayée",
};

/** Pastille de statut d'une vente. */
export function BadgeStatut({ statut }: { statut: string }) {
  return (
    <span className={`badge ${STYLES_STATUT[statut] ?? "bg-gray-100 text-gray-600"}`}>
      {LIBELLE_STATUT[statut] ?? statut}
    </span>
  );
}
