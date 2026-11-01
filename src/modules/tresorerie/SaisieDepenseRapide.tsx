"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ajouterMouvement } from "./actions";
import { Icone } from "@/components/Icone";

const TOUCHES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "⌫"] as const;
const MAX_DIGITS = 9;
const CATEGORIES = [
  "Stock", "Transport", "Salaires", "Loyer",
  "Électricité", "Crédit tél.", "Impôts", "Autre",
] as const;

type CategorieDepense = (typeof CATEGORIES)[number];

export type CompteSource = { id: string; label: string };

function fmt(n: number) {
  return n.toLocaleString("fr-FR");
}

export default function SaisieDepenseRapide({ sources }: { sources: CompteSource[] }) {
  const [digits, setDigits] = useState("");
  const [categorie, setCategorie] = useState<CategorieDepense>("Stock");
  const [sourceIdx, setSourceIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [erreur, setErreur] = useState("");
  const [isPending, startTransition] = useTransition();

  const montant = digits === "" ? 0 : parseInt(digits, 10);
  const source = sources[sourceIdx] ?? sources[0];
  const empty = montant === 0 || !source;

  function push(k: string) {
    setDigits((prev) => {
      if (k === "⌫") return prev.slice(0, -1);
      if (k === "000") {
        if (prev === "") return "";
        const next = prev + "000";
        return next.length > MAX_DIGITS ? prev : next;
      }
      const next = prev === "" ? k : prev + k;
      return next.length > MAX_DIGITS ? prev : next;
    });
  }

  function handleSave() {
    if (empty || isPending) return;
    setErreur("");
    startTransition(async () => {
      const fd = new FormData();
      fd.set("account_id", source.id);
      fd.set("type", "sortie");
      fd.set("categorie", categorie);
      fd.set("montant", String(montant));
      const res = await ajouterMouvement(fd);
      if (res?.erreur) {
        setErreur(res.erreur);
      } else {
        setDone(true);
      }
    });
  }

  function reset() {
    setDigits("");
    setCategorie("Stock");
    setSourceIdx(0);
    setDone(false);
    setErreur("");
  }

  if (done) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-1 flex-col items-center justify-center gap-3.5 text-center">
          <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-ink">
            <Icone nom="check" taille={36} className="text-white" />
          </span>
          <h2 className="font-display text-[40px] font-extrabold leading-none tracking-tight tabular-nums">
            − {fmt(montant)} <span className="text-lg">FCFA</span>
          </h2>
          <p className="text-base font-semibold text-muted">
            {categorie}, payé depuis {source?.label ?? "le compte"}.
          </p>
        </div>
        <button type="button" onClick={reset} className="btn-primary">
          Autre dépense
        </button>
        <Link href="/app" className="py-2.5 text-center text-[15px] font-bold text-ink">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Montant */}
      <div className="flex flex-col items-center gap-1">
        <output
          aria-live="polite"
          className={`font-display text-[52px] font-extrabold leading-none tracking-[-0.03em] tabular-nums ${
            empty ? "text-disabled" : "text-ink"
          }`}
        >
          {fmt(montant)}
        </output>
        <span className="text-sm font-bold text-muted">FCFA</span>
      </div>

      {/* Catégorie */}
      <div className="flex flex-col gap-2">
        <span id="cat" className="text-xs font-extrabold uppercase tracking-[0.08em] text-muted">
          Pour quoi ?
        </span>
        <div role="radiogroup" aria-labelledby="cat" className="grid grid-cols-4 gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={categorie === c}
              onClick={() => setCategorie(c)}
              className={`min-h-12 rounded-xl border px-1 text-[12px] font-extrabold ${
                categorie === c
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-surface text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Source */}
      {sources.length > 0 ? (
        <div className="flex flex-col gap-2">
          <span id="src" className="text-xs font-extrabold uppercase tracking-[0.08em] text-muted">
            Payé depuis
          </span>
          <div
            role="radiogroup"
            aria-labelledby="src"
            className="grid gap-1 rounded-[14px] bg-divider p-1"
            style={{ gridTemplateColumns: `repeat(${Math.min(sources.length, 4)}, minmax(0, 1fr))` }}
          >
            {sources.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={sourceIdx === i}
                onClick={() => setSourceIdx(i)}
                className={`min-h-11 rounded-[10px] text-[13px] font-extrabold transition ${
                  sourceIdx === i
                    ? "bg-surface text-ink shadow-sm"
                    : "bg-transparent text-muted"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {erreur ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-danger">{erreur}</p>
      ) : null}

      {/* Pavé numérique */}
      <div className="grid grid-cols-3 gap-1.5">
        {TOUCHES.map((k) => (
          <button
            key={k}
            type="button"
            aria-label={k === "⌫" ? "Effacer" : k}
            onClick={() => push(k)}
            className="flex h-14 items-center justify-center rounded-[14px] bg-surface font-display text-2xl font-bold text-ink transition active:scale-95"
          >
            {k}
          </button>
        ))}
      </div>

      {/* Bouton valider */}
      <button
        type="button"
        onClick={handleSave}
        disabled={empty || isPending}
        className={`w-full min-h-[58px] rounded-[14px] text-[17px] font-extrabold text-white transition ${
          empty ? "bg-disabled" : "bg-ink"
        }`}
      >
        {isPending ? "Enregistrement…" : "Enregistrer la dépense"}
      </button>
    </div>
  );
}
