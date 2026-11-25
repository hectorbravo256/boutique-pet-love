-- REVIEW ONLY: local isolated clone, not production.
BEGIN;
-- Per-schema grants are additive. Remove global PUBLIC routine EXECUTE too.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM anon,authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon,authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon,authenticated;
-- Preserve service_role defaults provisionally; review explicit server grants.
-- supabase_admin is platform-managed: do not alter its defaults in this draft.
-- Future app objects must be created by approved postgres migration role,
-- with RLS and explicit least-privilege grants in the same transaction.
-- Global PUBLIC revoke affects future postgres functions across schemas:
-- verify platform/extension compatibility before approval.
-- Fixture tests in clone: create new table, sequence, function; assert anon/auth
-- lack access, then verify explicit grants + RLS. Do not create fixtures in production.
ROLLBACK;
