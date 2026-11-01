"use client";

/**
 * Contrôle segmenté : ton de relance, mode de paiement, etc.
 * Accessible : role="radiogroup" + aria-checked sur chaque segment.
 */
export default function Segmente<T extends string>({
  name,
  options,
  valeur,
  onChange,
  className = "",
}: {
  name: string;
  options: { valeur: T; label: string }[];
  valeur: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div role="radiogroup" className={`segmented ${className}`}>
      {options.map((opt) => {
        const actif = opt.valeur === valeur;
        return (
          <button
            key={opt.valeur}
            type="button"
            role="radio"
            aria-checked={actif}
            onClick={() => onChange(opt.valeur)}
          >
            {opt.label}
          </button>
        );
      })}
      <input type="hidden" name={name} value={valeur} />
    </div>
  );
}
