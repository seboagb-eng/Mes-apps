import { createClient, createAdminClient } from "@/lib/supabase/server";

const BASE_URL =
  process.env.FEDAPAY_ENV === "live"
    ? "https://api.fedapay.com/v1"
    : "https://sandbox-api.fedapay.com/v1";

/**
 * Génère un lien de paiement Mobile Money rattaché à une facture impayée.
 *
 * • Si les clés FedaPay sont configurées : crée une transaction FedaPay et
 *   renvoie l'URL de paiement hébergée.
 * • Sinon (dev / pas encore branché) : renvoie un lien interne de secours
 *   vers une page de paiement, afin que le reste du produit reste utilisable.
 *
 * Le rattachement à la facture se fait via le champ `callback_url` qui inclut
 * le sale_id, et via la métadonnée custom_metadata.
 */
export async function creerLienPaiement(saleId: string): Promise<string> {
  const supabase = createClient();
  const { data: vente } = await supabase
    .from("sales")
    .select("id, company_id, montant_total, montant_paye, customer_id, customers(nom, telephone, email)")
    .eq("id", saleId)
    .single();

  if (!vente) throw new Error("Vente introuvable.");
  const resteDu = vente.montant_total - vente.montant_paye;
  if (resteDu <= 0) throw new Error("Cette facture est déjà soldée.");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const cle = process.env.FEDAPAY_SECRET_KEY;

  // Repli sans clés : lien interne (utile en démo / avant validation FedaPay).
  if (!cle) {
    return `${appUrl}/payer/${saleId}`;
  }

  const client = (vente as any).customers ?? {};
  // 1) Créer la transaction FedaPay.
  const resTx = await fetch(`${BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cle}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      description: `Facture PILOT ${saleId.slice(0, 8)}`,
      amount: resteDu, // FedaPay XOF : montant entier en FCFA
      currency: { iso: "XOF" },
      callback_url: `${appUrl}/api/fedapay/webhook`,
      custom_metadata: { sale_id: saleId, company_id: vente.company_id },
      customer: {
        firstname: client.nom || "Client",
        email: client.email || undefined,
        phone_number: client.telephone
          ? { number: client.telephone, country: "bj" }
          : undefined,
      },
    }),
  });
  if (!resTx.ok) throw new Error("FedaPay : création de transaction refusée.");
  const tx = await resTx.json();
  const id = tx?.["v1/transaction"]?.id ?? tx?.id;

  // 2) Générer le token / l'URL de paiement.
  const resToken = await fetch(`${BASE_URL}/transactions/${id}/token`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/json" },
  });
  if (!resToken.ok) throw new Error("FedaPay : génération du lien refusée.");
  const tok = await resToken.json();
  return tok?.url as string;
}

/**
 * Génère un lien de paiement FedaPay pour un abonnement mensuel.
 * Repli sans clés (démo) : renvoie `null` — l'appelant active alors directement.
 * La métadonnée `type: "subscription"` permet au webhook de router la confirmation.
 */
export async function creerLienAbonnement(
  companyId: string,
  plan: string,
  montant: number
): Promise<string | null> {
  const cle = process.env.FEDAPAY_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  if (!cle) return null;

  const resTx = await fetch(`${BASE_URL}/transactions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      description: `Abonnement PILOT ${plan}`,
      amount: montant,
      currency: { iso: "XOF" },
      callback_url: `${appUrl}/api/fedapay/webhook`,
      custom_metadata: { type: "subscription", company_id: companyId, plan },
    }),
  });
  if (!resTx.ok) throw new Error("FedaPay : création de l'abonnement refusée.");
  const tx = await resTx.json();
  const id = tx?.["v1/transaction"]?.id ?? tx?.id;

  const resToken = await fetch(`${BASE_URL}/transactions/${id}/token`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/json" },
  });
  if (!resToken.ok) throw new Error("FedaPay : génération du lien refusée.");
  const tok = await resToken.json();
  return tok?.url as string;
}

/**
 * Active (ou renouvelle) l'abonnement d'une entreprise via la RPC admin.
 * Utilisé par le webhook (paiement confirmé) et par le mode démo.
 */
export async function activerAbonnement(params: {
  companyId: string;
  plan: string;
  montant: number;
}): Promise<void> {
  const admin = createAdminClient();
  await admin.rpc("activer_abonnement_admin", {
    p_company_id: params.companyId,
    p_plan: params.plan,
    p_montant: params.montant,
  });
}

/**
 * Traite la confirmation d'un paiement FedaPay (webhook).
 * Marque la vente comme payée et crédite la trésorerie via la RPC
 * enregistrer_paiement (avec le client admin, hors RLS).
 */
export async function traiterPaiementConfirme(params: {
  saleId: string;
  montant: number;
}): Promise<void> {
  const admin = createAdminClient();
  // Compte de réception : le premier compte Mobile Money de l'entreprise.
  const { data: vente } = await admin
    .from("sales")
    .select("company_id")
    .eq("id", params.saleId)
    .single();
  if (!vente) return;

  const { data: compte } = await admin
    .from("accounts")
    .select("id")
    .eq("company_id", vente.company_id)
    .eq("type", "mobile_money")
    .limit(1)
    .maybeSingle();

  const { data: fallback } = compte
    ? { data: compte }
    : await admin
        .from("accounts")
        .select("id")
        .eq("company_id", vente.company_id)
        .limit(1)
        .maybeSingle();

  const accountId = (compte ?? fallback)?.id;
  if (!accountId) return;

  // RPC SECURITY DEFINER : ici on l'appelle en service_role, mais la fonction
  // recalcule via auth_company_id() = null. On insère donc directement.
  await admin.rpc("enregistrer_paiement_admin", {
    p_sale_id: params.saleId,
    p_account_id: accountId,
    p_montant: params.montant,
    p_moyen: "momo",
  });
}
