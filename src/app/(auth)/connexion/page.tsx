"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { connexion } from "../actions";
import BoutonSoumettre from "@/components/BoutonSoumettre";
import { Icone } from "@/components/Icone";

export default function ConnexionPage() {
  const [etat, action] = useFormState(connexion, { erreur: "" } as { erreur: string });

  return (
    <div className="flex min-h-screen flex-col bg-ground font-sans text-ink">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5">
        <Link
          href="/"
          aria-label="Retour à l'accueil"
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-ink"
        >
          <Icone nom="retour" taille={20} />
        </Link>
        <span className="font-display text-xl font-bold text-primary">PILOT</span>
      </div>

      {/* Titre */}
      <div className="flex flex-col gap-1.5 px-5 pt-5">
        <h1 className="font-display text-[32px] font-extrabold leading-[1.05] tracking-tight">
          Bon retour.
        </h1>
        <p className="text-sm text-muted">Connectez-vous à votre espace.</p>
      </div>

      {/* Formulaire */}
      <form action={action} className="flex flex-1 flex-col">
        <div className="flex-1 px-5 py-5">
          <div className="flex flex-col gap-[18px]">
            <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
              Email
              <input
                name="email"
                type="email"
                required
                className="input"
                autoComplete="email"
                placeholder="vous@exemple.bj"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
              Mot de passe
              <input
                name="mot_de_passe"
                type="password"
                required
                className="input"
                autoComplete="current-password"
                placeholder="Votre mot de passe"
              />
            </label>

            {etat?.erreur ? (
              <p className="rounded-xl bg-red-50 px-3 py-3 text-sm text-danger">{etat.erreur}</p>
            ) : null}
          </div>
        </div>

        {/* CTA fixe */}
        <div className="flex flex-col gap-3 border-t border-divider bg-ground px-5 pb-8 pt-3.5">
          <BoutonSoumettre>Se connecter</BoutonSoumettre>
          <p className="text-center text-sm text-muted">
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="font-bold text-primary">
              Créer un compte
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
