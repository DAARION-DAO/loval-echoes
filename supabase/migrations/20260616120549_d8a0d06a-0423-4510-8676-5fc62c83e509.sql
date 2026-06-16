
CREATE TABLE IF NOT EXISTS public.platform_admin_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  invited_role text NOT NULL DEFAULT 'guardian',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','revoked','expired')),
  invite_token text UNIQUE NOT NULL,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_admin_invites TO authenticated;
GRANT ALL ON public.platform_admin_invites TO service_role;

ALTER TABLE public.platform_admin_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform guardians can manage all admin invites"
  ON public.platform_admin_invites
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.admin_create_platform_admin_invite(
  invited_email text,
  invited_role text
)
RETURNS TABLE (invite_id uuid, invite_token text)
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
  v_token text;
  v_invite_id uuid;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: guardian role required';
  END IF;

  IF invited_role IS DISTINCT FROM 'guardian' THEN
    RAISE EXCEPTION 'Invalid role: only guardian is supported';
  END IF;

  v_token := encode(gen_random_bytes(32), 'hex');
  v_invite_id := gen_random_uuid();

  INSERT INTO public.platform_admin_invites (
    id, email, invited_role, status, invite_token, invited_by, expires_at
  ) VALUES (
    v_invite_id, lower(invited_email), invited_role, 'pending', v_token, auth.uid(), now() + interval '7 days'
  );

  RETURN QUERY SELECT v_invite_id, v_token;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_revoke_platform_admin_invite(invite_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: guardian role required';
  END IF;

  UPDATE public.platform_admin_invites
  SET status = 'revoked', revoked_at = now(), updated_at = now()
  WHERE id = invite_id AND status = 'pending';
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_platform_admin_invite(p_invite_token text)
RETURNS void
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
  v_invite_id uuid;
  v_invite_email text;
  v_invited_role text;
  v_user_email text;
BEGIN
  v_user_email := lower(auth.jwt() ->> 'email');

  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT id, email, invited_role
    INTO v_invite_id, v_invite_email, v_invited_role
  FROM public.platform_admin_invites
  WHERE invite_token = p_invite_token
    AND status = 'pending'
    AND expires_at > now()
  FOR UPDATE;

  IF v_invite_id IS NULL THEN
    RAISE EXCEPTION 'Invalid, expired, or already accepted invitation';
  END IF;

  IF v_invite_email <> v_user_email THEN
    RAISE EXCEPTION 'Unauthorized: invite email does not match authenticated user email';
  END IF;

  UPDATE public.profiles
  SET role = v_invited_role,
      access_tier = v_invited_role,
      approval_status = 'approved',
      updated_at = now()
  WHERE user_id = auth.uid();

  UPDATE public.platform_admin_invites
  SET status = 'accepted', accepted_at = now(), accepted_by = auth.uid(), updated_at = now()
  WHERE id = v_invite_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_create_platform_admin_invite(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_revoke_platform_admin_invite(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_platform_admin_invite(text) TO authenticated;
