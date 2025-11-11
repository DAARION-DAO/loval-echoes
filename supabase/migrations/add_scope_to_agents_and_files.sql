-- Додаємо scope до таблиці agents
ALTER TABLE public.agents 
  ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'personal' CHECK (scope IN ('community', 'personal'));

-- Оновлюємо owner_user_id - може бути NULL для спільних агентів
ALTER TABLE public.agents 
  ALTER COLUMN owner_user_id DROP NOT NULL;

-- Створюємо спільного агента для всієї команди (якщо його ще немає)
INSERT INTO public.agents (
  id,
  name,
  description,
  owner_user_id,
  connection_type,
  status,
  is_preset,
  scope,
  created_at
)
SELECT 
  gen_random_uuid(),
  'ЖОС - Спільний агент',
  'Спільний AI агент для всієї команди. Допомагає з повідомленнями, задачами та проєктами.',
  NULL,
  'msp',
  'active',
  true,
  'community',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.agents 
  WHERE scope = 'community' AND is_preset = true
);

-- Оновлюємо RLS політики для agents
DROP POLICY IF EXISTS "Users can view agents" ON public.agents;
CREATE POLICY "Users can view community and own personal agents"
  ON public.agents
  FOR SELECT
  USING (
    scope = 'community' OR 
    (scope = 'personal' AND owner_user_id = auth.uid())
  );

-- Додаємо scope до таблиці files (якщо ще немає)
ALTER TABLE public.files 
  ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'community' CHECK (scope IN ('community', 'project', 'personal'));

-- Оновлюємо існуючі файли - якщо project_id є, то scope = 'project', інакше 'community'
UPDATE public.files 
SET scope = CASE 
  WHEN project_id IS NOT NULL THEN 'project'
  ELSE 'community'
END
WHERE scope IS NULL OR scope = 'community';

-- Оновлюємо RLS політики для files
-- Користувачі можуть читати спільні файли, файли проєктів де вони учасники, та свої особисті
DROP POLICY IF EXISTS "Users can view files" ON public.files;
CREATE POLICY "Users can view files by scope"
  ON public.files
  FOR SELECT
  USING (
    scope = 'community' OR
    (scope = 'project' AND project_id IN (
      SELECT project_id FROM public.project_members 
      WHERE user_id = auth.uid()
    )) OR
    (scope = 'personal' AND uploaded_by = auth.uid())
  );

-- Оновлюємо політику для створення файлів
DROP POLICY IF EXISTS "Users can create files" ON public.files;
CREATE POLICY "Users can create files"
  ON public.files
  FOR INSERT
  WITH CHECK (
    (scope = 'community' AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND approval_status = 'approved'
    )) OR
    (scope = 'project' AND project_id IN (
      SELECT project_id FROM public.project_members 
      WHERE user_id = auth.uid()
    )) OR
    (scope = 'personal' AND uploaded_by = auth.uid())
  );

-- Оновлюємо політику для оновлення файлів
DROP POLICY IF EXISTS "Users can update files" ON public.files;
CREATE POLICY "Users can update files"
  ON public.files
  FOR UPDATE
  USING (
    (scope = 'community' AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND approval_status = 'approved'
    )) OR
    (scope = 'project' AND project_id IN (
      SELECT project_id FROM public.project_members 
      WHERE user_id = auth.uid()
    )) OR
    (scope = 'personal' AND uploaded_by = auth.uid())
  )
  WITH CHECK (
    (scope = 'community' AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND approval_status = 'approved'
    )) OR
    (scope = 'project' AND project_id IN (
      SELECT project_id FROM public.project_members 
      WHERE user_id = auth.uid()
    )) OR
    (scope = 'personal' AND uploaded_by = auth.uid())
  );

-- Додаємо індекси
CREATE INDEX IF NOT EXISTS idx_agents_scope ON public.agents(scope);
CREATE INDEX IF NOT EXISTS idx_agents_owner_scope ON public.agents(owner_user_id, scope);
CREATE INDEX IF NOT EXISTS idx_files_scope ON public.files(scope);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by_scope ON public.files(uploaded_by, scope) WHERE scope = 'personal';

