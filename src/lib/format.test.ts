import { describe, it, expect } from "vitest";
import { formatFCFA, parseFCFA, ancienneteJours, trancheAnciennete } from "./format";

describe("formatFCFA", () => {
  it("formate sans décimales avec séparateur de milliers", () => {
    expect(formatFCFA(1250000)).toBe("1 250 000 FCFA");
  });
  it("arrondit à l'entier", () => {
    expect(formatFCFA(999.7)).toBe("1 000 FCFA");
  });
  it("gère le suffixe désactivé", () => {
    expect(formatFCFA(5000, { sansSuffixe: true })).toBe("5 000");
  });
  it("gère zéro et valeurs nulles", () => {
    expect(formatFCFA(0)).toBe("0 FCFA");
  });
});

describe("parseFCFA", () => {
  it("extrait l'entier d'une saisie formatée", () => {
    expect(parseFCFA("1 250 000 FCFA")).toBe(1250000);
    expect(parseFCFA("1.250.000")).toBe(1250000);
  });
  it("retourne 0 pour une saisie vide", () => {
    expect(parseFCFA("")).toBe(0);
  });
});

describe("trancheAnciennete", () => {
  it("classe correctement les créances", () => {
    expect(trancheAnciennete(0)).toBe("0-30");
    expect(trancheAnciennete(30)).toBe("0-30");
    expect(trancheAnciennete(31)).toBe("31-60");
    expect(trancheAnciennete(60)).toBe("31-60");
    expect(trancheAnciennete(61)).toBe("+60");
  });
});

describe("ancienneteJours", () => {
  it("compte les jours écoulés depuis l'échéance", () => {
    const hier = new Date(Date.now() - 86400000);
    expect(ancienneteJours(hier)).toBeGreaterThanOrEqual(0);
  });
});
