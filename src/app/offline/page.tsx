export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="text-5xl">📡</div>
      <h1 className="text-xl font-bold text-gray-800">Connexion indisponible</h1>
      <p className="max-w-xs text-sm text-gray-500">
        Vous êtes hors-ligne. Vos données saisies sont sauvegardées localement.
        Reconnectez-vous pour les enregistrer.
      </p>
      <a href="/app" className="btn-primary mt-2 inline-block">
        Réessayer
      </a>
    </div>
  );
}
