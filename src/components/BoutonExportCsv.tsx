"use client";

import { useTransition } from "react";

type ResultatExport = { csv?: string; nom?: string; erreur?: string };

/**
 * Bouton générique : appelle une action serveur qui renvoie un CSV,
 * puis déclenche le téléchargement côté navigateur (avec BOM UTF-8 pour Excel).
 */
export default function BoutonExportCsv({
  action,
  libelle = "Exporter CSV",
}: {
  action: () => Promise<ResultatExport>;
  libelle?: string;
}) {
  const [pending, startTransition] = useTransition();

  function exporter() {
    startTransition(async () => {
      const res = await action();
      if (res.erreur || !res.csv) {
        alert(res.erreur ?? "Export impossible.");
        return;
      }
      const blob = new Blob(["﻿" + res.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.nom ?? "export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  return (
    <button onClick={exporter} disabled={pending} className="btn-secondary w-full">
      {pending ? "Export en cours…" : libelle}
    </button>
  );
}
