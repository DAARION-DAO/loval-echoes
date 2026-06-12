-- Injected helper to restore profiles table policy after function was recreated in 20250923083212
CREATE POLICY "Users can view their own profile and conversation participants"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  user_id IN (
    SELECT user_id FROM public.get_conversation_participant_profiles(auth.uid())
  )
);
