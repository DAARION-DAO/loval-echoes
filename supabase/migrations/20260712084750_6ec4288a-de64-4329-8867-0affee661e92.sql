-- 1) Fix mutable search_path on update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 2) Revoke EXECUTE from PUBLIC and anon on every SECURITY DEFINER function in public.
--    Authenticated users retain access; individual functions still perform their
--    own server-side authorization checks (e.g. has_role) internally.
DO $$
DECLARE
  r RECORD;
  sig TEXT;
BEGIN
  FOR r IN
    SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND NOT EXISTS (
        SELECT 1
        FROM pg_depend d
        JOIN pg_extension e ON e.oid = d.refobjid
        WHERE d.objid = p.oid AND d.deptype = 'e'
      )
  LOOP
    sig := format('public.%I(%s)', r.proname, r.args);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', sig);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', sig);
  END LOOP;
END $$;