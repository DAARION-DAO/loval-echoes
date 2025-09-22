-- Create user approval system tables
CREATE TABLE IF NOT EXISTS public.user_approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  requested_at timestamp with time zone DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by text[] DEFAULT '{}',
  rejected_by text[] DEFAULT '{}',
  total_existing_users integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.user_approval_requests(id) ON DELETE CASCADE,
  approver_id uuid NOT NULL,
  decision text NOT NULL CHECK (decision IN ('approve', 'reject')),
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Add approval_status to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Update existing users to be approved
UPDATE public.profiles SET approval_status = 'approved' WHERE approval_status = 'pending';

-- Enable RLS
ALTER TABLE public.user_approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_approvals ENABLE ROW LEVEL SECURITY;

-- RLS policies for approval requests
CREATE POLICY "Users can view all approval requests"
ON public.user_approval_requests
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can manage approval requests"
ON public.user_approval_requests
FOR ALL
USING (auth.uid() IS NOT NULL);

-- RLS policies for approvals
CREATE POLICY "Users can view all approvals"
ON public.user_approvals
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create their own approvals"
ON public.user_approvals
FOR INSERT
WITH CHECK (auth.uid() = approver_id);

-- Create triggers for updated_at
CREATE TRIGGER update_user_approval_requests_updated_at
  BEFORE UPDATE ON public.user_approval_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create approval request for new users
CREATE OR REPLACE FUNCTION public.create_approval_request_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_users_count integer;
BEGIN
  -- Count existing approved users
  SELECT COUNT(*) INTO existing_users_count
  FROM public.profiles
  WHERE approval_status = 'approved';
  
  -- If there are existing users, create approval request
  IF existing_users_count > 0 THEN
    INSERT INTO public.user_approval_requests (user_id, total_existing_users)
    VALUES (NEW.user_id, existing_users_count);
    
    -- Set new user as pending
    NEW.approval_status = 'pending';
  ELSE
    -- First user or no existing users, auto-approve
    NEW.approval_status = 'approved';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to create approval request for new users
CREATE TRIGGER on_new_user_profile_created
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_approval_request_for_new_user();