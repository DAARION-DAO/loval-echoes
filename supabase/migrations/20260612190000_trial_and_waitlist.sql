-- Migration: Sprint B2 — MicroDAO Leader Onboarding & Community Spirit Agent
-- Date: 2026-06-12

-- 1. Clean up old waitlist / trial triggers and tables if they exist
DROP TRIGGER IF EXISTS trigger_initialize_trial ON public.profiles;
DROP FUNCTION IF EXISTS public.initialize_trial_on_approval();

-- 2. Redefine is_admin function safely if it doesn't exist
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = is_admin.user_id 
    AND p.approval_status = 'approved'
    AND p.created_at <= (
      SELECT p2.created_at + INTERVAL '1 day'
      FROM public.profiles p2 
      WHERE p2.approval_status = 'approved' 
      ORDER BY p2.created_at ASC 
      LIMIT 1
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 3. Redefine profile approval check to make all new signups 'approved' by default
CREATE OR REPLACE FUNCTION public.create_approval_request_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.approval_status IS NULL THEN
    NEW.approval_status := 'approved';
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Redefine handle_new_user trigger function to auto-approve new registrations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_display_name text;
BEGIN
  -- Extract display name metadata
  v_display_name := COALESCE(
    NEW.raw_user_meta_data ->> 'display_name',
    NEW.raw_user_meta_data ->> 'full_name',
    split_part(NEW.email, '@', 1),
    'Користувач'
  );

  -- All users default to 'approved' to access the lobby
  INSERT INTO public.profiles (user_id, display_name, email, approval_status, access_tier)
  VALUES (
    NEW.id,
    v_display_name,
    NEW.email,
    'approved',
    'early_access'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    approval_status = EXCLUDED.approval_status,
    access_tier = EXCLUDED.access_tier;

  RETURN NEW;
END;
$function$;

-- 5. Recreate invitation_codes table with platform vs community scope
DROP TABLE IF EXISTS public.invitation_codes CASCADE;
CREATE TABLE public.invitation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL DEFAULT 'community' CHECK (scope IN ('platform', 'community')),
  community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  role_to_grant text DEFAULT 'member' CHECK (role_to_grant IN ('owner', 'admin', 'member', 'guest', 'agent')),
  access_tier text DEFAULT 'early_access',
  max_uses integer,
  used_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS and grants
ALTER TABLE public.invitation_codes ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitation_codes TO authenticated;
GRANT ALL ON public.invitation_codes TO service_role;

-- 6. Expand community_members roles constraint
ALTER TABLE public.community_members DROP CONSTRAINT IF EXISTS community_members_role_check;
ALTER TABLE public.community_members ADD CONSTRAINT community_members_role_check CHECK (role IN ('owner', 'admin', 'member', 'guest', 'agent'));

-- 7. Alter agents table to link to communities and support Spirit Agent fields
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS agent_type text NOT NULL DEFAULT 'community_spirit';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS system_prompt text;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS personality jsonb DEFAULT '{}';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS memory_scope text DEFAULT 'community';

-- 8. Create community_setup_sessions
CREATE TABLE IF NOT EXISTS public.community_setup_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leader_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id uuid REFERENCES public.communities(id) ON DELETE SET NULL,
  current_step text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'cancelled')),
  answers jsonb DEFAULT '{}',
  generated_summary jsonb DEFAULT '{}',
  created_agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.community_setup_sessions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_setup_sessions TO authenticated;
GRANT ALL ON public.community_setup_sessions TO service_role;

-- 9. Create agent_permissions
CREATE TABLE IF NOT EXISTS public.agent_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
  community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE,
  can_invite_guests boolean DEFAULT true,
  can_create_tasks boolean DEFAULT true,
  can_send_welcome_messages boolean DEFAULT true,
  can_create_summaries boolean DEFAULT true,
  can_suggest_roles boolean DEFAULT true,
  can_approve_members boolean DEFAULT false,
  can_make_admins boolean DEFAULT false,
  can_remove_members boolean DEFAULT false,
  can_delete_community boolean DEFAULT false,
  requires_human_approval_for_sensitive_actions boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.agent_permissions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_permissions TO authenticated;
GRANT ALL ON public.agent_permissions TO service_role;

-- 10. Create agent_action_logs
CREATE TABLE IF NOT EXISTS public.agent_action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
  community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  action_payload jsonb DEFAULT '{}',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'executed', 'rejected', 'failed')),
  requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  executed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.agent_action_logs ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_action_logs TO authenticated;
GRANT ALL ON public.agent_action_logs TO service_role;

-- ============ RLS POLICIES ============

-- Profiles policies verification
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Setup sessions: User can only access their own setup drafts
CREATE POLICY "Users can manage their own setup sessions"
  ON public.community_setup_sessions
  USING (auth.uid() = leader_id)
  WITH CHECK (auth.uid() = leader_id);

-- Agents: Community members can view agents in their community
DROP POLICY IF EXISTS "Users can view community and own personal agents" ON public.agents;
CREATE POLICY "Users can view community and own personal agents"
  ON public.agents
  FOR SELECT
  USING (
    scope = 'community' AND (
      community_id IN (
        SELECT cm.community_id FROM public.community_members cm
        WHERE cm.user_id = auth.uid() AND cm.status = 'approved'
      ) OR community_id IS NULL
    )
    OR
    (scope = 'personal' AND owner_user_id = auth.uid())
  );

-- Agent permissions: Community members can read, admins can edit
CREATE POLICY "Community members can read agent permissions"
  ON public.agent_permissions
  FOR SELECT
  USING (
    community_id IN (
      SELECT cm.community_id FROM public.community_members cm
      WHERE cm.user_id = auth.uid() AND cm.status = 'approved'
    )
  );

CREATE POLICY "Community admins can manage agent permissions"
  ON public.agent_permissions
  FOR ALL
  USING (
    community_id IN (
      SELECT cm.community_id FROM public.community_members cm
      WHERE cm.user_id = auth.uid() AND cm.status = 'approved' AND cm.role IN ('owner', 'admin')
    )
  );

-- Agent action logs: Community members can read
CREATE POLICY "Community members can read agent action logs"
  ON public.agent_action_logs
  FOR SELECT
  USING (
    community_id IN (
      SELECT cm.community_id FROM public.community_members cm
      WHERE cm.user_id = auth.uid() AND cm.status = 'approved'
    )
  );

-- Invitation codes: Frontend CANNOT query codes directly. Restrict SELECT to admins and creators.
DROP POLICY IF EXISTS "Admins can manage invitation codes" ON public.invitation_codes;
DROP POLICY IF EXISTS "Anyone authenticated can view invitation codes" ON public.invitation_codes;

CREATE POLICY "Authorized roles can manage invitation codes" ON public.invitation_codes
  FOR ALL
  USING (
    public.is_admin(auth.uid()) OR
    created_by = auth.uid() OR
    (scope = 'community' AND community_id IN (
      SELECT cm.community_id FROM public.community_members cm
      WHERE cm.user_id = auth.uid() AND cm.status = 'approved' AND cm.role IN ('owner', 'admin')
    ))
  );

CREATE POLICY "Authorized roles can view invitation codes" ON public.invitation_codes
  FOR SELECT
  USING (
    public.is_admin(auth.uid()) OR
    created_by = auth.uid() OR
    (scope = 'community' AND community_id IN (
      SELECT cm.community_id FROM public.community_members cm
      WHERE cm.user_id = auth.uid() AND cm.status = 'approved' AND cm.role IN ('owner', 'admin')
    ))
  );

-- ============ RPC FUNCTIONS ============

-- 1. Safe RPC to validate an invitation code without read access to invitation_codes
CREATE OR REPLACE FUNCTION public.validate_invitation_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_code_record RECORD;
  v_res jsonb;
BEGIN
  -- Look up code
  SELECT * INTO v_code_record
  FROM public.invitation_codes
  WHERE code = p_code
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR used_count < max_uses);

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Код недійсний або його термін дії закінчився');
  END IF;

  v_res := jsonb_build_object(
    'valid', true,
    'scope', v_code_record.scope,
    'community_id', v_code_record.community_id,
    'role_to_grant', v_code_record.role_to_grant,
    'access_tier', v_code_record.access_tier
  );

  RETURN v_res;
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_invitation_code(text) TO authenticated;

-- 2. Atomic Transaction to create a MicroDAO with its Community Spirit Agent
CREATE OR REPLACE FUNCTION public.create_microdao_with_spirit_agent(
  p_name text,
  p_type text,
  p_description text,
  p_mission text,
  p_goal_30_days text,
  p_values_rules text,
  p_agent_name text,
  p_autonomy_level text,
  p_setup_answers jsonb,
  p_setup_session_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid;
  v_community_id uuid;
  v_agent_id uuid;
  v_system_prompt text;
  v_slug text;
  v_res jsonb;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Потрібна авторизація';
  END IF;

  -- Generate slug from name
  v_slug := lower(regexp_replace(p_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);
  IF v_slug = '' THEN
    v_slug := 'community-' || substr(md5(random()::text), 1, 6);
  END IF;

  -- Ensure slug uniqueness
  IF EXISTS (SELECT 1 FROM public.communities WHERE slug = v_slug) THEN
    v_slug := v_slug || '-' || substr(md5(random()::text), 1, 6);
  END IF;

  -- 1. Create Community
  INSERT INTO public.communities (name, slug, type, description, owner_id)
  VALUES (p_name, v_slug, p_type, p_description, v_user_id)
  RETURNING id INTO v_community_id;

  -- 2. Add Leader as Owner in community_members (approved status)
  INSERT INTO public.community_members (community_id, user_id, role, status)
  VALUES (v_community_id, v_user_id, 'owner', 'approved');

  -- 3. Generate Community Spirit Agent Prompt
  v_system_prompt := 'You are the Community Spirit Agent (Дух Спільноти) of this MicroDAO, named ' || p_agent_name || '.' ||
    E'\nCommunity Name: ' || p_name ||
    E'\nMission: ' || p_mission ||
    E'\nFirst 30-day Goal: ' || p_goal_30_days ||
    E'\nValues & Rules: ' || p_values_rules ||
    E'\nAutonomy Level: ' || p_autonomy_level ||
    E'\n\nYour identity: You preserve community memory, coordinate members, onboard new people, help the leader structure roles and tasks, and act as a supervised admin under human authority. Speak in a helpful, community-focused tone, in Ukrainian.';

  -- 4. Create Community Spirit Agent in public.agents
  INSERT INTO public.agents (
    name,
    description,
    owner_user_id,
    connection_type,
    status,
    is_preset,
    scope,
    community_id,
    agent_type,
    system_prompt,
    personality
  )
  VALUES (
    p_agent_name,
    'Дух Спільноти для ' || p_name || '. Зберігає пам’ять, веде онбординг та допомагає з процесами.',
    v_user_id,
    'msp',
    'active',
    false,
    'community',
    v_community_id,
    'community_spirit',
    v_system_prompt,
    jsonb_build_object(
      'autonomy_level', p_autonomy_level,
      'mission', p_mission,
      'goal_30_days', p_goal_30_days,
      'values_rules', p_values_rules
    )
  )
  RETURNING id INTO v_agent_id;

  -- 5. Create default agent permissions
  INSERT INTO public.agent_permissions (
    agent_id,
    community_id,
    can_invite_guests,
    can_create_tasks,
    can_send_welcome_messages,
    can_create_summaries,
    can_suggest_roles,
    can_approve_members,
    can_make_admins,
    can_remove_members,
    can_delete_community,
    requires_human_approval_for_sensitive_actions
  )
  VALUES (
    v_agent_id,
    v_community_id,
    true,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    false,
    true
  );

  -- 6. Log Agent Action
  INSERT INTO public.agent_action_logs (
    agent_id,
    community_id,
    action_type,
    action_payload,
    status,
    requested_by,
    executed_at
  )
  VALUES (
    v_agent_id,
    v_community_id,
    'community_creation',
    jsonb_build_object(
      'community_name', p_name,
      'leader_id', v_user_id,
      'agent_name', p_agent_name,
      'autonomy_level', p_autonomy_level
    ),
    'executed',
    v_user_id,
    now()
  );

  -- 7. Update community setup session if provided
  IF p_setup_session_id IS NOT NULL THEN
    UPDATE public.community_setup_sessions
    SET status = 'completed',
        community_id = v_community_id,
        created_agent_id = v_agent_id,
        answers = p_setup_answers,
        updated_at = now()
    WHERE id = p_setup_session_id;
  END IF;

  -- 8. Return result
  v_res := jsonb_build_object(
    'community_id', v_community_id,
    'agent_id', v_agent_id,
    'slug', v_slug
  );

  RETURN v_res;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_microdao_with_spirit_agent(text, text, text, text, text, text, text, text, jsonb, uuid) TO authenticated;

-- 3. SQL Function to join community by invitation code safely
CREATE OR REPLACE FUNCTION public.join_community_by_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid;
  v_code_record RECORD;
  v_res jsonb;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Потрібна авторизація';
  END IF;

  -- Look up code
  SELECT * INTO v_code_record
  FROM public.invitation_codes
  WHERE code = p_code
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR used_count < max_uses)
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Код запрошення недійсний або його термін дії закінчився';
  END IF;

  IF v_code_record.scope <> 'community' OR v_code_record.community_id IS NULL THEN
    RAISE EXCEPTION 'Цей код не належить до жодної спільноти';
  END IF;

  -- Increment use count
  UPDATE public.invitation_codes
  SET used_count = used_count + 1
  WHERE id = v_code_record.id;

  -- Add user as member
  INSERT INTO public.community_members (community_id, user_id, role, status)
  VALUES (v_code_record.community_id, v_user_id, v_code_record.role_to_grant, 'approved')
  ON CONFLICT (community_id, user_id) DO UPDATE
  SET status = 'approved', role = EXCLUDED.role;

  -- Log joining
  INSERT INTO public.agent_action_logs (
    community_id,
    action_type,
    action_payload,
    status,
    requested_by,
    executed_at
  )
  VALUES (
    v_code_record.community_id,
    'member_join',
    jsonb_build_object(
      'user_id', v_user_id,
      'role', v_code_record.role_to_grant,
      'code_used', p_code
    ),
    'executed',
    v_user_id,
    now()
  );

  v_res := jsonb_build_object(
    'community_id', v_code_record.community_id,
    'role', v_code_record.role_to_grant
  );

  RETURN v_res;
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_community_by_code(text) TO authenticated;
