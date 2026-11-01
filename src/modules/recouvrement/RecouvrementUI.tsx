"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { preparerRelance } from "./actions";
import { messageRelance, lienWhatsApp } from "@/lib/relances";
import { formatFCFA } from "@/lib/format";
import { Icone } from "@/components/Icone";
import Encaisser from "./Encaisser";
import type { TonRelance, Compte } from "@/lib/types";

export type CreanceItem = {
  id: string;
  nomClient: string;
  telephone: string | null;
  joursRetard: number;
  montantDu: number;
  enRetard: boolean;
};

interface Props {
  creances: CreanceItem[];
  totalDu: number;
  enRetardTotal: number;
  nomEntreprise: string;
  comptes: Compte[];
}

const TONS: { valeur: TonRelance; label: string }[] = [
  { valeur: "courtois", label: "Courtois" },
  { valeur: "ferme", label: "Ferme" },
  { valeur: "dernier_avis", label: "Dernier rappel" },
];

function initiales(nom: string): string {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function RecouvrementUI({
  creances,
  totalDu,
  enRetardTotal,
  nomEntreprise,
  comptes,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(creances[0]?.id ?? null);
  const [ton, setTon] = useState<TonRelance>("courtois");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const selected = creances.find((c) => c.id === selectedId) ?? null;

  const messagePreview = selected
    ? messageRelance({ ton, nomEntreprise, nomClient: selected.nomClient, montantDu: selected.montantDu })
    : "";

  function envoyer() {
    if (!selected) return;
    const fd = new FormData();
    fd.set("sale_id", selected.id);
    fd.set("ton", ton);
    fd.set("canal", "whatsapp");
    fd.set("avec_paiement", "0");
    startTransition(async () => {
      await preparerRelance(fd);
      window.open(lienWhatsApp(selected.telephone, messagePreview), "_blank");
      router.refresh();
    });
  }

  if (creances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-success-tint">
          <Icone nom="check" taille={28} className="text-success" />
        </span>
        <p className="text-[17px] font-bold text-ink">Tout est encaissé !</p>
        <p className="mt-1 text-sm text-muted">Aucune créance en cours.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Argent dehors */}
      <div className="flex items-center justify-between rounded-2xl bg-ink px-5 py-4 text-white">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-white/60">
            Argent dehors
          </div>
          <div className="mt-1 font-display text-[28px] font-extrabold leading-none tabular-nums">
            {formatFCFA(totalDu)}
          </div>
        </div>
        {enRetardTotal > 0 && (
          <div className="text-right">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-white/60">
              en retard
            </div>
            <div
              className="mt-1 font-display text-xl font-extrabold tabular-nums"
              style={{ color: "#FFB48A" }}
            >
              {formatFCFA(enRetardTotal)}
            </div>
          </div>
        )}
      </div>

      {/* Liste clients */}
      <div className="flex flex-col gap-1.5">
        {creances.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedId(c.id)}
            className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
              selectedId === c.id ? "bg-primary-tint ring-2 ring-primary" : "bg-surface"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-sm font-extrabold ${
                c.enRetard ? "bg-late-tint text-late-text" : "bg-divider text-muted"
              }`}
            >
              {initiales(c.nomClient)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-bold text-ink">{c.nomClient}</div>
              <div className="text-[13px] text-muted">
                {c.joursRetard > 0 ? `${c.joursRetard} j de retard` : "à échéance"}
              </div>
            </div>
            <div className="shrink-0 tabular-nums text-[15px] font-extrabold text-ink">
              {formatFCFA(c.montantDu)}
            </div>
          </button>
        ))}
      </div>

      {/* Encaissement */}
      {selected && (
        <div className="rounded-2xl border border-line bg-surface p-3">
          <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted">
            Encaisser un règlement
          </div>
          <Encaisser
            saleId={selected.id}
            resteDu={selected.montantDu}
            comptes={comptes}
            nomEntreprise={nomEntreprise}
            nomClient={selected.nomClient}
            telephoneClient={selected.telephone}
          />
        </div>
      )}

      {/* Ton */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted">
          Ton du message
        </span>
        <div
          role="radiogroup"
          aria-label="Ton du message"
          className="grid grid-cols-3 gap-1 rounded-[14px] bg-divider p-1"
        >
          {TONS.map((t) => (
            <button
              key={t.valeur}
              type="button"
              role="radio"
              aria-checked={ton === t.valeur}
              onClick={() => setTon(t.valeur)}
              className={`min-h-10 rounded-[10px] text-[13px] font-extrabold transition ${
                ton === t.valeur ? "bg-surface text-ink shadow-sm" : "bg-transparent text-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Aperçu WhatsApp */}
      {selected && (
        <div className="min-h-[100px] rounded-2xl p-4" style={{ backgroundColor: "#EAE6DF" }}>
          <div
            className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm px-3 py-2 text-[14px] leading-relaxed"
            style={{ backgroundColor: "#D9FDD3", whiteSpace: "pre-line" }}
          >
            {messagePreview}
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={envoyer}
        disabled={!selected || pending}
        className="btn-whatsapp flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[14px] text-[17px] font-extrabold disabled:opacity-50"
      >
        <Icone nom="whatsapp" taille={22} />
        {pending ? "Préparation…" : "Envoyer sur WhatsApp"}
      </button>
    </div>
  );
}
