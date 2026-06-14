-- ═══════════════════════════════════════════════════════════════════════
-- PILOT — Test d'isolation multi-tenant (RLS)
-- Vérifie qu'une entreprise ne peut JAMAIS voir/modifier les données d'une autre.
--
-- À exécuter dans l'éditeur SQL Supabase APRÈS les migrations 0001→0004.
-- Le script est transactionnel : il ROLLBACK à la fin (ne laisse aucune trace).
-- Si une assertion échoue, une exception est levée -> le test échoue clairement.
-- ═══════════════════════════════════════════════════════════════════════

begin;

-- Deux identités auth fictives.
insert into auth.users (id, email, instance_id, aud, role)
values
  ('11111111-1111-1111-1111-111111111111', 'alpha@test.bj', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'beta@test.bj',  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated');

-- Deux entreprises + leurs profils admin.
insert into companies (id, nom) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Entreprise ALPHA'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Entreprise BETA');

insert into users (id, company_id, nom, role) values
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Admin Alpha', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Admin Beta', 'admin');

-- Chaque entreprise a un client et un compte.
insert into customers (company_id, nom) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Client de ALPHA'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Client de BETA');

insert into accounts (company_id, type, nom, solde_courant) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'caisse', 'Caisse ALPHA', 100000),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'caisse', 'Caisse BETA', 200000);

-- ── On se fait passer pour l'admin de ALPHA ────────────────────────────
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111"}', true);

do $$
declare
  n_clients int;
  n_comptes int;
  nom_vu text;
begin
  -- ALPHA ne doit voir QUE son client.
  select count(*) into n_clients from customers;
  if n_clients <> 1 then
    raise exception 'ÉCHEC isolation: ALPHA voit % clients (attendu 1)', n_clients;
  end if;

  select nom into nom_vu from customers;
  if nom_vu <> 'Client de ALPHA' then
    raise exception 'ÉCHEC isolation: ALPHA voit le mauvais client (%)', nom_vu;
  end if;

  -- ALPHA ne doit voir QUE son compte.
  select count(*) into n_comptes from accounts;
  if n_comptes <> 1 then
    raise exception 'ÉCHEC isolation: ALPHA voit % comptes (attendu 1)', n_comptes;
  end if;

  -- ALPHA ne peut PAS écrire dans l'entreprise BETA (le with check doit bloquer).
  begin
    insert into customers (company_id, nom)
    values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Intrus');
    raise exception 'ÉCHEC isolation: ALPHA a pu insérer un client chez BETA !';
  exception
    when insufficient_privilege or check_violation then
      null; -- comportement attendu : insertion refusée
  end;

  raise notice 'OK — isolation multi-tenant vérifiée pour ALPHA.';
end $$;

-- ── Symétrie : l'admin de BETA ne voit que BETA ───────────────────────
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222"}', true);

do $$
declare
  nom_vu text;
begin
  select nom into nom_vu from customers;
  if nom_vu <> 'Client de BETA' then
    raise exception 'ÉCHEC isolation: BETA voit le mauvais client (%)', nom_vu;
  end if;
  raise notice 'OK — isolation multi-tenant vérifiée pour BETA.';
end $$;

reset role;
rollback;
