# PILOT

**SaaS de pilotage d'entreprise et de recouvrement pour les PME du Bénin.**

PILOT répond à deux questions quotidiennes du dirigeant :
1. **« Comment va ma boîte ? »** — ventes, marges, dépenses, vue d'ensemble.
2. **« Où est mon argent ? »** — trésorerie consolidée (caisse, banque, Mobile Money) et créances à recouvrer.

Cœur commercial : le module **recouvrement** — relances WhatsApp/SMS avec lien de paiement Mobile Money.

## Stack
- **Next.js 14** (App Router) + **TypeScript strict** + **Tailwind CSS**
- **Supabase** : PostgreSQL, Auth, Row Level Security (multi-tenant)
- **Recharts** (graphiques) · **PWA** installable · **FedaPay** (paiement Mobile Money)
- Déploiement : **Vercel**

## Contexte produit
- Devise : **FCFA / XOF**, montants entiers, format « 1 250 000 FCFA ».
- Interface **français**, **mobile-first**, tolérante au réseau 3G instable.
- Dates en UTC, affichées en heure du Bénin (GMT+1).

## Démarrage rapide
```bash
npm install
cp .env.example .env.local   # puis remplir les clés Supabase
npm run dev
```
Configuration de la base : voir **[docs/SUPABASE.md](docs/SUPABASE.md)**.

## Scripts
| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run typecheck` | Vérification TypeScript |
| `npm test` | Tests unitaires (Vitest) |

## Structure
```
src/
  app/              Routes (App Router) : (auth), app/*, api/fedapay, payer
  components/       UI réutilisable (cartes, navigation, formulaires)
  lib/              format FCFA/dates, types, clients Supabase, FedaPay, relances
  modules/          Logique par domaine : dashboard, tresorerie, ventes, recouvrement, reglages
supabase/
  migrations/       Schéma, RLS, fonctions, FedaPay
  tests/            Test d'isolation multi-tenant (RLS)
```

## Sécurité
- **Isolation stricte par entreprise** via RLS Supabase (`company_id` sur chaque ligne).
- Validation systématique côté serveur ; clé `service_role` jamais exposée au client.
- Voir le test d'isolation : `supabase/tests/isolation_rls.sql`.

## Avancement
Voir **[PROGRESS.md](PROGRESS.md)** (mis à jour à chaque étape).
