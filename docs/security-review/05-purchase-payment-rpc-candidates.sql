-- REVIEW ONLY: isolated clone, after private.is_admin and original fingerprint checks.
BEGIN;
DO $$ BEGIN
 IF md5((SELECT prosrc FROM pg_proc WHERE oid='public.registrar_compra(text,text,text)'::regprocedure)) IS DISTINCT FROM 'a81b951c1ed7d1f10d2a22e91751f57f' OR md5((SELECT prosrc FROM pg_proc WHERE oid='public.registrar_abono_reserva(bigint,numeric,text,text,text)'::regprocedure)) IS DISTINCT FROM 'd0b045d147576708c72f88129ff66866' THEN RAISE EXCEPTION 'Original RPC changed'; END IF;
END $$;
CREATE OR REPLACE FUNCTION public.registrar_abono_reserva(p_reservation_id bigint, p_monto numeric, p_medio_pago text, p_observacion text DEFAULT NULL::text, p_created_by text DEFAULT NULL::text)
 RETURNS TABLE(reserva_id bigint, numero_reserva bigint, total numeric, total_abonado numeric, saldo_pendiente numeric, estado text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_reserva public.reservations%rowtype;
  v_monto numeric(12,2) := round(coalesce(p_monto, 0), 2);
  v_medio text := lower(trim(coalesce(p_medio_pago, '')));
  v_nuevo_abonado numeric(12,2);
  v_nuevo_estado text;
begin
  IF NOT private.is_admin() THEN RAISE EXCEPTION 'Acceso administrativo no autorizado' USING ERRCODE='42501'; END IF;
  if (select auth.uid()) is null then
    raise exception 'No autorizado. Debes iniciar sesión para registrar un abono.';
  end if;

  if p_reservation_id is null then
    raise exception 'Debes indicar la reserva.';
  end if;

  if v_monto <= 0 then
    raise exception 'El monto del abono debe ser mayor que cero.';
  end if;

  if v_medio not in ('efectivo','debito','transferencia','mercado_pago') then
    raise exception 'Medio de pago inválido.';
  end if;

  select * into v_reserva
  from public.reservations
  where id = p_reservation_id
  for update;

  if not found then
    raise exception 'La reserva % no existe.', p_reservation_id;
  end if;

  if v_reserva.estado in ('convertida','cancelada') then
    raise exception 'No se puede registrar un abono en una reserva con estado %.', v_reserva.estado;
  end if;

  if v_monto > coalesce(v_reserva.saldo_pendiente, 0) then
    raise exception 'El abono de $% supera el saldo pendiente de $%.', v_monto, coalesce(v_reserva.saldo_pendiente, 0);
  end if;

  v_nuevo_abonado := round(coalesce(v_reserva.total_abonado, 0) + v_monto, 2);

  if round(coalesce(v_reserva.total, 0) - v_nuevo_abonado, 2) <= 0 then
    v_nuevo_estado := 'pagada';
  else
    v_nuevo_estado := 'abono_parcial';
  end if;

  insert into public.reservation_payments (reservation_id, monto, medio_pago, observacion, created_by)
  values (p_reservation_id, v_monto, v_medio, nullif(trim(p_observacion), ''), (select auth.uid())::text);

  update public.reservations
  set total_abonado = v_nuevo_abonado,
      medio_pago_abono = v_medio,
      estado = v_nuevo_estado,
      updated_at = now()
  where id = p_reservation_id;

  return query
  select r.id, r.numero_reserva, r.total, r.total_abonado, r.saldo_pendiente, r.estado
  from public.reservations r
  where r.id = p_reservation_id;
end;
$function$;
CREATE OR REPLACE FUNCTION public.registrar_compra(p_supplier text, p_invoice text, p_observations text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare

    v_purchase_id uuid;

begin
  IF NOT private.is_admin() THEN RAISE EXCEPTION 'Acceso administrativo no autorizado' USING ERRCODE='42501'; END IF;
    insert into public.purchases (

        supplier,
        invoice_number,
        observations

    )

    values (

        p_supplier,
        p_invoice,
        p_observations

    )

    returning id

    into v_purchase_id;

    return v_purchase_id;

end;

$function$;
REVOKE ALL ON FUNCTION public.registrar_compra(text,text,text),public.registrar_abono_reserva(bigint,numeric,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.registrar_compra(text,text,text),public.registrar_abono_reserva(bigint,numeric,text,text,text) TO authenticated;
-- Candidate only: verify callers and audit display before removing direct grants.
ROLLBACK;
