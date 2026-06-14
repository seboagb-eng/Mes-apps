-- ═══════════════════════════════════════════════════════════════════════
-- PILOT — Support des paiements en ligne (FedaPay)
-- Migration 0004 : variante « admin » d'enregistrement de paiement,
-- appelée par le webhook (service_role, sans session utilisateur).
-- ═══════════════════════════════════════════════════════════════════════

-- Identique à enregistrer_paiement mais déduit le company_id depuis la vente,
-- car le webhook n'a pas d'utilisateur connecté (auth.uid() est null).
-- N'est appelable qu'avec la clé service_role (jamais exposée au client).
create or replace function enregistrer_paiement_admin(
  p_sale_id uuid,
  p_account_id uuid,
  p_montant bigint,
  p_moyen moyen_paiement default 'momo'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_total bigint;
  v_paye bigint;
  v_deja_paye boolean;
begin
  select company_id, montant_total, montant_paye, (statut = 'payee')
    into v_company_id, v_total, v_paye, v_deja_paye
    from sales where id = p_sale_id;

  if v_company_id is null then
    raise exception 'Vente introuvable.';
  end if;

  -- Idempotence : si la vente est déjà soldée, on n'enregistre rien
  -- (un webhook peut être reçu plusieurs fois).
  if v_deja_paye then
    return;
  end if;

  insert into payments (company_id, sale_id, account_id, montant, date, moyen)
  values (v_company_id, p_sale_id, p_account_id, p_montant, current_date, p_moyen);

  insert into transactions (company_id, account_id, type, categorie, montant, date, description, sale_id)
  values (v_company_id, p_account_id, 'entree', 'vente', p_montant, current_date, 'Paiement en ligne FedaPay', p_sale_id);

  update sales set
    montant_paye = v_paye + p_montant,
    statut = (case
      when v_paye + p_montant >= v_total then 'payee'
      when v_paye + p_montant > 0 then 'partielle'
      else 'impayee'
    end)::statut_vente
  where id = p_sale_id;
end;
$$;

-- On retire le droit d'exécution au rôle public/anon : seul service_role
-- (qui contourne ces grants) doit l'utiliser.
revoke execute on function enregistrer_paiement_admin(uuid, uuid, bigint, moyen_paiement) from public, anon, authenticated;
