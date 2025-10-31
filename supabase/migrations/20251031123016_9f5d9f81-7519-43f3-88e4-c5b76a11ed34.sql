-- Пересоздаем функцию уведомлений с правильным названием колонки
CREATE OR REPLACE FUNCTION public.notify_users_about_news()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Пересоздаем триггер (на всякий случай)
DROP TRIGGER IF EXISTS on_news_feed_insert ON public.news_feed;
CREATE TRIGGER on_news_feed_insert
  AFTER INSERT ON public.news_feed
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_users_about_news();