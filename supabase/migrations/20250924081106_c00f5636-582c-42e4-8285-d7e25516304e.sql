-- Fix infinite recursion in RLS policies by creating security definer functions
-- and updating the policies to be non-recursive

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Approved users can view all approved profiles" ON public.profiles;
DROP POLICY IF EXISTS "Moderators can view all profiles" ON public.profiles;

-- Create security definer functions that bypass RLS
CREATE OR REPLACE FUNCTION public.get_user_approval_status(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT approval_status 
  FROM public.profiles 
  WHERE profiles.user_id = get_user_approval_status.user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_user_approved(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE profiles.user_id = is_user_approved.user_id 
    AND approval_status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_user_admin_simple(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = is_user_admin_simple.user_id 
    AND p.approval_status = 'approved'
    AND p.created_at <= (
      SELECT p2.created_at + INTERVAL '1 day'
      FROM public.profiles p2 
      WHERE p2.approval_status = 'approved' 
      ORDER BY p2.created_at ASC 
      LIMIT 1
    )
  );
$$;

-- Create new simple, non-recursive RLS policies
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING ((auth.uid() = user_id) OR public.is_user_admin_simple(auth.uid()));

CREATE POLICY "Approved users can view approved profiles"
ON public.profiles
FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  (public.is_user_approved(auth.uid()) AND approval_status = 'approved') OR
  public.is_user_admin_simple(auth.uid())
);

-- Update the is_moderator function to use security definer
CREATE OR REPLACE FUNCTION public.is_moderator(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = is_moderator.user_id 
    AND p.approval_status = 'approved'
  );
$$;

-- Update the is_admin function to use the new simple version
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_user_admin_simple(user_id);
$$;