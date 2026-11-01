/**
 * Carte de verdict financier du jour.
 * 3 états : bonne (fond ink), surveiller (watch.tint), tendue (late.tint).
 */

type EtatVerdict = "bonne" | "surveiller" | "tendue";

const CONFIG: Record<
  EtatVerdict,
  { fond: string; badge: string; texte: string; libelle: string }
> = {
  bonne: {
    fond: "bg-ink text-white",
    badge: "bg-success-tint text-success",
    libelle: "Ça va bien",
    texte: "text-white",
  },
  surveiller: {
    fond: "bg-watch-tint text-watch-text",
    badge: "bg-watch-tint text-watch-text border border-watch-text/20",
    libelle: "À surveiller",
    texte: "text-watch-text",
  },
  tendue: {
    fond: "bg-late-tint text-late-text",
    badge: "bg-late-tint text-late-text border border-late-text/20",
    libelle: "Situation tendue",
    texte: "text-late-text",
  },
};

export default function CarteVerdict({
  etat,
  phrase,
}: {
  etat: EtatVerdict;
  phrase: string;
}) {
  const c = CONFIG[etat];
  return (
    <div className={`rounded-2xl p-4 ${c.fond}`}>
      <span className={`badge text-xs font-bold ${c.badge}`}>{c.libelle}</span>
      <p className={`mt-2 font-display text-[17px] font-bold leading-snug ${c.texte}`}>
        {phrase}
      </p>
    </div>
  );
}
