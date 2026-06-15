"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inviterUtilisateur, retirerMembre } from "./actions";
import type { Utilisateur } from "@/lib/types";

const ROLES: { v: string; label: string; aide: string }[] = [
  { v: "gestionnaire", label: "Gestionnaire", aide: "Saisie ventes, trésorerie, recouvrement" },
  { v: "lecture", label: "Lecture seule", aide: "Consultation uniquement" },
  { v: "admin", label: "Administrateur", aide: "Tous les droits, dont l'équipe" },
];

export default function Equipe({
  membres,
  moiId,
}: {
  membres: Utilisateur[];
  moiId: string;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [pending, startTransition] = useTransition();
  const [resultat, setResultat] = useState<{
    erreur?: string;
    identifiants?: { email: string; motDePasse: string };
  } | null>(null);
  const router = useRouter();

  function inviter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      setResultat(null);
      const res = await inviterUtilisateur(fd);
      setResultat(res);
      if (res.ok) {
        form.reset();
        router.refresh();
      }
    });
  }

  function retirer(id: string, nom: string) {
    if (!confirm(`Retirer ${nom} de l'équipe ? Son accès sera supprimé.`)) return;
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      const res = await retirerMembre(fd);
      if (res?.erreur) alert(res.erreur);
      else router.refresh();
    });
  }

  const labelRole = (r: string) => ROLES.find((x) => x.v === r)?.label ?? r;

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-gray-100 rounded-2xl bg-white ring-1 ring-gray-100">
        {membres.map((m) => (
          <li key={m.id} className="flex items-center justify-between px-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">
                {m.nom}
                {m.id === moiId ? <span className="text-xs text-gray-400"> (vous)</span> : null}
              </div>
              <div className="truncate text-xs text-gray-400">
                {m.email} · {labelRole(m.role)}
              </div>
            </div>
            {m.id !== moiId ? (
              <button
                onClick={() => retirer(m.id, m.nom)}
                disabled={pending}
                className="text-xs text-gray-400 hover:text-danger"
              >
                Retirer
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      {!ouvert ? (
        <button onClick={() => setOuvert(true)} className="btn-secondary w-full">
          + Inviter un membre
        </button>
      ) : (
        <form onSubmit={inviter} className="card space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold">Nouveau membre</h4>
            <button type="button" onClick={() => setOuvert(false)} className="text-sm text-gray-400">
              Fermer
            </button>
          </div>
          <input name="nom" placeholder="Nom complet" className="input" required />
          <input name="email" type="email" placeholder="Email" className="input" required />
          <input name="telephone" placeholder="Téléphone (optionnel)" className="input" />
          <select name="role" defaultValue="gestionnaire" className="input">
            {ROLES.map((r) => (
              <option key={r.v} value={r.v}>
                {r.label} — {r.aide}
              </option>
            ))}
          </select>
          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? "Création…" : "Créer le membre"}
          </button>

          {resultat?.erreur && (
            <p className="rounded-lg bg-red-50 p-2 text-sm text-danger">{resultat.erreur}</p>
          )}
          {resultat?.identifiants && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-success">
              <p className="font-semibold">Membre créé. Transmettez ces identifiants :</p>
              <p className="mt-1 font-mono text-xs">
                Email : {resultat.identifiants.email}
                <br />
                Mot de passe : {resultat.identifiants.motDePasse}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Le membre pourra le changer dans Réglages → Mon compte. Ce mot de passe ne sera plus
                affiché.
              </p>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
