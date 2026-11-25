-- REVIEW ONLY. Isolated clone, never production. Requires explicit UUID approval.
BEGIN;
CREATE SCHEMA private;
REVOKE ALL ON SCHEMA private FROM PUBLIC,anon,authenticated;
CREATE TABLE private.admin_users (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE private.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.admin_users FROM PUBLIC,anon,authenticated;
CREATE FUNCTION private.is_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS (SELECT 1 FROM private.admin_users WHERE user_id=(SELECT auth.uid()) AND active)
$$;
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC,anon,authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;
-- Bootstrap only with explicitly approved UUID in isolated environment.
-- No user is authorized by this draft.
ROLLBACK;
