-- REVIEW ONLY: run in isolated clone after reviewed candidates are installed.
BEGIN;
DO $review$
DECLARE s text; f record;
BEGIN
FOREACH s IN ARRAY ARRAY['apply_physical_count(uuid)',
'convertir_reserva_a_venta(bigint)',
'crear_reserva(text,text,text,text,text,text,text,text,boolean,jsonb,numeric,text,text,text)',
'create_physical_count(text,text,text,text)',
'guardar_compra_completa(text,text,text,text,jsonb)',
'marcar_pago_cambio(uuid,text)',
'marcar_reembolso_paket(uuid,text,text)',
'marcar_reembolsos_paket_masivos(uuid[],text,text)',
'registrar_abono_reserva(bigint,numeric,text,text,text)',
'registrar_cambio_venta(bigint,bigint,integer,bigint,integer,text,text,text,text)',
'registrar_compra(text,text,text)',
'registrar_reingreso_reparacion(bigint,jsonb,text,text)',
'registrar_reparacion(text,text,text,jsonb,text)',
'registrar_venta_externa(text,text,text,text,text,text,jsonb,text,text,text,text,text,text,numeric,boolean)',
'registrar_venta_externa(text,text,text,text,text,text,jsonb,text,text)',
'registrar_venta_presencial(text,text,text,text,text,jsonb,text,text)'] LOOP
 SELECT p.oid,p.prosrc INTO STRICT f FROM pg_proc p WHERE p.oid=to_regprocedure('public.'||s);
 IF strpos(f.prosrc,'IF NOT private.is_admin() THEN RAISE EXCEPTION')=0 THEN RAISE EXCEPTION 'Missing candidate guard: %',s; END IF;
 EXECUTE 'GRANT EXECUTE ON FUNCTION public.'||s||' TO authenticated';
END LOOP;
END $review$;
-- Text marker is a preliminary check, not proof of guard execution.
-- Requires reviewed candidate hashes, negative role tests and exact ACL audit.
ROLLBACK;
