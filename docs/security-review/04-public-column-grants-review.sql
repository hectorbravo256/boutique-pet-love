-- REVIEW ONLY. Requires explicit public projections and isolated tests.
-- Apply after table policies in same reviewed transaction; not standalone.
BEGIN;
-- Remove table-wide anonymous SELECT before granting columns.
REVOKE SELECT ON public.product_variants,public.paket_shipping_settings,public.paket_shipping_exceptions FROM anon;
GRANT SELECT (id,product_id,size,price,stock) ON public.product_variants TO anon;
GRANT SELECT (id,enabled,timezone,cutoff,pickup_weekdays,preparation_days) ON public.paket_shipping_settings TO anon;
GRANT SELECT (date,reason) ON public.paket_shipping_exceptions TO anon;
-- Authenticated table-wide SELECT is needed by existing admin clients, but also
-- exposes these columns on public rows to nonadmin authenticated users.
-- Resolve via separate guarded admin API/RPC or public projection architecture.
-- No claim of complete column isolation until that design is implemented.
-- Existing column ACLs must be inspected and explicitly revoked if present.
-- Product and category fields currently remain readable under active-row RLS.
-- Product.jsx, Category.jsx and Checkout.jsx wildcard queries must be narrowed first.
ROLLBACK;
