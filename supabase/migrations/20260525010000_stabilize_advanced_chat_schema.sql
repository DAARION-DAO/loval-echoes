-- Drop the invalid RLS policy created by 20250923141017
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create the correct, secure RLS policy for public.profiles updates
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (
    (auth.uid() = user_id) OR is_moderator(auth.uid())
  );

-- Clean up the temporary dummy columns and types injected for compilation bypass
ALTER TABLE public.profiles DROP COLUMN IF EXISTS old;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS new;
DROP TYPE IF EXISTS dummy_approval_type;
