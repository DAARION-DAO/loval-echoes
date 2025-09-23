-- Fix Critical Security Issues
-- Phase 1: Enable RLS on approval_inconsistencies table and create proper policies

-- Check if approval_inconsistencies is a view or table
DO $$
BEGIN
  -- If it's a view, we can't enable RLS directly
  -- If it's a table, enable RLS and add policies
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'approval_inconsistencies'
    AND table_type = 'BASE TABLE'
  ) THEN
    -- Enable RLS on approval_inconsistencies table
    ALTER TABLE public.approval_inconsistencies ENABLE ROW LEVEL SECURITY;
    
    -- Create admin-only access policy
    CREATE POLICY "Only admins can access approval inconsistencies" 
    ON public.approval_inconsistencies 
    FOR ALL 
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
    
    RAISE NOTICE 'RLS enabled on approval_inconsistencies table';
  ELSE
    RAISE NOTICE 'approval_inconsistencies appears to be a view, not a table';
  END IF;
END $$;

-- Improve rate limiting function security
-- Add more granular rate limits for different actions
CREATE OR REPLACE FUNCTION public.check_enhanced_rate_limit(
  p_identifier text, 
  p_action text, 
  p_max_attempts integer DEFAULT 5, 
  p_window_minutes integer DEFAULT 15,
  p_block_duration_minutes integer DEFAULT 60
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_attempts integer;
  window_start_time timestamp with time zone;
  is_blocked boolean;
  block_duration interval;
BEGIN
  -- Calculate block duration
  block_duration := (p_block_duration_minutes || ' minutes')::interval;
  
  -- Check if currently blocked
  SELECT blocked_until > now() INTO is_blocked
  FROM rate_limits
  WHERE identifier = p_identifier AND action = p_action;
  
  IF is_blocked THEN
    -- Log blocked attempt
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
      THEN now() + block_duration
      ELSE NULL
    END
  RETURNING attempts INTO current_attempts;
  
  -- Log if approaching limit
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
  
  -- Return true if under limit
  RETURN current_attempts <= p_max_attempts;
END;
$$;

-- Create function to validate file uploads more securely
CREATE OR REPLACE FUNCTION public.validate_file_upload_security(
  p_file_name text,
  p_file_size bigint,
  p_file_type text,
  p_user_id uuid DEFAULT auth.uid()
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  dangerous_extensions text[] := ARRAY[
    '.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.js', '.jar',
    '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.sh', '.ps1', '.dll'
  ];
  ext text;
  sanitized_name text;
BEGIN
  -- Initialize result
  result := jsonb_build_object('valid', true, 'errors', '[]'::jsonb);
  
  -- Check file size (50MB limit)
  IF p_file_size > 52428800 THEN
    result := jsonb_set(result, '{valid}', 'false'::jsonb);
    result := jsonb_set(result, '{errors}', 
      (result->>'errors')::jsonb || jsonb_build_array('Файл слишком большой (максимум 50MB)'));
  END IF;
  
  -- Extract file extension
  ext := lower(substring(p_file_name from '\.([^.]*)$'));
  
  -- Check for dangerous extensions
  IF ('.' || ext) = ANY(dangerous_extensions) THEN
    result := jsonb_set(result, '{valid}', 'false'::jsonb);
    result := jsonb_set(result, '{errors}', 
      (result->>'errors')::jsonb || jsonb_build_array('Тип файла не разрешен из соображений безопасности'));
  END IF;
  
  -- Sanitize filename
  sanitized_name := regexp_replace(p_file_name, '[^a-zA-Z0-9._-]', '_', 'g');
  result := jsonb_set(result, '{sanitized_filename}', to_jsonb(sanitized_name));
  
  -- Log the validation attempt
  PERFORM public.enhanced_log_security_event(
    p_user_id,
    'file_upload_validation',
    jsonb_build_object(
      'original_filename', p_file_name,
      'sanitized_filename', sanitized_name,
      'file_size', p_file_size,
      'file_type', p_file_type,
      'validation_result', result->>'valid'
    ),
    null,
    null,
    CASE WHEN result->>'valid' = 'true' THEN 'info' ELSE 'warning' END
  );
  
  RETURN result;
END;
$$;