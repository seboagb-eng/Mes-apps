import { formatFCFA } from "@/lib/format";

type TypeOp = "vente" | "depense" | "credit";

const CONFIG: Record<TypeOp, { signe: string; couleur: string; fond: string }> = {
  vente:   { signe: "+", couleur: "text-success", fond: "bg-success-tint" },
  depense: { signe: "−", couleur: "text-ink",     fond: "bg-divider" },
  credit:  { signe: "→", couleur: "text-late-text", fond: "bg-late-tint" },
};

/**
 * Ligne d'une opération dans le journal d'activité.
 * Avatar 36–40px, titre + sous-titre, montant à droite.
 */
export default function LigneOperation({
  type,
  titre,
  sousTitre,
  montant,
}: {
  type: TypeOp;
  titre: string;
  sousTitre?: string;
  montant: number;
}) {
  const c = CONFIG[type];
  return (
    <div className="flex items-center gap-3 min-h-[60px] py-2">
      {/* Avatar */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${c.fond} ${c.couleur}`}
        aria-hidden="true"
      >
        {c.signe}
      </div>

      {/* Texte */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-ink">{titre}</div>
        {sousTitre ? (
          <div className="truncate text-xs text-muted">{sousTitre}</div>
        ) : null}
      </div>

      {/* Montant */}
      <div className={`shrink-0 font-display text-[15px] font-bold tabular-nums ${c.couleur}`}>
        {c.signe !== "→" ? c.signe : ""}
        {formatFCFA(montant, { sansSuffixe: true })}
      </div>
    </div>
  );
}
