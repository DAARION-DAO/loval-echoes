-- Add dify_message_id column to messages table to store Dify API message IDs
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS dify_message_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_messages_dify_message_id 
ON public.messages(dify_message_id);

-- Add comment
COMMENT ON COLUMN public.messages.dify_message_id IS 'Message ID from Dify API for feedback and tracking';