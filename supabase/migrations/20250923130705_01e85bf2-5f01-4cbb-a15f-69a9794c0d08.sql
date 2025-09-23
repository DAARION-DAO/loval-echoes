-- Fix foreign key constraint issues and trigger order
-- First, let's add the missing foreign key constraint for user_approval_requests
ALTER TABLE user_approval_requests 
ADD CONSTRAINT fk_user_approval_requests_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Update the trigger function to ensure proper ordering
CREATE OR REPLACE FUNCTION public.create_approval_request_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  existing_users_count integer;
BEGIN
  -- Count existing approved users
  SELECT COUNT(*) INTO existing_users_count
  FROM public.profiles
  WHERE approval_status = 'approved';
  
  -- If there are existing users, create approval request (this will happen after profile creation)
  IF existing_users_count > 0 THEN
    -- The approval request will be created by a separate trigger after profile insertion
    NEW.approval_status = 'pending';
  ELSE
    -- First user or no existing users, auto-approve
    NEW.approval_status = 'approved';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create a separate trigger for approval requests that runs after profile creation
CREATE OR REPLACE FUNCTION public.create_approval_request_after_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  existing_users_count integer;
BEGIN
  -- Only create approval request if status is pending
  IF NEW.approval_status = 'pending' THEN
    -- Count existing approved users (excluding the new user)
    SELECT COUNT(*) INTO existing_users_count
    FROM public.profiles
    WHERE approval_status = 'approved' AND user_id != NEW.user_id;
    
    -- Insert the approval request after profile is created
    INSERT INTO public.user_approval_requests (user_id, total_existing_users)
    VALUES (NEW.user_id, existing_users_count)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists and create new ones
DROP TRIGGER IF EXISTS create_approval_request_trigger ON public.profiles;
DROP TRIGGER IF EXISTS create_approval_request_after_trigger ON public.profiles;

-- Create triggers with proper order
CREATE TRIGGER create_approval_request_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_approval_request_for_new_user();

CREATE TRIGGER create_approval_request_after_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_approval_request_after_profile();