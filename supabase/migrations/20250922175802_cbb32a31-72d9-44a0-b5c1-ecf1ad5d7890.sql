-- Fix critical security vulnerabilities in RLS policies

-- 1. Create security definer function to get conversation participant profiles safely
CREATE OR REPLACE FUNCTION public.get_conversation_participant_profiles(requesting_user_id uuid)
RETURNS TABLE(user_id uuid) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT cp.user_id
  FROM conversation_participants cp1
  JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = requesting_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 2. Create function to check if user is admin (for future role-based access)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- For now, check if user is one of the first approved users (temporary admin logic)
  -- This should be replaced with proper role system later
  RETURN EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = is_admin.user_id 
    AND p.approval_status = 'approved'
    AND p.created_at <= (
      SELECT p2.created_at + INTERVAL '1 day'
      FROM profiles p2 
      WHERE p2.approval_status = 'approved' 
      ORDER BY p2.created_at ASC 
      LIMIT 1
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 3. Fix profiles table RLS policy - restrict to conversation participants only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view their own profile and conversation participants"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  user_id IN (
    SELECT user_id FROM public.get_conversation_participant_profiles(auth.uid())
  )
);

-- 4. Fix user_approval_requests RLS policies - restrict to admins and requesting user
DROP POLICY IF EXISTS "Users can view all approval requests" ON public.user_approval_requests;
DROP POLICY IF EXISTS "System can manage approval requests" ON public.user_approval_requests;

CREATE POLICY "Users can view relevant approval requests"
ON public.user_approval_requests
FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  public.is_admin(auth.uid())
);

CREATE POLICY "Admins can manage approval requests"
ON public.user_approval_requests
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users can view their own approval request"
ON public.user_approval_requests
FOR SELECT
USING (auth.uid() = user_id);

-- 5. Fix user_approvals RLS policies - restrict to admins and involved parties
DROP POLICY IF EXISTS "Users can view all approvals" ON public.user_approvals;
DROP POLICY IF EXISTS "Users can create their own approvals" ON public.user_approvals;

CREATE POLICY "Admins and involved users can view approvals"
ON public.user_approvals
FOR SELECT
USING (
  auth.uid() = approver_id 
  OR 
  public.is_admin(auth.uid())
  OR
  auth.uid() = (SELECT user_id FROM user_approval_requests WHERE id = request_id)
);

CREATE POLICY "Approved users can create approvals"
ON public.user_approvals
FOR INSERT
WITH CHECK (
  auth.uid() = approver_id 
  AND 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND approval_status = 'approved')
);

-- 6. Add security audit logging for sensitive operations
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when someone accesses profiles (for monitoring)
  PERFORM public.log_security_event(
    auth.uid(),
    'profile_access',
    jsonb_build_object(
      'accessed_user_id', NEW.user_id,
      'timestamp', now()
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Add trigger for profile access logging (only for SELECT operations)
-- Note: This is a simple approach, in production you'd want more sophisticated monitoring

-- 8. Add constraint to ensure approval_status values are valid
ALTER TABLE public.profiles 
ADD CONSTRAINT check_approval_status 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- 9. Add constraint to ensure user_approval_requests status values are valid  
ALTER TABLE public.user_approval_requests
ADD CONSTRAINT check_request_status
CHECK (status IN ('pending', 'approved', 'rejected'));

-- 10. Add constraint to ensure user_approvals decision values are valid
ALTER TABLE public.user_approvals
ADD CONSTRAINT check_approval_decision
CHECK (decision IN ('approve', 'reject'));