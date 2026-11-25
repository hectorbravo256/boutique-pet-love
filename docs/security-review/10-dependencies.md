# Administrative dependency matrix — review draft
Not a complete call graph. Based on prior source audit and schema inventory; verify exact callers before migration.

| Module | Database / API dependencies | Acceptance |
|---|---|---|
| Public catalog / SEO | categories, products, product_variants, product_images, public Storage, sitemap, google-shopping | active rows and variant prices/images available |
| Checkout | product_variants, coupons, PAKET settings/exceptions, create-preference | server coupon validation before revoking public coupon access |
| Success | coupon counter, local order state | remove public mutation; verified payment only |
| Online sales | webhook, confirmar_venta_online, orders, inventory_movements | server-only RPC; verify credentials and payment |
| Dashboard / reports | seven vw_* views, get-orders | admin-only data; non-admin view leakage tests |
| Sales | orders, get-orders, update-order, registrar_venta_externa (both), registrar_venta_presencial, registrar_cambio_venta, marcar_pago_cambio | token verification; authorized state transitions |
| Purchases | purchases, purchase_details, guardar_compra_completa, registrar_compra, suppliers | preserve transaction and numbering |
| Reservations | reservations, reservation_items, reservation_payments, crear_reserva, registrar_abono_reserva, convertir_reserva_a_venta | preserve stock/abonos and conversion |
| Repairs | inventory_repairs, inventory_repair_items, registrar_reparacion, registrar_reingreso_reparacion | preserve sequence and stock |
| Physical count | physical_count_sessions/items, create_physical_count, apply_physical_count | admin AND existing owner/state checks |
| PAKET | shipping_expenses, settings/exceptions, marcar_reembolso_paket, marcar_reembolsos_paket_masivos | public calendar, private financial data |
| Inventory / labels | inventory_movements, product_variants, inventory views | preserve SKU/barcode, no public costs |
| Product/category admin | products, categories, variants, images, Storage | authorized CRUD and upsert |

## Release blockers
- Review full RPC bodies, exact signatures, internal calls and trigger ownership; add admin guards before granting authenticated EXECUTE.
- Narrow table DML grants (especially orders, movements, purchases, PAKET); audit column ACLs and default ACLs.
- Restrict admin views even where underlying catalog is public.
- Verify Netlify credential scopes, auth settings and all endpoint consumers.
- Integrate transaction, bootstrap approved admin UUID in clone, generate exact inverse SQL from actual backup, run fixture and HTTP tests.
- No production changes or real sales. Existing drafts individually roll back and are not an executable migration chain.
