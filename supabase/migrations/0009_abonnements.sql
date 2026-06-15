-- 0009 — Abonnements : activation d'un abonnement payé (FedaPay) ou en démo.
-- Appelé soit par le webhook FedaPay (service_role), soit par l'action
-- « souscrire » en mode démo (sans clés FedaPay), via le client admin.

create or replace function activer_abonnement_admin(
  p_company_id uuid,
  p_plan       plan_abonnement,
  p_montant    bigint
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_echeance date := current_date + interval '1 month';
begin
  -- Un abonnement par entreprise : on met à jour s'il existe, sinon on crée.
  update subscriptions
     set plan = p_plan,
         montant = p_montant,
         prochaine_echeance = v_echeance,
         statut = 'actif'
   where company_id = p_company_id;

  if not found then
    insert into subscriptions (company_id, plan, montant, prochaine_echeance, statut)
    values (p_company_id, p_plan, p_montant, v_echeance, 'actif');
  end if;

  -- Active l'entreprise et fige le plan choisi.
  update companies
     set plan = p_plan,
         statut = 'actif'
   where id = p_company_id;
end;
$$;

-- Réservé au service_role (webhook) et au client admin : jamais exposé aux rôles
-- anon/authenticated (pas d'activation gratuite côté client).
revoke all on function activer_abonnement_admin(uuid, plan_abonnement, bigint) from public;
revoke all on function activer_abonnement_admin(uuid, plan_abonnement, bigint) from anon;
revoke all on function activer_abonnement_admin(uuid, plan_abonnement, bigint) from authenticated;
