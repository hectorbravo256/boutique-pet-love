-- Read-only metadata export. Save each result securely outside GitHub.
-- Not a data backup; pg_dump and Storage backup/restore rehearsal also required.
BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
SELECT current_database(),current_setting('server_version'),transaction_timestamp();
SELECT n.nspname,c.relname,c.relkind,pg_get_userbyid(c.relowner) owner,c.relacl,c.relrowsecurity,c.relforcerowsecurity,c.reloptions
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' OR (n.nspname='storage' AND c.relname='objects');
SELECT n.nspname,c.relname,a.attname,a.attacl FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND a.attnum>0 AND NOT a.attisdropped AND a.attacl IS NOT NULL;
SELECT * FROM pg_policies WHERE schemaname IN ('public','storage');
SELECT p.oid::regprocedure,pg_get_userbyid(p.proowner),p.proacl,p.proconfig,pg_get_functiondef(p.oid) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.prokind='f';
SELECT schemaname,viewname,viewowner,definition FROM pg_views WHERE schemaname='public';
SELECT nspname,nspacl,pg_get_userbyid(nspowner) FROM pg_namespace WHERE nspname IN ('public','storage','private');
SELECT * FROM pg_default_acl;
SELECT * FROM pg_sequences WHERE schemaname='public';
SELECT c.relname,pg_get_triggerdef(t.oid) FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND NOT t.tgisinternal;
ROLLBACK;
