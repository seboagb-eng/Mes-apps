/**
 * Parseur CSV minimal mais robuste pour l'import de ventes.
 * Gère le séparateur « ; » (Excel francophone) ou « , », et les champs
 * entre guillemets doubles. Tout est pur → testable unitairement.
 */

/** Détecte le séparateur le plus probable d'après la 1re ligne. */
export function detecterSeparateur(ligne: string): ";" | "," {
  const pv = (ligne.match(/;/g) || []).length;
  const vg = (ligne.match(/,/g) || []).length;
  return pv >= vg ? ";" : ",";
}

/** Découpe une ligne en cellules en respectant les guillemets. */
function decouperLigne(ligne: string, sep: string): string[] {
  const cellules: string[] = [];
  let courant = "";
  let dansGuillemets = false;
  for (let i = 0; i < ligne.length; i++) {
    const c = ligne[i];
    if (c === '"') {
      if (dansGuillemets && ligne[i + 1] === '"') {
        courant += '"';
        i++;
      } else {
        dansGuillemets = !dansGuillemets;
      }
    } else if (c === sep && !dansGuillemets) {
      cellules.push(courant);
      courant = "";
    } else {
      courant += c;
    }
  }
  cellules.push(courant);
  return cellules.map((c) => c.trim());
}

/** Parse un texte CSV en tableau de lignes (chaque ligne = tableau de cellules). */
export function parseCSV(texte: string): string[][] {
  const lignes = texte
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((l) => l.trim() !== "");
  if (lignes.length === 0) return [];
  const sep = detecterSeparateur(lignes[0]);
  return lignes.map((l) => decouperLigne(l, sep));
}

/** Normalise une date « JJ/MM/AAAA » ou « AAAA-MM-JJ » en ISO « AAAA-MM-JJ ». */
export function normaliserDate(valeur: string): string | null {
  const v = (valeur || "").trim();
  if (!v) return null;
  // Déjà au format ISO.
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  // JJ/MM/AAAA ou JJ-MM-AAAA.
  const m = v.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (m) {
    const [, j, mo, a] = m;
    return `${a}-${mo.padStart(2, "0")}-${j.padStart(2, "0")}`;
  }
  return null;
}

export interface LigneVenteCSV {
  date: string | null;
  client: string;
  designation: string;
  montant_total: number;
  montant_paye: number;
  moyen: string;
  echeance: string | null;
}

export interface ResultatParseCSV {
  lignes: LigneVenteCSV[];
  erreurs: { ligne: number; message: string }[];
}

const MOYENS = new Set(["especes", "momo", "banque", "virement"]);

/** Convertit une saisie monétaire (« 1 250 000 », « 50000 ») en entier FCFA. */
function montant(valeur: string): number {
  const n = parseInt((valeur || "").replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Transforme les lignes brutes d'un CSV de ventes en objets validés.
 * En-têtes attendus (ordre libre, insensible à la casse/accents) :
 *   date ; client ; designation ; montant_total ; montant_paye ; moyen ; echeance
 * Seul « montant_total » est obligatoire.
 */
export function parseVentesCSV(texte: string): ResultatParseCSV {
  const rows = parseCSV(texte);
  const resultat: ResultatParseCSV = { lignes: [], erreurs: [] };
  if (rows.length < 2) {
    resultat.erreurs.push({ ligne: 0, message: "Fichier vide ou sans données." });
    return resultat;
  }

  const normaliser = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .trim();
  const entetes = rows[0].map(normaliser);
  const idx = (nom: string) => entetes.indexOf(nom);
  const iTotal = idx("montant_total");
  if (iTotal === -1) {
    resultat.erreurs.push({
      ligne: 1,
      message: "Colonne « montant_total » introuvable dans l'en-tête.",
    });
    return resultat;
  }
  const iDate = idx("date");
  const iClient = idx("client");
  const iDes = idx("designation");
  const iPaye = idx("montant_paye");
  const iMoyen = idx("moyen");
  const iEch = idx("echeance");

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const ligneNum = r + 1; // numéro de ligne « humain »
    const total = montant(cells[iTotal] ?? "");
    if (total <= 0) {
      resultat.erreurs.push({ ligne: ligneNum, message: "montant_total manquant ou invalide." });
      continue;
    }
    const paye = iPaye >= 0 ? Math.min(montant(cells[iPaye] ?? ""), total) : 0;
    const moyenBrut = iMoyen >= 0 ? normaliser(cells[iMoyen] ?? "") : "";
    const moyen = MOYENS.has(moyenBrut) ? moyenBrut : "especes";

    resultat.lignes.push({
      date: iDate >= 0 ? normaliserDate(cells[iDate] ?? "") : null,
      client: iClient >= 0 ? (cells[iClient] ?? "").trim() : "",
      designation: iDes >= 0 ? (cells[iDes] ?? "").trim() || "Vente" : "Vente",
      montant_total: total,
      montant_paye: paye,
      moyen,
      echeance: iEch >= 0 ? normaliserDate(cells[iEch] ?? "") : null,
    });
  }
  return resultat;
}
