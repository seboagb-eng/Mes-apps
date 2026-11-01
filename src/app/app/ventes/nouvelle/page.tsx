import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SaisieVenteRapide from "@/modules/ventes/SaisieVenteRapide";
import type { ModeVente } from "@/modules/ventes/SaisieVenteRapide";
import { Icone } from "@/components/Icone";
import type { Compte } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NouvelleVentePage() {
  const supabase = createClient();
  const { data } = await supabase.from("accounts").select("id, type, nom").order("created_at");
  const comptes = (data ?? []) as Pick<Compte, "id" | "type" | "nom">[];

  const caisse = comptes.find((c) => c.type === "caisse") ?? null;
  const momo = comptes.find((c) => c.type === "mobile_money") ?? null;
  const banque = comptes.find((c) => c.type === "banque") ?? null;

  const modes: ModeVente[] = [
    { label: "Espèces", moyen: "especes", accountId: caisse?.id ?? null },
    { label: "MoMo", moyen: "momo", accountId: momo?.id ?? null },
    { label: "Moov", moyen: "momo", accountId: momo?.id ?? null },
    { label: "À crédit", moyen: "especes", accountId: null, credit: true },
  ];

  return (
    <div className="flex min-h-[calc(100vh-11rem)] flex-col gap-3">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <Link
          href="/app"
          aria-label="Fermer"
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-ink"
        >
          <Icone nom="fermer" taille={20} />
        </Link>
        <h1 className="font-display text-xl font-extrabold">Nouvelle vente</h1>
        <span className="w-11" aria-hidden="true" />
      </div>

      <SaisieVenteRapide modes={modes} />
    </div>
  );
}
