"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { preparerRelance } from "./actions";
import { messageRelance, lienWhatsApp, lienSMS, LIBELLE_TON } from "@/lib/relances";
import type { CanalRelance, TonRelance } from "@/lib/types";

interface Props {
  saleId: string;
  nomEntreprise: string;
  nomClient: string;
  telephoneClient: string | null;
  montantDu: number;
}

/**
 * Bouton « Relancer » : choix du ton et du canal, génération du message
 * pré-rédigé (+ lien de paiement optionnel), puis ouverture de WhatsApp/SMS.
 * La relance est tracée dans l'historique côté serveur.
 */
export default function Relancer(props: Props) {
  const [ouvert, setOuvert] = useState(false);
  const [ton, setTon] = useState<TonRelance>("courtois");
  const [canal, setCanal] = useState<CanalRelance>("whatsapp");
  const [avecPaiement, setAvecPaiement] = useState(true);
  const [pending, startTransition] = useTransition();
  const [erreur, setErreur] = useState("");
  const router = useRouter();

  function envoyer() {
    setErreur("");
    const fd = new FormData();
    fd.set("sale_id", props.saleId);
    fd.set("ton", ton);
    fd.set("canal", canal);
    fd.set("avec_paiement", avecPaiement ? "1" : "0");

    startTransition(async () => {
      const res = await preparerRelance(fd);
      if (res.erreur) {
        setErreur(res.erreur);
        return;
      }
      const message = messageRelance({
        ton,
        nomEntreprise: props.nomEntreprise,
        nomClient: props.nomClient,
        montantDu: props.montantDu,
        lienPaiement: res.lien_paiement,
      });
      const url =
        canal === "whatsapp"
          ? lienWhatsApp(props.telephoneClient, message)
          : lienSMS(props.telephoneClient, message);
      window.open(url, "_blank");
      setOuvert(false);
      router.refresh();
    });
  }

  if (!ouvert) {
    return (
      <button onClick={() => setOuvert(true)} className="btn-primary px-3 py-2 text-sm">
        Relancer
      </button>
    );
  }

  return (
    <div className="mt-3 w-full rounded-xl bg-gray-50 p-3">
      <div className="mb-2 text-xs font-medium text-gray-500">Ton du message</div>
      <div className="mb-3 flex gap-2">
        {(Object.keys(LIBELLE_TON) as TonRelance[]).map((t) => (
          <button
            key={t}
            onClick={() => setTon(t)}
            className={`badge ${ton === t ? "bg-primary text-white" : "bg-white text-gray-600 ring-1 ring-gray-200"}`}
          >
            {LIBELLE_TON[t]}
          </button>
        ))}
      </div>

      <div className="mb-3 flex gap-2">
        {(["whatsapp", "sms"] as CanalRelance[]).map((c) => (
          <button
            key={c}
            onClick={() => setCanal(c)}
            className={`badge ${canal === c ? "bg-primary text-white" : "bg-white text-gray-600 ring-1 ring-gray-200"}`}
          >
            {c === "whatsapp" ? "WhatsApp" : "SMS"}
          </button>
        ))}
      </div>

      <label className="mb-3 flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={avecPaiement}
          onChange={(e) => setAvecPaiement(e.target.checked)}
        />
        Inclure un lien de paiement Mobile Money
      </label>

      {erreur ? <p className="mb-2 text-sm text-danger">{erreur}</p> : null}

      <div className="flex gap-2">
        <button onClick={envoyer} disabled={pending} className="btn-primary flex-1 py-2 text-sm">
          {pending ? "Préparation…" : "Ouvrir le message"}
        </button>
        <button onClick={() => setOuvert(false)} className="btn-secondary py-2 text-sm">
          Annuler
        </button>
      </div>
    </div>
  );
}
