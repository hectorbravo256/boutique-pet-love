-- REVIEW ONLY. Fail closed: no authenticated RPC grants until each body has an admin guard.
BEGIN;
DO $$ DECLARE f record; BEGIN
FOR f IN SELECT p.oid::regprocedure AS signature FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.prokind='f' LOOP
 EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC,anon,authenticated',f.signature);
END LOOP;
END $$;
GRANT EXECUTE ON FUNCTION public.confirmar_venta_online(text,jsonb) TO service_role;
-- Pending: preserve each function body and add authorization guard to callable admin RPCs,
-- then grant exact signatures; preserve trigger/internal dependencies; audit search_path.
-- This draft intentionally disables direct administrative RPC calls.
ROLLBACK;
