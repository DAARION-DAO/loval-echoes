-- Create enum for agent connection types
CREATE TYPE public.agent_connection_type AS ENUM ('webhook', 'websocket', 'msp');

-- Create enum for agent status
CREATE TYPE public.agent_status AS ENUM ('active', 'paused', 'disconnected');

-- Create enum for agent membership roles
CREATE TYPE public.agent_role AS ENUM ('assistant', 'observer', 'manager');

-- Create agents table
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  owner_user_id UUID NOT NULL,
  connection_type agent_connection_type NOT NULL DEFAULT 'msp',
  endpoint_url TEXT,
  public_key TEXT,
  status agent_status NOT NULL DEFAULT 'active',
  is_preset BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent_memberships table (which chats/projects/tasks agent is added to)
CREATE TABLE public.agent_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.kanban_cards(id) ON DELETE CASCADE,
  role agent_role NOT NULL DEFAULT 'assistant',
  scopes TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT at_least_one_target CHECK (
    (conversation_id IS NOT NULL) OR 
    (project_id IS NOT NULL) OR 
    (task_id IS NOT NULL)
  )
);

-- Create personal_agent_chats table (1-1 chats with agents)
CREATE TABLE public.personal_agent_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_agent_chats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agents table
CREATE POLICY "Users can view their own agents and preset agents"
  ON public.agents FOR SELECT
  USING (
    (auth.uid() = owner_user_id) OR 
    (is_preset = true AND is_user_approved(auth.uid()))
  );

CREATE POLICY "Users can create their own agents"
  ON public.agents FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own agents"
  ON public.agents FOR UPDATE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete their own agents"
  ON public.agents FOR DELETE
  USING (auth.uid() = owner_user_id);

-- RLS Policies for agent_memberships
CREATE POLICY "Users can view memberships of their agents"
  ON public.agent_memberships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = agent_memberships.agent_id 
      AND agents.owner_user_id = auth.uid()
    )
    OR
    (conversation_id IS NOT NULL AND is_conversation_participant(auth.uid(), conversation_id))
    OR
    (project_id IS NOT NULL AND is_conversation_participant(auth.uid(), project_id))
  );

CREATE POLICY "Users can create memberships for their agents"
  ON public.agent_memberships FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = agent_memberships.agent_id 
      AND agents.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update memberships of their agents"
  ON public.agent_memberships FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = agent_memberships.agent_id 
      AND agents.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete memberships of their agents"
  ON public.agent_memberships FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = agent_memberships.agent_id 
      AND agents.owner_user_id = auth.uid()
    )
  );

-- RLS Policies for personal_agent_chats
CREATE POLICY "Users can view their personal agent chats"
  ON public.personal_agent_chats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create personal agent chats"
  ON public.personal_agent_chats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their personal agent chats"
  ON public.personal_agent_chats FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_agents_owner ON public.agents(owner_user_id);
CREATE INDEX idx_agents_status ON public.agents(status);
CREATE INDEX idx_agent_memberships_agent ON public.agent_memberships(agent_id);
CREATE INDEX idx_agent_memberships_conversation ON public.agent_memberships(conversation_id);
CREATE INDEX idx_personal_agent_chats_user ON public.personal_agent_chats(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert preset agents
INSERT INTO public.agents (name, description, avatar_url, owner_user_id, status, is_preset, connection_type)
VALUES 
  (
    'Яромир',
    'Агент співдії — контекстні підказки, синхронізація задач',
    NULL,
    (SELECT id FROM auth.users LIMIT 1),
    'active',
    true,
    'msp'
  ),
  (
    'Еонарх Синергетон',
    'Агент синергії — аналітика взаємодій, оптимізація процесів',
    NULL,
    (SELECT id FROM auth.users LIMIT 1),
    'active',
    true,
    'msp'
  );