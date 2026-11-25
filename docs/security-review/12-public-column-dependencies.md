# Public column review
Read-only schema inspection and branch source review.
- product_variants public: id, product_id, size, price, stock. Internal: min_stock, sku, barcode. Exact stock retained for current cart quantity validation; future availability API may minimize it.
- categories: all 10 existing fields support catalog/SEO or identifiers; review future fields.
- products: 20 existing fields; public catalog/SEO/collection fields; seo_keywords not necessarily needed, defer restriction until exact consumers audited.
- product_images: all four fields are catalog identifiers/image ordering.
- PAKET settings: id, enabled, timezone, cutoff, pickup_weekdays, preparation_days; exclude updated_at. Exceptions: date, reason; exclude created_at. Review whether reason contains internal notes before public exposure.
- Product.jsx and Category.jsx request nested product_variants (*); Checkout.jsx requests settings (*). These are blockers to column grants. Category also requests products/categories/images wildcard.
- Gender.jsx, Collection.jsx, Layout.jsx, Google Shopping, product/category Edge HTML and sitemap already use explicit projections. App.jsx has explicit select, full field dependency review pending.
- Google Shopping and ProductGroup generate identifiers from variant id, not internal SKU/barcode.
- Authenticated role is shared by admin and nonadmin; RLS controls rows, not columns. Anonymous grants alone cannot hide internal fields from nonadmin authenticated users on active rows. Need separate guarded admin data path or public projection design.
No app changes or SQL execution. Verify actual column ACLs, full consumers and API behavior before applying.
