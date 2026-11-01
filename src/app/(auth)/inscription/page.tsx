"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormState } from "react-dom";
import { inscription } from "../actions";
import BoutonSoumettre from "@/components/BoutonSoumettre";
import ChoixChips from "@/components/ChoixChips";
import { Icone } from "@/components/Icone";

const SECTEURS = [
  { valeur: "Commerce / Boutique", label: "Commerce / Boutique" },
  { valeur: "Restauration", label: "Restauration" },
  { valeur: "Services", label: "Services" },
  { valeur: "Quincaillerie / BTP", label: "Quincaillerie / BTP" },
  { valeur: "Agroalimentaire", label: "Agroalimentaire" },
  { valeur: "Santé / Pharmacie", label: "Santé / Pharmacie" },
  { valeur: "Autre", label: "Autre" },
];

type Secteur = (typeof SECTEURS)[number]["valeur"];

export default function InscriptionPage() {
  const [etat, action] = useFormState(inscription, { erreur: "" } as { erreur: string });
  const [secteur, setSecteur] = useState<Secteur>(SECTEURS[0].valeur);

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
        <span className="rounded-full bg-primary-tint px-3 py-2 text-xs font-bold text-primary">
          14 jours gratuits
        </span>
      </div>

      {/* Titre */}
      <div className="flex flex-col gap-1.5 px-5 pt-5">
        <h1 className="font-display text-[32px] font-extrabold leading-[1.05] tracking-tight">
          Créons votre espace
        </h1>
        <p className="text-sm text-muted">Sans carte bancaire. 1 minute.</p>
      </div>

      {/* Formulaire */}
      <form action={action} className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="flex flex-col gap-[18px]">
            {/* Votre entreprise */}
            <fieldset className="flex flex-col gap-3.5 border-0 p-0">
              <legend className="pb-2 text-xs font-extrabold uppercase tracking-[0.08em] text-muted">
                Votre entreprise
              </legend>
              <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
                Nom de l'entreprise
                <input
                  name="nom_entreprise"
                  type="text"
                  placeholder="Ex. Ets Akpovi Distribution"
                  required
                  className="input"
                  autoComplete="organization"
                />
              </label>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-ink">Secteur d'activité</span>
                <ChoixChips<Secteur>
                  name="secteur"
                  options={SECTEURS}
                  valeur={secteur}
                  onChange={setSecteur}
                />
              </div>
            </fieldset>

            {/* Vous */}
            <fieldset className="flex flex-col gap-3.5 border-0 p-0">
              <legend className="pb-2 text-xs font-extrabold uppercase tracking-[0.08em] text-muted">
                Vous
              </legend>
              <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
                Votre nom
                <input
                  name="nom_dirigeant"
                  type="text"
                  placeholder="Prénom et nom"
                  required
                  className="input"
                  autoComplete="name"
                />
              </label>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-bold text-ink">Téléphone WhatsApp</span>
                <div className="flex h-[52px] overflow-hidden rounded-xl border border-line bg-surface">
                  <span className="flex items-center bg-divider px-3 text-[15px] font-bold text-ink">
                    +229
                  </span>
                  <input
                    name="telephone"
                    type="tel"
                    inputMode="tel"
                    placeholder="01 00 00 00 00"
                    className="min-w-0 flex-1 border-0 bg-transparent px-3 text-base font-medium text-ink placeholder:text-disabled focus:outline-none"
                  />
                </div>
              </div>
              <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
                Mot de passe
                <input
                  name="mot_de_passe"
                  type="password"
                  placeholder="8 caractères minimum"
                  required
                  minLength={8}
                  className="input"
                  autoComplete="new-password"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
                Email{" "}
                <span className="font-medium text-muted">(facultatif)</span>
                <input
                  name="email"
                  type="email"
                  placeholder="vous@exemple.bj"
                  className="input"
                  autoComplete="email"
                />
              </label>
            </fieldset>

            {etat?.erreur ? (
              <p className="rounded-xl bg-red-50 px-3 py-3 text-sm text-danger">{etat.erreur}</p>
            ) : null}
          </div>
        </div>

        {/* CTA fixe */}
        <div className="flex flex-col gap-3 border-t border-divider bg-ground px-5 pb-8 pt-3.5">
          <BoutonSoumettre>Créer mon compte</BoutonSoumettre>
          <p className="text-center text-sm text-muted">
            Déjà inscrit ?{" "}
            <Link href="/connexion" className="font-bold text-primary">
              Se connecter
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
