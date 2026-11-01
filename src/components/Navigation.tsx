"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icone, type NomIcone } from "./Icone";
import { deconnexion } from "@/app/(auth)/actions";

const LIENS: { href: string; label: string; icone: NomIcone; exact?: boolean }[] = [
  { href: "/app",              label: "Accueil",  icone: "accueil",  exact: true },
  { href: "/app/activite",     label: "Activité", icone: "activite" },
  { href: "/app/recouvrement", label: "Relances", icone: "relances" },
  { href: "/app/reglages",     label: "Compte",   icone: "compte" },
];

export default function Navigation({
  retardCount = 0,
  nomEntreprise = "",
}: {
  retardCount?: number;
  nomEntreprise?: string;
}) {
  const path = usePathname();
  const actif = (href: string, exact?: boolean) =>
    exact ? path === href : path.startsWith(href);

  return (
    <>
      {/* ── Mobile : barre fixe en bas ──────────────────────── */}
      <nav
        className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-divider bg-surface pb-[env(safe-area-inset-bottom)]"
        aria-label="Navigation principale"
      >
        <ul className="flex items-stretch justify-between">
          {LIENS.map((l) => {
            const isActif = actif(l.href, l.exact);
            const badge = l.href === "/app/recouvrement" && retardCount > 0;
            return (
              <li key={l.href} className="flex-1">
                <Link
                  href={l.href}
                  aria-current={isActif ? "page" : undefined}
                  className={`relative flex flex-col items-center gap-0.5 px-2 py-2.5 text-xs font-semibold transition ${
                    isActif ? "text-primary" : "text-muted"
                  }`}
                >
                  <span className="relative">
                    <Icone nom={l.icone} taille={22} />
                    {badge ? (
                      <span className="absolute -top-1 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-late-strong px-0.5 text-[9px] font-bold text-white">
                        {retardCount > 9 ? "9+" : retardCount}
                      </span>
                    ) : null}
                  </span>
                  <span>{l.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Bureau : sidebar fixe gauche ────────────────────── */}
      <aside
        className="hidden md:flex fixed inset-y-0 left-0 z-40 w-60 flex-col bg-ink"
        aria-label="Navigation principale"
      >
        {/* Logo + entreprise */}
        <div className="border-b border-white/10 px-5 py-5">
          <div className="font-display text-xl font-extrabold text-white">PILOT</div>
          {nomEntreprise && (
            <div className="mt-0.5 truncate text-xs text-white/50">{nomEntreprise}</div>
          )}
        </div>

        {/* Liens */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {LIENS.map((l) => {
            const isActif = actif(l.href, l.exact);
            const badge = l.href === "/app/recouvrement" && retardCount > 0;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActif ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActif
                    ? "bg-primary text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icone nom={l.icone} taille={18} />
                <span className="flex-1">{l.label}</span>
                {badge ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-late-strong px-1 text-[10px] font-bold text-white">
                    {retardCount > 9 ? "9+" : retardCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Déconnexion */}
        <div className="border-t border-white/10 px-3 py-4">
          <form action={deconnexion}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-late-text transition hover:bg-white/10 hover:text-white"
            >
              <Icone nom="deconnexion" taille={18} />
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
