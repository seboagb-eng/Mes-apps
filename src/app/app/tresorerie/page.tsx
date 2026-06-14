import { createClient } from "@/lib/supabase/server";
import { StatCard, TitreSection, EtatVide } from "@/components/ui";
import { LIBELLE_TYPE_COMPTE } from "@/lib/constantes";
import { formatFCFA, formatDateCourte } from "@/lib/format";
import CourbeCash from "@/modules/tresorerie/CourbeCash";
import FormulairesTresorerie from "@/modules/tresorerie/Formulaires";
import type { Compte } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Construit la série du solde total jour par jour sur 90 jours. */
function serieSolde(
  soldeActuel: number,
  mouvements: { type: string; montant: number; date: string }[]
): { date: string; solde: number }[] {
  const jours: { date: string; solde: number }[] = [];
  const today = new Date();

  // Variation nette par jour.
  const variation = new Map<string, number>();
  for (const m of mouvements) {
    const signe = m.type === "entree" ? 1 : -1;
    variation.set(m.date, (variation.get(m.date) ?? 0) + signe * m.montant);
  }

  // On remonte depuis le solde actuel jusqu'à il y a 90 jours.
  let solde = soldeActuel;
  const pile: { date: string; solde: number }[] = [];
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    pile.push({ date: iso, solde });
    solde -= variation.get(iso) ?? 0; // solde de la veille
  }
  jours.push(...pile.reverse());
  return jours;
}

export default async function TresoreriePage() {
  const supabase = createClient();
  const [{ data: comptesData }, { data: mouvements }] = await Promise.all([
    supabase.from("accounts").select("*").order("created_at"),
    supabase
      .from("transactions")
      .select("type, montant, date, categorie, description, account_id")
      .gte("date", new Date(Date.now() - 95 * 86400000).toISOString().slice(0, 10))
      .order("date", { ascending: false }),
  ]);

  const comptes = (comptesData ?? []) as Compte[];
  const total = comptes.reduce((s, c) => s + c.solde_courant, 0);
  const serie = serieSolde(total, mouvements ?? []);
  const derniersMouvements = (mouvements ?? []).slice(0, 15);

  return (
    <div className="space-y-6">
      <section>
        <TitreSection>Trésorerie consolidée</TitreSection>
        <div className="card mb-3 bg-primary text-white">
          <div className="text-xs opacity-80">Solde total disponible</div>
          <div className="mt-1 text-2xl font-extrabold tabular-nums">{formatFCFA(total)}</div>
        </div>
        {comptes.length === 0 ? (
          <EtatVide texte="Aucun compte. Créez votre première caisse ci-dessous." />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {comptes.map((c) => (
              <StatCard
                key={c.id}
                label={`${c.nom} · ${LIBELLE_TYPE_COMPTE[c.type]}`}
                montant={c.solde_courant}
              />
            ))}
          </div>
        )}
      </section>

      {comptes.length > 0 ? (
        <section className="card">
          <TitreSection>Évolution du cash</TitreSection>
          <CourbeCash serie={serie} />
        </section>
      ) : null}

      <FormulairesTresorerie comptes={comptes} />

      <section>
        <TitreSection>Derniers mouvements</TitreSection>
        {derniersMouvements.length === 0 ? (
          <EtatVide texte="Aucun mouvement récent." />
        ) : (
          <ul className="divide-y divide-gray-100 rounded-2xl bg-white ring-1 ring-gray-100">
            {derniersMouvements.map((m, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm font-medium capitalize">
                    {m.description || m.categorie}
                  </div>
                  <div className="text-xs text-gray-400">{formatDateCourte(m.date)}</div>
                </div>
                <div
                  className={`text-sm font-semibold tabular-nums ${
                    m.type === "entree" ? "text-success" : "text-danger"
                  }`}
                >
                  {m.type === "entree" ? "+" : "−"}
                  {formatFCFA(m.montant, { sansSuffixe: true })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
