-- REVIEW ONLY: candidate generation, not installation.
BEGIN;
SET LOCAL search_path = public, pg_catalog;
DO $review$
DECLARE r record; d text;
BEGIN
FOR r IN SELECT * FROM (VALUES
('vw_dashboard_alerts','db299ff5511db67c084f798d754f6771'),
('vw_dashboard_shipping','c34509c4166832b898fa0981c57ad4bb'),
('vw_dashboard_summary','ed6c1b1867f869ee94cbe6fb0f5c9bbf'),
('vw_inventory_master','ad72b5b17b27c27390308e980962b275'),
('vw_inventory_value','49e8b8bc492e1ac8eed718c0e6b2da96'),
('vw_reportes_ventas','ad7394551f9b233cd7276565882fdb52'),
('vw_variant_summary','d0496175695a955a085ce994b3c10495')
) AS expected(view_name,fingerprint) LOOP
 d := pg_get_viewdef(to_regclass('public.'||r.view_name),true);
 IF d IS NULL OR md5(d) IS DISTINCT FROM r.fingerprint THEN
  RAISE EXCEPTION 'View definition changed or deparse context differs: %',r.view_name;
 END IF;
 -- Wrap the complete query, including aggregate rows, rather than filter inputs.
 RAISE NOTICE '%',format('CREATE OR REPLACE VIEW public.%I WITH (security_invoker=true,security_barrier=true) AS SELECT guarded.* FROM (%s) guarded WHERE (SELECT private.is_admin());',r.view_name,regexp_replace(d,';[[:space:]]*$',''));
END LOOP;
END $review$;
-- Review ordering, exact types, dependencies and ACLs before installing.
-- Revoke PUBLIC/anon access, grant authenticated SELECT only after guard installation.
-- No generated statement is executed.
ROLLBACK;
