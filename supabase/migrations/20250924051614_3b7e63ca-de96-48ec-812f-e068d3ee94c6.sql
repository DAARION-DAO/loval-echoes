-- Fix security definer view issue by removing the problematic view and creating proper RLS policies
DROP VIEW IF EXISTS approval_inconsistencies;

-- Create a table for approval inconsistencies instead of a view to allow proper RLS
CREATE TABLE IF NOT EXISTS approval_inconsistencies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(user_id),
  display_name text,
  profile_status text,
  request_status text,
  approved_by text[],
  rejected_by text[],
  approval_count integer,
  rejection_count integer,
  required_approvals integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE approval_inconsistencies ENABLE ROW LEVEL SECURITY;

-- Create admin-only policy for approval_inconsistencies
CREATE POLICY "Only admins can access approval inconsistencies" 
ON approval_inconsistencies 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create function to populate inconsistencies table (without SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.detect_approval_inconsistencies()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER -- Use SECURITY INVOKER instead of DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clear existing inconsistencies
  DELETE FROM approval_inconsistencies WHERE created_at < now() - interval '1 hour';
  
  -- Insert current inconsistencies
  INSERT INTO approval_inconsistencies (
    user_id, display_name, profile_status, request_status, 
    approved_by, rejected_by, approval_count, rejection_count, required_approvals
  )
  SELECT 
    p.user_id,
    p.display_name,
    p.approval_status,
    uar.status,
    uar.approved_by,
    uar.rejected_by,
    array_length(uar.approved_by, 1),
    array_length(uar.rejected_by, 1),
    calculate_required_approvals()
  FROM profiles p
  JOIN user_approval_requests uar ON p.user_id = uar.user_id
  WHERE (
    (uar.status = 'approved' AND p.approval_status <> 'approved') OR
    (uar.status = 'rejected' AND p.approval_status <> 'rejected') OR
    (uar.status = 'pending' AND array_length(uar.approved_by, 1) >= calculate_required_approvals()) OR
    (uar.status = 'pending' AND array_length(uar.rejected_by, 1) >= calculate_required_approvals())
  );
END;
$$;