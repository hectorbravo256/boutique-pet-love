-- REVIEW ONLY: isolated clone, after guarded RPC dependencies resolved.
BEGIN;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC,anon,authenticated;
-- Provisional USAGE only for legacy invoker reservation payment insert and
-- purchase number default. Remove after moving these writes to guarded paths.
GRANT USAGE ON SEQUENCE public.reservation_payments_id_seq,public.purchase_number_seq TO authenticated;
-- Identity-backed inserts normally do not require direct sequence privileges.
-- Verify all explicit nextval/currval references and triggers before integration.
-- USAGE permits nextval, so provisional grants do not fully isolate counters.
-- Never call nextval/setval on production to test. No counter resets.
SELECT c.relname,has_sequence_privilege('anon',c.oid,'USAGE') anon_usage,
 has_sequence_privilege('authenticated',c.oid,'USAGE') auth_usage,
 has_sequence_privilege('authenticated',c.oid,'UPDATE') auth_update
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relkind='S' ORDER BY c.relname;
ROLLBACK;
