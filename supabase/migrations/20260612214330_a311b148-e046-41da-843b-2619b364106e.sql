
-- 1. Drop old broad UPDATE policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own safe profile fields" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- 2. Restrict column-level UPDATE for authenticated role
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (display_name, avatar_url, news_push_enabled) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 3. Own-row UPDATE policy (safe fields only — enforced by column GRANT above)
CREATE POLICY "Users can update own safe profile fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Admin-only RPC for changing approval_status
CREATE OR REPLACE FUNCTION public.admin_set_approval_status(
  p_user_id uuid,
  p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Потрібна авторизація';
  END IF;
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Недостатньо прав';
  END IF;
  IF p_status NOT IN ('approved', 'pending', 'rejected') THEN
    RAISE EXCEPTION 'Невалідний статус';
  END IF;
  UPDATE public.profiles
  SET approval_status = p_status, updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_approval_status(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_approval_status(uuid, text) TO authenticated;
