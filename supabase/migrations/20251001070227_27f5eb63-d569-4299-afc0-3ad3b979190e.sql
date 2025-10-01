-- Создаем таблицу для логирования действий с чатами
CREATE TABLE IF NOT EXISTS public.chat_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'archived', 'unarchived', 'deleted', 'restored')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Включаем RLS для таблицы логов
ALTER TABLE public.chat_action_logs ENABLE ROW LEVEL SECURITY;

-- Политика: администраторы и участники чата могут просматривать логи
CREATE POLICY "Users can view logs for their chats"
ON public.chat_action_logs
FOR SELECT
USING (
  is_conversation_participant(auth.uid(), chat_id) OR is_admin(auth.uid())
);

-- Политика: только аутентифицированные пользователи могут создавать логи
CREATE POLICY "Authenticated users can create logs"
ON public.chat_action_logs
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND 
  is_conversation_participant(auth.uid(), chat_id)
);

-- Создаем индекс для быстрого поиска по chat_id
CREATE INDEX IF NOT EXISTS idx_chat_action_logs_chat_id ON public.chat_action_logs(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_action_logs_user_id ON public.chat_action_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_action_logs_created_at ON public.chat_action_logs(created_at DESC);

-- Обновляем RLS политику для conversations: разрешаем обновление статуса
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;

CREATE POLICY "Users can update their conversations"
ON public.conversations
FOR UPDATE
USING (
  is_conversation_participant(auth.uid(), id)
)
WITH CHECK (
  is_conversation_participant(auth.uid(), id)
);

-- Создаем функцию для автоматического логирования изменений статуса
CREATE OR REPLACE FUNCTION public.log_chat_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Логируем только изменения статуса
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.chat_action_logs (chat_id, user_id, action, metadata)
    VALUES (
      NEW.id,
      auth.uid(),
      CASE 
        WHEN NEW.status = 'archived' THEN 'archived'
        WHEN NEW.status = 'active' AND OLD.status = 'archived' THEN 'unarchived'
        WHEN NEW.status = 'deleted' THEN 'deleted'
        WHEN NEW.status = 'active' AND OLD.status = 'deleted' THEN 'restored'
        ELSE 'updated'
      END,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'chat_name', NEW.name
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Создаем триггер для автоматического логирования
DROP TRIGGER IF EXISTS trigger_log_chat_status_change ON public.conversations;

CREATE TRIGGER trigger_log_chat_status_change
AFTER UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.log_chat_status_change();