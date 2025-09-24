-- Fix RLS policy for profiles table to allow approved users to see all approved profiles
-- Drop the restrictive policy that only allows conversation participants
DROP POLICY IF EXISTS "Users can view their own profile and conversation participants" ON public.profiles;

-- Create new policies that allow approved users to see all approved profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Approved users can view all approved profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- Current user must be approved
  (SELECT approval_status FROM public.profiles WHERE user_id = auth.uid()) = 'approved'
  AND 
  -- Can view approved profiles
  approval_status = 'approved'
);

CREATE POLICY "Moderators can view all profiles"
ON public.profiles
FOR SELECT
USING (is_moderator(auth.uid()));