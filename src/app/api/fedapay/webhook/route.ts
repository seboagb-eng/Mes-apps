import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { traiterPaiementConfirme, activerAbonnement } from "@/lib/fedapay";
import { PLANS } from "@/lib/constantes";
import type { Plan } from "@/lib/types";

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
  const meta = entite?.custom_metadata ?? {};
  const montant = Number(entite?.amount) || 0;

  // Paiement d'un abonnement : on active/renouvelle l'entreprise.
  if (meta?.type === "subscription" && meta?.company_id) {
    const plan = (meta.plan as Plan) in PLANS ? (meta.plan as Plan) : "starter";
    await activerAbonnement({ companyId: meta.company_id, plan, montant: PLANS[plan].prix });
    return NextResponse.json({ recu: true });
  }

  // Paiement d'une facture client.
  if (meta?.sale_id && montant > 0) {
    await traiterPaiementConfirme({ saleId: meta.sale_id, montant });
  }

  return NextResponse.json({ recu: true });
}
