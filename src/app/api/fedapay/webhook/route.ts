import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { traiterPaiementConfirme } from "@/lib/fedapay";

/**
 * Webhook FedaPay : confirme un paiement et met à jour la facture + la trésorerie.
 * Sécurité : on vérifie la signature HMAC envoyée dans l'en-tête `x-fedapay-signature`.
 */
export async function POST(req: NextRequest) {
  const brut = await req.text();
  const secret = process.env.FEDAPAY_WEBHOOK_SECRET;
  const signature = req.headers.get("x-fedapay-signature") || "";

  if (secret) {
    const attendu = crypto.createHmac("sha256", secret).update(brut).digest("hex");
    // Comparaison à temps constant.
    const ok =
      signature.length === attendu.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(attendu));
    if (!ok) {
      return NextResponse.json({ erreur: "Signature invalide" }, { status: 401 });
    }
  }

  let event: any;
  try {
    event = JSON.parse(brut);
  } catch {
    return NextResponse.json({ erreur: "Corps invalide" }, { status: 400 });
  }

  // On ne traite que les paiements approuvés.
  const nom = event?.name || event?.event;
  if (nom !== "transaction.approved" && event?.entity?.status !== "approved") {
    return NextResponse.json({ recu: true });
  }

  const entite = event?.entity ?? event?.["v1/transaction"] ?? {};
  const saleId = entite?.custom_metadata?.sale_id;
  const montant = Number(entite?.amount) || 0;

  if (saleId && montant > 0) {
    await traiterPaiementConfirme({ saleId, montant });
  }

  return NextResponse.json({ recu: true });
}
