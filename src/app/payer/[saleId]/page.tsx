import { createAdminClient } from "@/lib/supabase/server";
import { formatFCFA } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * Page de paiement de secours (utilisée quand FedaPay n'est pas encore branché).
 * Affiche le montant dû à régler. En production, le lien pointe directement
 * vers la page de paiement hébergée par FedaPay.
 */
export default async function PayerPage({ params }: { params: { saleId: string } }) {
  const admin = createAdminClient();
  const { data: vente } = await admin
    .from("sales")
    .select("montant_total, montant_paye, statut, companies(nom), customers(nom)")
    .eq("id", params.saleId)
    .single();

  if (!vente) {
    return (
      <main className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="text-gray-500">Facture introuvable.</p>
      </main>
    );
  }

  const reste = vente.montant_total - vente.montant_paye;
  const entreprise = (vente as any).companies?.nom ?? "L'entreprise";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10 text-center">
      <div className="mb-2 text-2xl font-extrabold text-primary">PILOT</div>
      <h1 className="mb-1 text-lg font-bold">Paiement à {entreprise}</h1>
      {vente.statut === "payee" ? (
        <p className="mt-6 rounded-xl bg-green-50 p-4 text-success">
          Cette facture est déjà réglée. Merci !
        </p>
      ) : (
        <>
          <p className="text-gray-600">Montant à régler</p>
          <div className="my-4 text-3xl font-extrabold tabular-nums">{formatFCFA(reste)}</div>
          <div className="rounded-xl bg-amber-50 p-4 text-sm text-warning">
            Le paiement Mobile Money en ligne sera disponible dès l'activation de FedaPay.
            En attendant, réglez par Mobile Money ou espèces auprès de {entreprise}.
          </div>
        </>
      )}
    </main>
  );
}
