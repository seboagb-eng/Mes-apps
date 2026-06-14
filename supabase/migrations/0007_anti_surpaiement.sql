-- ═══════════════════════════════════════════════════════════════════════
-- PILOT — Correctif — Migration 0007
-- Faille détectée aux tests : le surpaiement était accepté (montant_paye
-- pouvait dépasser montant_total et gonflait la trésorerie).
-- On rejette désormais tout encaissement supérieur au reste dû.
-- (Repris aussi dans 0003 pour les installations neuves.)
-- ═══════════════════════════════════════════════════════════════════════

create or replace function enregistrer_paiement(
  p_sale_id uuid, p_account_id uuid, p_montant bigint, p_moyen moyen_paiement, p_date date default current_date
) returns void language plpgsql security definer set search_path = public as $$
declare v_company_id uuid := auth_company_id(); v_total bigint; v_old bigint; v_reste bigint;
begin
  if not exists (select 1 from sales where id = p_sale_id and company_id = v_company_id) then
    raise exception 'Vente introuvable pour cette entreprise.'; end if;
  if not exists (select 1 from accounts where id = p_account_id and company_id = v_company_id) then
    raise exception 'Compte introuvable pour cette entreprise.'; end if;
  if p_montant <= 0 then raise exception 'Le montant doit être positif.'; end if;

  select montant_total, montant_paye into v_total, v_old from sales where id = p_sale_id;
  v_reste := v_total - v_old;
  if p_montant > v_reste then
    raise exception 'Le montant (% FCFA) dépasse le reste dû (% FCFA).', p_montant, v_reste;
  end if;

  insert into payments (company_id, sale_id, account_id, montant, date, moyen)
  values (v_company_id, p_sale_id, p_account_id, p_montant, p_date, p_moyen);
  insert into transactions (company_id, account_id, type, categorie, montant, date, description, sale_id)
  values (v_company_id, p_account_id, 'entree', 'vente', p_montant, p_date, 'Encaissement vente', p_sale_id);

  update sales set montant_paye = v_old + p_montant,
    statut = (case when v_old + p_montant >= v_total then 'payee'
                   when v_old + p_montant > 0 then 'partielle' else 'impayee' end)::statut_vente
  where id = p_sale_id;
end; $$;
