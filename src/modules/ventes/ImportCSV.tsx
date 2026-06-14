"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { importerVentesCSV } from "./actions";
import type { Compte } from "@/lib/types";

const MODELE =
  "date;client;designation;montant_total;montant_paye;moyen;echeance\n" +
  "2026-06-01;Awa Boutique;10 sacs de ciment;50000;20000;momo;2026-07-01\n" +
  "2026-06-02;Koffi Quincaillerie;Tôles;120000;0;;2026-07-15";

/** Import de ventes par fichier CSV (format documenté). */
export default function ImportCSV({ comptes }: { comptes: Compte[] }) {
  const [ouvert, setOuvert] = useState(false);
  const [texte, setTexte] = useState("");
  const [compte, setCompte] = useState("");
  const [resultat, setResultat] = useState<{
    importees?: number;
    total?: number;
    erreur?: string;
    details?: { ligne: number; message: string }[];
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function lireFichier(file: File) {
    const reader = new FileReader();
    reader.onload = () => setTexte(String(reader.result || ""));
    reader.readAsText(file);
  }

  function lancer() {
    const fd = new FormData();
    fd.set("csv", texte);
    fd.set("account_id", compte);
    startTransition(async () => {
      setResultat(null);
      const res = await importerVentesCSV(fd);
      setResultat(res);
      if (res.importees) router.refresh();
    });
  }

  if (!ouvert) {
    return (
      <button onClick={() => setOuvert(true)} className="btn-secondary w-full">
        Importer des ventes (CSV)
      </button>
    );
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">Import CSV</h3>
        <button onClick={() => setOuvert(false)} className="text-sm text-gray-400">
          Fermer
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Colonnes : <code>date ; client ; designation ; montant_total ; montant_paye ; moyen ; echeance</code>.
        Seul <strong>montant_total</strong> est obligatoire. Séparateur « ; » ou « , ».
      </p>

      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => e.target.files?.[0] && lireFichier(e.target.files[0])}
        className="block w-full text-sm"
      />

      <details className="text-xs text-gray-500">
        <summary className="cursor-pointer">Voir / coller le format</summary>
        <textarea
          value={texte || MODELE}
          onChange={(e) => setTexte(e.target.value)}
          rows={5}
          className="input mt-2 font-mono text-xs"
        />
      </details>

      <div>
        <label className="label">Compte crédité pour les montants déjà payés</label>
        <select value={compte} onChange={(e) => setCompte(e.target.value)} className="input">
          <option value="">— Aucun (tout en impayé) —</option>
          {comptes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
      </div>

      <button onClick={lancer} disabled={pending || !texte.trim()} className="btn-primary w-full">
        {pending ? "Import en cours…" : "Importer"}
      </button>

      {resultat ? (
        <div className="space-y-2 text-sm">
          {resultat.erreur ? (
            <p className="rounded-lg bg-red-50 p-2 text-danger">{resultat.erreur}</p>
          ) : (
            <p className="rounded-lg bg-green-50 p-2 text-success">
              {resultat.importees} vente(s) importée(s) sur {resultat.total}.
            </p>
          )}
          {resultat.details && resultat.details.length > 0 ? (
            <ul className="max-h-40 space-y-1 overflow-auto rounded-lg bg-amber-50 p-2 text-xs text-warning">
              {resultat.details.map((d, i) => (
                <li key={i}>Ligne {d.ligne} : {d.message}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
