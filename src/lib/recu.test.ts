import { describe, it, expect } from "vitest";
import { messageRecu } from "./recu";

describe("messageRecu", () => {
  const base = {
    nomEntreprise: "Quincaillerie Awa",
    nomClient: "Koffi",
    montant: 20000,
    moyen: "momo" as const,
    date: new Date("2026-06-15T10:00:00Z"),
  };

  it("indique le reste à payer quand la facture n'est pas soldée", () => {
    const txt = messageRecu({ ...base, resteApres: 30000 });
    expect(txt).toContain("REÇU DE PAIEMENT");
    expect(txt).toContain("Quincaillerie Awa");
    expect(txt).toContain("Client : Koffi");
    expect(txt).toContain("Mode : Mobile Money");
    expect(txt).toContain("Reste à payer");
  });

  it("marque la facture soldée quand il ne reste rien", () => {
    const txt = messageRecu({ ...base, resteApres: 0 });
    expect(txt).toContain("soldée");
    expect(txt).not.toContain("Reste à payer");
  });
});
