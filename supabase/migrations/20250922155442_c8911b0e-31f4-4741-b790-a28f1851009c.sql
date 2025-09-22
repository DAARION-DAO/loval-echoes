-- Fix RLS policy for conversations to allow authenticated users to create new conversations
-- The current policy creates a circular dependency: user must be participant to create, 
-- but can't be participant until conversation exists

DROP POLICY IF EXISTS "Authenticated users can create new conversations" ON public.conversations;

CREATE POLICY "Authenticated users can create new conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Also ensure the conversation_participants table has proper policies
-- Check if the INSERT policy exists and is correct
DROP POLICY IF EXISTS "Users can join new conversations" ON public.conversation_participants;

CREATE POLICY "Users can join new conversations" 
ON public.conversation_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);