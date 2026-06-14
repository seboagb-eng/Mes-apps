import { createClient } from "@/lib/supabase/server";
import { ancienneteJours } from "@/lib/format";

/** Début du mois courant au format YYYY-MM-DD. */
function debutMois(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function aujourdHui(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface DonneesDashboard {
  caMois: number;
  caJour: number;
  cashTotal: number;
  totalCreances: number;
  depensesMois: number;
  topClients: { nom: string; montant: number }[];
  serieCA: { semaine: string; montant: number }[];
  repartitionDepenses: { categorie: string; montant: number }[];
  alertes: { type: "danger" | "warning"; texte: string }[];
}

/** Agrège toutes les données du tableau de bord pour l'entreprise courante. */
export async function chargerDashboard(): Promise<DonneesDashboard> {
  const supabase = createClient();
  const mois = debutMois();
  const jour = aujourdHui();

  const [ventesRes, comptesRes, transRes, clientsRes] = await Promise.all([
    supabase.from("sales").select("id, customer_id, date, montant_total, montant_paye, statut, echeance"),
    supabase.from("accounts").select("solde_courant"),
    supabase.from("transactions").select("type, categorie, montant, date"),
    supabase.from("customers").select("id, nom"),
  ]);

  const ventes = ventesRes.data ?? [];
  const comptes = comptesRes.data ?? [];
  const transactions = transRes.data ?? [];
  const clients = clientsRes.data ?? [];
  const nomClient = new Map(clients.map((c) => [c.id, c.nom]));

  const caMois = ventes
    .filter((v) => v.date >= mois)
    .reduce((s, v) => s + v.montant_total, 0);
  const caJour = ventes
    .filter((v) => v.date === jour)
    .reduce((s, v) => s + v.montant_total, 0);

  const cashTotal = comptes.reduce((s, c) => s + c.solde_courant, 0);

  const totalCreances = ventes
    .filter((v) => v.statut !== "payee")
    .reduce((s, v) => s + (v.montant_total - v.montant_paye), 0);

  const depenses = transactions.filter(
    (t) => t.type === "sortie" && t.categorie !== "transfert" && t.date >= mois
  );
  const depensesMois = depenses.reduce((s, t) => s + t.montant, 0);

  // Top 3 clients par chiffre d'affaires du mois.
  const parClient = new Map<string, number>();
  for (const v of ventes.filter((v) => v.date >= mois && v.customer_id)) {
    parClient.set(v.customer_id!, (parClient.get(v.customer_id!) ?? 0) + v.montant_total);
  }
  const topClients = [...parClient.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, montant]) => ({ nom: nomClient.get(id) ?? "Client", montant }));

  // CA sur 12 semaines.
  const serieCA = construireSerieCA(ventes);

  // Répartition des dépenses du mois par catégorie.
  const parCateg = new Map<string, number>();
  for (const t of depenses) {
    parCateg.set(t.categorie, (parCateg.get(t.categorie) ?? 0) + t.montant);
  }
  const repartitionDepenses = [...parCateg.entries()]
    .map(([categorie, montant]) => ({ categorie, montant }))
    .sort((a, b) => b.montant - a.montant);

  // Alertes.
  const alertes: DonneesDashboard["alertes"] = [];
  const creancesAnciennes = ventes
    .filter((v) => v.statut !== "payee" && v.echeance && ancienneteJours(v.echeance) > 30)
    .reduce((s, v) => s + (v.montant_total - v.montant_paye), 0);
  if (creancesAnciennes > 0) {
    alertes.push({
      type: "danger",
      texte: `Créances de plus de 30 jours à relancer.`,
    });
  }
  const derniereVente = ventes.map((v) => v.date).sort().at(-1);
  if (!derniereVente || ancienneteJours(derniereVente) >= 3) {
    alertes.push({ type: "warning", texte: "Aucune vente saisie depuis 3 jours." });
  }

  return {
    caMois,
    caJour,
    cashTotal,
    totalCreances,
    depensesMois,
    topClients,
    serieCA,
    repartitionDepenses,
    alertes,
  };
}

function construireSerieCA(
  ventes: { date: string; montant_total: number }[]
): { semaine: string; montant: number }[] {
  const semaines: { semaine: string; montant: number; debut: Date }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const debut = new Date(now);
    debut.setDate(now.getDate() - i * 7);
    semaines.push({
      semaine: `S-${i === 0 ? "0" : i}`,
      montant: 0,
      debut: new Date(debut.getFullYear(), debut.getMonth(), debut.getDate()),
    });
  }
  for (const v of ventes) {
    const d = new Date(v.date);
    for (let i = semaines.length - 1; i >= 0; i--) {
      if (d >= semaines[i].debut) {
        semaines[i].montant += v.montant_total;
        break;
      }
    }
  }
  return semaines.map((s) => ({ semaine: s.semaine, montant: s.montant }));
}
