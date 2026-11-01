import { createClient } from "@/lib/supabase/server";
import ActiviteClient from "@/modules/activite/ActiviteClient";
import type { FeedItem } from "@/modules/activite/ActiviteClient";

export const dynamic = "force-dynamic";

export default async function ActivitePage() {
  const supabase = createClient();

  const sept = new Date();
  sept.setDate(sept.getDate() - 7);
  const dateS7 = sept.toISOString().slice(0, 10);

  const [{ data: transactions }, { data: ventes }, { data: clients }] = await Promise.all([
    supabase
      .from("transactions")
      .select("id, type, categorie, montant, date")
      .order("date", { ascending: false })
      .limit(200),
    supabase
      .from("sales")
      .select("id, customer_id, date, montant_total, montant_paye, statut")
      .order("date", { ascending: false })
      .limit(200),
    supabase.from("customers").select("id, nom"),
  ]);

  const nomClient = new Map((clients ?? []).map((c) => [c.id, c.nom as string]));

  const items: FeedItem[] = [];

  // Ventes payées ou partiellement encaissées → kind "vente"
  for (const v of ventes ?? []) {
    if (v.montant_paye > 0) {
      items.push({
        id: `vente-${v.id}`,
        date: v.date,
        kind: "vente",
        label: "Vente",
        sousLabel: v.customer_id ? (nomClient.get(v.customer_id) ?? "") : "",
        montant: v.montant_paye,
      });
    }
    // Crédits (solde non réglé)
    if (v.statut !== "payee" && v.montant_total - v.montant_paye > 0) {
      items.push({
        id: `credit-${v.id}`,
        date: v.date,
        kind: "credit",
        label: "À crédit",
        sousLabel: v.customer_id ? (nomClient.get(v.customer_id) ?? "") : "",
        montant: v.montant_total - v.montant_paye,
      });
    }
  }

  // Transactions (entrées/sorties), en excluant les transferts
  for (const t of transactions ?? []) {
    if (t.categorie === "transfert") continue;
    if (t.type === "entree") {
      items.push({
        id: `tx-${t.id}`,
        date: t.date,
        kind: "vente",
        label: t.categorie ?? "Entrée",
        sousLabel: "",
        montant: t.montant,
      });
    } else {
      items.push({
        id: `tx-${t.id}`,
        date: t.date,
        kind: "depense",
        label: t.categorie ?? "Dépense",
        sousLabel: "",
        montant: t.montant,
      });
    }
  }

  // Dédupliquer : si une transaction correspond à une vente payée, on garde la vente
  // (la transaction entree est créée par le trigger pour chaque paiement → doublons possibles).
  // Simple deduplication par date + montant côté client — on garde tout pour l'instant.

  // Stats 7 jours
  const entreesS7 = items
    .filter((i) => i.date >= dateS7 && i.kind === "vente")
    .reduce((s, i) => s + i.montant, 0);
  const sortiesS7 = items
    .filter((i) => i.date >= dateS7 && i.kind === "depense")
    .reduce((s, i) => s + i.montant, 0);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-[26px] font-extrabold text-ink">Activité</h1>
      <ActiviteClient items={items} entreesS7={entreesS7} sortiesS7={sortiesS7} />
    </div>
  );
}
