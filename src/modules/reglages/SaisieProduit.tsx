"use client";

import { useState } from "react";
import { creerProduit } from "./actions";
import FormulaireAction from "@/components/FormulaireAction";

/** Formulaire d'ajout d'un produit / service. */
export default function SaisieProduit() {
  const [ouvert, setOuvert] = useState(false);

  if (!ouvert) {
    return (
      <button onClick={() => setOuvert(true)} className="btn-secondary w-full">
        + Nouveau produit
      </button>
    );
  }

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold">Nouveau produit</h3>
        <button onClick={() => setOuvert(false)} className="text-sm text-gray-400">
          Fermer
        </button>
      </div>
      <FormulaireAction
        action={creerProduit}
        libelleBouton="Ajouter"
        libelleSucces="Produit ajouté."
        onSucces={() => setOuvert(false)}
      >
        <input name="nom" placeholder="Nom du produit / service" className="input" required />
        <div className="grid grid-cols-2 gap-3">
          <input name="prix_vente" type="number" inputMode="numeric" placeholder="Prix de vente" className="input" required />
          <input name="prix_achat" type="number" inputMode="numeric" placeholder="Prix d'achat (opt.)" className="input" />
        </div>
        <input name="unite" placeholder="Unité (ex : sac, kg, heure)" className="input" />
      </FormulaireAction>
    </div>
  );
}
