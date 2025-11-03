-- Fix: Extension in Public (SUPA_extension_in_public)
-- Move pg_trgm extension from public schema to extensions schema
DROP EXTENSION IF EXISTS pg_trgm CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- Fix: Function Search Path Mutable (SUPA_function_search_path_mutable)
-- Add search_path to functions that are missing it

-- Fix notify_users_about_news function (SECURITY DEFINER - critical)
CREATE OR REPLACE FUNCTION public.notify_users_about_news()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  user_record RECORD;
  notification_text TEXT;
BEGIN
  -- Формируем текст уведомления
  IF NEW.is_agent THEN
    notification_text := '🤖 ЖОС: ' || LEFT(NEW.text, 100);
  ELSE
    notification_text := '📢 Новость: ' || LEFT(NEW.text, 100);
  END IF;
  
  IF LENGTH(NEW.text) > 100 THEN
    notification_text := notification_text || '...';
  END IF;
  
  -- Создаем уведомления для всех пользователей с включенными push-уведомлениями (кроме автора)
  FOR user_record IN 
    SELECT user_id 
    FROM public.profiles 
    WHERE news_push_enabled = true 
    AND (NEW.author_id IS NULL OR user_id != NEW.author_id)
  LOOP
    INSERT INTO public.news_notifications (user_id, news_id, message)
    VALUES (
      user_record.user_id,
      NEW.id,
      notification_text
    );
  END LOOP;
  
  RETURN NEW;
END;
$function$;

-- Fix update_file_updated_at function (trigger function)
CREATE OR REPLACE FUNCTION public.update_file_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_push_subscriptions_updated_at function (trigger function)
CREATE OR REPLACE FUNCTION public.update_push_subscriptions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;