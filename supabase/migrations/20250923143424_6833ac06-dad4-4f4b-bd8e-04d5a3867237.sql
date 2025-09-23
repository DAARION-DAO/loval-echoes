-- Step 1: Fix the "Key" user's profile status manually
-- Update profiles where the user has an approved request but profile is still pending
UPDATE profiles 
SET approval_status = 'approved', updated_at = now()
WHERE user_id IN (
  SELECT uar.user_id 
  FROM user_approval_requests uar 
  WHERE uar.status = 'approved' 
  AND uar.user_id IN (
    SELECT p.user_id 
    FROM profiles p 
    WHERE p.approval_status = 'pending'
  )
);

-- Step 2: Create function to detect and fix data inconsistencies
CREATE OR REPLACE FUNCTION public.fix_approval_inconsistencies()
RETURNS TABLE(fixed_user_id uuid, old_status text, new_status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  UPDATE profiles 
  SET approval_status = 'approved', updated_at = now()
  WHERE user_id IN (
    SELECT uar.user_id 
    FROM user_approval_requests uar 
    WHERE uar.status = 'approved' 
    AND uar.user_id IN (
      SELECT p.user_id 
      FROM profiles p 
      WHERE p.approval_status = 'pending'
    )
  )
  RETURNING user_id, 'pending'::text, 'approved'::text;
END;
$$;

-- Step 3: Create view to monitor data inconsistencies
CREATE OR REPLACE VIEW public.approval_inconsistencies AS
SELECT 
  p.user_id,
  p.display_name,
  p.approval_status as profile_status,
  uar.status as request_status,
  uar.approved_by,
  uar.rejected_by,
  array_length(uar.approved_by, 1) as approval_count,
  array_length(uar.rejected_by, 1) as rejection_count,
  calculate_required_approvals() as required_approvals
FROM profiles p
JOIN user_approval_requests uar ON p.user_id = uar.user_id
WHERE (
  -- Request is approved but profile is not
  (uar.status = 'approved' AND p.approval_status != 'approved') OR
  -- Request is rejected but profile is not  
  (uar.status = 'rejected' AND p.approval_status != 'rejected') OR
  -- Request is pending but has enough approvals
  (uar.status = 'pending' AND array_length(uar.approved_by, 1) >= calculate_required_approvals()) OR
  -- Request is pending but has enough rejections
  (uar.status = 'pending' AND array_length(uar.rejected_by, 1) >= calculate_required_approvals())
);