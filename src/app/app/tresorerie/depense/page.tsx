import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SaisieDepenseRapide from "@/modules/tresorerie/SaisieDepenseRapide";
import type { CompteSource } from "@/modules/tresorerie/SaisieDepenseRapide";
import { Icone } from "@/components/Icone";
import type { Compte } from "@/lib/types";

export const dynamic = "force-dynamic";

const LIBELLE_SOURCE: Record<string, string> = {
  caisse: "Caisse",
  mobile_money: "MoMo",
  banque: "Banque",
};

export default async function NouvelleDepensePage() {
  const supabase = createClient();
  const { data } = await supabase.from("accounts").select("id, type, nom").order("created_at");
  const comptes = (data ?? []) as Pick<Compte, "id" | "type" | "nom">[];

  const sources: CompteSource[] = comptes.map((c) => ({
    id: c.id,
    label: LIBELLE_SOURCE[c.type] ?? c.nom,
  }));

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
        <h1 className="font-display text-xl font-extrabold">Nouvelle dépense</h1>
        <span className="w-11" aria-hidden="true" />
      </div>

      <SaisieDepenseRapide sources={sources} />
    </div>
  );
}
