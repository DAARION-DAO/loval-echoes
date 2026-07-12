
CREATE OR REPLACE FUNCTION public.grant_admin_role(p_user_id uuid, p_granted_by uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'cannot self-grant admin' USING ERRCODE = '42501';
  END IF;
  INSERT INTO public.user_roles (user_id, role, granted_by)
  VALUES (p_user_id, 'admin', COALESCE(p_granted_by, auth.uid()))
  ON CONFLICT (user_id, role) DO UPDATE SET revoked_at = NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.revoke_admin_role(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;
  UPDATE public.user_roles SET revoked_at = now()
  WHERE user_id = p_user_id AND role = 'admin' AND revoked_at IS NULL;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.grant_admin_role(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.revoke_admin_role(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_admin_role(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.revoke_admin_role(uuid) TO service_role;
