-- Injected chat tables definition to satisfy dependencies of subsequent migrations
-- Alter conversations table first to add missing columns expected by subsequent migrations
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS is_group_chat BOOLEAN DEFAULT false;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE,
  role TEXT DEFAULT 'member',
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sender_name TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  file_url TEXT,
  message_type TEXT,
  transcription TEXT,
  voice_duration DOUBLE PRECISION
);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' AND policyname = 'Anyone can view messages'
  ) THEN
    CREATE POLICY "Anyone can view messages" ON public.messages FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' AND policyname = 'Anyone can update messages'
  ) THEN
    CREATE POLICY "Anyone can update messages" ON public.messages FOR UPDATE USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' AND policyname = 'Anyone can insert messages'
  ) THEN
    CREATE POLICY "Anyone can insert messages" ON public.messages FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'conversation_participants' AND policyname = 'Anyone can view participants'
  ) THEN
    CREATE POLICY "Anyone can view participants" ON public.conversation_participants FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'conversation_participants' AND policyname = 'Anyone can join conversations'
  ) THEN
    CREATE POLICY "Anyone can join conversations" ON public.conversation_participants FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'conversation_participants' AND policyname = 'Anyone can update participants'
  ) THEN
    CREATE POLICY "Anyone can update participants" ON public.conversation_participants FOR UPDATE USING (true);
  END IF;
END
$$;

-- Pre-emptively drop this policy to avoid duplicate key error in 20250921133720_6c7069ae-8fbd-4c78-9edd-1b6420f0630b.sql
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
