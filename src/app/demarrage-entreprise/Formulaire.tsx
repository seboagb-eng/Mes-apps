"use client";

import { useFormState } from "react-dom";
import { creerEntrepriseConnecte } from "../(auth)/actions";
import BoutonSoumettre from "@/components/BoutonSoumettre";

const SECTEURS = [
  "Commerce / Boutique",
  "Restauration",
  "Services",
  "Quincaillerie / BTP",
  "Agroalimentaire",
  "Santé / Pharmacie",
  "Autre",
];

export default function FormulaireEntreprise({ nomParDefaut }: { nomParDefaut: string }) {
  const [etat, action] = useFormState(creerEntrepriseConnecte, { erreur: "" } as {
    erreur: string;
  });

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="nom_entreprise">
          Nom de l'entreprise
        </label>
        <input id="nom_entreprise" name="nom_entreprise" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="secteur">
          Secteur d'activité
        </label>
        <select id="secteur" name="secteur" className="input">
          {SECTEURS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="nom_dirigeant">
          Votre nom
        </label>
        <input
          id="nom_dirigeant"
          name="nom_dirigeant"
          required
          defaultValue={nomParDefaut}
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="telephone">
          Téléphone
        </label>
        <input id="telephone" name="telephone" type="tel" inputMode="tel" className="input" />
      </div>

      {etat?.erreur ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-danger">{etat.erreur}</p>
      ) : null}

      <BoutonSoumettre>Créer mon entreprise</BoutonSoumettre>
    </form>
  );
}
