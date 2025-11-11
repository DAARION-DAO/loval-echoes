-- Додаємо scope до таблиці user_integrations
ALTER TABLE public.user_integrations 
  ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'personal' CHECK (scope IN ('team', 'personal'));

-- Оновлюємо UNIQUE constraint для включення scope
ALTER TABLE public.user_integrations 
  DROP CONSTRAINT IF EXISTS user_integrations_user_id_type_key;

ALTER TABLE public.user_integrations 
  ADD CONSTRAINT user_integrations_user_id_type_scope_key UNIQUE(user_id, type, scope);

-- Оновлюємо CHECK constraint для type, додаючи нові інтеграції
ALTER TABLE public.user_integrations 
  DROP CONSTRAINT IF EXISTS user_integrations_type_check;

ALTER TABLE public.user_integrations 
  ADD CONSTRAINT user_integrations_type_check 
  CHECK (type IN (
    'telegram', 'whatsapp', 'email', 'calendar', 'slack', 'discord',
    'google_drive', 'google_docs', 'chatgpt', 'deepseek'
  ));

-- Додаємо індекс для scope
CREATE INDEX IF NOT EXISTS idx_user_integrations_scope ON public.user_integrations(scope);

-- Оновлюємо RLS політики для підтримки командних інтеграцій
-- Користувачі можуть читати свої інтеграції та командні інтеграції
DROP POLICY IF EXISTS "Users can view their own integrations" ON public.user_integrations;
CREATE POLICY "Users can view their own and team integrations"
  ON public.user_integrations
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    (scope = 'team' AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND approval_status = 'approved'
    ))
  );

-- Оновлюємо політику для створення
DROP POLICY IF EXISTS "Users can create their own integrations" ON public.user_integrations;
CREATE POLICY "Users can create integrations"
  ON public.user_integrations
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    (scope = 'personal' OR 
     (scope = 'team' AND EXISTS (
       SELECT 1 FROM public.profiles 
       WHERE user_id = auth.uid() 
       AND approval_status = 'approved'
     )))
  );

-- Оновлюємо політику для оновлення
DROP POLICY IF EXISTS "Users can update their own integrations" ON public.user_integrations;
CREATE POLICY "Users can update their own integrations"
  ON public.user_integrations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Оновлюємо політику для видалення
DROP POLICY IF EXISTS "Users can delete their own integrations" ON public.user_integrations;
CREATE POLICY "Users can delete their own integrations"
  ON public.user_integrations
  FOR DELETE
  USING (auth.uid() = user_id);

