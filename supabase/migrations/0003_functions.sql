-- ═══════════════════════════════════════════════════════════════════════
-- PILOT — Fonctions métier (RPC) et triggers
-- Migration 0003 : opérations atomiques qui touchent l'argent.
-- ═══════════════════════════════════════════════════════════════════════

-- ── Bootstrap onboarding : créer entreprise + profil admin ─────────────
-- Appelée juste après l'inscription Supabase. SECURITY DEFINER car
-- l'utilisateur n'a pas encore de company_id (le RLS bloquerait l'insert).
create or replace function creer_entreprise(
  p_nom_entreprise text,
  p_secteur text,
  p_nom_dirigeant text,
  p_telephone text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
begin
  -- Garde-fou : un utilisateur ne peut créer qu'une seule entreprise.
  if exists (select 1 from users where id = auth.uid()) then
    raise exception 'Cet utilisateur possède déjà une entreprise.';
  end if;

  insert into companies (nom, secteur)
  values (p_nom_entreprise, p_secteur)
  returning id into v_company_id;

  insert into users (id, company_id, nom, telephone, email, role)
  values (
    auth.uid(),
    v_company_id,
    p_nom_dirigeant,
    p_telephone,
    (select email from auth.users where id = auth.uid()),
    'admin'
  );

  insert into subscriptions (company_id, plan, montant, prochaine_echeance, statut)
  values (v_company_id, 'starter', 0, current_date + interval '14 days', 'actif');

  return v_company_id;
end;
$$;

-- ── Trigger : maintien du solde des comptes depuis les transactions ────
create or replace function maj_solde_compte()
returns trigger
language plpgsql
as $$
declare
  v_signe int;
begin
  if (tg_op = 'INSERT') then
    v_signe := case when new.type = 'entree' then 1 else -1 end;
    update accounts set solde_courant = solde_courant + v_signe * new.montant
      where id = new.account_id;
    return new;
  elsif (tg_op = 'DELETE') then
    v_signe := case when old.type = 'entree' then 1 else -1 end;
    update accounts set solde_courant = solde_courant - v_signe * old.montant
      where id = old.account_id;
    return old;
  elsif (tg_op = 'UPDATE') then
    -- Annule l'effet de l'ancienne ligne, applique la nouvelle.
    update accounts set solde_courant = solde_courant
        - (case when old.type = 'entree' then 1 else -1 end) * old.montant
      where id = old.account_id;
    update accounts set solde_courant = solde_courant
        + (case when new.type = 'entree' then 1 else -1 end) * new.montant
      where id = new.account_id;
    return new;
  end if;
  return null;
end;
$$;

create trigger trg_maj_solde
  after insert or update or delete on transactions
  for each row execute function maj_solde_compte();

-- ── Enregistrer un paiement sur une vente (atomique) ───────────────────
-- 1) crée le paiement, 2) crédite la trésorerie via une transaction
-- (le trigger met à jour le solde), 3) recalcule le statut de la vente.
create or replace function enregistrer_paiement(
  p_sale_id uuid,
  p_account_id uuid,
  p_montant bigint,
  p_moyen moyen_paiement,
  p_date date default current_date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid := auth_company_id();
  v_total bigint;
  v_paye bigint;
begin
  -- Vérifie que la vente ET le compte appartiennent à l'entreprise de l'appelant.
  if not exists (select 1 from sales where id = p_sale_id and company_id = v_company_id) then
    raise exception 'Vente introuvable pour cette entreprise.';
  end if;
  if not exists (select 1 from accounts where id = p_account_id and company_id = v_company_id) then
    raise exception 'Compte introuvable pour cette entreprise.';
  end if;
  if p_montant <= 0 then
    raise exception 'Le montant doit être positif.';
  end if;

  insert into payments (company_id, sale_id, account_id, montant, date, moyen)
  values (v_company_id, p_sale_id, p_account_id, p_montant, p_date, p_moyen);

  insert into transactions (company_id, account_id, type, categorie, montant, date, description, sale_id)
  values (v_company_id, p_account_id, 'entree', 'vente', p_montant, p_date, 'Encaissement vente', p_sale_id);

  select montant_total, montant_paye + p_montant
    into v_total, v_paye
    from sales where id = p_sale_id;

  update sales set
    montant_paye = v_paye,
    statut = case
      when v_paye >= v_total then 'payee'
      when v_paye > 0 then 'partielle'
      else 'impayee'
    end
  where id = p_sale_id;
end;
$$;

-- ── Transfert entre deux comptes de trésorerie (atomique) ──────────────
create or replace function transferer_tresorerie(
  p_source uuid,
  p_destination uuid,
  p_montant bigint,
  p_date date default current_date,
  p_description text default 'Transfert entre comptes'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid := auth_company_id();
begin
  if p_source = p_destination then
    raise exception 'Les comptes source et destination doivent être différents.';
  end if;
  if p_montant <= 0 then
    raise exception 'Le montant doit être positif.';
  end if;
  if not exists (select 1 from accounts where id = p_source and company_id = v_company_id)
     or not exists (select 1 from accounts where id = p_destination and company_id = v_company_id) then
    raise exception 'Compte introuvable pour cette entreprise.';
  end if;

  insert into transactions (company_id, account_id, type, categorie, montant, date, description)
  values (v_company_id, p_source, 'sortie', 'transfert', p_montant, p_date, p_description);
  insert into transactions (company_id, account_id, type, categorie, montant, date, description)
  values (v_company_id, p_destination, 'entree', 'transfert', p_montant, p_date, p_description);
end;
$$;
