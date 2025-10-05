-- Таблица для уведомлений
CREATE TABLE IF NOT EXISTS public.task_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.kanban_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deadline_reminder', 'no_assignee', 'needs_review', 'overdue', 'status_change')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Таблица для телеметрии задач
CREATE TABLE IF NOT EXISTS public.task_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID,
  task_id UUID,
  project_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_task_notifications_user_id ON public.task_notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_task_notifications_created_at ON public.task_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_telemetry_event_type ON public.task_telemetry(event_type);
CREATE INDEX IF NOT EXISTS idx_task_telemetry_created_at ON public.task_telemetry(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_due_date ON public.kanban_cards(due_date) WHERE due_date IS NOT NULL;

-- RLS для уведомлений
ALTER TABLE public.task_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
  ON public.task_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
  ON public.task_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS для телеметрии
ALTER TABLE public.task_telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create telemetry"
  ON public.task_telemetry FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all telemetry"
  ON public.task_telemetry FOR SELECT
  USING (is_admin(auth.uid()));

-- Функция для создания уведомления
CREATE OR REPLACE FUNCTION public.create_task_notification(
  p_task_id UUID,
  p_user_id UUID,
  p_type TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.task_notifications (task_id, user_id, type, message, metadata)
  VALUES (p_task_id, p_user_id, p_type, p_message, p_metadata)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Функция для логирования телеметрии
CREATE OR REPLACE FUNCTION public.log_task_event(
  p_event_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_task_id UUID DEFAULT NULL,
  p_project_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.task_telemetry (event_type, user_id, task_id, project_id, metadata)
  VALUES (p_event_type, p_user_id, p_task_id, p_project_id, p_metadata)
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Включить realtime для уведомлений
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_notifications;