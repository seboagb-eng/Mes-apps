"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { connexion } from "../actions";
import BoutonSoumettre from "@/components/BoutonSoumettre";

export default function ConnexionPage() {
  const [etat, action] = useFormState(connexion, { erreur: "" } as { erreur: string });

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <Link href="/" className="mb-6 text-2xl font-extrabold text-primary">
        PILOT
      </Link>
      <h1 className="mb-6 text-xl font-bold">Connexion</h1>

      <form action={action} className="space-y-4">
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
            className="input"
            autoComplete="current-password"
          />
        </div>

        {etat?.erreur ? (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-danger">{etat.erreur}</p>
        ) : null}

        <BoutonSoumettre>Se connecter</BoutonSoumettre>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-primary">
          Créer un compte
        </Link>
      </p>
    </main>
  );
}
