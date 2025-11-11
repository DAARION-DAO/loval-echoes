-- Додаємо scope до таблиці conversations
ALTER TABLE public.conversations 
  ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'community' CHECK (scope IN ('community', 'project', 'personal'));

-- Оновлюємо існуючі чати - за замовчуванням всі community
UPDATE public.conversations 
SET scope = 'community'
WHERE scope IS NULL;

-- Додаємо індекс для scope
CREATE INDEX IF NOT EXISTS idx_conversations_scope ON public.conversations(scope);

-- Оновлюємо RLS політики для conversations (якщо потрібно)
-- За замовчуванням користувачі можуть читати community та project чати, де вони учасники
-- Приватні чати (scope = 'personal') доступні тільки власнику

