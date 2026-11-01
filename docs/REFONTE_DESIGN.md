# PILOT — Refonte design (brief pour Claude Code)

> À placer dans `docs/REFONTE_DESIGN.md`. Les maquettes HTML de référence sont dans
> `docs/design/maquettes/` (une par écran, styles inline = valeurs exactes à reprendre).
> Relire `PROGRESS.md` avant de commencer. **Une phase à la fois**, dans l'ordre.

## 0. Règles de travail

- Travailler sur une branche `refonte-design`, jamais directement sur `main` (Vercel déploie `main` en production).
- Une phase = un commit (ou une PR) ; à la fin de chaque phase : `npm run typecheck && npm test && npm run build` doivent passer.
- **Ne rien casser de l'existant** : RLS, RPC (`creer_entreprise`, `enregistrer_paiement`, transfert…), FedaPay, `useFormPersist`, service worker, mode lecture seule, export CSV. La refonte touche l'UI ; la logique métier ne change que là où ce document le dit.
- Montants toujours en entiers FCFA, `formatFCFA()` existant. Dates GMT+1 (`Africa/Porto-Novo`).
- Pas d'emoji dans l'interface (la `Navigation` actuelle en utilise : à remplacer par des icônes SVG inline).
- Ne pas élargir le périmètre au-delà de ce document. Mettre `PROGRESS.md` à jour à chaque phase.
- Les noms de clients et montants des maquettes sont des exemples, jamais à coder en dur.

## 1. Identité visuelle (Phase 1 — tokens)

Remplacer le bleu `#0B5FFF` par l'indigo, partout (Tailwind, `globals.css`, `viewport.themeColor`, `public/manifest.webmanifest`, icônes si elles portent la couleur).

### 1.1 Couleurs → `tailwind.config.ts`

```ts
colors: {
  ink: "#10131A",          // texte principal, bouton dépense, cartes sombres, menu bureau
  ground: "#F3F4F1",       // fond des écrans (remplace bg-gray-50)
  surface: "#FFFFFF",      // cartes, champs
  line: "#D5D7D1",         // bordures champs / boutons secondaires (1.5px)
  divider: "#ECEDE9",      // séparateurs de lignes
  muted: "#565B66",        // texte secondaire (6.17:1 sur ground)
  primary: {               // on garde le nom "primary" pour limiter le diff
    DEFAULT: "#2D2A9E",    // indigo : action principale, onglet actif
    dark: "#1E1B73",
    mid: "#4B47C9",
    light: "#A9A7EC",
    tint: "#E7E6F7",
  },
  success: { DEFAULT: "#0F7A4A", tint: "#E3F4E8" },          // encaissé, marge +, WhatsApp
  late: { DEFAULT: "#E0661F", strong: "#B84A0E", text: "#8F3708", tint: "#FFE8DA" },
  watch: { text: "#8A5A00", tint: "#FFF3D6" },               // verdict « à surveiller »
  disabled: "#6B7079",
}
```

Règles d'usage :
- Vert = argent encaissé, orange = argent en retard. Jamais décoratifs.
- `late.DEFAULT` (#E0661F) uniquement pour des barres/carrés sans texte (3.45:1 avec blanc) ; pastille chiffrée ou badge → `late.strong` ; texte → `late.text`.
- Garder `danger` (#DC2626) seulement pour les erreurs de formulaire et la suppression.
- Bouton désactivé : fond `disabled`, pas `opacity-50`.

### 1.2 Typographie → `src/app/layout.tsx` avec `next/font/google`

- **Bricolage Grotesque** (500, 700, 800) : titres et **tous les montants** → variable `--font-display`, classe `font-display`.
- **Manrope** (400–800) : tout le reste → `--font-sans`.
- `subsets: ["latin"]`, `display: "swap"`. Auto-hébergées par `next/font` (pas de requête Google en 3G).
- Montants : `tabular-nums`, séparateur de milliers espace, unité « FCFA » plus petite et en `muted`.

| Rôle | Police | Graisse | Mobile | Bureau |
|---|---|---|---|---|
| Titre landing | display | 800 | 42px | `clamp(42px,6vw,76px)` |
| Titre section landing | display | 800 | 32px | 48–56px |
| Montant héros (saisie, trésorerie) | display | 800 | 52–56px | 38px |
| Titre d'écran | display | 800 | 24–26px | 32px |
| Verdict du jour | display | 700 | 21px | 20px |
| Montant de carte | display | 700 | 19–20px | 28px |
| Texte courant | sans | 500–600 | 15–16px | 16–19px |
| Libellé | sans | 600–700 | 12–13px | 13–14px |
| Sur-titre | sans | 800, uppercase, tracking 0.08em | 12px | 14px |

### 1.3 Formes et tailles

- Tout élément cliquable ≥ 44px de haut ; action principale 56px ; champs 52px (police 16px min, sinon zoom iOS).
- Rayons : champ/bouton 12–14px, carte 16–22px (mobile) / 24px (landing), chip/badge `rounded-full`.
- Cartes : **sans bordure ni ombre** (supprimer `shadow-sm ring-1` de `.card`). Une seule ombre dans tout le produit : la maquette téléphone de la landing.
- Marges latérales mobile 18–20px ; contenu landing `max-w-[1200px]` + 24px.

### 1.4 Mettre à jour `globals.css`

Réécrire `.btn-primary`, `.btn-secondary`, `.card`, `.input`, `.label`, `.badge` avec les tokens ci-dessus. Ajouter :
- `.btn-dark` (ink, pour les dépenses), `.btn-whatsapp` (success), `.btn-credit` (late.text).
- `.chip` / `.chip-on` (blanc bordé `line` / ink plein, `rounded-full`, min-h 44px).
- `.segmented` (fond #E2E3DE, padding 4px, segment actif blanc).

**Critère de fin Phase 1** : toute l'app existante tourne avec la nouvelle palette et les polices, sans changement de structure. Captures avant/après dans la PR.

## 2. Composants (Phase 2 — `src/components/`)

| Composant | Fichier | Détail |
|---|---|---|
| `Icone` | `Icone.tsx` | Jeu d'icônes SVG inline stroke 2.2, `aria-hidden` : accueil, activite, relances, compte, retour, fermer, plus, moins, whatsapp, photo, recherche, check. |
| `Navigation` | refaire | 4 onglets : **Accueil** `/app`, **Activité** `/app/activite`, **Relances** `/app/recouvrement`, **Compte** `/app/reglages`. Actif = `primary` + `aria-current="page"`. Pastille `late.strong` sur Relances = nombre de ventes en retard. Bureau (`md:`) : menu latéral sombre (ink) 220–260px. |
| `ChoixChips` | nouveau | `role="radiogroup"` + boutons `role="radio" aria-checked`. Secteurs, catégories, modes. |
| `Segmente` | nouveau | Idem en contrôle segmenté (ton de relance, « Payé depuis »). |
| `Interrupteur` | nouveau | `role="switch"`, 52×32, on = primary, off = #C9CBC4. |
| `PaveNumerique` | nouveau | Touches 1–9, `000`, 0, effacer (`aria-label="Effacer"`). Contrôle un montant entier (max 9 chiffres). Remplace le clavier système pour les montants. Affichage du montant dans un `<output aria-live="polite">`. |
| `CarteVerdict` | nouveau | 3 états : `bonne` (fond ink, badge success « Ça va bien »), `surveiller` (watch.tint, badge watch.text), `tendue` (late.tint, badge late.text). Une phrase en display 700. |
| `BarreRepartition` | nouveau | Barre horizontale 14px, segments séparés de 3px, **toujours** suivie d'une légende chiffrée (la couleur seule ne porte pas l'info). Couleurs : banque primary.dark, mobile_money primary.mid, caisse primary.light, chez les clients late. `role="img"` + `aria-label` complet. |
| `LigneOperation` | nouveau | Avatar/icône 36–40px, titre + sous-titre, montant à droite ; min-h 60px. Vente « + » success, dépense « − » ink, crédit late.text. |
| `StatCard` | adapter | Montant en `font-display`, variante alerte (late.tint). |

Supprimer les emoji dans les alertes du dashboard (`⚠️`).

## 3. Écrans (Phase 3 à 7)

Pour chaque écran : la maquette de référence, la route existante, ce qui change.

### Phase 3 — Landing `src/app/page.tsx` (maquette `Main.dc.html`)

Ordre des blocs : en-tête (logo + « Comment ça marche », « Tarif », « Se connecter ») → héros → **relances automatiques** (section sombre) → trois questions → relance ponctuelle en 3 gestes → bandeau FCFA / 3G / Français → tarif → appel final → pied de page.

- Héros : sur-titre « Pour les PME du Bénin · tout en FCFA », H1 « Pilotez votre entreprise. / Récupérez votre argent. » (2e ligne en primary), texte d'accroche de la maquette, CTA « Essayer 14 jours gratuits » → `/inscription`, « J'ai déjà un compte » → `/connexion`. À droite : maquette téléphone **en HTML/CSS, pas une image**.
- Section relances automatiques : J (courtois), J+3 (ferme), J+10 (dernier rappel), chacune avec une bulle WhatsApp d'exemple ; CTA « Activer mes relances ».
- Tarif : lire `PLANS` dans `constantes.ts` (ne pas recopier les prix en dur). Afficher Business par défaut si c'est celui qui inclut les relances.
- Responsive sans breakpoint fixe : `flex-wrap` + `grid-cols-[repeat(auto-fit,minmax(260px,1fr))]`.
- Pied de page : contact et mentions légales = `[À FOURNIR]`.

### Phase 4 — Inscription `src/app/(auth)/inscription/page.tsx` (maquette `Inscription.dc.html`)

- Deux `fieldset` : « Votre entreprise » (nom, secteur en `ChoixChips`) / « Vous » (nom, téléphone WhatsApp avec préfixe fixe `+229`, mot de passe, email).
- Secteurs : Commerce / Boutique, Restauration, Services, Quincaillerie / BTP, Agroalimentaire, Santé / Pharmacie, Autre (valeur envoyée inchangée vers `creer_entreprise`).
- Bouton fixé en bas de l'écran.
- **Email : rester obligatoire pour l'instant.** La maquette le marque facultatif, mais Supabase Auth exige un email (ou l'auth par téléphone avec un fournisseur SMS). Laisser un `TODO` et ne pas changer l'auth.
- Même traitement visuel pour `/connexion`.

### Phase 5 — Accueil `src/app/app/page.tsx` + `modules/dashboard/queries.ts` (maquettes `Accueil.dc.html` mobile, `Bureau.dc.html` bureau)

Ordre mobile : date + nom entreprise + indicateur de synchro → `CarteVerdict` → « Où est mon argent ? » (total, `BarreRepartition`, légende) → boutons **+ Vente** / **− Dépense** → « Novembre, à ce jour » (ventes, dépenses, marge) → « À relancer aujourd'hui » (2–3 lignes + « Tout voir »).

Données à ajouter dans `chargerDashboard()` (fonctions pures dans `src/lib/pilotage.ts`, testées avec Vitest) :
- `repartition` : somme de `accounts.solde_courant` par `type` + total des créances (`montant_total - montant_paye` des ventes non payées).
- `joursTresorerie` = `floor(cashTotal / depenseJournaliereMoyenne30j)` ; `null` si aucune dépense sur 30 jours.
- `verdict` : `{ etat: "bonne" | "surveiller" | "tendue", phrase: string }`. Règle v1 :
  - `tendue` si `joursTresorerie !== null && joursTresorerie < 15` ;
  - sinon `surveiller` si les dépenses du mois à date progressent plus vite que les ventes du mois à date (vs même période du mois précédent) ;
  - sinon `bonne`. Phrase : « Vous avez vendu X % de plus/moins que le mois dernier, à la même date. »
  - Seuils en constantes dans `constantes.ts` (le gérant pourra les régler plus tard).
- `aRelancerAujourdhui` : ventes non payées dont l'échéance tombe aujourd'hui selon le calendrier de relance (Phase 7), ou toutes celles en retard si le calendrier est désactivé ; tri par retard décroissant.
- Garder les graphiques existants mais **en bureau seulement** (`hidden md:block`) : CA 12 semaines → remplacer par entrées/sorties 8 semaines si simple, sinon garder ; ajouter « Qui vous doit, depuis quand » (réutiliser les tranches existantes du recouvrement : 0-30 / 31-60 / +60 jours) et « Dernières opérations ».
- Indicateur de synchro : « À jour » (success) en ligne ; « Hors ligne » (late.text) quand `navigator.onLine === false`. Composant client minimal.

Bureau (`md:` et plus) : menu latéral sombre, en-tête avec titre « Comment va ma boîte ? » + boutons Vente / Dépense, verdict pleine largeur, 4 `StatCard` (trésorerie + jours, ventes du mois + évolution, marge + %, argent chez les clients en variante alerte), graphique + créances par ancienneté côte à côte, tableau des dernières opérations (`overflow-x-auto`).

### Phase 6 — Saisie rapide Vente et Dépense (maquettes `Vente.dc.html`, `Depense.dc.html`)

Écrans plein écran : nouvelles routes `/app/ventes/nouvelle` et `/app/tresorerie/depense`, ouvertes par les boutons de l'accueil. Garder `useFormPersist`.

**Vente** — réutiliser l'action `creerVente` existante, ne pas dupliquer la logique :
- Montant via `PaveNumerique` ; raccourcis +5 000 / +10 000 / +25 000 / +50 000 (s'additionnent).
- « Payé comment ? » en `ChoixChips` : un chip **par compte** de l'entreprise (`accounts`, libellé = nom du compte, ex. Caisse, MTN MoMo, Moov), + **« À crédit »**.
- « À crédit » : vente `impayee`, demande le client (recherche dans `customers` ou création rapide) et propose une échéance (défaut +7 jours). Le bouton passe en `btn-credit` : « Enregistrer la vente à crédit ».
- Bouton désactivé tant que le montant vaut 0.
- Écran de confirmation : montant, phrase (« Vente encaissée en Caisse. Votre trésorerie est à jour. » / « Vente à crédit enregistrée. Elle apparaîtra dans vos relances à l'échéance. »), **« Envoyer le reçu sur WhatsApp »** (réutiliser `src/lib/recu.ts`, si un client avec téléphone est lié), « Vente suivante », « Retour à l'accueil ».
- Le formulaire détaillé existant (lignes produits) reste accessible via un lien « Vente détaillée » depuis cet écran.

**Dépense** — réutiliser `ajouterMouvement` (type `sortie`) de `modules/tresorerie/actions.ts` :
- Montant via `PaveNumerique`, bouton `btn-dark` (jamais primary).
- « Pour quoi ? » en `ChoixChips`, libellés → valeurs `CATEGORIES_DEPENSE` : Stock→`achats`, Transport→`transport`, Salaires→`salaires`, Loyer→`loyer`, Électricité→`electricite`, Eau→`eau`, Crédit tél.→`communication`, Impôts→`impots`, Autre→`autres`.
- « Payé depuis » en `Segmente` : un segment par compte.
- Bouton photo du reçu : **affiché désactivé avec un `TODO`** (nécessite un bucket Supabase Storage + RLS : hors périmètre de cette refonte).
- Confirmation : « − X FCFA », « Transport, payé depuis la caisse. », carte « Transport ce mois-ci » = total de la catégorie sur le mois + écart vs mois précédent.

### Phase 7 — Relances, Activité, Compte

**Relances** `src/app/app/recouvrement/page.tsx` + `modules/recouvrement/*` (maquette `Recouvrement.dc.html`) — restyler, la logique existe :
- Carte sombre « Argent dehors » (total dû) + « dont X en retard ».
- Liste des créances en `radiogroup` (sélection = fond primary.tint + contour primary 2px). Sous-titre « N jours de retard » en late.text, ou « Échéance aujourd'hui / dans N jours » en muted.
- Ton en `Segmente` (`LIBELLE_TON` : Courtois / Ferme / Dernier avis).
- Aperçu du message dans une bulle WhatsApp (fond #D9FDD3, `white-space: pre-line`), généré par `messageRelance()`.
- Bouton fixe `btn-whatsapp` « Envoyer sur WhatsApp » → `lienWhatsApp()` ; garder SMS en lien secondaire ; garder l'historique `reminders`.

**Relances automatiques** (nouvelle fonction, la seule qui touche la base) :
- Migration `0011_relances_auto.sql` : table `relance_regles (company_id uuid pk references companies on delete cascade, j0 boolean default true, j3 boolean default true, j10 boolean default false, updated_at timestamptz)` + RLS identique aux autres tables (`company_id = auth_company_id()`), + test dans `supabase/tests/isolation_rls.sql`.
- Calendrier : J = jour de l'échéance → ton `courtois` ; J+3 → `ferme` ; J+10 → `dernier_avis`. Fonction pure `relancesDuJour(ventes, regles, historique, aujourdhui)` dans `src/lib/relances.ts` + tests : une vente déjà relancée pour une étape n'est pas reproposée ; une vente payée sort de la liste.
- **Pas d'envoi automatique serveur** : `wa.me` exige un geste par message, et l'API WhatsApp Business est explicitement hors MVP (`PROGRESS.md`). « Automatique » = PILOT prépare la file du jour ; le gérant ouvre chaque message d'un geste. Écran « Relances du jour » en tête de `/app/recouvrement` : liste, bouton par ligne, compteur « 3 sur 5 envoyées ». Marquer `reminders.statut = 'envoyee'` à l'ouverture du lien.

**Activité** — nouvelle route `src/app/app/activite/page.tsx` (maquette `Activite.dc.html`) :
- Fusion des `sales`, `payments` et `transactions` de l'entreprise, triés par date décroissante, groupés par jour (« Aujourd'hui », « Hier », « Lundi 2 novembre »).
- Filtres en chips : Tout / Ventes / Dépenses / Crédits ; recherche (client, montant, catégorie) ; en tête : entrées et sorties de la semaine.
- Pagination simple (50 lignes, « Voir plus ») pour rester léger en 3G.
- Les pages `/app/ventes`, `/app/tresorerie`, `/app/clients` restent en place, accessibles depuis l'accueil (carte « Où est mon argent ? » → trésorerie) et depuis le menu bureau.

**Compte** `src/app/app/reglages/page.tsx` (maquette `Compte.dc.html`) :
- Carte entreprise (initiales, nom, secteur, téléphone, « Modifier »).
- Carte sombre essai/abonnement : jours restants + barre de progression + « Activer — payer par Mobile Money » → `/app/reglages/abonnement` (existant).
- « Où vos clients vous paient » : comptes Mobile Money de l'entreprise.
- « Relances automatiques » : 3 `Interrupteur` branchés sur `relance_regles` + phrase « PILOT prépare les messages chaque matin ; vous les envoyez d'un geste. »
- « Équipe et comptabilité » : Équipe (existant), Modèles de messages, Export comptable (existant, CSV).
- « Se déconnecter » en late.text. Supprimer le bouton « Quitter » de l'en-tête de `app/layout.tsx`.

## 4. Performance, accessibilité

- Budget : < 150 Ko transférés pour `/` et `/app` (hors cache). Aucune image dans ces deux pages. Vérifier les bundles avec `next build` (actuellement ~88–194 kB First Load JS : ne pas dépasser).
- Accueil rendu côté serveur, chiffres déjà calculés, pas de spinner.
- Vrais éléments : `button`, `a`, `input` + `label`, `fieldset` + `legend`. `aria-label` sur les boutons à icône seule.
- Contrastes : tous les couples texte/fond ≥ 4.5:1 (déjà vérifiés pour les tokens ci-dessus).
- Couleur jamais seule : retard = orange + texte « X jours de retard ».

## 5. Définition de « terminé »

- [ ] Phase 1 : tokens + polices appliqués, `theme-color` et manifest en `#2D2A9E`.
- [ ] Phase 2 : composants créés, emoji retirés.
- [ ] Phase 3 : landing conforme à `Main.dc.html`, responsive de 360 à 1440 px.
- [ ] Phase 4 : inscription / connexion restylées, auth inchangée.
- [ ] Phase 5 : accueil mobile + bureau, `pilotage.ts` testé (verdict, jours de trésorerie, répartition).
- [ ] Phase 6 : saisie rapide vente + dépense, actions existantes réutilisées.
- [ ] Phase 7 : relances restylées + file du jour, migration 0011 + test RLS, Activité, Compte.
- [ ] `typecheck`, `test`, `build` verts ; `PROGRESS.md` à jour ; PR ouverte vers `main` avec captures mobile et bureau.

## Hors périmètre (ne pas faire)

Photo du reçu de dépense (Storage), inscription sans email, envoi WhatsApp côté serveur (API Business), multi-sites, assistant IA.
