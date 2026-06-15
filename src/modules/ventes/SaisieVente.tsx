"use client";

import { useState, useRef, useEffect } from "react";
import { creerVente } from "./actions";
import FormulaireAction from "@/components/FormulaireAction";
import { useFormPersist } from "@/hooks/useFormPersist";
import type { Client, Compte } from "@/lib/types";

const PERSIST_KEY = "pilot:saisie-vente";

/** Formulaire de saisie d'une vente en moins de 30 secondes. */
export default function SaisieVente({
  clients,
  comptes,
}: {
  clients: Client[];
  comptes: Compte[];
}) {
  const [ouvert, setOuvert] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);
  const { save, restore, clear } = useFormPersist(PERSIST_KEY);
  const today = new Date().toISOString().slice(0, 10);

  // Restaure la saisie précédente à l'ouverture du formulaire.
  useEffect(() => {
    if (ouvert) restore(divRef.current);
  }, [ouvert, restore]);

  if (!ouvert) {
    return (
      <button onClick={() => setOuvert(true)} className="btn-primary w-full">
        + Nouvelle vente
      </button>
    );
  }

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold">Nouvelle vente</h3>
        <button onClick={() => setOuvert(false)} className="text-sm text-gray-400">
          Fermer
        </button>
      </div>

      {/* onChange délégué sur le div pour persister tous les champs */}
      <div ref={divRef} onChange={save}>
        <FormulaireAction
          action={creerVente}
          libelleBouton="Enregistrer la vente"
          libelleSucces="Vente enregistrée."
          onSucces={() => { clear(); setOuvert(false); }}
        >
          <select name="customer_id" className="input">
            <option value="">— Client (optionnel) —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
          <input name="designation" placeholder="Désignation (ex : 10 sacs de ciment)" className="input" />
          <input
            name="montant_total"
            type="number"
            min={1}
            inputMode="numeric"
            placeholder="Montant total (FCFA)"
            className="input"
            required
          />
          <input
            name="montant_paye"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Déjà payé (0 si crédit total)"
            className="input"
            defaultValue={0}
          />
          <div className="grid grid-cols-2 gap-3">
            <select name="moyen" className="input">
              <option value="especes">Espèces</option>
              <option value="momo">Mobile Money</option>
              <option value="banque">Banque</option>
              <option value="virement">Virement</option>
            </select>
            <select name="account_id" className="input">
              <option value="">Compte crédité…</option>
              {comptes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
          <label className="label">Date de la vente</label>
          <input name="date" type="date" defaultValue={today} className="input" />
          <label className="label">Échéance si crédit (optionnel)</label>
          <input name="echeance" type="date" className="input" />
        </FormulaireAction>
      </div>
    </div>
  );
}
