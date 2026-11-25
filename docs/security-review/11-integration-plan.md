# Integration plan — review only
No runnable integrated migration yet. Existing scripts independently BEGIN/ROLLBACK; concatenation would discard prerequisites. Do not remove rollback statements manually.
1. Provision dedicated local clone with synthetic fixtures, no production credentials, payment keys or customer data. Verify connection target independently; run 00-isolation-preflight.sql in the same connection and transaction as future migration. A database name/session marker is not an identity guarantee; use local socket or loopback with no forwarding.
2. Capture metadata and schema-only backup; rehearse restore. Keep originals containing personal identifiers outside Git.
3. Resolve exact administrator bootstrap UUID for synthetic auth user. Install private authorization objects.
4. Finalize RPC candidates and reviewed hashes; qualify temporary references including online confirmation; audit unqualified relations and search_path (pg_catalog, public, pg_temp where required; retain empty path where possible). Check temp collisions and repeated calls. Preserve trigger semantics. Do not grant on textual marker alone.
5. Apply restrictive policies, column grants, sequence/default ACL and invoker views after dependency review. Resolve public coupon flow and authenticated Netlify endpoints before release.
6. Install reviewed RPC definitions and exact grants atomically; online confirmation service-only. Test anon, nonadmin, admin and server roles; exercise commercial fixtures and storage.
7. Generate exact inverse from original metadata, test restoration. No reset of live sequence values.
8. First rehearsal must rollback. Any committed isolated rehearsal needs separate authorization. Production remains prohibited.
Blockers: actual clone not provisioned; full function diffs and search_path not validated; existing table draft overbroad admin DML; view filtering, default ACL, endpoint changes and executable inverse pending. No SQL applied.
