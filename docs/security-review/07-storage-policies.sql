-- REVIEW ONLY. Requires private.is_admin() from 03.
BEGIN;
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
ROLLBACK;
