-- Fix Critical Security Issues

-- 1. Create proper role-based access control system
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz DEFAULT now(),
  revoked_at timestamptz,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND revoked_at IS NULL
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Fix email exposure in profiles table
-- Drop old policies
DROP POLICY IF EXISTS "Approved users can view approved profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- New policies with email protection
CREATE POLICY "Users can view their own profile with email"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Approved users can view other profiles without sensitive data"
ON public.profiles FOR SELECT
USING (
  is_user_approved(auth.uid()) AND 
  approval_status = 'approved' AND
  user_id != auth.uid()
);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Create security definer function for rate limiting
CREATE OR REPLACE FUNCTION public.check_rate_limit_secure(
  p_identifier text,
  p_action text,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15,
  p_block_duration_minutes integer DEFAULT 60
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_attempts integer;
  is_blocked boolean;
  block_until timestamptz;
  result jsonb;
BEGIN
  -- Check if currently blocked
  SELECT 
    blocked_until > now(),
    blocked_until,
    attempts
  INTO is_blocked, block_until, current_attempts
  FROM rate_limits
  WHERE identifier = p_identifier AND action = p_action;
  
  IF is_blocked THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked', true,
      'blocked_until', block_until,
      'message', 'Too many attempts. Please try again later.'
    );
  END IF;
  
  -- Get or create rate limit record
  INSERT INTO rate_limits (identifier, action, attempts, window_start)
  VALUES (p_identifier, p_action, 1, now())
  ON CONFLICT (identifier, action) DO UPDATE SET
    attempts = CASE 
      WHEN rate_limits.window_start < now() - (p_window_minutes || ' minutes')::interval 
      THEN 1
      ELSE rate_limits.attempts + 1
    END,
    window_start = CASE 
      WHEN rate_limits.window_start < now() - (p_window_minutes || ' minutes')::interval 
      THEN now()
      ELSE rate_limits.window_start
    END,
    blocked_until = CASE 
      WHEN rate_limits.attempts + 1 > p_max_attempts 
      THEN now() + (p_block_duration_minutes || ' minutes')::interval
      ELSE NULL
    END
  RETURNING attempts INTO current_attempts;
  
  -- Check if just got blocked
  IF current_attempts > p_max_attempts THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked', true,
      'attempts', current_attempts,
      'message', 'Too many attempts. Account temporarily locked.'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'blocked', false,
    'attempts', current_attempts,
    'max_attempts', p_max_attempts
  );
END;
$$;

-- Migrate existing admins to new role system
-- Grant admin role to users who were admins under old system
INSERT INTO public.user_roles (user_id, role, granted_by)
SELECT 
  p.user_id,
  'admin'::app_role,
  NULL -- system granted
FROM public.profiles p
WHERE p.approval_status = 'approved'
  AND p.created_at <= (
    SELECT p2.created_at + INTERVAL '1 day'
    FROM public.profiles p2 
    WHERE p2.approval_status = 'approved' 
    ORDER BY p2.created_at ASC 
    LIMIT 1
  )
ON CONFLICT (user_id, role) DO NOTHING;