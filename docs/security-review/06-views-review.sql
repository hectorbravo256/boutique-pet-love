-- REVIEW ONLY: isolated clone, requires table policy draft in same test transaction.
BEGIN;
DO $$ DECLARE v text; BEGIN
FOREACH v IN ARRAY ARRAY['vw_dashboard_alerts','vw_dashboard_shipping','vw_dashboard_summary','vw_inventory_master','vw_inventory_value','vw_reportes_ventas','vw_variant_summary'] LOOP
 EXECUTE format('ALTER VIEW public.%I SET (security_invoker=true)',v);
 EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC,anon,authenticated',v);
 EXECUTE format('GRANT SELECT ON public.%I TO authenticated',v);
END LOOP;
END $$;
-- Pending: ensure non-admin cannot derive information from public-table-only views.
-- Validate each view dependency, including sale_exchanges; consider admin-filtered wrappers.
ROLLBACK;
