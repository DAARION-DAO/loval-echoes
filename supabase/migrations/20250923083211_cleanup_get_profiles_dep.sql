-- Injected helper to drop dependent policy before get_conversation_participant_profiles(uuid) function is dropped in 20250923083212
DROP POLICY IF EXISTS "Users can view their own profile and conversation participants" ON public.profiles;
