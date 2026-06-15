"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { souscrire } from "./actions";
import { formatFCFA } from "@/lib/format";
import { PLANS } from "@/lib/constantes";
import type { Plan } from "@/lib/types";

/** Liste des plans avec bouton de souscription (FedaPay ou activation démo). */
export default function BoutonsAbonnement({ planActuel }: { planActuel: Plan }) {
  const [pending, startTransition] = useTransition();
  const [enCours, setEnCours] = useState<Plan | null>(null);
  const [message, setMessage] = useState<{ ok?: boolean; erreur?: string } | null>(null);
  const router = useRouter();

  function choisir(plan: Plan) {
    setEnCours(plan);
    setMessage(null);
    startTransition(async () => {
      const res = await souscrire(plan);
      if (res.url) {
        // Redirection vers la page de paiement FedaPay.
        window.location.href = res.url;
        return;
      }
      setMessage(res);
      setEnCours(null);
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {(Object.keys(PLANS) as Plan[]).map((p) => {
        const plan = PLANS[p];
        const actuel = planActuel === p;
        const chargement = pending && enCours === p;
        return (
          <div key={p} className={`card ${actuel ? "ring-2 ring-primary" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold">{plan.nom}</div>
                <div className="text-sm text-gray-500">{plan.description}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold tabular-nums">{formatFCFA(plan.prix)}</div>
                <div className="text-xs text-gray-400">par mois</div>
              </div>
            </div>
            <button
              onClick={() => choisir(p)}
              disabled={pending}
              className={`mt-3 w-full ${actuel ? "btn-secondary" : "btn-primary"}`}
            >
              {chargement
                ? "Traitement…"
                : actuel
                  ? "Renouveler / Payer"
                  : "Choisir ce plan"}
            </button>
          </div>
        );
      })}

      {message?.erreur && (
        <p className="rounded-lg bg-red-50 p-2 text-sm text-danger">{message.erreur}</p>
      )}
      {message?.ok && (
        <p className="rounded-lg bg-green-50 p-2 text-sm text-success">
          Abonnement activé. Merci !
        </p>
      )}
    </div>
  );
}
