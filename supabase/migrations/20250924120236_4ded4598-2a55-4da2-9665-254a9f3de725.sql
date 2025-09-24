-- Add status field to conversations table for proper archiving/deletion
ALTER TABLE public.conversations 
ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted'));

-- Update existing conversations to have active status
UPDATE public.conversations SET status = 'active' WHERE status IS NULL;

-- Make status field NOT NULL
ALTER TABLE public.conversations ALTER COLUMN status SET NOT NULL;

-- Create index for better performance when filtering by status
CREATE INDEX idx_conversations_status ON public.conversations(status);

-- Update RLS policies to hide deleted conversations from regular users
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations" 
ON public.conversations FOR SELECT 
USING (
  is_conversation_participant(auth.uid(), id) 
  AND status != 'deleted'
);