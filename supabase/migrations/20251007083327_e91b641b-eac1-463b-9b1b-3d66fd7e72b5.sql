-- Create news notifications table
CREATE TABLE IF NOT EXISTS public.news_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  news_id UUID NOT NULL REFERENCES public.news_feed(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their news notifications"
ON public.news_notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their news notifications"
ON public.news_notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_news_notifications_user_id ON public.news_notifications(user_id);
CREATE INDEX idx_news_notifications_read ON public.news_notifications(user_id, read);

-- Function to create notifications for all users with push enabled
CREATE OR REPLACE FUNCTION public.notify_users_about_news()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  author_name TEXT;
BEGIN
  -- Only notify for human messages (not agent responses)
  IF NEW.is_agent = FALSE THEN
    -- Get author name
    SELECT display_name INTO author_name
    FROM profiles
    WHERE user_id = NEW.author_id;
    
    -- Create notifications for all users with push enabled (except author)
    FOR user_record IN 
      SELECT user_id 
      FROM profiles 
      WHERE news_push_enabled = TRUE 
      AND user_id != COALESCE(NEW.author_id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND approval_status = 'approved'
    LOOP
      INSERT INTO public.news_notifications (user_id, news_id, message)
      VALUES (
        user_record.user_id,
        NEW.id,
        CONCAT('📢 ', COALESCE(author_name, 'Пользователь'), ': ', LEFT(NEW.text, 100))
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_news_feed_insert ON public.news_feed;
CREATE TRIGGER on_news_feed_insert
  AFTER INSERT ON public.news_feed
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_users_about_news();

-- Enable realtime for news_notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.news_notifications;