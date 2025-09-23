-- Create function to check if user is moderator (approved user)
CREATE OR REPLACE FUNCTION public.is_moderator(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = is_moderator.user_id 
    AND p.approval_status = 'approved'
  );
$$;

-- Update RLS policy for profiles to allow moderators to update approval_status
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  is_moderator(auth.uid())
);

-- Update the approval logic function
CREATE OR REPLACE FUNCTION public.calculate_required_approvals()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN (SELECT COUNT(*) FROM profiles WHERE approval_status = 'approved') >= 3 THEN 3
    WHEN (SELECT COUNT(*) FROM profiles WHERE approval_status = 'approved') = 2 THEN 2
    WHEN (SELECT COUNT(*) FROM profiles WHERE approval_status = 'approved') = 1 THEN 1
    ELSE 0
  END;
$$;

-- Update the create_approval_request_for_new_user function
CREATE OR REPLACE FUNCTION public.create_approval_request_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  approved_users_count integer;
BEGIN
  -- Count existing approved users
  SELECT COUNT(*) INTO approved_users_count
  FROM public.profiles
  WHERE approval_status = 'approved';
  
  -- Auto-approve first user
  IF approved_users_count = 0 THEN
    NEW.approval_status = 'approved';
  ELSE
    -- All other users need approval
    NEW.approval_status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$;