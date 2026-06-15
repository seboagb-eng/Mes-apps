-- 0010 — Performance : index de clés étrangères + optimisation initplan RLS.
--
-- Note sécurité : les helpers RLS auth_company_id() / auth_role() restent
-- exécutables par authenticated/anon. C'est REQUIS : la RLS échoue sans EXECUTE
-- (vérifié : « permission denied for function auth_company_id »). Ces fonctions
-- sans argument ne renvoient que le company_id / rôle de l'appelant lui-même
-- (null pour anon) — aucune fuite inter-tenant. Le WARN du linter est accepté.

-- Index couvrant les FK signalées par l'advisor (jointures recouvrement/relances).
create index if not exists idx_payments_account on public.payments(account_id);
create index if not exists idx_transactions_sale on public.transactions(sale_id);

-- initplan : auth.uid() était réévalué par ligne dans users_delete.
-- On l'enveloppe dans un sous-select pour qu'il soit évalué une seule fois.
drop policy if exists users_delete on public.users;
create policy users_delete on public.users for delete
  using (
    company_id = auth_company_id()
    and auth_role() = 'admin'
    and id <> (select auth.uid())
  );
