-- BORRADOR: únicamente en clon aislado. No modifica valores de secuencias.
BEGIN;
DO $$ DECLARE s record; BEGIN FOR s IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='S' LOOP EXECUTE format('REVOKE ALL ON SEQUENCE public.%I FROM PUBLIC, anon',s.relname); EXECUTE format('REVOKE UPDATE ON SEQUENCE public.%I FROM authenticated',s.relname); END LOOP; END $$;
-- Mantener USAGE autenticado donde inserciones directas lo requieran; revisar antes de reducirlo.
SELECT c.relname,has_sequence_privilege('anon',c.oid,'USAGE') AS anon_usage,has_sequence_privilege('anon',c.oid,'UPDATE') AS anon_update FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='S';
ROLLBACK;
