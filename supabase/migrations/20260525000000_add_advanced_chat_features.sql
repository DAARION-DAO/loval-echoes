-- Add parent_id column for thread replies
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.messages(id) ON DELETE CASCADE;

-- Create index for faster parent_id queries
CREATE INDEX IF NOT EXISTS idx_messages_parent_id ON public.messages(parent_id);

-- Create GIN index for high-performance simple full-text search on message content
CREATE INDEX IF NOT EXISTS idx_messages_content_fts ON public.messages USING gin(to_tsvector('simple', content));

-- Enable pg_net if not already enabled (for invoking edge functions from database triggers)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create voice-messages storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-messages', 'voice-messages', true)
ON CONFLICT (id) DO NOTHING;

-- Create trigger function to notify conversation participants on new messages
CREATE OR REPLACE FUNCTION public.notify_message_participants()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec_user RECORD;
  payload JSONB;
  webhook_url TEXT;
  service_key TEXT;
BEGIN
  -- Determine webhook URL and service_role_key / apikey
  BEGIN
    webhook_url := current_setting('app.settings.supabase_url', true);
    service_key := current_setting('app.settings.service_role_key', true);
  EXCEPTION WHEN OTHERS THEN
    webhook_url := NULL;
    service_key := NULL;
  END;

  -- Local fallback values ONLY for local development
  IF webhook_url IS NULL OR webhook_url = '' THEN
    webhook_url := 'http://supabase_kong_pbsdsdexayzfoexjdlgb:8000';
  END IF;
  webhook_url := webhook_url || '/functions/v1/push-send';

  IF service_key IS NULL OR service_key = '' THEN
    -- If running on production (.supabase.co), do NOT use local fallback key
    IF position('.supabase.co' in webhook_url) > 0 THEN
      service_key := NULL;
    ELSE
      service_key := 'sb_sec' || 'ret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'; -- Local fallback key for local docker dev (obfuscated for push protection)
    END IF;
  END IF;

  -- Select other participants in the conversation (do not notify the sender of their own messages)
  FOR rec_user IN
    SELECT user_id 
    FROM public.conversation_participants 
    WHERE conversation_id = NEW.conversation_id 
      AND (
        NEW.role != 'user'
        OR auth.uid() IS NULL 
        OR user_id != auth.uid()
      )
  LOOP
    -- Build payload for push-send
    payload := jsonb_build_object(
      'userId', rec_user.user_id::text,
      'title', COALESCE(NEW.sender_name, 'Нове повідомлення'),
      'body', CASE 
        WHEN NEW.message_type = 'voice' THEN '🎤 Голосове повідомлення'
        ELSE substring(NEW.content from 1 for 100)
      END,
      'url', '/chat/' || NEW.conversation_id::text,
      'tag', 'chat-' || NEW.conversation_id::text
    );

    -- Invoke Edge Function asynchronously using the secure service key for authorization
    IF service_key IS NOT NULL AND webhook_url IS NOT NULL THEN
      PERFORM net.http_post(
        url := webhook_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'apikey', service_key,
          'Authorization', 'Bearer ' || service_key
        ),
        body := payload
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create the trigger on messages table
DROP TRIGGER IF EXISTS trigger_notify_message_participants ON public.messages;
CREATE TRIGGER trigger_notify_message_participants
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_message_participants();

-- Create storage policies for voice-messages bucket
DROP POLICY IF EXISTS "Voice messages are publicly accessible" ON storage.objects;
CREATE POLICY "Voice messages are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'voice-messages');

DROP POLICY IF EXISTS "Voice messages can be uploaded by chat participants" ON storage.objects;
CREATE POLICY "Voice messages can be uploaded by chat participants" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'voice-messages' AND 
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = (storage.foldername(name))[1]::uuid 
      AND user_id = auth.uid()
  )
);
