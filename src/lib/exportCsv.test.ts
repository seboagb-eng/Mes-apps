import { describe, it, expect } from "vitest";
import { champCsv, genererCsv } from "./exportCsv";

describe("champCsv", () => {
  it("laisse les champs simples intacts", () => {
    expect(champCsv("Awa")).toBe("Awa");
    expect(champCsv(50000)).toBe("50000");
    expect(champCsv(null)).toBe("");
    expect(champCsv(undefined)).toBe("");
  });

  it("entoure de guillemets les champs avec séparateur, guillemet ou saut de ligne", () => {
    expect(champCsv("Boutique; Awa")).toBe('"Boutique; Awa"');
    expect(champCsv('Il a dit "ok"')).toBe('"Il a dit ""ok"""');
    expect(champCsv("ligne1\nligne2")).toBe('"ligne1\nligne2"');
  });
});

describe("genererCsv", () => {
  it("assemble en-têtes + lignes avec « ; » et CRLF", () => {
    const csv = genererCsv(
      ["date", "client", "montant"],
      [
        ["2026-06-01", "Awa", 50000],
        ["2026-06-02", "Koffi; Fils", 0],
      ]
    );
    expect(csv).toBe(
      'date;client;montant\r\n2026-06-01;Awa;50000\r\n2026-06-02;"Koffi; Fils";0'
    );
  });

  it("gère un export sans lignes (en-têtes seuls)", () => {
    expect(genererCsv(["a", "b"], [])).toBe("a;b");
  });
});
