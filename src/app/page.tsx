import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/constantes";

/** Page d'accueil publique. Redirige vers l'app si déjà connecté. */
export default async function AccueilPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/app");

  const planBusiness = PLANS.business;

  return (
    <div className="min-h-screen bg-ground font-sans text-ink">

      {/* ── En-tête ──────────────────────────────────────────── */}
      <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-5">
        <a href="#top" className="flex items-center gap-2.5 no-underline">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 17l5-6 4 4 7-9"/><path d="M15 6h5v5"/>
            </svg>
          </span>
          <span className="font-display text-[22px] font-extrabold tracking-wide text-ink">PILOT</span>
        </a>
        <nav aria-label="Principale" className="flex flex-wrap items-center gap-1">
          <a href="#fonctionnement" className="rounded-xl px-3.5 py-3 text-[15px] font-semibold text-ink hover:text-primary">Comment ça marche</a>
          <a href="#tarif" className="rounded-xl px-3.5 py-3 text-[15px] font-semibold text-ink hover:text-primary">Tarif</a>
          <Link href="/connexion" className="rounded-xl border-[1.5px] border-ink px-4 py-2.5 text-[15px] font-bold text-ink hover:bg-ink hover:text-white transition">
            Se connecter
          </Link>
        </nav>
      </header>

      {/* ── Héros ────────────────────────────────────────────── */}
      <section id="top" className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-14 px-6 py-12 pb-20">
        {/* Texte */}
        <div className="flex min-w-0 flex-1 basis-[480px] flex-col gap-7">
          <p className="inline-flex self-start items-center gap-2 rounded-full bg-primary-tint px-3.5 py-2 text-sm font-bold text-primary">
            Pour les PME du Bénin · tout en FCFA
          </p>
          <h1 className="font-display text-[clamp(42px,6vw,76px)] font-extrabold leading-[0.98] tracking-[-0.03em]">
            Pilotez votre entreprise.<br />
            <span className="text-primary">Récupérez votre argent.</span>
          </h1>
          <p className="max-w-[540px] text-[19px] leading-relaxed text-muted">
            PILOT relance vos clients sur WhatsApp à votre place, avec un lien de paiement Mobile Money.
            Vous validez le matin, l'argent rentre. Et vous voyez enfin ventes, dépenses et trésorerie sur votre téléphone.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/inscription"
              className="inline-flex min-h-[56px] items-center gap-2.5 rounded-[14px] bg-primary px-6 text-[17px] font-bold text-white transition hover:bg-primary-dark"
            >
              Essayer 14 jours gratuits
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>
              </svg>
            </Link>
            <Link
              href="/connexion"
              className="inline-flex min-h-[56px] items-center rounded-[14px] border-[1.5px] border-line bg-surface px-5 text-[17px] font-bold text-ink transition hover:bg-ground"
            >
              J'ai déjà un compte
            </Link>
          </div>
          <p className="text-sm text-muted">Sans carte bancaire · Annulable à tout moment</p>
        </div>

        {/* Maquette téléphone — HTML/CSS, pas d'image */}
        <div className="flex min-w-0 flex-1 basis-[400px] justify-center">
          <div className="w-full max-w-[360px] rounded-[36px] bg-ink p-3.5" style={{ boxShadow: "0 30px 60px -20px rgba(16,19,26,0.35)" }}>
            <div className="flex flex-col gap-3.5 rounded-[26px] bg-ground p-5">
              <p className="text-[13px] font-semibold text-muted">Mardi · Ets Akpovi Distribution</p>

              {/* Carte trésorerie */}
              <div className="flex flex-col gap-1.5 rounded-[20px] bg-primary p-5 text-white">
                <span className="text-[13px] font-semibold opacity-85">Trésorerie disponible</span>
                <span className="font-display text-[34px] font-extrabold tracking-tight tabular-nums">
                  4 860 000 <span className="text-[16px] font-bold">FCFA</span>
                </span>
                <span className="text-[13px] font-semibold">Assez pour 41 jours de dépenses</span>
              </div>

              {/* 2 stats */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1 rounded-2xl bg-surface p-3.5">
                  <span className="text-xs font-semibold text-muted">À encaisser</span>
                  <span className="font-display text-[20px] font-bold tabular-nums">1 240 000</span>
                </div>
                <div className="flex flex-col gap-1 rounded-2xl bg-late-tint p-3.5">
                  <span className="text-xs font-bold text-late-text">En retard</span>
                  <span className="font-display text-[20px] font-bold tabular-nums text-late-text">385 000</span>
                </div>
              </div>

              {/* Relance */}
              <div className="flex flex-col gap-2.5 rounded-2xl bg-surface p-3.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 12a9 9 0 01-13.5 7.8L3 21l1.2-4.5A9 9 0 1121 12z"/>
                    </svg>
                  </span>
                  <span className="text-[13px] font-bold">Relance automatique · M. Hounkpè</span>
                </div>
                <div className="rounded-[12px_12px_12px_4px] bg-success-tint p-2.5 text-[13px] leading-[1.45] text-ink">
                  Bonjour M. Hounkpè, votre facture n° 214 de 185 000 FCFA est arrivée à échéance. Payez ici par Mobile Money : pilot.bj/p/214
                </div>
                <span className="text-xs font-bold text-success">Payé à 11 h 42 · MoMo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Relances automatiques (sombre) ───────────────────── */}
      <section id="fonctionnement" className="bg-ink text-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-6 py-20">
          <div className="flex max-w-[760px] flex-col gap-3.5">
            <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-primary-light">Relances automatiques</p>
            <h2 className="font-display text-[clamp(32px,4.4vw,56px)] font-extrabold leading-[1.02] tracking-[-0.02em]">
              Vos clients sont relancés. Sans que vous y pensiez.
            </h2>
            <p className="text-[18px] leading-relaxed text-white/70">
              Vous réglez le calendrier une fois. Chaque matin, PILOT vous montre les relances du jour : un geste pour valider, et les messages partent depuis votre WhatsApp.
            </p>
          </div>

          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))" }}>
            {[
              { jour: "Jour J", ton: "Courtois", badge: "bg-primary-light text-ink", msg: "Bonjour, petit rappel pour la facture n° 214 de 185 000 FCFA. Payez ici par Mobile Money : pilot.bj/p/214" },
              { jour: "J + 3", ton: "Ferme", badge: "bg-[#FFB48A] text-ink", msg: "La facture n° 214 reste impayée. Merci de la régler aujourd'hui via ce lien : pilot.bj/p/214" },
              { jour: "J + 10", ton: "Dernier rappel", badge: "bg-late-strong text-white", msg: "Dernier rappel avant suspension de vos commandes : facture n° 214, 185 000 FCFA." },
            ].map((c) => (
              <div key={c.jour} className="flex flex-col gap-4 rounded-3xl bg-white/5 p-6">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-3xl font-extrabold">{c.jour}</span>
                  <span className={`rounded-full px-2.5 py-1.5 text-[13px] font-extrabold ${c.badge}`}>{c.ton}</span>
                </div>
                {/* Bulle WhatsApp */}
                <div className="rounded-[14px_14px_4px_14px] p-3 text-[14px] leading-[1.45] text-ink" style={{ background: "#D9FDD3" }}>
                  {c.msg}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-5 border-t border-white/10 pt-7">
            <p className="max-w-[620px] text-[17px] leading-relaxed text-white/70">
              Dès que le client paie, les relances suivantes s'arrêtent. Vous gardez la main : chaque message reste modifiable.
            </p>
            <Link
              href="/inscription"
              className="inline-flex min-h-[56px] items-center rounded-[14px] bg-white px-6 text-[17px] font-extrabold text-ink transition hover:bg-ground"
            >
              Activer mes relances
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trois questions ───────────────────────────────────── */}
      <section className="border-y border-divider bg-surface">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-6 py-20">
          <h2 className="font-display max-w-[760px] text-[clamp(32px,4vw,48px)] font-extrabold leading-[1.05] tracking-[-0.02em]">
            Trois questions. Une réponse chaque matin.
          </h2>
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            <div className="flex flex-col gap-3.5 rounded-3xl bg-ground p-8">
              <span className="font-display text-[15px] font-extrabold text-primary">01</span>
              <h3 className="font-display text-[26px] font-bold leading-[1.15]">« Comment va ma boîte ? »</h3>
              <p className="text-[16px] leading-relaxed text-muted">Un verdict en une phrase : ventes, dépenses et marge du mois, comparées au mois dernier.</p>
            </div>
            <div className="flex flex-col gap-3.5 rounded-3xl bg-ground p-8">
              <span className="font-display text-[15px] font-extrabold text-primary">02</span>
              <h3 className="font-display text-[26px] font-bold leading-[1.15]">« Où est mon argent ? »</h3>
              <p className="text-[16px] leading-relaxed text-muted">En caisse, sur Mobile Money, en banque, et surtout chez vos clients. Chaque franc a une adresse.</p>
            </div>
            <div className="flex flex-col gap-3.5 rounded-3xl bg-ink p-8 text-white">
              <span className="font-display text-[15px] font-extrabold text-primary-light">03</span>
              <h3 className="font-display text-[26px] font-bold leading-[1.15]">« Comment je le récupère ? »</h3>
              <p className="text-[16px] leading-relaxed text-white/70">PILOT liste qui vous doit quoi, depuis quand, et prépare la relance WhatsApp à votre place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Relance ponctuelle en 3 gestes ───────────────────── */}
      <section id="relance-ponctuelle" className="mx-auto flex max-w-[1200px] flex-col gap-12 px-6 py-20">
        <div className="flex max-w-[720px] flex-col gap-3.5">
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-primary">À la demande</p>
          <h2 className="font-display text-[clamp(32px,4vw,48px)] font-extrabold leading-[1.05] tracking-[-0.02em]">
            Une relance ponctuelle ? Trois gestes.
          </h2>
        </div>
        <div className="grid gap-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {[
            {
              n: "1",
              titre: "Touchez la facture en retard",
              corps: "Les plus urgentes remontent en premier, avec le nombre de jours de retard.",
            },
            {
              n: "2",
              titre: "Choisissez le ton",
              corps: "Courtois, ferme ou dernier rappel. Le message est prêt, avec montant et lien de paiement.",
            },
            {
              n: "3",
              titre: "Le client paie par Mobile Money",
              corps: "Il ouvre le lien sur WhatsApp et règle depuis son téléphone. Vous suivez le statut dans PILOT.",
            },
          ].map((e) => (
            <div key={e.n} className="flex flex-col gap-3.5 border-t-[3px] border-ink pt-5">
              <span className="font-display text-[44px] font-extrabold leading-none text-primary">{e.n}</span>
              <h3 className="text-[20px] font-bold">{e.titre}</h3>
              <p className="text-[16px] leading-relaxed text-muted">{e.corps}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bandeau FCFA / 3G / Français ─────────────────────── */}
      <section className="bg-primary-tint">
        <div
          className="mx-auto max-w-[1200px] px-6 py-16"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "2rem" }}
        >
          {[
            { titre: "FCFA", corps: "Tous les montants, sans conversion ni décimales inutiles." },
            { titre: "3G",   corps: "Des pages légères qui s'ouvrent vite, même avec un réseau faible." },
            { titre: "Français", corps: "Des mots de commerçant, pas de jargon comptable." },
          ].map((b) => (
            <div key={b.titre} className="flex flex-col gap-2">
              <span className="font-display text-[36px] font-extrabold text-primary">{b.titre}</span>
              <p className="text-[16px] leading-relaxed text-ink/70">{b.corps}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tarif ─────────────────────────────────────────────── */}
      <section id="tarif" className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-10 px-6 py-20">
        <div className="flex min-w-0 flex-1 basis-[420px] flex-col gap-4">
          <h2 className="font-display text-[clamp(32px,4vw,48px)] font-extrabold leading-[1.05] tracking-[-0.02em]">
            Un prix simple.
          </h2>
          <p className="max-w-[460px] text-[18px] leading-relaxed text-muted">
            Essayez tout pendant 14 jours. Si PILOT ne vous fait pas récupérer plus que son prix, ne continuez pas.
          </p>
        </div>
        <div className="flex min-w-0 flex-1 basis-[360px] flex-col gap-5 rounded-3xl border-[1.5px] border-ink bg-surface p-9">
          <span className="text-[15px] font-bold text-muted">{planBusiness.nom}</span>
          <span className="font-display text-[48px] font-extrabold tracking-tight">
            {planBusiness.prix.toLocaleString("fr-FR")}{" "}
            <span className="text-[18px] font-bold text-muted">FCFA / mois</span>
          </span>
          <ul className="flex flex-col gap-2.5 text-[16px]">
            {[
              "Ventes, dépenses, trésorerie",
              "Relances WhatsApp automatiques",
              "Liens de paiement Mobile Money",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F7A4A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12l5 5 9-10"/>
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/inscription"
            className="flex min-h-[54px] items-center justify-center rounded-[14px] bg-primary text-[17px] font-bold text-white transition hover:bg-primary-dark"
          >
            Commencer gratuitement
          </Link>
        </div>
      </section>

      {/* ── Appel final + footer ──────────────────────────────── */}
      <section className="bg-ink text-white">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-7 px-6 py-20">
          <h2 className="font-display max-w-[640px] text-[clamp(30px,4vw,46px)] font-extrabold leading-[1.05] tracking-[-0.02em]">
            L'argent qu'on vous doit est déjà à vous. Allez le chercher.
          </h2>
          <Link
            href="/inscription"
            className="inline-flex min-h-[56px] items-center rounded-[14px] bg-white px-7 text-[17px] font-bold text-ink transition hover:bg-ground"
          >
            Créer mon compte
          </Link>
        </div>
        <footer className="mx-auto max-w-[1200px] border-t border-white/10 px-6 py-6">
          <div className="flex flex-wrap justify-between gap-3 text-sm text-white/50">
            <span>PILOT · Bénin</span>
            <span>[À FOURNIR : contact WhatsApp] · [À FOURNIR : mentions légales]</span>
          </div>
        </footer>
      </section>

    </div>
  );
}
