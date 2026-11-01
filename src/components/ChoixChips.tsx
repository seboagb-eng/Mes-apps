"use client";

/**
 * Sélecteur de type radiogroup en chips : secteurs, catégories, modes.
 * Accessible : role="radiogroup" + role="radio" aria-checked.
 */
export default function ChoixChips<T extends string>({
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
    <div role="radiogroup" className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((opt) => {
        const actif = opt.valeur === valeur;
        return (
          <button
            key={opt.valeur}
            type="button"
            role="radio"
            aria-checked={actif}
            onClick={() => onChange(opt.valeur)}
            className={actif ? "chip-on" : "chip"}
          >
            {opt.label}
          </button>
        );
      })}
      <input type="hidden" name={name} value={valeur} />
    </div>
  );
}
