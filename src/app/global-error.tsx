"use client";

/**
 * Filet de sécurité global : remplace l'écran blanc par un message lisible
 * si une erreur non interceptée survient au plus haut niveau.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Une erreur est survenue</h1>
        <p style={{ color: "#666", marginTop: 8 }}>
          Réessayez. Si le problème persiste, contactez le support.
        </p>
        <button
          onClick={() => reset()}
          style={{
            marginTop: 16,
            background: "#0B5FFF",
            color: "#fff",
            border: 0,
            borderRadius: 12,
            padding: "12px 20px",
            fontWeight: 600,
          }}
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
