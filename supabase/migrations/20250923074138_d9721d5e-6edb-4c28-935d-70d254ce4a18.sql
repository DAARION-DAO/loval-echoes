-- Fix the foreign key constraint issue in user_approval_requests
-- The issue is that the foreign key references auth.users, but we should reference profiles instead

-- First, let's check if there are any existing approval requests that might be causing issues
DELETE FROM user_approval_requests WHERE user_id NOT IN (SELECT user_id FROM profiles);

-- Drop the existing foreign key constraint if it exists
ALTER TABLE user_approval_requests DROP CONSTRAINT IF EXISTS fk_user_approval_requests_user_id;

-- Add the correct foreign key constraint referencing profiles
ALTER TABLE user_approval_requests 
ADD CONSTRAINT fk_user_approval_requests_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Update the trigger function to handle the foreign key correctly
CREATE OR REPLACE FUNCTION public.create_approval_request_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  existing_users_count integer;
BEGIN
  -- Count existing approved users
  SELECT COUNT(*) INTO existing_users_count
  FROM public.profiles
  WHERE approval_status = 'approved';
  
  -- If there are existing users, create approval request after profile is created
  IF existing_users_count > 0 THEN
    -- Insert the approval request (this will happen after the profile is created)
    INSERT INTO public.user_approval_requests (user_id, total_existing_users)
    VALUES (NEW.user_id, existing_users_count)
    ON CONFLICT (user_id) DO NOTHING; -- Prevent duplicate requests
    
    -- Set new user as pending
    NEW.approval_status = 'pending';
  ELSE
    -- First user or no existing users, auto-approve
    NEW.approval_status = 'approved';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add unique constraint to prevent duplicate approval requests
ALTER TABLE user_approval_requests 
ADD CONSTRAINT unique_user_approval_request 
UNIQUE (user_id);

-- Create a more robust security audit function
CREATE OR REPLACE FUNCTION public.enhanced_log_security_event(
  p_user_id uuid, 
  p_event_type text, 
  p_event_data jsonb DEFAULT '{}'::jsonb, 
  p_ip_address inet DEFAULT NULL::inet, 
  p_user_agent text DEFAULT NULL::text,
  p_severity text DEFAULT 'info'
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Create rate limiting table for security
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL, -- IP address or user ID
  action text NOT NULL, -- login, signup, file_upload, etc.
  attempts integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(identifier, action)
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can access rate limits
CREATE POLICY "System only access to rate limits" ON public.rate_limits
FOR ALL USING (false);

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_action text,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_attempts integer;
  window_start_time timestamp with time zone;
  is_blocked boolean;
BEGIN
  -- Check if currently blocked
  SELECT blocked_until > now() INTO is_blocked
  FROM rate_limits
  WHERE identifier = p_identifier AND action = p_action;
  
  IF is_blocked THEN
    RETURN false;
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
      THEN now() + (p_window_minutes || ' minutes')::interval
      ELSE NULL
    END
  RETURNING attempts INTO current_attempts;
  
  -- Return true if under limit
  RETURN current_attempts <= p_max_attempts;
END;
$function$;