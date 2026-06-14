-- ═══════════════════════════════════════════════════════════════════════
-- PILOT — Schéma de base de données (multi-tenant)
-- Migration 0001 : tables, types, contraintes, index.
-- Les politiques RLS sont dans 0002_rls.sql (à exécuter APRÈS celle-ci).
--
-- Règles transverses :
--   • Tout est rattaché à un company_id (isolation par entreprise).
--   • Les montants sont des ENTIERS (FCFA, sans décimales) -> bigint.
--   • Les dates métier sont en date/timestamptz (UTC), affichées en GMT+1.
-- ═══════════════════════════════════════════════════════════════════════

-- Types énumérés ------------------------------------------------------------
create type plan_abonnement as enum ('starter', 'business', 'entreprise');
create type role_utilisateur as enum ('admin', 'gestionnaire', 'lecture');
create type statut_company as enum ('essai', 'actif', 'bloque');
create type type_compte as enum ('caisse', 'banque', 'mobile_money');
create type moyen_paiement as enum ('especes', 'momo', 'banque', 'virement');
create type statut_vente as enum ('payee', 'partielle', 'impayee');
create type type_mouvement as enum ('entree', 'sortie');
create type canal_relance as enum ('whatsapp', 'sms');
create type ton_relance as enum ('courtois', 'ferme', 'dernier_avis');
create type statut_relance as enum ('preparee', 'envoyee', 'payee');
create type statut_abonnement as enum ('actif', 'en_retard', 'annule');

-- companies -----------------------------------------------------------------
create table companies (
  id            uuid primary key default gen_random_uuid(),
  nom           text not null,
  secteur       text,
  plan          plan_abonnement not null default 'starter',
  statut        statut_company not null default 'essai',
  date_fin_essai date not null default (current_date + interval '14 days'),
  created_at    timestamptz not null default now()
);

-- users (profils) : 1 ligne par compte Supabase auth -----------------------
create table users (
  id          uuid primary key references auth.users(id) on delete cascade,
  company_id  uuid not null references companies(id) on delete cascade,
  nom         text not null,
  telephone   text,
  email       text,
  role        role_utilisateur not null default 'admin',
  created_at  timestamptz not null default now()
);
create index idx_users_company on users(company_id);

-- customers (clients de l'entreprise) --------------------------------------
create table customers (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id) on delete cascade,
  nom         text not null,
  telephone   text,
  email       text,
  notes       text,
  created_at  timestamptz not null default now()
);
create index idx_customers_company on customers(company_id);

-- products ------------------------------------------------------------------
create table products (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id) on delete cascade,
  nom         text not null,
  prix_vente  bigint not null default 0 check (prix_vente >= 0),
  prix_achat  bigint check (prix_achat >= 0),
  unite       text,
  created_at  timestamptz not null default now()
);
create index idx_products_company on products(company_id);

-- accounts (comptes de trésorerie) -----------------------------------------
create table accounts (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  type          type_compte not null,
  nom           text not null,
  solde_courant bigint not null default 0,
  created_at    timestamptz not null default now()
);
create index idx_accounts_company on accounts(company_id);

-- sales (ventes / factures) -------------------------------------------------
-- Les lignes de vente sont stockées en JSONB (souple pour le MVP, saisie rapide).
create table sales (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  customer_id   uuid references customers(id) on delete set null,
  date          date not null default current_date,
  lignes        jsonb not null default '[]'::jsonb,
  montant_total bigint not null default 0 check (montant_total >= 0),
  montant_paye  bigint not null default 0 check (montant_paye >= 0),
  statut        statut_vente not null default 'impayee',
  echeance      date,
  created_at    timestamptz not null default now()
);
create index idx_sales_company on sales(company_id);
create index idx_sales_customer on sales(customer_id);
create index idx_sales_statut on sales(company_id, statut);

-- payments (encaissements) --------------------------------------------------
create table payments (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id) on delete cascade,
  sale_id     uuid references sales(id) on delete set null,
  account_id  uuid not null references accounts(id) on delete restrict,
  montant     bigint not null check (montant > 0),
  date        date not null default current_date,
  moyen       moyen_paiement not null default 'especes',
  created_at  timestamptz not null default now()
);
create index idx_payments_company on payments(company_id);
create index idx_payments_sale on payments(sale_id);

-- transactions (mouvements de trésorerie + dépenses) -----------------------
create table transactions (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id) on delete cascade,
  account_id  uuid not null references accounts(id) on delete cascade,
  type        type_mouvement not null,
  categorie   text not null default 'autres',
  montant     bigint not null check (montant > 0),
  date        date not null default current_date,
  description text,
  sale_id     uuid references sales(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index idx_transactions_company on transactions(company_id);
create index idx_transactions_account on transactions(account_id);
create index idx_transactions_date on transactions(company_id, date);

-- reminders (relances de recouvrement) -------------------------------------
create table reminders (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  sale_id       uuid not null references sales(id) on delete cascade,
  canal         canal_relance not null default 'whatsapp',
  ton           ton_relance not null default 'courtois',
  statut        statut_relance not null default 'preparee',
  date_envoi    timestamptz,
  lien_paiement text,
  created_at    timestamptz not null default now()
);
create index idx_reminders_company on reminders(company_id);
create index idx_reminders_sale on reminders(sale_id);

-- subscriptions -------------------------------------------------------------
create table subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  company_id         uuid not null references companies(id) on delete cascade,
  plan               plan_abonnement not null default 'starter',
  montant            bigint not null default 0,
  prochaine_echeance date,
  statut             statut_abonnement not null default 'actif',
  created_at         timestamptz not null default now()
);
create index idx_subscriptions_company on subscriptions(company_id);
