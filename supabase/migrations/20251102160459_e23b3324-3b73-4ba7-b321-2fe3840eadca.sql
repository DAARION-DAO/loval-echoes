-- Remove automatic admin grant based on registration time
-- This prevents privilege escalation via timestamp manipulation

-- Revoke all auto-granted admin roles (where granted_by is NULL)
DELETE FROM public.user_roles 
WHERE role = 'admin' 
AND granted_by IS NULL 
AND granted_at <= (
  SELECT MIN(p.created_at) + INTERVAL '1 day' 
  FROM public.profiles p
  WHERE p.approval_status = 'approved'
);

-- Create a secure admin assignment function that requires existing admin approval
CREATE OR REPLACE FUNCTION public.grant_admin_role(
  p_user_id UUID,
  p_granted_by UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only existing admins can grant admin role
  IF NOT public.has_role(p_granted_by, 'admin') THEN
    RAISE EXCEPTION 'Only admins can grant admin role';
  END IF;
  
  -- Insert the admin role with proper audit trail
  INSERT INTO public.user_roles (user_id, role, granted_by)
  VALUES (p_user_id, 'admin', p_granted_by)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log the security event
  PERFORM public.enhanced_log_security_event(
    p_granted_by,
    'admin_role_granted',
    jsonb_build_object(
      'target_user_id', p_user_id,
      'granted_by', p_granted_by,
      'timestamp', now()
    ),
    null,
    null,
    'info'
  );
END;
$$;

-- Create a function to revoke admin role
CREATE OR REPLACE FUNCTION public.revoke_admin_role(
  p_user_id UUID,
  p_revoked_by UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only existing admins can revoke admin role
  IF NOT public.has_role(p_revoked_by, 'admin') THEN
    RAISE EXCEPTION 'Only admins can revoke admin role';
  END IF;
  
  -- Prevent revoking own admin role
  IF p_user_id = p_revoked_by THEN
    RAISE EXCEPTION 'Cannot revoke own admin role';
  END IF;
  
  -- Update the role to mark as revoked
  UPDATE public.user_roles
  SET revoked_at = now()
  WHERE user_id = p_user_id 
  AND role = 'admin'
  AND revoked_at IS NULL;
  
  -- Log the security event
  PERFORM public.enhanced_log_security_event(
    p_revoked_by,
    'admin_role_revoked',
    jsonb_build_object(
      'target_user_id', p_user_id,
      'revoked_by', p_revoked_by,
      'timestamp', now()
    ),
    null,
    null,
    'warning'
  );
END;
$$;