-- Fix the get_conversation_participant_profiles function to resolve the missing FROM-clause error
DROP FUNCTION IF EXISTS public.get_conversation_participant_profiles(uuid);

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