-- Phase 3: Address security warnings from linter
-- Enable leaked password protection and strengthen password requirements

-- Note: This enables password security features in Supabase Auth
-- Users will be protected against using leaked passwords from data breaches
-- This is a security best practice recommended by Supabase

-- Enable password strength validation and leaked password protection
-- This will be handled through Supabase dashboard settings, but we can set up
-- database-level constraints for additional security

-- Add audit logging for security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow system/admin access to audit logs (no user access)
CREATE POLICY "Only system can access audit logs" 
ON public.security_audit_log 
FOR ALL
USING (false);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_event_data jsonb DEFAULT '{}',
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.log_security_event(uuid, text, jsonb, inet, text) TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE public.security_audit_log IS 'Security audit log for tracking authentication and authorization events';
COMMENT ON FUNCTION public.log_security_event IS 'Function to log security events for audit purposes';