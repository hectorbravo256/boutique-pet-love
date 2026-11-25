# Administrative views: review and acceptance
All seven definitions inspected read-only. Preserve calculations, columns and types. Candidate wraps original query with admin predicate outside aggregate, so unauthorized callers should receive zero rows rather than a misleading zero-valued dashboard row. security_invoker preserves underlying RLS; security_barrier adds protection but is not a substitute for authorization. Explicit admin ordering must be verified because wrapper does not guarantee original ORDER BY.
- vw_dashboard_alerts: low/out-of-stock alerts; compare priority/order.
- vw_dashboard_shipping: PAKET costs and reimbursements; compare all six metrics.
- vw_dashboard_summary: sales, purchases, inventory and ticket; depends on vw_inventory_value; compare all metrics including empty fixtures.
- vw_inventory_master: active products, image and stock status; compare rows.
- vw_inventory_value: last unit cost and stock valuation; compare rows.
- vw_reportes_ventas: paid orders and exchanges; compare additional payments and total collected.
- vw_variant_summary: last/average cost, supplier, purchase date; compare rows.
Install inventory value before dashboard summary; check nested invoker grants and sale_exchanges admin SELECT. Anon must receive permission denied; authenticated nonadmin must receive no rows (or permission denied if underlying grants restricted); admin must match baseline exactly. Test public catalog unaffected. Verify actual view column ACLs and future hidden-column changes; use guarded RPC instead if invoker dependencies become incompatible.
Fingerprint depends on deparse search_path; mismatch aborts, never bypass. No candidate executed. Existing 06-views-review.sql alone is insufficient; replace in integrated migration after validation.
