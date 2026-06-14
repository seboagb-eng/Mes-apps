-- ═══════════════════════════════════════════════════════════════════════
-- PILOT — Row Level Security (RLS)
-- Migration 0002 : LE point de sécurité le plus critique du projet.
-- Une entreprise ne doit JAMAIS voir/modifier les données d'une autre.
--
-- Principe : chaque ligne porte un company_id. Une fonction renvoie le
-- company_id de l'utilisateur connecté. Toute politique compare les deux.
-- ═══════════════════════════════════════════════════════════════════════

-- Fonction d'aide : company_id de l'utilisateur authentifié -----------------
-- SECURITY DEFINER pour lire la table users sans déclencher sa propre RLS
-- (sinon récursion). STABLE car constante sur une même requête.
create or replace function auth_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.users where id = auth.uid();
$$;

-- Fonction d'aide : rôle de l'utilisateur authentifié -----------------------
create or replace function auth_role()
returns role_utilisateur
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

-- Activation du RLS sur toutes les tables -----------------------------------
alter table companies     enable row level security;
alter table users         enable row level security;
alter table customers     enable row level security;
alter table products      enable row level security;
alter table accounts      enable row level security;
alter table sales         enable row level security;
alter table payments      enable row level security;
alter table transactions  enable row level security;
alter table reminders     enable row level security;
alter table subscriptions enable row level security;

-- ── companies ──────────────────────────────────────────────────────────
-- On ne voit/modifie que SA propre entreprise.
create policy companies_select on companies for select
  using (id = auth_company_id());
create policy companies_update on companies for update
  using (id = auth_company_id() and auth_role() = 'admin');

-- ── users ──────────────────────────────────────────────────────────────
create policy users_select on users for select
  using (company_id = auth_company_id());
-- L'insertion du tout premier profil se fait via RPC SECURITY DEFINER
-- (creer_entreprise) ; ici on autorise l'admin à gérer son équipe.
create policy users_insert on users for insert
  with check (company_id = auth_company_id() and auth_role() = 'admin');
create policy users_update on users for update
  using (company_id = auth_company_id() and auth_role() = 'admin');
create policy users_delete on users for delete
  using (company_id = auth_company_id() and auth_role() = 'admin' and id <> auth.uid());

-- ── Politiques génériques par company_id ───────────────────────────────
-- Modèle appliqué identiquement à toutes les tables « données métier ».
-- SELECT pour tous les rôles de l'entreprise ; écriture interdite au rôle 'lecture'.

-- customers
create policy customers_select on customers for select using (company_id = auth_company_id());
create policy customers_write  on customers for all
  using (company_id = auth_company_id() and auth_role() <> 'lecture')
  with check (company_id = auth_company_id() and auth_role() <> 'lecture');

-- products
create policy products_select on products for select using (company_id = auth_company_id());
create policy products_write  on products for all
  using (company_id = auth_company_id() and auth_role() <> 'lecture')
  with check (company_id = auth_company_id() and auth_role() <> 'lecture');

-- accounts
create policy accounts_select on accounts for select using (company_id = auth_company_id());
create policy accounts_write  on accounts for all
  using (company_id = auth_company_id() and auth_role() <> 'lecture')
  with check (company_id = auth_company_id() and auth_role() <> 'lecture');

-- sales
create policy sales_select on sales for select using (company_id = auth_company_id());
create policy sales_write  on sales for all
  using (company_id = auth_company_id() and auth_role() <> 'lecture')
  with check (company_id = auth_company_id() and auth_role() <> 'lecture');

-- payments
create policy payments_select on payments for select using (company_id = auth_company_id());
create policy payments_write  on payments for all
  using (company_id = auth_company_id() and auth_role() <> 'lecture')
  with check (company_id = auth_company_id() and auth_role() <> 'lecture');

-- transactions
create policy transactions_select on transactions for select using (company_id = auth_company_id());
create policy transactions_write  on transactions for all
  using (company_id = auth_company_id() and auth_role() <> 'lecture')
  with check (company_id = auth_company_id() and auth_role() <> 'lecture');

-- reminders
create policy reminders_select on reminders for select using (company_id = auth_company_id());
create policy reminders_write  on reminders for all
  using (company_id = auth_company_id() and auth_role() <> 'lecture')
  with check (company_id = auth_company_id() and auth_role() <> 'lecture');

-- subscriptions (lecture pour tous, écriture admin uniquement)
create policy subscriptions_select on subscriptions for select using (company_id = auth_company_id());
create policy subscriptions_write  on subscriptions for all
  using (company_id = auth_company_id() and auth_role() = 'admin')
  with check (company_id = auth_company_id() and auth_role() = 'admin');
