-- Добавляем поля для закрепления чатов и автогенерации названий
ALTER TABLE conversations 
ADD COLUMN is_pinned boolean DEFAULT false,
ADD COLUMN pinned_at timestamp with time zone,
ADD COLUMN auto_generated_name boolean DEFAULT false;

-- Добавляем мягкое удаление для сообщений
ALTER TABLE messages 
ADD COLUMN deleted_at timestamp with time zone,
ADD COLUMN deleted_by uuid REFERENCES auth.users(id);

-- Создаем таблицу реакций
CREATE TABLE message_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  emoji text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Включаем RLS для реакций
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Политики для реакций
CREATE POLICY "Users can view reactions in their conversations" 
ON message_reactions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM messages m 
    WHERE m.id = message_reactions.message_id 
    AND is_conversation_participant(auth.uid(), m.conversation_id)
  )
);

CREATE POLICY "Users can add reactions in their conversations" 
ON message_reactions FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM messages m 
    WHERE m.id = message_reactions.message_id 
    AND is_conversation_participant(auth.uid(), m.conversation_id)
  )
);

CREATE POLICY "Users can remove their own reactions" 
ON message_reactions FOR DELETE 
USING (auth.uid() = user_id);

-- Добавляем реалтайм для реакций
ALTER TABLE message_reactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;