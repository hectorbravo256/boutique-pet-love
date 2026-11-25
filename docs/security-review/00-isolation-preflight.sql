-- REVIEW ONLY: fail-closed preflight for a future local isolated clone.
-- Not a production migration. Run through psql with ON_ERROR_STOP.
-- A separately provisioned local database named bpl_security_review is required.
-- This guard is defense in depth, not proof of project identity.
DO $guard$
BEGIN
 IF current_database() <> 'bpl_security_review' THEN
  RAISE EXCEPTION 'Security review requires dedicated local database';
 END IF;
 IF inet_server_addr() IS NOT NULL AND inet_server_addr() NOT IN ('127.0.0.1'::inet,'::1'::inet) THEN
  RAISE EXCEPTION 'Remote database forbidden';
 END IF;
 IF current_setting('bpl.security_review',true) IS DISTINCT FROM 'isolated-fixtures-only' THEN
  RAISE EXCEPTION 'Explicit isolated review marker required';
 END IF;
 IF current_user <> 'postgres' THEN RAISE EXCEPTION 'Unexpected migration role'; END IF;
END $guard$;
