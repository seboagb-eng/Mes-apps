import { getContexte } from "@/lib/auth";
import { TitreSection } from "@/components/ui";
import { formatFCFA, formatDate } from "@/lib/format";
import { PLANS } from "@/lib/constantes";
import type { Plan } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AbonnementPage() {
  const { company } = await getContexte();

  return (
    <div className="space-y-5">
      <TitreSection>Abonnement</TitreSection>

      {company.statut === "essai" && company.date_fin_essai ? (
        <div className="card bg-primary-light">
          <div className="text-sm text-primary-dark">
            Essai gratuit jusqu'au <strong>{formatDate(company.date_fin_essai)}</strong>. Choisissez
            un plan pour continuer sans interruption.
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {(Object.keys(PLANS) as Plan[]).map((p) => {
          const plan = PLANS[p];
          const actuel = company.plan === p;
          return (
            <div
              key={p}
              className={`card ${actuel ? "ring-2 ring-primary" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold">{plan.nom}</div>
                  <div className="text-sm text-gray-500">{plan.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-extrabold tabular-nums">{formatFCFA(plan.prix)}</div>
                  <div className="text-xs text-gray-400">par mois</div>
                </div>
              </div>
              <button
                disabled={actuel}
                className={`mt-3 w-full ${actuel ? "btn-secondary" : "btn-primary"}`}
              >
                {actuel ? "Plan actuel" : "Choisir ce plan"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400">
        Le paiement de l'abonnement par Mobile Money (FedaPay) sera activé à l'étape 9.
      </p>
    </div>
  );
}
