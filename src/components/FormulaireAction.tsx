"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type ActionServeur = (fd: FormData) => Promise<{ erreur?: string; ok?: boolean }>;

/**
 * Enveloppe réutilisable d'un formulaire piloté par une action serveur.
 * Gère l'état d'envoi, l'affichage d'erreur/succès, le reset et le refresh.
 */
export default function FormulaireAction({
  action,
  children,
  libelleBouton = "Enregistrer",
  libelleSucces = "Enregistré.",
  resetApresSucces = true,
  onSucces,
}: {
  action: ActionServeur;
  children: React.ReactNode;
  libelleBouton?: string;
  libelleSucces?: string;
  resetApresSucces?: boolean;
  onSucces?: () => void;
}) {
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        startTransition(async () => {
          setErreur("");
          setSucces("");
          const res = await action(fd);
          if (res?.erreur) {
            setErreur(res.erreur);
          } else {
            setSucces(libelleSucces);
            if (resetApresSucces) form.reset();
            router.refresh();
            onSucces?.();
          }
        });
      }}
      className="space-y-3"
    >
      {children}
      {erreur ? <p className="rounded-lg bg-red-50 p-2 text-sm text-danger">{erreur}</p> : null}
      {succes ? <p className="rounded-lg bg-green-50 p-2 text-sm text-success">{succes}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Enregistrement…" : libelleBouton}
      </button>
    </form>
  );
}
