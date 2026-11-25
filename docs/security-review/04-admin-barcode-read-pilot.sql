-- REVIEW ONLY. Requires private.is_admin() and isolated clone.
BEGIN;
CREATE FUNCTION public.admin_barcode_catalog()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $fn$
DECLARE result jsonb;
BEGIN
 IF NOT private.is_admin() THEN
  RAISE EXCEPTION 'Acceso administrativo no autorizado' USING ERRCODE='42501';
 END IF;
 SELECT coalesce(jsonb_agg(jsonb_build_object(
  'id',p.id,'name',p.name,'category',p.category,'active',p.active,
  'product_variants',coalesce((SELECT jsonb_agg(jsonb_build_object(
   'id',v.id,'size',v.size,'price',v.price,'stock',v.stock,'sku',v.sku,'barcode',v.barcode
  ) ORDER BY v.id) FROM public.product_variants v WHERE v.product_id=p.id),'[]'::jsonb)
 ) ORDER BY p.name,p.id),'[]'::jsonb) INTO result
 FROM public.products p;
 RETURN result;
END;
$fn$;
REVOKE ALL ON FUNCTION public.admin_barcode_catalog() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_barcode_catalog() TO authenticated;
-- Verify owner, response size, role tests, frontend contract and pagination needs.
-- Does not revoke existing table grants; do not apply independently.
ROLLBACK;
