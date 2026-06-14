-- ═══════════════════════════════════════════════════════════════════════
-- PILOT — Durcissement de sécurité — Migration 0005
-- Corrige les avertissements de l'audit Supabase :
--   1) search_path figé sur le trigger de solde.
--   2) RPC métier non exposées au rôle anon (seuls les utilisateurs
--      authentifiés en ont besoin). Les vérifications internes (auth_company_id)
--      bloquaient déjà les appels anonymes ; on retire la surface inutile.
-- ═══════════════════════════════════════════════════════════════════════

-- 1) Trigger de solde : search_path explicite.
create or replace function maj_solde_compte()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_signe int;
begin
  if (tg_op = 'INSERT') then
    v_signe := case when new.type = 'entree' then 1 else -1 end;
    update accounts set solde_courant = solde_courant + v_signe * new.montant where id = new.account_id;
    return new;
  elsif (tg_op = 'DELETE') then
    v_signe := case when old.type = 'entree' then 1 else -1 end;
    update accounts set solde_courant = solde_courant - v_signe * old.montant where id = old.account_id;
    return old;
  elsif (tg_op = 'UPDATE') then
    update accounts set solde_courant = solde_courant
        - (case when old.type = 'entree' then 1 else -1 end) * old.montant where id = old.account_id;
    update accounts set solde_courant = solde_courant
        + (case when new.type = 'entree' then 1 else -1 end) * new.montant where id = new.account_id;
    return new;
  end if;
  return null;
end;
$$;

-- 2) Retirer l'exécution des RPC métier au rôle anon (garder authenticated).
revoke execute on function creer_entreprise(text, text, text, text) from anon;
revoke execute on function enregistrer_paiement(uuid, uuid, bigint, moyen_paiement, date) from anon;
revoke execute on function transferer_tresorerie(uuid, uuid, bigint, date, text) from anon;
