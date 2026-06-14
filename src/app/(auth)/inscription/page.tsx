"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { inscription } from "../actions";
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

export default function InscriptionPage() {
  const [etat, action] = useFormState(inscription, { erreur: "" } as { erreur: string });

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <Link href="/" className="mb-6 text-2xl font-extrabold text-primary">
        PILOT
      </Link>
      <h1 className="mb-1 text-xl font-bold">Créer mon compte</h1>
      <p className="mb-6 text-sm text-gray-600">14 jours gratuits, sans carte bancaire.</p>

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
          <input id="nom_dirigeant" name="nom_dirigeant" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="telephone">
            Téléphone
          </label>
          <input id="telephone" name="telephone" type="tel" inputMode="tel" className="input" placeholder="+229 01 00 00 00 00" />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="mot_de_passe">
            Mot de passe
          </label>
          <input
            id="mot_de_passe"
            name="mot_de_passe"
            type="password"
            required
            minLength={6}
            className="input"
            autoComplete="new-password"
          />
        </div>

        {etat?.erreur ? (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-danger">{etat.erreur}</p>
        ) : null}

        <BoutonSoumettre>Créer mon compte</BoutonSoumettre>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="font-semibold text-primary">
          Se connecter
        </Link>
      </p>
    </main>
  );
}
