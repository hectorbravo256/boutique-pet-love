-- ISOLATED STRUCTURAL REHEARSAL ONLY. Not a deployable migration.
-- No COMMIT. Admin RPCs intentionally disabled; no functional acceptance claimed.
\set ON_ERROR_STOP on
BEGIN;

-- SOURCE: 00-isolation-preflight.sql
-- REVIEW ONLY: fail-closed preflight for a future local isolated clone.
-- Not a production migration. Run through psql with ON_ERROR_STOP.
-- A separately provisioned local database named bpl_security_review is required.
-- This guard is defense in depth, not proof of project identity.
DO $guard$
BEGIN
 IF current_database() <> 'bpl_security_review' THEN
  RAISE EXCEPTION 'Security review requires dedicated local database';
 END IF;
 IF inet_server_addr() IS NOT NULL AND inet_server_addr() NOT IN ('127.0.0.1'::inet,'::1'::inet) THEN
  RAISE EXCEPTION 'Remote database forbidden';
 END IF;
 IF current_setting('bpl.security_review',true) IS DISTINCT FROM 'isolated-fixtures-only' THEN
  RAISE EXCEPTION 'Explicit isolated review marker required';
 END IF;
 IF current_user <> 'postgres' THEN RAISE EXCEPTION 'Unexpected migration role'; END IF;
END $guard$;


-- SOURCE: 03-admin-authorization.sql
-- REVIEW ONLY. Isolated clone, never production. Requires explicit UUID approval.

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


-- SOURCE: 04-table-policies.sql
-- REVIEW ONLY: isolated clone, after 03 in same transaction (remove intermediate ROLLBACK only in reviewed test harness).

DO $$ DECLARE t text; p record; BEGIN
FOREACH t IN ARRAY ARRAY['categories','products','product_variants','product_images','orders','coupons','shipping_expenses','purchases','purchase_details','inventory_repairs','inventory_repair_items','reservations','reservation_items','reservation_payments','suppliers','inventory_movements','paket_shipping_settings','paket_shipping_exceptions','sale_exchanges'] LOOP
 FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP
 EXECUTE format('DROP POLICY %I ON public.%I',p.policyname,t);
 END LOOP;
 EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC,anon,authenticated',t);
 EXECUTE format('GRANT SELECT ON public.%I TO authenticated',t);
 EXECUTE format('CREATE POLICY admin_read ON public.%I FOR SELECT TO authenticated USING ((SELECT private.is_admin()))',t);
 IF t NOT IN ('inventory_movements','sale_exchanges','inventory_repairs','inventory_repair_items') THEN
 EXECUTE format('GRANT INSERT,UPDATE,DELETE ON public.%I TO authenticated',t);
 EXECUTE format('CREATE POLICY admin_write ON public.%I FOR ALL TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()))',t);
 END IF;
END LOOP;
FOREACH t IN ARRAY ARRAY['physical_count_sessions','physical_count_items'] LOOP
 EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC,anon',t);
 EXECUTE format('CREATE POLICY admin_required ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()))',t);
END LOOP;
END $$;
GRANT SELECT ON public.categories,public.products,public.product_variants,public.product_images,public.paket_shipping_settings,public.paket_shipping_exceptions TO anon;
CREATE POLICY catalog_read ON public.categories FOR SELECT TO anon,authenticated USING (active);
CREATE POLICY catalog_read ON public.products FOR SELECT TO anon,authenticated USING (active);
CREATE POLICY catalog_read ON public.product_variants FOR SELECT TO anon,authenticated USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id=product_id AND p.active));
CREATE POLICY catalog_read ON public.product_images FOR SELECT TO anon,authenticated USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id=product_id AND p.active));
CREATE POLICY calendar_read ON public.paket_shipping_settings FOR SELECT TO anon,authenticated USING (true);
CREATE POLICY calendar_read ON public.paket_shipping_exceptions FOR SELECT TO anon,authenticated USING (true);
-- Pending: narrow admin DML grants by actual consumers; column grants audit;
-- public SKU/min_stock/barcode exposure and select(*) consumers; coupon endpoint replacement.


-- SOURCE: 05-function-permissions.sql
-- REVIEW ONLY. Fail closed: no authenticated RPC grants until each body has an admin guard.

DO $$ DECLARE f record; BEGIN
FOR f IN SELECT p.oid::regprocedure AS signature FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.prokind='f' LOOP
 EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC,anon,authenticated',f.signature);
END LOOP;
END $$;
GRANT EXECUTE ON FUNCTION public.confirmar_venta_online(text,jsonb) TO service_role;
-- Pending: preserve each function body and add authorization guard to callable admin RPCs,
-- then grant exact signatures; preserve trigger/internal dependencies; audit search_path.
-- This draft intentionally disables direct administrative RPC calls.


-- SOURCE: 07-storage-policies.sql
-- REVIEW ONLY. Requires private.is_admin() from 03.

DROP POLICY "Public Delete Categories" ON storage.objects;
DROP POLICY "Public Delete Products" ON storage.objects;
DROP POLICY "Public Update Categories" ON storage.objects;
DROP POLICY "Public Update Products" ON storage.objects;
DROP POLICY "Public Upload Categories" ON storage.objects;
DROP POLICY "Public Upload Products" ON storage.objects;
CREATE POLICY admin_catalog_upload ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('products','categories') AND (SELECT private.is_admin()));
CREATE POLICY admin_catalog_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('products','categories') AND (SELECT private.is_admin())) WITH CHECK (bucket_id IN ('products','categories') AND (SELECT private.is_admin()));
CREATE POLICY admin_catalog_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('products','categories') AND (SELECT private.is_admin()));
-- Existing public SELECT policies retained; verify no additional permissive write policies.


-- SOURCE: 06-default-privileges-review.sql
-- REVIEW ONLY: local isolated clone, not production.

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


-- SOURCE: 06-views-review.sql
-- REVIEW ONLY: isolated clone, requires table policy draft in same test transaction.

DO $$ DECLARE v text; BEGIN
FOREACH v IN ARRAY ARRAY['vw_dashboard_alerts','vw_dashboard_shipping','vw_dashboard_summary','vw_inventory_master','vw_inventory_value','vw_reportes_ventas','vw_variant_summary'] LOOP
 EXECUTE format('ALTER VIEW public.%I SET (security_invoker=true)',v);
 EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC,anon,authenticated',v);
 EXECUTE format('GRANT SELECT ON public.%I TO authenticated',v);
END LOOP;
END $$;
-- Pending: ensure non-admin cannot derive information from public-table-only views.
-- Validate each view dependency, including sale_exchanges; consider admin-filtered wrappers.


-- SOURCE: 06-sequence-minimum-grants.sql
-- REVIEW ONLY: isolated clone, after guarded RPC dependencies resolved.

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


-- SOURCE: 04-minimum-table-grants-review.sql
-- REVIEW ONLY. Local isolated rehearsal, after 04-table-policies in same transaction.
-- Not standalone migration; remaining consumers must be audited.

-- Financial history: reads through admin RLS; mutations through guarded RPC/server.
REVOKE INSERT,UPDATE,DELETE,TRUNCATE ON public.orders,public.purchases,public.purchase_details,public.inventory_movements,public.sale_exchanges,public.inventory_repairs,public.inventory_repair_items FROM authenticated;
-- Reservation payment insertion is currently required by SECURITY INVOKER registrar_abono_reserva.
-- Keep INSERT provisionally; forbid direct edits/deletes of historical payments.
REVOKE UPDATE,DELETE,TRUNCATE ON public.reservation_payments FROM authenticated;
-- Reservation updates are currently required by invoker abono RPC. Do not revoke yet.
-- registrar_compra is SECURITY INVOKER: removing purchases INSERT above blocks this legacy RPC.
-- Resolve caller and choose guarded RPC design before integration.
-- Shipping expenses, suppliers, catalog, settings, coupons and reservation items:
-- retain previous draft until exact direct write callers and columns are verified.
-- Coupon public SELECT/UPDATE removal requires checkout/success redesign.
-- Column ACLs may independently grant privileges; inspect before integration.
SELECT table_name,privilege_type FROM information_schema.role_table_grants
WHERE table_schema='public' AND grantee='authenticated' ORDER BY table_name,privilege_type;


-- SOURCE: 04-public-column-grants-review.sql
-- REVIEW ONLY. Requires explicit public projections and isolated tests.
-- Apply after table policies in same reviewed transaction; not standalone.

-- Remove table-wide anonymous SELECT before granting columns.
REVOKE SELECT ON public.product_variants,public.paket_shipping_settings,public.paket_shipping_exceptions FROM anon;
GRANT SELECT (id,product_id,size,price,stock) ON public.product_variants TO anon;
GRANT SELECT (id,enabled,timezone,cutoff,pickup_weekdays,preparation_days) ON public.paket_shipping_settings TO anon;
GRANT SELECT (date,reason) ON public.paket_shipping_exceptions TO anon;
-- Authenticated table-wide SELECT is needed by existing admin clients, but also
-- exposes these columns on public rows to nonadmin authenticated users.
-- Resolve via separate guarded admin API/RPC or public projection architecture.
-- No claim of complete column isolation until that design is implemented.
-- Existing column ACLs must be inspected and explicitly revoked if present.
-- Product and category fields currently remain readable under active-row RLS.
-- Product.jsx, Category.jsx and Checkout.jsx wildcard queries must be narrowed first.


-- Structural assertions only
-- REVIEW ONLY. Run against an isolated clone AFTER integrated candidate migration.
-- No business writes. Fixture users and representative rows required for behavioral tests.

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
