"use client";

import { useState, useTransition } from "react";
import { changerMotDePasse } from "./actions";

export default function ChangerMotDePasse() {
  const [ouvert, setOuvert] = useState(false);
  const [resultat, setResultat] = useState<{ ok?: boolean; erreur?: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      setResultat(null);
      const res = await changerMotDePasse(fd);
      setResultat(res);
      if (res.ok) {
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setOuvert(false), 1500);
      }
    });
  }

  if (!ouvert) {
    return (
      <button onClick={() => setOuvert(true)} className="btn-secondary text-sm">
        Changer mon mot de passe
      </button>
    );
  }

  return (
    <form onSubmit={soumettre} className="mt-3 space-y-3">
      <div>
        <label className="label">Mot de passe actuel</label>
        <input name="actuel" type="password" required className="input" autoComplete="current-password" />
      </div>
      <div>
        <label className="label">Nouveau mot de passe</label>
        <input name="nouveau" type="password" required minLength={8} className="input" autoComplete="new-password" />
      </div>
      <div>
        <label className="label">Confirmer le nouveau mot de passe</label>
        <input name="confirmation" type="password" required minLength={8} className="input" autoComplete="new-password" />
      </div>

      {resultat?.erreur && (
        <p className="rounded-lg bg-red-50 p-2 text-sm text-danger">{resultat.erreur}</p>
      )}
      {resultat?.ok && (
        <p className="rounded-lg bg-green-50 p-2 text-sm text-success">Mot de passe modifié.</p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary flex-1 text-sm">
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button type="button" onClick={() => setOuvert(false)} className="btn-secondary text-sm">
          Annuler
        </button>
      </div>
    </form>
  );
}
