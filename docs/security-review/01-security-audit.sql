-- Solo lectura: inventario de objetos y permisos.
BEGIN READ ONLY;
SELECT c.relname,c.relkind,c.relacl,c.relrowsecurity,c.reloptions FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind IN ('r','v','S') ORDER BY 2,1;
SELECT * FROM pg_policies WHERE schemaname IN ('public','storage') ORDER BY 1,2,3;
SELECT p.oid::regprocedure AS signature,p.prosecdef,p.proconfig,p.proacl,pg_get_functiondef(p.oid) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.prokind='f' ORDER BY 1;
SELECT * FROM information_schema.view_table_usage WHERE view_schema='public';
SELECT * FROM information_schema.column_privileges WHERE table_schema='public';
SELECT * FROM pg_default_acl;
ROLLBACK;
