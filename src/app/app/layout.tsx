import Link from "next/link";
import { getContexte } from "@/lib/auth";
import { deconnexion } from "@/app/(auth)/actions";
import Navigation from "@/components/Navigation";
import EnregistrerSW from "@/components/EnregistrerSW";
import { formatDate } from "@/lib/format";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { utilisateur, company, lectureSeule } = await getContexte();

  return (
    <div className="mx-auto min-h-screen max-w-3xl pb-20 md:pb-6">
      <EnregistrerSW />

      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <div className="text-lg font-extrabold leading-none text-primary">PILOT</div>
            <div className="text-xs text-gray-500">{company.nom}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-600 sm:inline">{utilisateur.nom}</span>
            <form action={deconnexion}>
              <button type="submit" className="text-sm text-gray-500 hover:text-danger">
                Quitter
              </button>
            </form>
          </div>
        </div>

        {company.statut === "essai" && company.date_fin_essai ? (
          <div className="bg-primary-light px-4 py-1.5 text-center text-xs text-primary-dark">
            Essai gratuit jusqu'au {formatDate(company.date_fin_essai)}
          </div>
        ) : null}

        {lectureSeule ? (
          <div className="bg-amber-50 px-4 py-1.5 text-center text-xs text-warning">
            Mode lecture seule — votre essai est terminé.{" "}
            <Link href="/app/reglages/abonnement" className="font-semibold underline">
              Activer mon abonnement
            </Link>
          </div>
        ) : null}
      </header>

      <main className="px-4 py-4">{children}</main>

      <Navigation />
    </div>
  );
}
