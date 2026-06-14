-- ═══════════════════════════════════════════════════════════════════════
-- PILOT — Correctif — Migration 0006
-- Corrige l'erreur à l'encaissement :
--   « column "statut" is of type statut_vente but expression is of type text »
-- Le CASE des fonctions d'encaissement renvoyait du text ; on caste
-- explicitement le résultat vers l'enum statut_vente.
-- (Déjà appliqué aussi dans 0003/0004 pour les installations neuves.)
-- ═══════════════════════════════════════════════════════════════════════

create or replace function enregistrer_paiement(
  p_sale_id uuid, p_account_id uuid, p_montant bigint, p_moyen moyen_paiement, p_date date default current_date
) returns void language plpgsql security definer set search_path = public as $$
declare v_company_id uuid := auth_company_id(); v_total bigint; v_paye bigint;
begin
  if not exists (select 1 from sales where id = p_sale_id and company_id = v_company_id) then
    raise exception 'Vente introuvable pour cette entreprise.'; end if;
  if not exists (select 1 from accounts where id = p_account_id and company_id = v_company_id) then
    raise exception 'Compte introuvable pour cette entreprise.'; end if;
  if p_montant <= 0 then raise exception 'Le montant doit être positif.'; end if;

  insert into payments (company_id, sale_id, account_id, montant, date, moyen)
  values (v_company_id, p_sale_id, p_account_id, p_montant, p_date, p_moyen);
  insert into transactions (company_id, account_id, type, categorie, montant, date, description, sale_id)
  values (v_company_id, p_account_id, 'entree', 'vente', p_montant, p_date, 'Encaissement vente', p_sale_id);

  select montant_total, montant_paye + p_montant into v_total, v_paye from sales where id = p_sale_id;
  update sales set montant_paye = v_paye,
    statut = (case when v_paye >= v_total then 'payee' when v_paye > 0 then 'partielle' else 'impayee' end)::statut_vente
  where id = p_sale_id;
end; $$;

create or replace function enregistrer_paiement_admin(
  p_sale_id uuid, p_account_id uuid, p_montant bigint, p_moyen moyen_paiement default 'momo'
) returns void language plpgsql security definer set search_path = public as $$
declare v_company_id uuid; v_total bigint; v_paye bigint; v_deja_paye boolean;
begin
  select company_id, montant_total, montant_paye, (statut = 'payee')
    into v_company_id, v_total, v_paye, v_deja_paye from sales where id = p_sale_id;
  if v_company_id is null then raise exception 'Vente introuvable.'; end if;
  if v_deja_paye then return; end if;

  insert into payments (company_id, sale_id, account_id, montant, date, moyen)
  values (v_company_id, p_sale_id, p_account_id, p_montant, current_date, p_moyen);
  insert into transactions (company_id, account_id, type, categorie, montant, date, description, sale_id)
  values (v_company_id, p_account_id, 'entree', 'vente', p_montant, current_date, 'Paiement en ligne FedaPay', p_sale_id);

  update sales set montant_paye = v_paye + p_montant,
    statut = (case when v_paye + p_montant >= v_total then 'payee'
                   when v_paye + p_montant > 0 then 'partielle' else 'impayee' end)::statut_vente
  where id = p_sale_id;
end; $$;

revoke execute on function enregistrer_paiement_admin(uuid, uuid, bigint, moyen_paiement) from public, anon, authenticated;
