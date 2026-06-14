"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LIENS = [
  { href: "/app", label: "Accueil", icone: "🏠" },
  { href: "/app/ventes", label: "Ventes", icone: "🧾" },
  { href: "/app/tresorerie", label: "Trésorerie", icone: "💰" },
  { href: "/app/recouvrement", label: "Créances", icone: "📣" },
  { href: "/app/reglages", label: "Réglages", icone: "⚙️" },
];

export default function Navigation() {
  const path = usePathname();
  const estActif = (href: string) =>
    href === "/app" ? path === "/app" : path.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:static md:border-none md:bg-transparent">
      <ul className="mx-auto flex max-w-3xl items-stretch justify-between md:justify-start md:gap-2">
        {LIENS.map((l) => (
          <li key={l.href} className="flex-1 md:flex-none">
            <Link
              href={l.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-2 text-xs font-medium md:flex-row md:gap-2 md:rounded-xl md:px-3 md:py-2 md:text-sm ${
                estActif(l.href)
                  ? "text-primary md:bg-primary-light"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <span className="text-lg md:text-base" aria-hidden>
                {l.icone}
              </span>
              <span>{l.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
