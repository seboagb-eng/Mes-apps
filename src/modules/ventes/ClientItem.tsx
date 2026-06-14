"use client";

import { useState } from "react";
import { modifierClient } from "./actions";
import FormulaireAction from "@/components/FormulaireAction";
import { formatFCFA } from "@/lib/format";
import type { Client } from "@/lib/types";

/** Ligne de client affichant le solde dû, avec édition des coordonnées en place. */
export default function ClientItem({ client, du }: { client: Client; du: number }) {
  const [editer, setEditer] = useState(false);

  return (
    <li className="px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium">{client.nom}</div>
          <div className="text-xs text-gray-400">
            {client.telephone ? client.telephone : <span className="text-warning">Téléphone manquant</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {du > 0 ? (
            <div className="text-right">
              <div className="text-xs text-gray-400">doit</div>
              <div className="text-sm font-semibold text-warning tabular-nums">{formatFCFA(du)}</div>
            </div>
          ) : (
            <span className="badge bg-green-50 text-success">À jour</span>
          )}
          <button onClick={() => setEditer((v) => !v)} className="text-sm font-medium text-primary">
            {editer ? "Fermer" : "Modifier"}
          </button>
        </div>
      </div>

      {editer ? (
        <div className="mt-3">
          <FormulaireAction
            action={modifierClient}
            libelleBouton="Enregistrer"
            libelleSucces="Client mis à jour."
            resetApresSucces={false}
            onSucces={() => setEditer(false)}
          >
            <input type="hidden" name="id" value={client.id} />
            <input name="nom" defaultValue={client.nom} placeholder="Nom" className="input" required />
            <input name="telephone" defaultValue={client.telephone ?? ""} type="tel" inputMode="tel" placeholder="Téléphone (+229…)" className="input" />
            <input name="email" defaultValue={client.email ?? ""} type="email" placeholder="Email" className="input" />
            <textarea name="notes" defaultValue={client.notes ?? ""} placeholder="Notes" className="input" rows={2} />
          </FormulaireAction>
        </div>
      ) : null}
    </li>
  );
}
