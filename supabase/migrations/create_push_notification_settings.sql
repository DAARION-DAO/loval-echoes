-- Створення таблиці для налаштувань push-сповіщень
CREATE TABLE IF NOT EXISTS public.push_notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  news_enabled BOOLEAN DEFAULT true,
  chat_notifications TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS політики
ALTER TABLE public.push_notification_settings ENABLE ROW LEVEL SECURITY;

-- Користувачі можуть читати тільки свої налаштування
CREATE POLICY "Users can view their own push settings"
  ON public.push_notification_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Користувачі можуть створювати тільки свої налаштування
CREATE POLICY "Users can create their own push settings"
  ON public.push_notification_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Користувачі можуть оновлювати тільки свої налаштування
CREATE POLICY "Users can update their own push settings"
  ON public.push_notification_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Користувачі можуть видаляти тільки свої налаштування
CREATE POLICY "Users can delete their own push settings"
  ON public.push_notification_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_push_settings_user_id ON public.push_notification_settings(user_id);

-- Функція для автоматичного оновлення updated_at
CREATE OR REPLACE FUNCTION update_push_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригер для автоматичного оновлення updated_at
CREATE TRIGGER update_push_notification_settings_updated_at
  BEFORE UPDATE ON public.push_notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_push_notification_settings_updated_at();

