-- Створення таблиці для зберігання інтеграцій користувачів
CREATE TABLE IF NOT EXISTS public.user_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('telegram', 'whatsapp', 'email', 'calendar', 'slack', 'discord')),
  enabled BOOLEAN DEFAULT false,
  connected BOOLEAN DEFAULT false,
  config JSONB,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, type)
);

-- RLS політики
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;

-- Користувачі можуть читати тільки свої інтеграції
CREATE POLICY "Users can view their own integrations"
  ON public.user_integrations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Користувачі можуть створювати тільки свої інтеграції
CREATE POLICY "Users can create their own integrations"
  ON public.user_integrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Користувачі можуть оновлювати тільки свої інтеграції
CREATE POLICY "Users can update their own integrations"
  ON public.user_integrations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Користувачі можуть видаляти тільки свої інтеграції
CREATE POLICY "Users can delete their own integrations"
  ON public.user_integrations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Індекс для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_user_integrations_user_id ON public.user_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_integrations_type ON public.user_integrations(type);
CREATE INDEX IF NOT EXISTS idx_user_integrations_enabled ON public.user_integrations(enabled) WHERE enabled = true;

-- Функція для автоматичного оновлення updated_at
CREATE OR REPLACE FUNCTION update_user_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригер для автоматичного оновлення updated_at
CREATE TRIGGER update_user_integrations_updated_at
  BEFORE UPDATE ON public.user_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_user_integrations_updated_at();

