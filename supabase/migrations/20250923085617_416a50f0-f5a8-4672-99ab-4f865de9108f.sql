-- Fix the get_conversation_participant_profiles function and recreate the RLS policy
DROP FUNCTION IF EXISTS public.get_conversation_participant_profiles(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.get_conversation_participant_profiles(requesting_user_id uuid)
RETURNS TABLE(user_id uuid)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT cp2.user_id
  FROM conversation_participants cp1
  JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = requesting_user_id;
END;
$$;

-- Recreate the RLS policy that was dropped
DROP POLICY IF EXISTS "Users can view their own profile and conversation participants" ON public.profiles;

CREATE POLICY "Users can view their own profile and conversation participants" 
ON public.profiles 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (user_id IN (SELECT get_conversation_participant_profiles.user_id FROM get_conversation_participant_profiles(auth.uid())))
);