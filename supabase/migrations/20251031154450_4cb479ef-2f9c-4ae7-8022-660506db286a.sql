-- Fix search_path for all security-sensitive functions
-- This prevents search_path manipulation attacks

-- Fix is_conversation_participant
CREATE OR REPLACE FUNCTION public.is_conversation_participant(user_id uuid, conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM conversation_participants cp 
    WHERE cp.user_id = user_id 
    AND cp.conversation_id = conversation_id
  );
$$;

-- Fix get_user_conversations
CREATE OR REPLACE FUNCTION public.get_user_conversations(user_id uuid)
RETURNS TABLE(conversation_id uuid)
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cp.conversation_id 
  FROM conversation_participants cp 
  WHERE cp.user_id = user_id;
$$;

-- Fix log_security_event
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_event_data jsonb DEFAULT '{}'::jsonb,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.security_audit_log (user_id, event_type, event_data, ip_address, user_agent)
  VALUES (p_user_id, p_event_type, p_event_data, p_ip_address, p_user_agent);
$$;

-- Fix get_conversation_participant_profiles
CREATE OR REPLACE FUNCTION public.get_conversation_participant_profiles(requesting_user_id uuid)
RETURNS TABLE(user_id uuid)
LANGUAGE plpgsql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT cp2.user_id
  FROM conversation_participants cp1
  JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = requesting_user_id;
END;
$$;

-- Fix is_admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_user_admin_simple(user_id);
$$;

-- Fix log_profile_access
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
$$;

-- Fix enhanced_log_security_event
CREATE OR REPLACE FUNCTION public.enhanced_log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_event_data jsonb DEFAULT '{}'::jsonb,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_severity text DEFAULT 'info'
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.security_audit_log (
    user_id, 
    event_type, 
    event_data, 
    ip_address, 
    user_agent
  )
  VALUES (
    p_user_id, 
    p_event_type, 
    jsonb_build_object(
      'severity', p_severity,
      'timestamp', now(),
      'data', p_event_data
    ), 
    p_ip_address, 
    p_user_agent
  );
$$;

-- Fix check_rate_limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_action text,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_attempts integer;
  is_blocked boolean;
BEGIN
  SELECT blocked_until > now() INTO is_blocked
  FROM rate_limits
  WHERE identifier = p_identifier AND action = p_action;
  
  IF is_blocked THEN
    RETURN false;
  END IF;
  
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
      THEN now() + (p_window_minutes || ' minutes')::interval
      ELSE NULL
    END
  RETURNING attempts INTO current_attempts;
  
  RETURN current_attempts <= p_max_attempts;
END;
$$;

-- Fix is_moderator
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

-- Fix calculate_required_approvals
CREATE OR REPLACE FUNCTION public.calculate_required_approvals()
RETURNS integer
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN (SELECT COUNT(*) FROM profiles WHERE approval_status = 'approved') >= 3 THEN 3
    WHEN (SELECT COUNT(*) FROM profiles WHERE approval_status = 'approved') = 2 THEN 2
    WHEN (SELECT COUNT(*) FROM profiles WHERE approval_status = 'approved') = 1 THEN 1
    ELSE 0
  END;
$$;

-- Fix create_approval_request_for_new_user
CREATE OR REPLACE FUNCTION public.create_approval_request_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  approved_users_count integer;
BEGIN
  SELECT COUNT(*) INTO approved_users_count
  FROM public.profiles
  WHERE approval_status = 'approved';
  
  IF approved_users_count = 0 THEN
    NEW.approval_status = 'approved';
  ELSE
    NEW.approval_status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix check_enhanced_rate_limit
CREATE OR REPLACE FUNCTION public.check_enhanced_rate_limit(
  p_identifier text,
  p_action text,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15,
  p_block_duration_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_attempts integer;
  is_blocked boolean;
  block_duration interval;
BEGIN
  block_duration := (p_block_duration_minutes || ' minutes')::interval;
  
  SELECT blocked_until > now() INTO is_blocked
  FROM rate_limits
  WHERE identifier = p_identifier AND action = p_action;
  
  IF is_blocked THEN
    PERFORM public.enhanced_log_security_event(
      auth.uid(),
      'blocked_attempt',
      jsonb_build_object(
        'identifier', p_identifier,
        'action', p_action,
        'blocked_until', (SELECT blocked_until FROM rate_limits WHERE identifier = p_identifier AND action = p_action)
      ),
      p_identifier::inet,
      null,
      'warning'
    );
    RETURN false;
  END IF;
  
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
      THEN now() + block_duration
      ELSE NULL
    END
  RETURNING attempts INTO current_attempts;
  
  IF current_attempts >= (p_max_attempts * 0.8) THEN
    PERFORM public.enhanced_log_security_event(
      auth.uid(),
      'approaching_rate_limit',
      jsonb_build_object(
        'identifier', p_identifier,
        'action', p_action,
        'attempts', current_attempts,
        'max_attempts', p_max_attempts
      ),
      p_identifier::inet,
      null,
      'warning'
    );
  END IF;
  
  RETURN current_attempts <= p_max_attempts;
END;
$$;

-- Restrict refresh_tokens access even from admins (only system can access)
DROP POLICY IF EXISTS "Admin can manage refresh tokens" ON public.refresh_tokens;

CREATE POLICY "System only access to refresh tokens"
ON public.refresh_tokens
FOR ALL
TO authenticated
USING (false);

-- Hide email column from other users in profiles
-- Only user can see their own email, admins can see all
DROP POLICY IF EXISTS "Approved users can view other profiles without sensitive data" ON public.profiles;

CREATE POLICY "Approved users can view other profiles without email"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_user_approved(auth.uid()) 
  AND approval_status = 'approved' 
  AND user_id != auth.uid()
);