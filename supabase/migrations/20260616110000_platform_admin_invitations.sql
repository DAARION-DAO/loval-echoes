-- Create platform admin invites table
CREATE TABLE IF NOT EXISTS public.platform_admin_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  invited_role text NOT NULL DEFAULT 'guardian',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  invite_token text UNIQUE NOT NULL,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_admin_invites ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security Policy for Guardians
CREATE POLICY "Platform guardians can manage all admin invites"
  ON public.platform_admin_invites
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'guardian'
    )
  );

-- RPC to create invite
CREATE OR REPLACE FUNCTION public.admin_create_platform_admin_invite(
  invited_email text,
  invited_role text
)
RETURNS TABLE (
  invite_id uuid,
  invite_token text
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_caller_role text;
  v_token text;
  v_invite_id uuid;
BEGIN
  -- Security check: caller must be a platform guardian
  SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
  IF v_caller_role IS DISTINCT FROM 'guardian' THEN
    RAISE EXCEPTION 'Unauthorized: guardian role required';
  END IF;

  -- Role check: only allow 'guardian' for MVP
  IF invited_role IS DISTINCT FROM 'guardian' THEN
    RAISE EXCEPTION 'Invalid role: only guardian is supported';
  END IF;

  -- Generate token
  v_token := md5(random()::text) || md5(random()::text);
  v_invite_id := gen_random_uuid();

  -- Insert invite
  INSERT INTO public.platform_admin_invites (
    id,
    email,
    invited_role,
    status,
    invite_token,
    invited_by,
    expires_at
  ) VALUES (
    v_invite_id,
    lower(invited_email),
    invited_role,
    'pending',
    v_token,
    auth.uid(),
    now() + interval '7 days'
  );

  RETURN QUERY SELECT v_invite_id, v_token;
END;
$$;

-- RPC to revoke invite
CREATE OR REPLACE FUNCTION public.admin_revoke_platform_admin_invite(
  invite_id uuid
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_caller_role text;
BEGIN
  SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
  IF v_caller_role IS DISTINCT FROM 'guardian' THEN
    RAISE EXCEPTION 'Unauthorized: guardian role required';
  END IF;

  UPDATE public.platform_admin_invites
  SET 
    status = 'revoked',
    revoked_at = now(),
    updated_at = now()
  WHERE id = invite_id AND status = 'pending';
END;
$$;

-- RPC to accept invite
CREATE OR REPLACE FUNCTION public.accept_platform_admin_invite(
  p_invite_token text
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_invite_id uuid;
  v_invite_email text;
  v_invited_role text;
  v_user_email text;
BEGIN
  -- Get user email from JWT
  v_user_email := lower(auth.jwt() ->> 'email');
  
  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Find and lock invite
  SELECT id, email, invited_role INTO v_invite_id, v_invite_email, v_invited_role
  FROM public.platform_admin_invites
  WHERE invite_token = p_invite_token
    AND status = 'pending'
    AND expires_at > now()
  FOR UPDATE;

  IF v_invite_id IS NULL THEN
    RAISE EXCEPTION 'Invalid, expired, or already accepted invitation';
  END IF;

  -- Check email match
  IF v_invite_email != v_user_email THEN
    RAISE EXCEPTION 'Unauthorized: invite email does not match authenticated user email';
  END IF;

  -- Update user profile
  UPDATE public.profiles
  SET
    role = v_invited_role,
    access_tier = v_invited_role,
    approval_status = 'approved',
    updated_at = now()
  WHERE id = auth.uid();

  -- Mark invite as accepted
  UPDATE public.platform_admin_invites
  SET
    status = 'accepted',
    accepted_at = now(),
    accepted_by = auth.uid(),
    updated_at = now()
  WHERE id = v_invite_id;
END;
$$;
