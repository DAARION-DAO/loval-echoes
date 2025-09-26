-- Create kanban column enum
CREATE TYPE public.kanban_column AS ENUM ('backlog', 'todo', 'progress', 'review', 'done');

-- Create kanban cards table
CREATE TABLE public.kanban_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  column_type public.kanban_column DEFAULT 'backlog' NOT NULL,
  position integer DEFAULT 0 NOT NULL,
  due_date timestamp with time zone,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create index for efficient ordering and filtering
CREATE INDEX idx_kanban_cards_project_column_position ON public.kanban_cards(project_id, column_type, position);
CREATE INDEX idx_kanban_cards_assignee ON public.kanban_cards(assignee_id);
CREATE INDEX idx_kanban_cards_created_by ON public.kanban_cards(created_by);

-- Enable RLS
ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view kanban cards in their conversations" 
ON public.kanban_cards 
FOR SELECT 
USING (is_conversation_participant(auth.uid(), project_id));

CREATE POLICY "Users can create kanban cards in their conversations" 
ON public.kanban_cards 
FOR INSERT 
WITH CHECK (
  is_conversation_participant(auth.uid(), project_id) 
  AND auth.uid() = created_by
);

CREATE POLICY "Users can update kanban cards in their conversations" 
ON public.kanban_cards 
FOR UPDATE 
USING (is_conversation_participant(auth.uid(), project_id));

CREATE POLICY "Users can delete their own kanban cards or admins can delete any" 
ON public.kanban_cards 
FOR DELETE 
USING (
  is_conversation_participant(auth.uid(), project_id) 
  AND (auth.uid() = created_by OR is_admin(auth.uid()))
);

-- Create trigger for updated_at
CREATE TRIGGER update_kanban_cards_updated_at
BEFORE UPDATE ON public.kanban_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.kanban_cards;