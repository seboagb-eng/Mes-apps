import { getContexte } from "@/lib/auth";
import { TitreSection } from "@/components/ui";
import { formatDate } from "@/lib/format";
import BoutonsAbonnement from "@/modules/abonnement/BoutonsAbonnement";

export const dynamic = "force-dynamic";

export default async function AbonnementPage() {
  const { company, abonnement, lectureSeule } = await getContexte();

  const echu =
    abonnement?.prochaine_echeance != null &&
    new Date(abonnement.prochaine_echeance) < new Date();

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

      {company.statut === "actif" && abonnement?.prochaine_echeance ? (
        <div className={`card ${echu ? "bg-amber-50" : "bg-green-50"}`}>
          <div className={`text-sm ${echu ? "text-warning" : "text-success"}`}>
            {echu ? (
              <>
                Votre abonnement est arrivé à échéance le{" "}
                <strong>{formatDate(abonnement.prochaine_echeance)}</strong>. Renouvelez pour
                réactiver la saisie.
              </>
            ) : (
              <>
                Abonnement actif. Prochaine échéance le{" "}
                <strong>{formatDate(abonnement.prochaine_echeance)}</strong>.
              </>
            )}
          </div>
        </div>
      ) : null}

      {lectureSeule && company.statut !== "essai" ? (
        <div className="card bg-amber-50 text-sm text-warning">
          Mode lecture seule actif. Choisissez ou renouvelez un plan pour débloquer la saisie.
        </div>
      ) : null}

      <BoutonsAbonnement planActuel={company.plan} />

      <p className="text-center text-xs text-gray-400">
        Paiement par Mobile Money via FedaPay. Sans clés configurées, l'activation est immédiate
        (mode démonstration).
      </p>
    </div>
  );
}
