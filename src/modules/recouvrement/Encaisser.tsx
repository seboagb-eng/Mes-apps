"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { encaisser } from "@/modules/ventes/actions";
import { formatFCFA } from "@/lib/format";
import { messageRecu } from "@/lib/recu";
import { lienWhatsApp } from "@/lib/relances";
import type { Compte, MoyenPaiement } from "@/lib/types";

/**
 * Bouton « Encaisser » : enregistre un règlement (total ou partiel) sur une
 * créance. Met à jour le statut de la vente et crédite le compte choisi.
 * Après succès, propose de partager un reçu par WhatsApp (si le contexte
 * client/entreprise est fourni).
 */
export default function Encaisser({
  saleId,
  resteDu,
  comptes,
  nomEntreprise,
  nomClient,
  telephoneClient,
}: {
  saleId: string;
  resteDu: number;
  comptes: Compte[];
  nomEntreprise?: string;
  nomClient?: string;
  telephoneClient?: string | null;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState("");
  const [recu, setRecu] = useState<{ montant: number; moyen: MoyenPaiement; resteApres: number } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (comptes.length === 0) {
    return (
      <span className="text-xs text-gray-400">
        Créez d'abord un compte de trésorerie pour encaisser.
      </span>
    );
  }

  // Après un encaissement réussi : proposer le partage du reçu.
  function partagerRecu() {
    if (!recu) return;
    const texte = messageRecu({
      nomEntreprise: nomEntreprise ?? "Votre fournisseur",
      nomClient: nomClient ?? "cher client",
      montant: recu.montant,
      moyen: recu.moyen,
      resteApres: recu.resteApres,
    });
    window.open(lienWhatsApp(telephoneClient, texte), "_blank");
  }

  if (recu && nomEntreprise) {
    return (
      <div className="mt-2 flex w-full flex-wrap items-center justify-end gap-2">
        <span className="text-xs text-success">Règlement enregistré ✅</span>
        <button onClick={partagerRecu} className="btn-secondary px-3 py-2 text-sm">
          Envoyer le reçu (WhatsApp)
        </button>
        <button onClick={() => setRecu(null)} className="text-xs text-gray-400">
          Fermer
        </button>
      </div>
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
        const montant = parseInt(String(fd.get("montant") || "0"), 10) || 0;
        const moyen = (String(fd.get("moyen") || "especes") as MoyenPaiement);
        startTransition(async () => {
          setErreur("");
          const res = await encaisser(fd);
          if (res?.erreur) setErreur(res.erreur);
          else {
            setOuvert(false);
            // Mémorise les données du reçu (uniquement si on a le contexte client).
            if (nomEntreprise) {
              setRecu({ montant, moyen, resteApres: Math.max(0, resteDu - montant) });
            }
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
