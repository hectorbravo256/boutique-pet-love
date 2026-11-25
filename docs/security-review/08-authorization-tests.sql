-- REVIEW ONLY. Run against an isolated clone AFTER integrated candidate migration.
-- No business writes. Fixture users and representative rows required for behavioral tests.
BEGIN READ ONLY;
DO $$ DECLARE r record; BEGIN
FOR r IN SELECT c.oid,c.relname,c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' LOOP
 IF NOT r.relrowsecurity THEN RAISE EXCEPTION 'RLS missing: %',r.relname; END IF;
 IF has_table_privilege('anon',r.oid,'INSERT,UPDATE,DELETE,TRUNCATE') OR has_any_column_privilege('anon',r.oid,'INSERT,UPDATE') THEN RAISE EXCEPTION 'Anonymous write grant: %',r.relname; END IF;
 IF r.relname NOT IN ('categories','products','product_variants','product_images','paket_shipping_settings','paket_shipping_exceptions') AND (has_table_privilege('anon',r.oid,'SELECT') OR has_any_column_privilege('anon',r.oid,'SELECT')) THEN RAISE EXCEPTION 'Anonymous private read: %',r.relname; END IF;
END LOOP;
FOR r IN SELECT p.oid,p.oid::regprocedure AS signature FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.prokind='f' LOOP
 IF has_function_privilege('anon',r.oid,'EXECUTE') THEN RAISE EXCEPTION 'Anonymous RPC: %',r.signature; END IF;
END LOOP;
IF has_function_privilege('authenticated','public.confirmar_venta_online(text,jsonb)','EXECUTE') OR NOT has_function_privilege('service_role','public.confirmar_venta_online(text,jsonb)','EXECUTE') THEN RAISE EXCEPTION 'Online confirmation permissions invalid'; END IF;
FOR r IN SELECT c.oid,c.relname,c.reloptions FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='v' LOOP
 IF has_table_privilege('anon',r.oid,'SELECT') OR has_any_column_privilege('anon',r.oid,'SELECT') THEN RAISE EXCEPTION 'Anonymous view: %',r.relname; END IF;
 IF NOT coalesce('security_invoker=true'=ANY(r.reloptions),false) THEN RAISE EXCEPTION 'View not invoker: %',r.relname; END IF;
END LOOP;
FOR r IN SELECT c.oid,c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='S' LOOP
 IF has_sequence_privilege('anon',r.oid,'USAGE,SELECT,UPDATE') THEN RAISE EXCEPTION 'Anonymous sequence: %',r.relname; END IF;
END LOOP;
END $$;
SET LOCAL ROLE anon;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.products WHERE NOT active) THEN RAISE EXCEPTION 'Inactive product exposed'; END IF;
 IF EXISTS(SELECT 1 FROM public.categories WHERE NOT active) THEN RAISE EXCEPTION 'Inactive category exposed'; END IF;
END $$;
RESET ROLE;
-- Behavioral tests still required: fixture JWTs for non-admin/admin, positive reads,
-- RPC guards, owner/state restrictions, view leakage, Storage API and Netlify HTTP.
-- This script checks grants and limited public reads only, not full authorization.
ROLLBACK;
