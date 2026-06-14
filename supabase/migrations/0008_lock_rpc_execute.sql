-- ═══════════════════════════════════════════════════════════════════════
-- PILOT — Durcissement — Migration 0008
-- La migration 0005 révoquait EXECUTE « from anon » seulement, ce qui était
-- inefficace : PostgreSQL accorde EXECUTE à PUBLIC par défaut à la (re)création
-- d'une fonction. Les RPC métier restaient donc appelables par anon.
-- On retire le grant PUBLIC et on l'accorde explicitement au seul authenticated.
-- ═══════════════════════════════════════════════════════════════════════

revoke execute on function creer_entreprise(text, text, text, text) from public;
revoke execute on function enregistrer_paiement(uuid, uuid, bigint, moyen_paiement, date) from public;
revoke execute on function transferer_tresorerie(uuid, uuid, bigint, date, text) from public;

grant execute on function creer_entreprise(text, text, text, text) to authenticated;
grant execute on function enregistrer_paiement(uuid, uuid, bigint, moyen_paiement, date) to authenticated;
grant execute on function transferer_tresorerie(uuid, uuid, bigint, date, text) to authenticated;
