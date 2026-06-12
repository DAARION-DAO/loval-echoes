-- Migration: Simplify Auth by auto-approving all user profiles
-- Date: 2026-06-12

-- 1. Redefine the BEFORE INSERT trigger function to always set approval_status to 'approved'
CREATE OR REPLACE FUNCTION public.create_approval_request_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Set approval_status to 'approved' by default for all new profiles
  NEW.approval_status = 'approved';
  RETURN NEW;
END;
$$;

-- 2. Update all existing profiles currently in pending status to approved
UPDATE public.profiles
SET approval_status = 'approved'
WHERE approval_status = 'pending';

-- 3. Mark any pending approval requests as approved
UPDATE public.user_approval_requests
SET status = 'approved'
WHERE status = 'pending';
