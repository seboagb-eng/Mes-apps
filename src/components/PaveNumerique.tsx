"use client";

import { useState } from "react";
import { formatFCFA } from "@/lib/format";

const MAX_DIGITS = 9;

/**
 * Pavé numérique pour la saisie de montants entiers FCFA.
 * Affiche le montant en cours dans un <output aria-live="polite">.
 * Rend un <input type="hidden"> pour intégration dans un formulaire.
 */
export default function PaveNumerique({
  name,
  defaultValue = 0,
  onChange,
}: {
  name: string;
  defaultValue?: number;
  onChange?: (val: number) => void;
}) {
  const [digits, setDigits] = useState(
    defaultValue > 0 ? String(defaultValue) : ""
  );

  const valeur = digits === "" ? 0 : parseInt(digits, 10);

  function push(s: string) {
    setDigits((prev) => {
      if (s === "000") {
        if (prev === "" || prev === "0") return "0";
        const next = prev + "000";
        if (next.length > MAX_DIGITS) return prev;
        onChange?.(parseInt(next, 10));
        return next;
      }
      const next = prev === "" ? s : prev + s;
      if (next.length > MAX_DIGITS) return prev;
      onChange?.(parseInt(next, 10));
      return next;
    });
  }

  function effacer() {
    setDigits((prev) => {
      const next = prev.slice(0, -1);
      onChange?.(next === "" ? 0 : parseInt(next, 10));
      return next;
    });
  }

  const touches: { label: string; action: () => void; ariaLabel?: string }[] = [
    { label: "1", action: () => push("1") },
    { label: "2", action: () => push("2") },
    { label: "3", action: () => push("3") },
    { label: "4", action: () => push("4") },
    { label: "5", action: () => push("5") },
    { label: "6", action: () => push("6") },
    { label: "7", action: () => push("7") },
    { label: "8", action: () => push("8") },
    { label: "9", action: () => push("9") },
    { label: "000", action: () => push("000") },
    { label: "0", action: () => push("0") },
    { label: "⌫", action: effacer, ariaLabel: "Effacer" },
  ];

  return (
    <div className="space-y-4">
      <output
        aria-live="polite"
        className="block text-center font-display text-4xl font-extrabold tabular-nums text-ink"
      >
        {valeur === 0 ? (
          <span className="text-muted">0 FCFA</span>
        ) : (
          formatFCFA(valeur)
        )}
      </output>

      <input type="hidden" name={name} value={valeur} />

      <div className="grid grid-cols-3 gap-2">
        {touches.map((t) => (
          <button
            key={t.label}
            type="button"
            aria-label={t.ariaLabel ?? t.label}
            onClick={t.action}
            className="flex h-14 items-center justify-center rounded-xl bg-ground text-lg font-semibold text-ink transition active:scale-95 hover:bg-line"
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
