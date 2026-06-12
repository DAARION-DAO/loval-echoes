
-- Sprint B2 — MicroDAO Leader Onboarding & Community Spirit Agent (sanitized, retry)

-- 1. Clean up old waitlist / trial trigger if it ever existed
DROP TRIGGER IF EXISTS trigger_initialize_trial ON public.profiles;
DROP FUNCTION IF EXISTS public.initialize_trial_on_approval();

-- 2. Auto-approve new signups so they land in onboarding (not waitlist)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_display_name text;
BEGIN
  v_display_name := COALESCE(
    NEW.raw_user_meta_data ->> 'display_name',
    NEW.raw_user_meta_data ->> 'full_name',
    split_part(NEW.email, '@', 1),
    'Користувач'
  );
  INSERT INTO public.profiles (user_id, display_name, email, approval_status, access_tier)
  VALUES (NEW.id, v_display_name, NEW.email, 'approved', 'early_access')
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    approval_status = EXCLUDED.approval_status,
    access_tier = EXCLUDED.access_tier;
  RETURN NEW;
END;
$function$;

-- 3. invitation_codes
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitation_codes TO authenticated;
GRANT ALL ON public.invitation_codes TO service_role;
ALTER TABLE public.invitation_codes ENABLE ROW LEVEL SECURITY;

-- 4. Expand community_members role enum
ALTER TABLE public.community_members DROP CONSTRAINT IF EXISTS community_members_role_check;
ALTER TABLE public.community_members ADD CONSTRAINT community_members_role_check
  CHECK (role IN ('owner', 'admin', 'member', 'guest', 'agent'));

-- 5. Extend agents for Community Spirit Agent
-- Ensure scope exists first (add_scope_to_agents_and_files.sql was never applied)
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS scope text DEFAULT 'personal' CHECK (scope IN ('community', 'personal'));
ALTER TABLE public.agents ALTER COLUMN owner_user_id DROP NOT NULL;
UPDATE public.agents SET scope = 'personal' WHERE scope IS NULL;

ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS agent_type text;
UPDATE public.agents SET agent_type = CASE
  WHEN is_preset = true THEN 'preset'
  WHEN scope = 'personal' THEN 'personal'
  ELSE 'community_spirit'
END WHERE agent_type IS NULL;
ALTER TABLE public.agents ALTER COLUMN agent_type SET DEFAULT 'community_spirit';
ALTER TABLE public.agents ALTER COLUMN agent_type SET NOT NULL;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS system_prompt text;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS personality jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS memory_scope text DEFAULT 'community';

-- 6. community_setup_sessions
CREATE TABLE IF NOT EXISTS public.community_setup_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leader_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id uuid REFERENCES public.communities(id) ON DELETE SET NULL,
  current_step text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'cancelled')),
  answers jsonb DEFAULT '{}'::jsonb,
  generated_summary jsonb DEFAULT '{}'::jsonb,
  created_agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_setup_sessions TO authenticated;
GRANT ALL ON public.community_setup_sessions TO service_role;
ALTER TABLE public.community_setup_sessions ENABLE ROW LEVEL SECURITY;

-- 7. agent_permissions
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_permissions TO authenticated;
GRANT ALL ON public.agent_permissions TO service_role;
ALTER TABLE public.agent_permissions ENABLE ROW LEVEL SECURITY;

-- 8. agent_action_logs
CREATE TABLE IF NOT EXISTS public.agent_action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
  community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  action_payload jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'executed', 'rejected', 'failed')),
  requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  executed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_action_logs TO authenticated;
GRANT ALL ON public.agent_action_logs TO service_role;
ALTER TABLE public.agent_action_logs ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES ============
DROP POLICY IF EXISTS "Users can manage their own setup sessions" ON public.community_setup_sessions;
CREATE POLICY "Users can manage their own setup sessions"
  ON public.community_setup_sessions FOR ALL
  USING (auth.uid() = leader_id) WITH CHECK (auth.uid() = leader_id);

DROP POLICY IF EXISTS "Users can view community and own personal agents" ON public.agents;
CREATE POLICY "Users can view community and own personal agents"
  ON public.agents FOR SELECT
  USING (
    (scope = 'community' AND (
      community_id IS NULL
      OR community_id IN (
        SELECT cm.community_id FROM public.community_members cm
        WHERE cm.user_id = auth.uid() AND cm.status = 'approved'
      )
    ))
    OR (scope = 'personal' AND owner_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Community members can read agent permissions" ON public.agent_permissions;
CREATE POLICY "Community members can read agent permissions"
  ON public.agent_permissions FOR SELECT
  USING (
    community_id IN (
      SELECT cm.community_id FROM public.community_members cm
      WHERE cm.user_id = auth.uid() AND cm.status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Community admins can manage agent permissions" ON public.agent_permissions;
CREATE POLICY "Community admins can manage agent permissions"
  ON public.agent_permissions FOR ALL
  USING (
    community_id IN (
      SELECT cm.community_id FROM public.community_members cm
      WHERE cm.user_id = auth.uid() AND cm.status = 'approved' AND cm.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    community_id IN (
      SELECT cm.community_id FROM public.community_members cm
      WHERE cm.user_id = auth.uid() AND cm.status = 'approved' AND cm.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Community members can read agent action logs" ON public.agent_action_logs;
CREATE POLICY "Community members can read agent action logs"
  ON public.agent_action_logs FOR SELECT
  USING (
    community_id IN (
      SELECT cm.community_id FROM public.community_members cm
      WHERE cm.user_id = auth.uid() AND cm.status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Admins can manage invitation codes" ON public.invitation_codes;
DROP POLICY IF EXISTS "Anyone authenticated can view invitation codes" ON public.invitation_codes;
DROP POLICY IF EXISTS "Authorized roles can manage invitation codes" ON public.invitation_codes;
DROP POLICY IF EXISTS "Authorized roles can view invitation codes" ON public.invitation_codes;

CREATE POLICY "Authorized roles can manage invitation codes" ON public.invitation_codes
  FOR ALL
  USING (
    public.is_admin(auth.uid())
    OR created_by = auth.uid()
    OR (scope = 'community' AND community_id IN (
      SELECT cm.community_id FROM public.community_members cm
      WHERE cm.user_id = auth.uid() AND cm.status = 'approved' AND cm.role IN ('owner', 'admin')
    ))
  )
  WITH CHECK (
    public.is_admin(auth.uid())
    OR created_by = auth.uid()
    OR (scope = 'community' AND community_id IN (
      SELECT cm.community_id FROM public.community_members cm
      WHERE cm.user_id = auth.uid() AND cm.status = 'approved' AND cm.role IN ('owner', 'admin')
    ))
  );

-- ============ RPC FUNCTIONS ============
CREATE OR REPLACE FUNCTION public.validate_invitation_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_code_record RECORD;
BEGIN
  SELECT * INTO v_code_record
  FROM public.invitation_codes
  WHERE code = p_code
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR used_count < max_uses);

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Код недійсний або його термін дії закінчився');
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'scope', v_code_record.scope,
    'community_id', v_code_record.community_id,
    'role_to_grant', v_code_record.role_to_grant,
    'access_tier', v_code_record.access_tier
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.validate_invitation_code(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_microdao_with_spirit_agent(
  p_name text, p_type text, p_description text, p_mission text,
  p_goal_30_days text, p_values_rules text, p_agent_name text,
  p_autonomy_level text, p_setup_answers jsonb, p_setup_session_id uuid DEFAULT NULL
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
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Потрібна авторизація';
  END IF;

  v_slug := lower(regexp_replace(p_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);
  IF v_slug = '' THEN
    v_slug := 'community-' || substr(md5(random()::text), 1, 6);
  END IF;
  IF EXISTS (SELECT 1 FROM public.communities WHERE slug = v_slug) THEN
    v_slug := v_slug || '-' || substr(md5(random()::text), 1, 6);
  END IF;

  INSERT INTO public.communities (name, slug, type, description, owner_id)
  VALUES (p_name, v_slug, p_type, p_description, v_user_id)
  RETURNING id INTO v_community_id;

  INSERT INTO public.community_members (community_id, user_id, role, status)
  VALUES (v_community_id, v_user_id, 'owner', 'approved');

  v_system_prompt := 'You are the Community Spirit Agent (Дух Спільноти) of this MicroDAO, named ' || p_agent_name || '.' ||
    E'\nCommunity Name: ' || p_name ||
    E'\nMission: ' || COALESCE(p_mission, '') ||
    E'\nFirst 30-day Goal: ' || COALESCE(p_goal_30_days, '') ||
    E'\nValues & Rules: ' || COALESCE(p_values_rules, '') ||
    E'\nAutonomy Level: ' || COALESCE(p_autonomy_level, 'low') ||
    E'\n\nYour identity: You preserve community memory, coordinate members, onboard new people, help the leader structure roles and tasks, and act as a supervised admin under human authority. Speak in a helpful, community-focused tone, in Ukrainian.';

  INSERT INTO public.agents (
    name, description, owner_user_id, connection_type, status, is_preset,
    scope, community_id, agent_type, system_prompt, personality
  )
  VALUES (
    p_agent_name,
    'Дух Спільноти для ' || p_name || '.',
    v_user_id, 'msp', 'active', false,
    'community', v_community_id, 'community_spirit', v_system_prompt,
    jsonb_build_object(
      'autonomy_level', p_autonomy_level,
      'mission', p_mission,
      'goal_30_days', p_goal_30_days,
      'values_rules', p_values_rules
    )
  )
  RETURNING id INTO v_agent_id;

  INSERT INTO public.agent_permissions (
    agent_id, community_id,
    can_invite_guests, can_create_tasks, can_send_welcome_messages,
    can_create_summaries, can_suggest_roles, can_approve_members,
    can_make_admins, can_remove_members, can_delete_community,
    requires_human_approval_for_sensitive_actions
  )
  VALUES (
    v_agent_id, v_community_id,
    true, true, true, true, true, false, false, false, false, true
  );

  INSERT INTO public.agent_action_logs (
    agent_id, community_id, action_type, action_payload, status, requested_by, executed_at
  )
  VALUES (
    v_agent_id, v_community_id, 'community_creation',
    jsonb_build_object('community_name', p_name, 'leader_id', v_user_id,
                       'agent_name', p_agent_name, 'autonomy_level', p_autonomy_level),
    'executed', v_user_id, now()
  );

  IF p_setup_session_id IS NOT NULL THEN
    UPDATE public.community_setup_sessions
    SET status = 'completed', community_id = v_community_id,
        created_agent_id = v_agent_id, answers = p_setup_answers, updated_at = now()
    WHERE id = p_setup_session_id;
  END IF;

  RETURN jsonb_build_object('community_id', v_community_id, 'agent_id', v_agent_id, 'slug', v_slug);
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_microdao_with_spirit_agent(text, text, text, text, text, text, text, text, jsonb, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.join_community_by_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid;
  v_code_record RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Потрібна авторизація';
  END IF;

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

  UPDATE public.invitation_codes SET used_count = used_count + 1 WHERE id = v_code_record.id;

  INSERT INTO public.community_members (community_id, user_id, role, status)
  VALUES (v_code_record.community_id, v_user_id, v_code_record.role_to_grant, 'approved')
  ON CONFLICT (community_id, user_id) DO UPDATE
  SET status = 'approved', role = EXCLUDED.role;

  INSERT INTO public.agent_action_logs (
    community_id, action_type, action_payload, status, requested_by, executed_at
  )
  VALUES (
    v_code_record.community_id, 'member_join',
    jsonb_build_object('user_id', v_user_id, 'role', v_code_record.role_to_grant, 'code_used', p_code),
    'executed', v_user_id, now()
  );

  RETURN jsonb_build_object('community_id', v_code_record.community_id, 'role', v_code_record.role_to_grant);
END;
$$;
GRANT EXECUTE ON FUNCTION public.join_community_by_code(text) TO authenticated;
