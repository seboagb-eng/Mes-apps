"use client";

import { useState } from "react";
import Interrupteur from "@/components/Interrupteur";

const RELANCES = [
  { key: "j0", titre: "Le jour J", sousTitre: "Rappel le jour de l'échéance" },
  { key: "j3", titre: "J+3", sousTitre: "Relance 3 jours après l'échéance" },
  { key: "j10", titre: "J+10", sousTitre: "Dernier avis après 10 jours" },
] as const;

export default function RelancesAuto() {
  const [actifs, setActifs] = useState<Record<string, boolean>>({ j0: true, j3: true, j10: false });

  return (
    <div className="overflow-hidden rounded-2xl bg-surface">
      {RELANCES.map((r, idx) => (
        <div
          key={r.key}
          className="flex items-center justify-between gap-3 px-4 py-3.5"
          style={{ borderTop: idx > 0 ? "1px solid #ECEDE9" : undefined }}
        >
          <div className="min-w-0">
            <div className="text-[15px] font-bold text-ink">{r.titre}</div>
            <div className="text-[13px] text-muted">{r.sousTitre}</div>
          </div>
          <Interrupteur
            actif={actifs[r.key] ?? false}
            onChange={(v) => setActifs((prev) => ({ ...prev, [r.key]: v }))}
            label={r.titre}
          />
        </div>
      ))}
    </div>
  );
}
