-- REVIEW ONLY: isolated clone, after 03 in same transaction (remove intermediate ROLLBACK only in reviewed test harness).
BEGIN;
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
ROLLBACK;
