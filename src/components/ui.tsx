import { formatFCFA } from "@/lib/format";

/** Carte d'indicateur (montant FCFA + libellé). */
export function StatCard({
  label,
  montant,
  accent = "text-gray-900",
  hint,
}: {
  label: string;
  montant: number;
  accent?: string;
  hint?: string;
}) {
  return (
    <div className="card">
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className={`mt-1 text-lg font-bold tabular-nums ${accent}`}>{formatFCFA(montant)}</div>
      {hint ? <div className="mt-0.5 text-xs text-gray-400">{hint}</div> : null}
    </div>
  );
}

/** Titre de section. */
export function TitreSection({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-base font-bold text-gray-800">{children}</h2>;
}

/** État vide avec message. */
export function EtatVide({ texte }: { texte: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
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
