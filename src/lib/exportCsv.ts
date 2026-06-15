/**
 * Génération de CSV (export). Séparateur « ; » (Excel FR), fins de ligne CRLF.
 * Symétrique de l'import (src/lib/csv.ts). Fonctions pures, sans I/O.
 */

/** Échappe un champ : guillemets si le champ contient ; " ou un saut de ligne. */
export function champCsv(valeur: string | number | null | undefined): string {
  const s = valeur === null || valeur === undefined ? "" : String(valeur);
  if (/[";\r\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/** Assemble un CSV à partir d'en-têtes et de lignes. */
export function genererCsv(entetes: string[], lignes: (string | number | null)[][]): string {
  const ligneCsv = (cells: (string | number | null)[]) => cells.map(champCsv).join(";");
  return [ligneCsv(entetes), ...lignes.map(ligneCsv)].join("\r\n");
}
