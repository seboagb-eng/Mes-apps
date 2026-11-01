import Link from "next/link";
import { getContexte } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatFCFA, formatDateCourte } from "@/lib/format";
import { PLANS, DUREE_ESSAI_JOURS, LIBELLE_TYPE_COMPTE } from "@/lib/constantes";
import { deconnexion } from "@/app/(auth)/actions";
import InfosEntreprise from "@/modules/reglages/InfosEntreprise";
import ChangerMotDePasse from "@/modules/reglages/ChangerMotDePasse";
import Equipe from "@/modules/reglages/Equipe";
import RelancesAuto from "@/modules/reglages/RelancesAuto";
import type { Compte, Utilisateur } from "@/lib/types";

export const dynamic = "force-dynamic";

function initialesEntreprise(nom: string): string {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default async function ComptePage() {
  const { company, utilisateur, abonnement } = await getContexte();
  const supabase = createClient();

  const [{ data: membres }, { data: comptesData }] = await Promise.all([
    supabase.from("users").select("*").order("created_at"),
    supabase.from("accounts").select("id, type, nom, solde_courant").order("created_at"),
  ]);

  const equipe = (membres ?? []) as Utilisateur[];
  const comptes = (comptesData ?? []) as Pick<Compte, "id" | "type" | "nom" | "solde_courant">[];

  const essaiJoursRestants = company.date_fin_essai
    ? Math.max(0, Math.ceil((new Date(company.date_fin_essai).getTime() - Date.now()) / 86400000))
    : 0;
  const essaiProgres =
    company.statut !== "actif" && company.date_fin_essai
      ? Math.round(((DUREE_ESSAI_JOURS - essaiJoursRestants) / DUREE_ESSAI_JOURS) * 100)
      : 0;

  const comptesClients = comptes.filter((c) => c.type === "banque" || c.type === "mobile_money");

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-[26px] font-extrabold text-ink">Compte</h1>

      {/* Carte entreprise */}
      <section className="flex items-center gap-4 rounded-2xl bg-surface p-4">
        <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px] bg-primary font-display text-lg font-extrabold text-white">
          {initialesEntreprise(company.nom)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[17px] font-extrabold text-ink">{company.nom}</div>
          {company.secteur ? (
            <div className="text-[13px] text-muted">{company.secteur}</div>
          ) : null}
          {utilisateur.telephone ? (
            <div className="text-[13px] text-muted">{utilisateur.telephone}</div>
          ) : null}
        </div>
      </section>

      {/* Modifier l'entreprise */}
      <section className="rounded-2xl bg-surface p-4">
        <div className="mb-3 text-[13px] font-extrabold text-muted">Modifier l'entreprise</div>
        <InfosEntreprise company={company} />
      </section>

      {/* Abonnement */}
      <section className="flex flex-col gap-3 rounded-2xl bg-ink px-5 py-4 text-white">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-white/60">
            {company.statut === "actif" ? "Abonnement" : "Période d'essai"}
          </div>
          {company.statut !== "actif" ? (
            <>
              <div className="mt-1 text-[17px] font-extrabold">
                {essaiJoursRestants > 0
                  ? `${essaiJoursRestants} jour${essaiJoursRestants > 1 ? "s" : ""} restants`
                  : "Essai terminé"}
              </div>
              <div
                className="mt-3 h-1.5 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: "#2C303A" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${essaiProgres}%`, backgroundColor: "#B9B7F2" }}
                />
              </div>
            </>
          ) : (
            <div className="mt-1 text-[17px] font-extrabold">
              {PLANS[company.plan]?.nom ?? company.plan}
              {abonnement?.prochaine_echeance
                ? ` · ${formatDateCourte(abonnement.prochaine_echeance)}`
                : ""}
            </div>
          )}
        </div>
        <Link
          href="/app/reglages/abonnement"
          className="flex min-h-[44px] items-center justify-center rounded-[10px] bg-surface text-[15px] font-extrabold text-ink"
        >
          {company.statut === "actif"
            ? `${formatFCFA(PLANS[company.plan]?.prix ?? 0)}/mois — Gérer`
            : "Activer mon abonnement"}
        </Link>
      </section>

      {/* Comptes de paiement */}
      <section className="flex flex-col gap-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted">
          Où vos clients vous paient
        </div>
        <div className="overflow-hidden rounded-2xl bg-surface">
          {comptesClients.length === 0 ? (
            <div className="px-4 py-3.5 text-[14px] text-muted">
              Aucun compte.{" "}
              <Link href="/app/demarrage" className="font-bold text-primary">
                Ajouter
              </Link>
            </div>
          ) : (
            comptesClients.map((c, idx) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 px-4 py-3.5"
                style={{ borderTop: idx > 0 ? "1px solid #ECEDE9" : undefined }}
              >
                <div>
                  <div className="text-[15px] font-bold text-ink">{c.nom}</div>
                  <div className="text-[13px] text-muted">
                    {LIBELLE_TYPE_COMPTE[c.type] ?? c.type}
                  </div>
                </div>
                <span className="rounded-full bg-success-tint px-2.5 py-1 text-[12px] font-extrabold text-success">
                  Actif
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Relances automatiques */}
      <section className="flex flex-col gap-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted">
          Relances automatiques
        </div>
        <RelancesAuto />
      </section>

      {/* Équipe et comptabilité */}
      <section className="flex flex-col gap-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted">
          Équipe et comptabilité
        </div>
        <div className="overflow-hidden rounded-2xl bg-surface">
          {utilisateur.role === "admin" ? (
            <div className="border-b border-divider px-4 py-3">
              <Equipe membres={equipe} moiId={utilisateur.id} />
            </div>
          ) : null}
          <Link
            href="/app/ventes"
            className="flex items-center justify-between px-4 py-3.5 text-[15px] font-bold text-ink"
          >
            Exporter les données
            <span className="text-muted">→</span>
          </Link>
          <div style={{ borderTop: "1px solid #ECEDE9" }} className="px-4 py-3">
            <ChangerMotDePasse />
          </div>
        </div>
      </section>

      {/* Déconnexion */}
      <form action={deconnexion} className="pb-4">
        <button
          type="submit"
          className="w-full py-3 text-center text-[15px] font-extrabold text-late-text"
        >
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
