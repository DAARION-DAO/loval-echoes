-- Create proper foreign key constraint for user_approval_requests
-- This will fix the relationship error in queries

-- First drop existing foreign key if exists
ALTER TABLE public.user_approval_requests
DROP CONSTRAINT IF EXISTS user_approval_requests_user_id_fkey;

-- Create new foreign key constraint  
ALTER TABLE public.user_approval_requests
ADD CONSTRAINT user_approval_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;