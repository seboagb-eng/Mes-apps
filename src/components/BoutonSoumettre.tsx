"use client";

import { useFormStatus } from "react-dom";

/** Bouton de soumission qui affiche un état de chargement. */
export default function BoutonSoumettre({
  children,
  className = "btn-primary w-full",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? "Veuillez patienter…" : children}
    </button>
  );
}
