"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { encaisser } from "@/modules/ventes/actions";
import { formatFCFA } from "@/lib/format";
import type { Compte } from "@/lib/types";

/**
 * Bouton « Encaisser » : enregistre un règlement (total ou partiel) sur une
 * créance. Met à jour le statut de la vente et crédite le compte choisi.
 */
export default function Encaisser({
  saleId,
  resteDu,
  comptes,
}: {
  saleId: string;
  resteDu: number;
  comptes: Compte[];
}) {
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (comptes.length === 0) {
    return (
      <span className="text-xs text-gray-400">
        Créez d'abord un compte de trésorerie pour encaisser.
      </span>
    );
  }

  if (!ouvert) {
    return (
      <button onClick={() => setOuvert(true)} className="btn-secondary px-3 py-2 text-sm">
        Encaisser
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          setErreur("");
          const res = await encaisser(fd);
          if (res?.erreur) setErreur(res.erreur);
          else {
            setOuvert(false);
            router.refresh();
          }
        });
      }}
      className="mt-3 w-full rounded-xl bg-gray-50 p-3 space-y-3"
    >
      <input type="hidden" name="sale_id" value={saleId} />
      <div>
        <label className="label">Montant reçu</label>
        <input
          name="montant"
          type="number"
          min={1}
          max={resteDu}
          inputMode="numeric"
          defaultValue={resteDu}
          className="input"
          required
        />
        <p className="mt-1 text-xs text-gray-400">Reste dû : {formatFCFA(resteDu)}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select name="moyen" className="input">
          <option value="especes">Espèces</option>
          <option value="momo">Mobile Money</option>
          <option value="banque">Banque</option>
          <option value="virement">Virement</option>
        </select>
        <select name="account_id" className="input" required>
          <option value="">Compte crédité…</option>
          {comptes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
      </div>
      {erreur ? <p className="text-sm text-danger">{erreur}</p> : null}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary flex-1 py-2 text-sm">
          {pending ? "Enregistrement…" : "Valider le règlement"}
        </button>
        <button type="button" onClick={() => setOuvert(false)} className="btn-secondary py-2 text-sm">
          Annuler
        </button>
      </div>
    </form>
  );
}
