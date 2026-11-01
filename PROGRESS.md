# PILOT — Suivi d'avancement

> Relire ce fichier au début de chaque session. Une fonctionnalité à la fois.

## ✅ Fait

### Étape 1 — Fondations
- Projet **Next.js 14 (App Router) + TypeScript strict + Tailwind** initialisé.
- Structure par module : `src/modules/{dashboard,tresorerie,ventes,recouvrement,reglages}`.
- Utilitaires FCFA (entiers, format « 1 250 000 FCFA ») et dates GMT+1 (`src/lib/format.ts`).
- Clients Supabase : navigateur, serveur, middleware de session, client admin (service_role).
- **Schéma SQL complet** + **RLS multi-tenant** + fonctions métier (`supabase/migrations/0001→0004`).
- **Test d'isolation RLS** (`supabase/tests/isolation_rls.sql`) + tests unitaires (FCFA, relances).
- PWA : manifest, service worker (network-first), icônes.

### Étape 2 — Auth & onboarding
- Inscription (entreprise + dirigeant) via RPC `creer_entreprise`, connexion, déconnexion.
- Protection des routes `/app` par middleware. Assistant de démarrage `/app/demarrage` (comptes, clients, produits).
- Essai 14 jours + bandeau ; mode **lecture seule** (blocage doux) géré dans `getContexte()`.

### Étape 3 — Trésorerie
- Comptes (caisse/banque/momo), vue consolidée, entrée/sortie, **transfert** (RPC atomique).
- Solde maintenu par **trigger** ; courbe d'évolution 30/90 jours.

### Étape 4 — Clients & ventes
- Fiche client, saisie de vente rapide (montant libre), payé/partiel/crédit, liste filtrable.
- Chaque paiement crédite automatiquement le compte choisi (RPC `enregistrer_paiement`).

### Étape 5 — Recouvrement
- Tableau des créances par ancienneté (0-30 / 31-60 / +60), total dû.
- Bouton **Relancer** : 3 tons, WhatsApp/SMS pré-rempli, lien de paiement optionnel, historique.

### Étape 6 — Dashboard
- 6 indicateurs, 2 graphiques (CA 12 semaines, dépenses du mois), 3 alertes.

### Étape 7 — FedaPay (socle)
- Génération de lien de paiement (`src/lib/fedapay.ts`, sandbox/live), webhook signé
  (`/api/fedapay/webhook`), RPC admin idempotente `enregistrer_paiement_admin`,
  page de paiement de secours `/payer/[saleId]`.

### Étape 8 — PWA hors-ligne ✅
- Service Worker v2 : cache-first assets statiques, network-first pages app,
  jamais de cache des données Supabase. Page `/offline` de repli.
- `useFormPersist` : sauvegarde locale (localStorage) des saisies en cours,
  restaurée à l'ouverture, effacée après succès. Branché sur Nouvelle vente +
  3 onglets trésorerie. Bundles First Load JS ~88–194 kB.

### Étape 9 — Abonnements ✅
- Paiement de l'abonnement via FedaPay (lien Mobile Money) + mode démo
  (activation immédiate sans clés). Webhook route ventes vs abonnements.
- RPC `activer_abonnement_admin` (migration 0009, service_role uniquement).
- Blocage doux à l'échéance : `getContexte` passe en lecture seule quand
  `prochaine_echeance` est dépassée ; bannières + page abonnement adaptées.
- Changement de mot de passe (Réglages → Mon compte).

### Reçu de paiement ✅
- Après un encaissement (recouvrement), bouton « Envoyer le reçu (WhatsApp) » :
  reçu texte (entreprise, client, montant, mode, date, reste/soldé).
- Lib pure `recu.ts` + 2 tests. Pas de PDF (léger, WhatsApp-first).

### Export CSV comptable ✅
- Export des ventes (`ventes-AAAA-MM-JJ.csv`) et de la trésorerie
  (`tresorerie-AAAA-MM-JJ.csv`) depuis leurs pages respectives.
- Lib pure `exportCsv.ts` (séparateur « ; », CRLF, échappement) + 4 tests.
  Téléchargement client avec BOM UTF-8 (accents Excel). Symétrique de l'import.

### Invitation d'équipe ✅
- Réglages → Équipe (admin uniquement) : liste des membres, invitation (création
  compte auth + profil rattaché à l'entreprise, mot de passe temporaire affiché
  une fois), retrait d'un membre (suppression auth → profil en cascade).
- Rôles : gestionnaire / lecture / admin. Garde-fous : admin only, rattachement
  forcé au `company_id` de l'admin, rollback du compte auth si le profil échoue,
  impossible de se retirer soi-même.

### Étape 10 — Revue de sécurité + perfs ✅
- Audit Supabase (security + performance) passé en revue.
- Webhook FedaPay **fail-closed** : signature HMAC obligatoire (refus 503 si
  `FEDAPAY_WEBHOOK_SECRET` absent) — empêche un webhook forgé d'activer un
  abonnement gratuit / solder une facture.
- Migration 0010 : index FK (`payments.account_id`, `transactions.sale_id`),
  initplan RLS sur `users_delete` (`(select auth.uid())`).
- Isolation multi-tenant re-vérifiée en base (1 company visible, 0 fuite).
- Confirmé : aucun secret en dur, `.env.local` gitignoré, `.env.example` = placeholders.
- **Décisions documentées (advisors non bloquants)** :
  - WARN `auth_company_id`/`auth_role` exécutables : requis par la RLS (révoquer
    casse tout), fonctions sans argument self-only → aucune fuite. Accepté.
  - WARN `multiple_permissive_policies` / index inutilisés : optimisations « à
    l'échelle », différées (base MVP, risque > gain sur prod avec données).
- **À faire côté dashboard Supabase** (hors code) : activer « Leaked password
  protection » (Auth → Passwords).

### Refonte design — Phase 6 (saisie rapide Vente + Dépense) ✅
- **`/app/ventes/nouvelle`** : page dédiée saisie rapide — grand montant, boutons +5k/+10k/+25k/+50k,
  chips mode (Espèces/MoMo/Moov/À crédit), champ client conditionnel, pavé 3×4, bouton
  valider adaptatif (primary/late-text/disabled). Confirmation après save.
- **`/app/tresorerie/depense`** : même principe — catégorie chips (8 options), segmenté source
  compte, pavé, bouton bg-ink. Confirmation après save.
- Composants : `SaisieVenteRapide.tsx` + `SaisieDepenseRapide.tsx` (modules respectifs).
- Fix `queries.ts` : colonne `type` (non `type_compte`) sur accounts.
- 30/30 tests, build vert (2 nouvelles routes).

### Refonte design — Phase 5 (dashboard accueil) ✅
- Dashboard `/app` entièrement redesigné : header date + nom entreprise + badge "En direct",
  CarteVerdict (bonne/surveiller/tendue + phrase calculée), section "Où est mon argent ?"
  (total + BarreRepartition + légende), 2 boutons rapides Vente/Dépense, stats mois
  (Ventes/Dépenses/Marge), section "À relancer aujourd'hui" (top 5 créances en retard).
- `queries.ts` : ajout `cashParType`, `margeMois`, `topRelances`, `verdict`. Logique verdict
  : tendue si <10j de dépenses, surveiller si >2j sans vente, bonne sinon.
- 30/30 tests, build vert.

### Refonte design — Phase 4 (auth) ✅
- **Inscription** restylée : fond `ground`, header (retour + chip 14 jours), titre Bricolage
  Grotesque, fieldsets « Votre entreprise » / « Vous », chips `ChoixChips` pour secteur,
  champ téléphone avec préfixe +229, email facultatif, CTA fixe en bas.
- **Connexion** restylée : même langage, heading « Bon retour. », back + logo PILOT.
- 30/30 tests, build vert.

### Refonte design — Phase 3 (landing page) ✅
- Page `/` entièrement réécrite : header PILOT + hero avec maquette téléphone HTML/CSS, section
  fonctionnement (bg-ink, bulles WhatsApp #D9FDD3), "3 questions" / "3 gestes" / bandeau FCFA,
  tarif lu depuis `PLANS.business` (15 000 FCFA), appel final bg-ink + footer.
- Responsive `flex-wrap` + `repeat(auto-fit, minmax(..., 1fr))`. Placeholders `[À FOURNIR]` pour
  contact WhatsApp et mentions légales (à compléter manuellement).
- 30/30 tests, build vert.

### Refonte design — Phase 2 (composants) ✅
- **`Icone.tsx`** : jeu d'icônes SVG inline (stroke 2.2, aria-hidden) — 13 icônes : accueil, activite, relances, compte, retour, fermer, plus, moins, whatsapp, photo, recherche, check, deconnexion.
- **`Navigation.tsx`** refait : 4 onglets (Accueil /app, Activité /app/activite, Relances /app/recouvrement, Compte /app/reglages). Pastille `late.strong` sur Relances = `retardCount`. Bureau (md:) : sidebar fixe 240px fond `ink`, liens actifs `primary`, `Se déconnecter` en bas.
- **`AppLayout`** mis à jour : query `retardCount` (créances échues), structure `md:flex` + `md:ml-60`, en-tête mobile/bureau séparés, bannières `late.tint` au lieu de `amber-50`.
- **`ChoixChips.tsx`** : radiogroup accessible (role="radiogroup"/radio/aria-checked), chips `.chip`/`.chip-on`.
- **`Segmente.tsx`** : contrôle segmenté accessible (même pattern), classe `.segmented`.
- **`Interrupteur.tsx`** : role="switch", 52×32px, on=#2D2A9E, off=#C9CBC4.
- **`PaveNumerique.tsx`** : pavé numérique 1–9/000/0/⌫, `<output aria-live="polite">`, `<input type="hidden">` pour formulaire, max 9 chiffres.
- **`CarteVerdict.tsx`** : 3 états (bonne/surveiller/tendue) avec fonds/badges des nouvelles couleurs.
- **`BarreRepartition.tsx`** : barre 14px avec segments séparés, légende chiffrée obligatoire (couleur non seule), role="img" + aria-label.
- **`LigneOperation.tsx`** : avatar 40px, titre+sous-titre, montant droite, min-h 60px, 3 types.
- **`StatCard`** : montant en `font-display`, variante `alerte` (late.tint).
- Emoji `⚠️` retiré des alertes du dashboard.
- 30/30 tests, build vert.

### Refonte design — Phase 1 (tokens + polices) ✅
- Branche `refonte-design` dédiée (jamais fusionnée directement sur `main`).
- Docs de refonte déposées : `docs/REFONTE_DESIGN.md` + maquettes HTML dans `docs/design/maquettes/`.
- **Tailwind** : nouvelle palette complète (ink, ground, surface, line, divider, muted, primary/dark/mid/light/tint, success, late, watch, disabled, danger). Alias `warning → late.text` pour compatibilité ascendante jusqu'à Phase 2.
- **Polices** : Bricolage Grotesque (500/700/800, variable `--font-display`) + Manrope (400–800, variable `--font-sans`) via `next/font/google` (auto-hébergées, `display: swap`).
- **globals.css** réécrits : `.btn-primary`, `.btn-primary-lg`, `.btn-secondary`, `.btn-dark`, `.btn-whatsapp`, `.btn-credit`, `.btn-danger`, `.card` (sans ombre ni bordure), `.input` (52px, 16px min), `.label`, `.badge`, `.chip` / `.chip-on`, `.segmented`.
- `theme_color` → `#2D2A9E` dans `layout.tsx` (viewport), `public/manifest.webmanifest`, icône SVG.
- Tous les `#0B5FFF` remplacés dans `Graphiques.tsx` et `global-error.tsx`.
- Build vert (30/30 tests, `npm run build` sans erreur).

## 🔧 À faire ensuite (ordre conseillé)
1. **Créer le projet Supabase** et exécuter les migrations (voir `docs/SUPABASE.md`).
2. Brancher les clés dans `.env.local`, tester l'inscription → onboarding → dashboard.
3. Tester FedaPay en sandbox (compte requis) puis activer en production.
4. Étape 10 : revue de sécurité complète + déploiement Vercel + domaine.

## 🕓 Plus tard (hors MVP — ne pas élargir le périmètre)
- Import CSV avancé, multi-sites, espace comptable.
- Assistant IA (API Anthropic). App Flutter native.
- Envoi WhatsApp automatique programmé (API WhatsApp Business).
- Envoi d'email d'invitation automatique (actuellement : identifiants partagés à la main).
- Branchement source automatique des ventes (MECeF / DGI).

## ⚠️ Notes techniques
- **Confirmation d'email à désactiver** dans Supabase Auth pour le MVP (sinon l'onboarding
  ne peut pas créer l'entreprise dans la foulée de l'inscription).
- Montants **toujours en entiers FCFA**. Dates en UTC, affichées GMT+1 (`Africa/Porto-Novo`).
- Clés API **jamais** dans le code → `.env.local` (non versionné).
