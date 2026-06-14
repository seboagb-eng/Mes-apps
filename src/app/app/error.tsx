"use client";

import Link from "next/link";

/** Affiche une erreur survenue dans l'espace connecté (au lieu d'un écran blanc). */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="mb-2 text-2xl">⚠️</div>
      <h1 className="text-lg font-bold">Impossible d'afficher cette page</h1>
      <p className="mt-1 text-sm text-gray-500">
        Vérifiez votre connexion et réessayez.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={() => reset()} className="btn-primary">
          Réessayer
        </button>
        <Link href="/app" className="btn-secondary">
          Accueil
        </Link>
      </div>
    </div>
  );
}
