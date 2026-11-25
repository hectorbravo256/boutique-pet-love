-- REVIEW ONLY. Requires private.is_admin() in same isolated test transaction.
-- Candidate generator, not approved migration. Full body review and diff required.
BEGIN;
CREATE TEMP TABLE rpc_review_candidates(signature text PRIMARY KEY, original_ddl text, candidate_ddl text) ON COMMIT DROP;
DO $review$
DECLARE r record; f record; body text; ddl text;
BEGIN
FOR r IN SELECT * FROM (VALUES
('confirmar_venta_online(text,jsonb)','0285e8486e2c75561ed925b53a3d1171'),
('apply_physical_count(uuid)','bae83b007aceec5da42c9652936467ce'),
('convertir_reserva_a_venta(bigint)','126f9891d4a515c4cd206a21ff367552'),
('crear_reserva(text,text,text,text,text,text,text,text,boolean,jsonb,numeric,text,text,text)','92c32b531e3f0b88f787fe47f60e65d0'),
('create_physical_count(text,text,text,text)','4da1e62f5c4e1e63458d8a74b414dd93'),
('guardar_compra_completa(text,text,text,text,jsonb)','1ed6dd1e6f58795c50f9975a331b6cce'),
('marcar_pago_cambio(uuid,text)','e9210b0b2ec371e8d67050751b327d97'),
('marcar_reembolso_paket(uuid,text,text)','78e9beaaba88663310ee6d3b6ad62355'),
('marcar_reembolsos_paket_masivos(uuid[],text,text)','bf16a5614dd284c0373225e62110f4bc'),
('registrar_abono_reserva(bigint,numeric,text,text,text)','d0b045d147576708c72f88129ff66866'),
('registrar_cambio_venta(bigint,bigint,integer,bigint,integer,text,text,text,text)','8da9c22f62fc03197545b979357b7ff2'),
('registrar_compra(text,text,text)','a81b951c1ed7d1f10d2a22e91751f57f'),
('registrar_reingreso_reparacion(bigint,jsonb,text,text)','b27fa1b4617095de047877e741e98e76'),
('registrar_reparacion(text,text,text,jsonb,text)','e9ccd40e7e12974782c39caf52fba1d3'),
('registrar_venta_externa(text,text,text,text,text,text,jsonb,text,text,text,text,text,text,numeric,boolean)','37384a67730c9a26c505d6ecb1cb2074'),
('registrar_venta_externa(text,text,text,text,text,text,jsonb,text,text)','439ad282e04dc1b660258f5c9f395ada'),
('registrar_venta_presencial(text,text,text,text,text,jsonb,text,text)','6b0a46bf10d5ff8c43d878c3ddb53e91')
) AS expected(signature,fingerprint) LOOP
 SELECT p.oid,p.prosrc,pg_get_functiondef(p.oid) AS definition INTO STRICT f FROM pg_proc p WHERE p.oid=to_regprocedure('public.'||r.signature);
 IF md5(f.prosrc) <> r.fingerprint THEN RAISE EXCEPTION 'Definition changed: %',r.signature; END IF;
 IF regexp_count(f.prosrc,'(?im)^\s*begin\s*$') <> 1 THEN RAISE EXCEPTION 'Unexpected block: %',r.signature; END IF;
 IF r.signature='confirmar_venta_online(text,jsonb)' THEN
  body := f.prosrc;
 ELSE
 body := regexp_replace(f.prosrc,'(?im)^(\s*begin)[ \t]*$',E'\\1\n IF NOT private.is_admin() THEN RAISE EXCEPTION ''Acceso administrativo no autorizado'' USING ERRCODE = ''42501''; END IF;');
 END IF;
 IF (body=f.prosrc AND r.signature<>'confirmar_venta_online(text,jsonb)') OR strpos(f.definition,f.prosrc)=0 THEN RAISE EXCEPTION 'Cannot generate: %',r.signature; END IF;
 IF r.signature='apply_physical_count(uuid)' THEN
  IF regexp_count(body,'(?im)^[ \t]*if \(auth\.jwt\(\)->>''email''\) is distinct from [^\n]+end if;[ \t]*$')<>1 THEN RAISE EXCEPTION 'Legacy check not uniquely identified'; END IF;
  body := regexp_replace(body,'(?im)^[ \t]*if \(auth\.jwt\(\)->>''email''\) is distinct from [^\n]+end if;[ \t]*$','');
 END IF;
 -- Qualify only audited relation references, not CREATE TEMP TABLE names.
 body := regexp_replace(body,'(?i)(\m(?:FROM|INTO|JOIN)[ \t]+)(tmp_sale_items|tmp_repair_items|tmp_reentry_items|tmp_online_sale_items)\M','\1pg_temp.\2','g');
 ddl := replace(f.definition,f.prosrc,body);
 -- The two dedicated purchase/payment candidates supersede generic output.
 IF r.signature NOT IN ('apply_physical_count(uuid)','create_physical_count(text,text,text,text)','registrar_abono_reserva(bigint,numeric,text,text,text)') THEN
  ddl := regexp_replace(ddl,'(?im)^ SET search_path TO [^\n]+\n','');
  ddl := replace(ddl,'AS $function$',E'SET search_path TO pg_catalog, public, pg_temp\nAS $function$');
  IF strpos(ddl,'SET search_path TO pg_catalog, public, pg_temp')=0 THEN RAISE EXCEPTION 'Cannot pin search path: %',r.signature; END IF;
 END IF;
 INSERT INTO rpc_review_candidates VALUES(r.signature,f.definition,ddl);
END LOOP;
END $review$;
SELECT signature,original_ddl,candidate_ddl FROM rpc_review_candidates ORDER BY signature;
-- No candidate executed. Review exact diffs before granting.
ROLLBACK;
