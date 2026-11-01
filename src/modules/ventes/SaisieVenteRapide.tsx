"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { creerVente } from "./actions";
import { Icone } from "@/components/Icone";

const QUICK = [5_000, 10_000, 25_000, 50_000];
const TOUCHES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "⌫"] as const;
const MAX_DIGITS = 9;

export type ModeVente = {
  label: string;
  moyen: string;
  accountId: string | null;
  credit?: boolean;
};

function fmt(n: number) {
  return n.toLocaleString("fr-FR");
}

export default function SaisieVenteRapide({ modes }: { modes: ModeVente[] }) {
  const [digits, setDigits] = useState("");
  const [modeIdx, setModeIdx] = useState(0);
  const [clientNom, setClientNom] = useState("");
  const [done, setDone] = useState(false);
  const [erreur, setErreur] = useState("");
  const [isPending, startTransition] = useTransition();

  const montant = digits === "" ? 0 : parseInt(digits, 10);
  const mode = modes[modeIdx] ?? modes[0];
  const credit = mode?.credit ?? false;
  const empty = montant === 0;

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

  function addQuick(v: number) {
    setDigits((prev) => {
      const cur = prev === "" ? 0 : parseInt(prev, 10);
      const s = String(cur + v);
      return s.length > MAX_DIGITS ? prev : s;
    });
  }

  function handleSave() {
    if (empty || isPending) return;
    setErreur("");
    startTransition(async () => {
      const fd = new FormData();
      fd.set("montant_total", String(montant));
      fd.set("montant_paye", credit ? "0" : String(montant));
      fd.set("moyen", mode.moyen);
      fd.set("designation", "Vente");
      if (!credit && mode.accountId) fd.set("account_id", mode.accountId);
      if (credit && clientNom.trim()) fd.set("nouveau_client", clientNom.trim());
      const res = await creerVente(fd);
      if (res?.erreur) {
        setErreur(res.erreur);
      } else {
        setDone(true);
      }
    });
  }

  function reset() {
    setDigits("");
    setModeIdx(0);
    setClientNom("");
    setDone(false);
    setErreur("");
  }

  if (done) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-1 flex-col items-center justify-center gap-3.5 text-center">
          <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-success">
            <Icone nom="check" taille={36} className="text-white" />
          </span>
          <h2 className="font-display text-[40px] font-extrabold leading-none tracking-tight tabular-nums">
            {fmt(montant)} <span className="text-lg">FCFA</span>
          </h2>
          <p className="text-base font-semibold text-muted">
            {credit
              ? "Vente à crédit enregistrée. Elle apparaîtra dans vos relances à l'échéance."
              : `Vente encaissée en ${mode.label}. Votre trésorerie est à jour.`}
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="btn-primary"
        >
          Vente suivante
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

      {/* Montants rapides */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {QUICK.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => addQuick(v)}
            className="min-h-10 rounded-full border border-line bg-surface px-3 text-[13px] font-bold text-ink"
          >
            +{fmt(v)}
          </button>
        ))}
      </div>

      {/* Mode paiement */}
      <div className="flex flex-col gap-2">
        <span id="pay" className="text-xs font-extrabold uppercase tracking-[0.08em] text-muted">
          Payé comment ?
        </span>
        <div role="radiogroup" aria-labelledby="pay" className="grid grid-cols-4 gap-1.5">
          {modes.map((m, i) => (
            <button
              key={m.label}
              type="button"
              role="radio"
              aria-checked={modeIdx === i}
              onClick={() => setModeIdx(i)}
              className={`min-h-12 rounded-xl border text-[13px] font-extrabold ${
                modeIdx === i
                  ? m.credit
                    ? "border-late-text bg-late-text text-white"
                    : "border-ink bg-ink text-white"
                  : "border-line bg-surface text-ink"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        {credit ? (
          <label className="flex min-h-12 items-center gap-2.5 rounded-xl bg-late-tint px-3 text-sm font-bold text-late-text">
            Client
            <input
              type="text"
              placeholder="Nom ou téléphone"
              value={clientNom}
              onChange={(e) => setClientNom(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border-0 bg-white px-2.5 py-1.5 text-[15px] font-semibold text-ink placeholder:text-disabled focus:outline-none"
            />
          </label>
        ) : null}
      </div>

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
          empty
            ? "bg-disabled"
            : credit
            ? "bg-late-text"
            : "bg-primary"
        }`}
      >
        {isPending
          ? "Enregistrement…"
          : credit
          ? "Enregistrer la vente à crédit"
          : "Enregistrer la vente"}
      </button>
    </div>
  );
}
