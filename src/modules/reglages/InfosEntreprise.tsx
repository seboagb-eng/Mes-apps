"use client";

import { majEntreprise } from "./actions";
import FormulaireAction from "@/components/FormulaireAction";
import type { Company } from "@/lib/types";

const SECTEURS = [
  "Commerce / Boutique",
  "Restauration",
  "Services",
  "Quincaillerie / BTP",
  "Agroalimentaire",
  "Santé / Pharmacie",
  "Autre",
];

/** Formulaire des informations de l'entreprise. */
export default function InfosEntreprise({ company }: { company: Company }) {
  return (
    <FormulaireAction action={majEntreprise} libelleBouton="Enregistrer" libelleSucces="Informations à jour." resetApresSucces={false}>
      <label className="label">Nom de l'entreprise</label>
      <input name="nom" defaultValue={company.nom} className="input" required />
      <label className="label">Secteur</label>
      <select name="secteur" defaultValue={company.secteur ?? ""} className="input">
        <option value="">—</option>
        {SECTEURS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </FormulaireAction>
  );
}
