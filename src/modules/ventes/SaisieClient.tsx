"use client";

import { useState } from "react";
import { creerClient } from "./actions";
import FormulaireAction from "@/components/FormulaireAction";

/** Formulaire d'ajout d'un client. */
export default function SaisieClient() {
  const [ouvert, setOuvert] = useState(false);

  if (!ouvert) {
    return (
      <button onClick={() => setOuvert(true)} className="btn-primary w-full">
        + Nouveau client
      </button>
    );
  }

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold">Nouveau client</h3>
        <button onClick={() => setOuvert(false)} className="text-sm text-gray-400">
          Fermer
        </button>
      </div>
      <FormulaireAction
        action={creerClient}
        libelleBouton="Ajouter le client"
        libelleSucces="Client ajouté."
        onSucces={() => setOuvert(false)}
      >
        <input name="nom" placeholder="Nom du client" className="input" required />
        <input name="telephone" type="tel" inputMode="tel" placeholder="Téléphone (+229…)" className="input" />
        <input name="email" type="email" placeholder="Email (optionnel)" className="input" />
        <textarea name="notes" placeholder="Notes (optionnel)" className="input" rows={2} />
      </FormulaireAction>
    </div>
  );
}
