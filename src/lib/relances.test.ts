import { describe, it, expect } from "vitest";
import { messageRelance, lienWhatsApp } from "./relances";

describe("messageRelance", () => {
  const base = {
    nomEntreprise: "Quincaillerie du Port",
    nomClient: "M. Dossou",
    montantDu: 150000,
  };

  it("inclut le montant dû et le nom du client", () => {
    const msg = messageRelance({ ...base, ton: "courtois" });
    expect(msg).toContain("150 000 FCFA");
    expect(msg).toContain("M. Dossou");
    expect(msg).toContain("Quincaillerie du Port");
  });

  it("durcit le ton selon le niveau", () => {
    expect(messageRelance({ ...base, ton: "dernier_avis" })).toContain("DERNIER RAPPEL");
    expect(messageRelance({ ...base, ton: "courtois" })).toContain("amical");
  });

  it("ajoute le lien de paiement quand fourni", () => {
    const msg = messageRelance({ ...base, ton: "ferme", lienPaiement: "https://pay/x" });
    expect(msg).toContain("https://pay/x");
  });

  it("n'ajoute pas de lien quand absent", () => {
    const msg = messageRelance({ ...base, ton: "ferme" });
    expect(msg).not.toContain("http");
  });
});

describe("lienWhatsApp", () => {
  it("nettoie le numéro et encode le message", () => {
    const url = lienWhatsApp("+229 01 00 00 00 00", "Bonjour");
    expect(url).toBe("https://wa.me/2290100000000?text=Bonjour");
  });
  it("fonctionne sans numéro", () => {
    expect(lienWhatsApp(null, "Salut")).toBe("https://wa.me/?text=Salut");
  });
});
