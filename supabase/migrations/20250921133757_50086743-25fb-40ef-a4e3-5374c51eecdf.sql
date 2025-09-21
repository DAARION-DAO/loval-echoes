-- CRITICAL SECURITY FIX: Replace overly permissive RLS policies with participant-based access control

-- First, create security definer functions to prevent RLS recursion issues
CREATE OR REPLACE FUNCTION public.is_conversation_participant(user_id uuid, conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM conversation_participants cp 
    WHERE cp.user_id = user_id 
    AND cp.conversation_id = conversation_id
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_conversations(user_id uuid)
RETURNS TABLE(conversation_id uuid)
LANGUAGE sql
STABLE  
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cp.conversation_id 
  FROM conversation_participants cp 
  WHERE cp.user_id = user_id;
$$;

-- DROP ALL existing policies for messages table
DROP POLICY IF EXISTS "Anyone can view messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can update messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can create messages" ON public.messages;

-- DROP ALL existing policies for conversations table  
DROP POLICY IF EXISTS "Anyone can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;

-- DROP ALL existing policies for conversation_participants table
DROP POLICY IF EXISTS "Anyone can view participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON public.conversation_participants;
DROP POLICY IF EXISTS "Authenticated users can join conversations" ON public.conversation_participants;

-- CREATE secure RLS policies for MESSAGES table
CREATE POLICY "Users can view messages in their conversations" 
ON public.messages 
FOR SELECT 
USING (public.is_conversation_participant(auth.uid(), conversation_id));

CREATE POLICY "Users can create messages in their conversations" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.is_conversation_participant(auth.uid(), conversation_id)
);

CREATE POLICY "Users can update messages in their conversations" 
ON public.messages 
FOR UPDATE 
USING (public.is_conversation_participant(auth.uid(), conversation_id));

-- CREATE secure RLS policies for CONVERSATIONS table
CREATE POLICY "Users can view their conversations" 
ON public.conversations 
FOR SELECT 
USING (public.is_conversation_participant(auth.uid(), id));

CREATE POLICY "Users can update their conversations" 
ON public.conversations 
FOR UPDATE 
USING (public.is_conversation_participant(auth.uid(), id));

CREATE POLICY "Authenticated users can create new conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- CREATE secure RLS policies for CONVERSATION_PARTICIPANTS table
CREATE POLICY "Users can view participants in their conversations" 
ON public.conversation_participants 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR public.is_conversation_participant(auth.uid(), conversation_id)
);

CREATE POLICY "Users can join new conversations" 
ON public.conversation_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation" 
ON public.conversation_participants 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add indexes for performance on security checks
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_conversation 
ON public.conversation_participants(user_id, conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
ON public.messages(conversation_id);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_conversation_participant(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_conversations(uuid) TO authenticated;