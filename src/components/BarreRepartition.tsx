import { formatFCFA } from "@/lib/format";

type Segment = {
  cle: "banque" | "mobile_money" | "caisse" | "clients";
  label: string;
  montant: number;
};

const COULEURS: Record<Segment["cle"], string> = {
  banque: "#1E1B73",       // primary.dark
  mobile_money: "#4B47C9", // primary.mid
  caisse: "#A9A7EC",       // primary.light
  clients: "#E0661F",      // late.DEFAULT
};

/**
 * Barre de répartition horizontale.
 * Toujours suivie d'une légende chiffrée (couleur non seule).
 * role="img" + aria-label complet.
 */
export default function BarreRepartition({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((s, seg) => s + seg.montant, 0);
  if (total === 0) return null;

  const ariaLabel = segments
    .map((s) => `${s.label} : ${formatFCFA(s.montant)}`)
    .join(", ");

  return (
    <div>
      {/* Barre */}
      <div
        role="img"
        aria-label={`Répartition — ${ariaLabel}`}
        className="flex h-3.5 w-full overflow-hidden rounded-full gap-[3px]"
      >
        {segments
          .filter((s) => s.montant > 0)
          .map((s) => (
            <div
              key={s.cle}
              style={{
                flex: s.montant / total,
                backgroundColor: COULEURS[s.cle],
                borderRadius: 9999,
              }}
            />
          ))}
      </div>

      {/* Légende chiffrée */}
      <ul className="mt-2 space-y-1">
        {segments
          .filter((s) => s.montant > 0)
          .map((s) => (
            <li key={s.cle} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: COULEURS[s.cle] }}
                aria-hidden="true"
              />
              <span className="flex-1 text-muted">{s.label}</span>
              <span className="font-semibold tabular-nums text-ink">
                {formatFCFA(s.montant)}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
