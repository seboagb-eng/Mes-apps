"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rattacherClient, modifierClient } from "@/modules/ventes/actions";
import type { Client } from "@/lib/types";

/**
 * Gère le client d'une créance directement depuis la carte de recouvrement :
 *  • aucun client rattaché  → rattacher un client existant ou en créer un ;
 *  • client sans téléphone  → compléter le numéro (indispensable aux relances) ;
 *  • client complet         → affiche nom + téléphone, avec « modifier ».
 */
export default function ClientCreance({
  saleId,
  client,
  clients,
}: {
  saleId: string;
  client: Client | null;
  clients: Client[];
}) {
  const [mode, setMode] = useState<"vue" | "rattacher" | "editer">("vue");
  const [erreur, setErreur] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function envoyer(action: (fd: FormData) => Promise<{ erreur?: string; ok?: boolean }>, fd: FormData) {
    startTransition(async () => {
      setErreur("");
      const res = await action(fd);
      if (res?.erreur) setErreur(res.erreur);
      else {
        setMode("vue");
        router.refresh();
      }
    });
  }

  // ── Aucun client rattaché ────────────────────────────────────────────
  if (!client && mode !== "rattacher") {
    return (
      <button onClick={() => setMode("rattacher")} className="text-sm font-medium text-primary">
        + Rattacher un client
      </button>
    );
  }

  if (mode === "rattacher") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          envoyer(rattacherClient, new FormData(e.currentTarget));
        }}
        className="mt-2 space-y-2 rounded-xl bg-gray-50 p-3"
      >
        <input type="hidden" name="sale_id" value={saleId} />
        {clients.length > 0 ? (
          <select name="customer_id" className="input">
            <option value="">— Choisir un client existant —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        ) : null}
        <div className="text-center text-xs text-gray-400">ou créer un nouveau client</div>
        <input name="nouveau_client" placeholder="Nom du client" className="input" />
        <input name="nouveau_telephone" type="tel" inputMode="tel" placeholder="Téléphone (+229…)" className="input" />
        {erreur ? <p className="text-sm text-danger">{erreur}</p> : null}
        <div className="flex gap-2">
          <button disabled={pending} className="btn-primary flex-1 py-2 text-sm">
            {pending ? "…" : "Rattacher"}
          </button>
          <button type="button" onClick={() => setMode("vue")} className="btn-secondary py-2 text-sm">
            Annuler
          </button>
        </div>
      </form>
    );
  }

  // ── Compléter / modifier les coordonnées d'un client existant ────────
  if (mode === "editer" && client) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          envoyer(modifierClient, new FormData(e.currentTarget));
        }}
        className="mt-2 space-y-2 rounded-xl bg-gray-50 p-3"
      >
        <input type="hidden" name="id" value={client.id} />
        <input name="nom" defaultValue={client.nom} placeholder="Nom" className="input" required />
        <input name="telephone" defaultValue={client.telephone ?? ""} type="tel" inputMode="tel" placeholder="Téléphone (+229…)" className="input" />
        <input name="email" defaultValue={client.email ?? ""} type="email" placeholder="Email (optionnel)" className="input" />
        {erreur ? <p className="text-sm text-danger">{erreur}</p> : null}
        <div className="flex gap-2">
          <button disabled={pending} className="btn-primary flex-1 py-2 text-sm">
            {pending ? "…" : "Enregistrer"}
          </button>
          <button type="button" onClick={() => setMode("vue")} className="btn-secondary py-2 text-sm">
            Annuler
          </button>
        </div>
      </form>
    );
  }

  // ── Vue par défaut (client rattaché) ─────────────────────────────────
  return (
    <div className="flex items-center gap-2 text-xs">
      {client?.telephone ? (
        <span className="text-gray-400">{client.telephone}</span>
      ) : (
        <span className="text-warning">Téléphone manquant</span>
      )}
      <button onClick={() => setMode("editer")} className="font-medium text-primary">
        {client?.telephone ? "Modifier" : "Ajouter le téléphone"}
      </button>
    </div>
  );
}
