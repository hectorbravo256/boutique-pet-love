-- REVIEW ONLY. Local isolated rehearsal, after 04-table-policies in same transaction.
-- Not standalone migration; remaining consumers must be audited.
BEGIN;
-- Financial history: reads through admin RLS; mutations through guarded RPC/server.
REVOKE INSERT,UPDATE,DELETE,TRUNCATE ON public.orders,public.purchases,public.purchase_details,public.inventory_movements,public.sale_exchanges,public.inventory_repairs,public.inventory_repair_items FROM authenticated;
-- Reservation payment insertion is currently required by SECURITY INVOKER registrar_abono_reserva.
-- Keep INSERT provisionally; forbid direct edits/deletes of historical payments.
REVOKE UPDATE,DELETE,TRUNCATE ON public.reservation_payments FROM authenticated;
-- Reservation updates are currently required by invoker abono RPC. Do not revoke yet.
-- registrar_compra is SECURITY INVOKER: removing purchases INSERT above blocks this legacy RPC.
-- Resolve caller and choose guarded RPC design before integration.
-- Shipping expenses, suppliers, catalog, settings, coupons and reservation items:
-- retain previous draft until exact direct write callers and columns are verified.
-- Coupon public SELECT/UPDATE removal requires checkout/success redesign.
-- Column ACLs may independently grant privileges; inspect before integration.
SELECT table_name,privilege_type FROM information_schema.role_table_grants
WHERE table_schema='public' AND grantee='authenticated' ORDER BY table_name,privilege_type;
ROLLBACK;
