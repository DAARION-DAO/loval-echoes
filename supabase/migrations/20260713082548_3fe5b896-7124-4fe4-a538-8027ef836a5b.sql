
-- Defense in depth against profiles_role_self_escalation.
-- Layer 1 (existing): BEFORE UPDATE trigger profiles_prevent_privileged_self_update
-- Layer 2 (new): column-level GRANTs so authenticated users cannot even attempt to write role / approval_status / email / identifiers.
-- Layer 3 (new): remove anon write privileges entirely.

-- 1. Anonymous users must never mutate profiles.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.profiles FROM anon;

-- 2. Remove any broad table-level UPDATE from authenticated, then re-grant only on safe columns.
REVOKE UPDATE ON public.profiles FROM authenticated;

GRANT UPDATE (
  display_name,
  avatar_url,
  news_push_enabled,
  wallet_address,
  wallet_verified_at,
  telegram_username,
  telegram_user_id,
  updated_at
) ON public.profiles TO authenticated;

-- 3. Service role keeps full access for legitimate admin paths.
GRANT ALL ON public.profiles TO service_role;

-- 4. Tighten the RLS UPDATE policy WITH CHECK to explicitly reject sensitive column drift,
--    matching the trigger for a clear, auditable policy surface.
DROP POLICY IF EXISTS "Users can update own safe profile fields" ON public.profiles;

CREATE POLICY "Users can update own safe profile fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  -- Sensitive fields cannot be changed by the row owner.
  -- Admin/server flows go through service_role or SECURITY DEFINER RPCs (admin_set_approval_status, grant_admin_role, etc.)
  AND role = (SELECT p.role FROM public.profiles p WHERE p.user_id = auth.uid())
  AND approval_status = (SELECT p.approval_status FROM public.profiles p WHERE p.user_id = auth.uid())
  AND email IS NOT DISTINCT FROM (SELECT p.email FROM public.profiles p WHERE p.user_id = auth.uid())
);
