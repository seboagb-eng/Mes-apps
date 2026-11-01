import { createClient } from "@/lib/supabase/server";
import { ancienneteJours } from "@/lib/format";

function debutMois(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function aujourdHui(): string {
  return new Date().toISOString().slice(0, 10);
}

function initiales(nom: string): string {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function calcVerdict(
  cashTotal: number,
  depensesMois: number,
  totalCreances: number,
  caJour: number,
  derniereVente: string | undefined,
  joursEcoules: number
): { etat: "bonne" | "surveiller" | "tendue"; phrase: string } {
  const depensesJour = joursEcoules > 0 ? depensesMois / joursEcoules : depensesMois;
  const joursRestants = depensesJour > 0 ? Math.round(cashTotal / depensesJour) : 99;

  if (joursRestants < 10 || cashTotal <= 0) {
    const j = Math.max(0, joursRestants);
    return {
      etat: "tendue",
      phrase:
        `Il vous reste environ ${j} jour${j !== 1 ? "s" : ""} de dépenses.` +
        (totalCreances > 0 ? ` Relancez les ${new Intl.NumberFormat("fr-FR").format(totalCreances)} FCFA dus.` : ""),
    };
  }
  if (caJour === 0 && derniereVente && ancienneteJours(derniereVente) >= 2) {
    return {
      etat: "surveiller",
      phrase: "Aucune vente saisie depuis 2 jours. Pensez à mettre à jour votre activité.",
    };
  }
  return {
    etat: "bonne",
    phrase: "Trésorerie saine. Continuez sur cette lancée.",
  };
}

export interface DonneesDashboard {
  caMois: number;
  caJour: number;
  cashTotal: number;
  totalCreances: number;
  depensesMois: number;
  margeMois: number;
  cashParType: { banque: number; mobile_money: number; caisse: number };
  topRelances: { initiales: string; nom: string; joursRetard: number; montantDu: number }[];
  topClients: { nom: string; montant: number }[];
  serieCA: { semaine: string; montant: number }[];
  repartitionDepenses: { categorie: string; montant: number }[];
  alertes: { type: "danger" | "warning"; texte: string }[];
  verdict: { etat: "bonne" | "surveiller" | "tendue"; phrase: string };
}

export async function chargerDashboard(): Promise<DonneesDashboard> {
  const supabase = createClient();
  const mois = debutMois();
  const jour = aujourdHui();

  const [ventesRes, comptesRes, transRes, clientsRes] = await Promise.all([
    supabase
      .from("sales")
      .select("id, customer_id, date, montant_total, montant_paye, statut, echeance"),
    supabase.from("accounts").select("solde_courant, type_compte"),
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

  const cashParType = { banque: 0, mobile_money: 0, caisse: 0 };
  for (const c of comptes) {
    const t = c.type_compte as keyof typeof cashParType;
    if (t in cashParType) cashParType[t] += c.solde_courant;
  }

  const totalCreances = ventes
    .filter((v) => v.statut !== "payee")
    .reduce((s, v) => s + (v.montant_total - v.montant_paye), 0);

  const depenses = transactions.filter(
    (t) => t.type === "sortie" && t.categorie !== "transfert" && t.date >= mois
  );
  const depensesMois = depenses.reduce((s, t) => s + t.montant, 0);
  const margeMois = caMois - depensesMois;

  // Top relances : créances en retard, triées par date d'échéance (plus ancien d'abord).
  const topRelances = ventes
    .filter((v) => v.statut !== "payee" && v.echeance && v.echeance < jour && v.customer_id)
    .sort((a, b) => (a.echeance! < b.echeance! ? -1 : 1))
    .slice(0, 5)
    .map((v) => {
      const nom = nomClient.get(v.customer_id!) ?? "Client";
      return {
        initiales: initiales(nom),
        nom,
        joursRetard: ancienneteJours(v.echeance!),
        montantDu: v.montant_total - v.montant_paye,
      };
    });

  // Top 3 clients du mois.
  const parClient = new Map<string, number>();
  for (const v of ventes.filter((v) => v.date >= mois && v.customer_id)) {
    parClient.set(v.customer_id!, (parClient.get(v.customer_id!) ?? 0) + v.montant_total);
  }
  const topClients = [...parClient.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, montant]) => ({ nom: nomClient.get(id) ?? "Client", montant }));

  const serieCA = construireSerieCA(ventes);

  const parCateg = new Map<string, number>();
  for (const t of depenses) {
    parCateg.set(t.categorie, (parCateg.get(t.categorie) ?? 0) + t.montant);
  }
  const repartitionDepenses = [...parCateg.entries()]
    .map(([categorie, montant]) => ({ categorie, montant }))
    .sort((a, b) => b.montant - a.montant);

  const alertes: DonneesDashboard["alertes"] = [];
  const creancesAnciennes = ventes
    .filter((v) => v.statut !== "payee" && v.echeance && ancienneteJours(v.echeance) > 30)
    .reduce((s, v) => s + (v.montant_total - v.montant_paye), 0);
  if (creancesAnciennes > 0) {
    alertes.push({ type: "danger", texte: "Créances de plus de 30 jours à relancer." });
  }
  const derniereVente = ventes.map((v) => v.date).sort().at(-1);
  if (!derniereVente || ancienneteJours(derniereVente) >= 3) {
    alertes.push({ type: "warning", texte: "Aucune vente saisie depuis 3 jours." });
  }

  const joursEcoules = new Date().getDate();
  const verdict = calcVerdict(cashTotal, depensesMois, totalCreances, caJour, derniereVente, joursEcoules);

  return {
    caMois,
    caJour,
    cashTotal,
    totalCreances,
    depensesMois,
    margeMois,
    cashParType,
    topRelances,
    topClients,
    serieCA,
    repartitionDepenses,
    alertes,
    verdict,
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
