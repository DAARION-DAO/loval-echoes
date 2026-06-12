ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.messages(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_messages_parent_id ON public.messages(parent_id);