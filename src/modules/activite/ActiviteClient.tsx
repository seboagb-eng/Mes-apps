"use client";

import { useState, useMemo } from "react";
import { formatFCFA } from "@/lib/format";
import { Icone } from "@/components/Icone";

export type FeedItem = {
  id: string;
  date: string; // ISO date "YYYY-MM-DD"
  kind: "vente" | "depense" | "credit";
  label: string;
  sousLabel: string;
  montant: number;
};

type Filtre = "tout" | "vente" | "depense" | "credit";

const FILTRES: { valeur: Filtre; label: string }[] = [
  { valeur: "tout", label: "Tout" },
  { valeur: "vente", label: "Ventes" },
  { valeur: "depense", label: "Dépenses" },
  { valeur: "credit", label: "Crédits" },
];

const KIND_STYLE = {
  vente: { bg: "#E3F4E8", fg: "#0F7A4A", signe: "+" },
  depense: { bg: "#ECEDE9", fg: "#10131A", signe: "−" },
  credit: { bg: "#FFE8DA", fg: "#8F3708", signe: "⏱" },
} as const;

function groupByDate(items: FeedItem[]): { date: string; items: FeedItem[] }[] {
  const map = new Map<string, FeedItem[]>();
  for (const item of items) {
    const group = map.get(item.date) ?? [];
    group.push(item);
    map.set(item.date, group);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, items]) => ({ date, items }));
}

function labelDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (iso === today.toISOString().slice(0, 10)) return "Aujourd'hui";
  if (iso === yesterday.toISOString().slice(0, 10)) return "Hier";
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

export default function ActiviteClient({
  items,
  entreesS7,
  sortiesS7,
}: {
  items: FeedItem[];
  entreesS7: number;
  sortiesS7: number;
}) {
  const [filtre, setFiltre] = useState<Filtre>("tout");
  const [recherche, setRecherche] = useState("");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filtre !== "tout" && item.kind !== filtre) return false;
      if (recherche) {
        const q = recherche.toLowerCase();
        return item.label.toLowerCase().includes(q) || item.sousLabel.toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, filtre, recherche]);

  const groupes = groupByDate(filtered);

  return (
    <div className="flex flex-col gap-4">
      {/* Barre de recherche */}
      <div className="flex h-12 items-center gap-2 rounded-xl border border-line bg-surface px-3">
        <Icone nom="recherche" taille={18} className="shrink-0 text-muted" />
        <input
          type="search"
          placeholder="Rechercher…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
        />
      </div>

      {/* Filtres */}
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {FILTRES.map((f) => (
          <button
            key={f.valeur}
            type="button"
            onClick={() => setFiltre(f.valeur)}
            className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-extrabold transition ${
              filtre === f.valeur
                ? "border-ink bg-ink text-white"
                : "border-line bg-surface text-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Stats semaine */}
      <div className="grid grid-cols-2 gap-3 rounded-2xl bg-surface p-4">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted">
            Entrées 7 j
          </div>
          <div className="mt-1 font-display text-[22px] font-extrabold tabular-nums text-success">
            + {formatFCFA(entreesS7)}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted">
            Sorties 7 j
          </div>
          <div className="mt-1 font-display text-[22px] font-extrabold tabular-nums text-ink">
            − {formatFCFA(sortiesS7)}
          </div>
        </div>
      </div>

      {/* Feed */}
      {groupes.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted">Aucune opération trouvée.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {groupes.map((groupe) => (
            <div key={groupe.date}>
              <div className="mb-2 text-[12px] font-extrabold uppercase tracking-[0.08em] text-muted">
                {labelDate(groupe.date)}
              </div>
              <div className="overflow-hidden rounded-2xl bg-surface">
                {groupe.items.map((item, idx) => {
                  const style = KIND_STYLE[item.kind];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{
                        borderTop: idx > 0 ? "1px solid #ECEDE9" : undefined,
                      }}
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-base font-extrabold"
                        style={{ backgroundColor: style.bg, color: style.fg }}
                      >
                        {style.signe}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[15px] font-bold text-ink">{item.label}</div>
                        {item.sousLabel ? (
                          <div className="text-[13px] text-muted">{item.sousLabel}</div>
                        ) : null}
                      </div>
                      <div
                        className="shrink-0 tabular-nums text-[15px] font-extrabold"
                        style={{ color: style.fg }}
                      >
                        {item.kind === "depense" ? "−" : "+"} {formatFCFA(item.montant, { sansSuffixe: true })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
