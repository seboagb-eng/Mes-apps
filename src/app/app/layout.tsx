import Link from "next/link";
import { getContexte } from "@/lib/auth";
import { deconnexion } from "@/app/(auth)/actions";
import { createClient } from "@/lib/supabase/server";
import Navigation from "@/components/Navigation";
import EnregistrerSW from "@/components/EnregistrerSW";
import { formatDate } from "@/lib/format";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { utilisateur, company, abonnement, lectureSeule } = await getContexte();
  const abonnementEchu =
    abonnement?.prochaine_echeance != null &&
    new Date(abonnement.prochaine_echeance) < new Date();

  // Nombre de créances en retard pour la pastille Relances.
  const supabase = createClient();
  const { count: retardCount } = await supabase
    .from("sales")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company.id)
    .in("statut", ["impayee", "partielle"])
    .lt("echeance", new Date().toISOString().slice(0, 10));

  return (
    <div className="min-h-screen md:flex">
      <EnregistrerSW />

      {/* Navigation : barre mobile en bas + sidebar bureau */}
      <Navigation retardCount={retardCount ?? 0} nomEntreprise={company.nom} />

      {/* Contenu principal */}
      <div className="flex min-w-0 flex-1 flex-col md:ml-60">
        {/* En-tête mobile */}
        <header className="sticky top-0 z-30 border-b border-divider bg-surface/90 backdrop-blur md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="font-display text-lg font-extrabold leading-none text-primary">PILOT</div>
              <div className="text-xs text-muted">{company.nom}</div>
            </div>
            <span className="text-sm text-muted">{utilisateur.nom}</span>
          </div>

          {company.statut === "essai" && company.date_fin_essai ? (
            <div className="bg-primary-tint px-4 py-1.5 text-center text-xs text-primary-dark">
              Essai gratuit jusqu'au {formatDate(company.date_fin_essai)}
            </div>
          ) : null}

          {lectureSeule ? (
            <div className="bg-late-tint px-4 py-1.5 text-center text-xs text-late-text">
              Mode lecture seule — {abonnementEchu ? "abonnement échu" : "votre essai est terminé"}.{" "}
              <Link href="/app/reglages/abonnement" className="font-semibold underline">
                {abonnementEchu ? "Renouveler mon abonnement" : "Activer mon abonnement"}
              </Link>
            </div>
          ) : null}
        </header>

        {/* En-tête bureau */}
        <header className="hidden md:flex sticky top-0 z-30 items-center justify-between border-b border-divider bg-surface/90 px-6 py-4 backdrop-blur">
          <div className="text-xl font-bold text-ink">{utilisateur.nom}</div>
          <div className="flex items-center gap-4">
            {company.statut === "essai" && company.date_fin_essai ? (
              <span className="rounded-full bg-primary-tint px-3 py-1 text-xs font-semibold text-primary-dark">
                Essai jusqu'au {formatDate(company.date_fin_essai)}
              </span>
            ) : null}
            {lectureSeule ? (
              <Link
                href="/app/reglages/abonnement"
                className="rounded-full bg-late-tint px-3 py-1 text-xs font-semibold text-late-text"
              >
                {abonnementEchu ? "Renouveler mon abonnement" : "Activer mon abonnement"}
              </Link>
            ) : null}
          </div>
        </header>

        <main className="px-4 py-4 pb-24 md:px-6 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
