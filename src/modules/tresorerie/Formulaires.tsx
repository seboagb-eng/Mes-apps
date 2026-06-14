"use client";

import { useState } from "react";
import { ajouterMouvement, transferer, creerCompte } from "./actions";
import FormulaireAction from "@/components/FormulaireAction";
import { CATEGORIES_DEPENSE } from "@/lib/constantes";
import type { Compte } from "@/lib/types";

/** Onglets de saisie : mouvement, transfert, nouveau compte. */
export default function FormulairesTresorerie({ comptes }: { comptes: Compte[] }) {
  const [onglet, setOnglet] = useState<"mouvement" | "transfert" | "compte">("mouvement");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="card">
      <div className="mb-4 flex gap-2 text-sm">
        {(
          [
            ["mouvement", "Entrée / Sortie"],
            ["transfert", "Transfert"],
            ["compte", "Nouveau compte"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setOnglet(k)}
            className={`flex-1 rounded-lg px-2 py-2 font-medium ${
              onglet === k ? "bg-primary-light text-primary" : "bg-gray-50 text-gray-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {onglet === "mouvement" && (
        <FormulaireAction action={ajouterMouvement} libelleSucces="Mouvement enregistré.">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center justify-center gap-2 rounded-xl border p-3 has-[:checked]:border-success has-[:checked]:bg-green-50">
              <input type="radio" name="type" value="entree" defaultChecked /> Entrée
            </label>
            <label className="flex items-center justify-center gap-2 rounded-xl border p-3 has-[:checked]:border-danger has-[:checked]:bg-red-50">
              <input type="radio" name="type" value="sortie" /> Sortie
            </label>
          </div>
          <select name="account_id" className="input" required>
            {comptes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
          <input name="montant" type="number" min={1} inputMode="numeric" placeholder="Montant (FCFA)" className="input" required />
          <select name="categorie" className="input">
            {CATEGORIES_DEPENSE.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input name="description" placeholder="Description (optionnel)" className="input" />
          <input name="date" type="date" defaultValue={today} className="input" />
        </FormulaireAction>
      )}

      {onglet === "transfert" && (
        <FormulaireAction action={transferer} libelleSucces="Transfert effectué.">
          <label className="label">Depuis</label>
          <select name="source" className="input" required>
            {comptes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
          <label className="label">Vers</label>
          <select name="destination" className="input" required>
            {comptes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
          <input name="montant" type="number" min={1} inputMode="numeric" placeholder="Montant (FCFA)" className="input" required />
          <input name="date" type="date" defaultValue={today} className="input" />
        </FormulaireAction>
      )}

      {onglet === "compte" && (
        <FormulaireAction action={creerCompte} libelleSucces="Compte créé.">
          <input name="nom" placeholder="Nom du compte (ex : Caisse principale)" className="input" required />
          <select name="type" className="input">
            <option value="caisse">Caisse (espèces)</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="banque">Banque</option>
          </select>
          <input name="solde_initial" type="number" inputMode="numeric" placeholder="Solde initial (FCFA)" className="input" defaultValue={0} />
        </FormulaireAction>
      )}
    </div>
  );
}
