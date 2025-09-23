-- Fix security definer view issue - recreate the view without SECURITY DEFINER
DROP VIEW IF EXISTS public.approval_inconsistencies;

CREATE VIEW public.approval_inconsistencies AS
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