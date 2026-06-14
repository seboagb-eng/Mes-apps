import { describe, it, expect } from "vitest";
import { parseCSV, detecterSeparateur, normaliserDate, parseVentesCSV } from "./csv";

describe("detecterSeparateur", () => {
  it("préfère le point-virgule (Excel FR)", () => {
    expect(detecterSeparateur("a;b;c")).toBe(";");
    expect(detecterSeparateur("a,b,c")).toBe(",");
  });
});

describe("parseCSV", () => {
  it("gère les guillemets et le séparateur dans un champ", () => {
    const rows = parseCSV('nom;montant\n"Boutique; Awa";50000');
    expect(rows[1]).toEqual(["Boutique; Awa", "50000"]);
  });
  it("ignore les lignes vides", () => {
    expect(parseCSV("a;b\n\n1;2\n")).toHaveLength(2);
  });
});

describe("normaliserDate", () => {
  it("accepte l'ISO et le format JJ/MM/AAAA", () => {
    expect(normaliserDate("2026-06-01")).toBe("2026-06-01");
    expect(normaliserDate("01/06/2026")).toBe("2026-06-01");
    expect(normaliserDate("1/6/2026")).toBe("2026-06-01");
  });
  it("retourne null si invalide", () => {
    expect(normaliserDate("hier")).toBeNull();
    expect(normaliserDate("")).toBeNull();
  });
});

describe("parseVentesCSV", () => {
  const entete = "date;client;designation;montant_total;montant_paye;moyen;echeance";

  it("parse une ligne complète", () => {
    const { lignes, erreurs } = parseVentesCSV(
      `${entete}\n2026-06-01;Awa;Ciment;50 000;20000;momo;2026-07-01`
    );
    expect(erreurs).toHaveLength(0);
    expect(lignes[0]).toEqual({
      date: "2026-06-01",
      client: "Awa",
      designation: "Ciment",
      montant_total: 50000,
      montant_paye: 20000,
      moyen: "momo",
      echeance: "2026-07-01",
    });
  });

  it("ordre des colonnes libre + en-têtes accentués/majuscules", () => {
    const { lignes } = parseVentesCSV("Montant_Total;Client\n10000;Koffi");
    expect(lignes[0].montant_total).toBe(10000);
    expect(lignes[0].client).toBe("Koffi");
  });

  it("plafonne le payé au total et borne le moyen", () => {
    const { lignes } = parseVentesCSV(`${entete}\n;X;V;10000;99999;carte;`);
    expect(lignes[0].montant_paye).toBe(10000); // plafonné
    expect(lignes[0].moyen).toBe("especes"); // moyen inconnu -> défaut
  });

  it("remonte une erreur par ligne invalide sans tout bloquer", () => {
    const { lignes, erreurs } = parseVentesCSV(`${entete}\n;A;V;0;0;;\n;B;V;5000;0;;`);
    expect(lignes).toHaveLength(1); // seule la 2e est valide
    expect(erreurs[0].ligne).toBe(2);
  });

  it("échoue proprement si montant_total absent", () => {
    const { erreurs } = parseVentesCSV("client;designation\nAwa;Ciment");
    expect(erreurs[0].message).toContain("montant_total");
  });
});
