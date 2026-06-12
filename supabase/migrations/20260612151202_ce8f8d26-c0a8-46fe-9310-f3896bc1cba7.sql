
-- ============ COMMUNITIES ============
CREATE TABLE IF NOT EXISTS public.communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  type text NOT NULL DEFAULT 'community',
  description text,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.communities TO authenticated;
GRANT ALL ON public.communities TO service_role;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_communities_owner_id ON public.communities(owner_id);

-- ============ COMMUNITY MEMBERS ============
CREATE TABLE IF NOT EXISTS public.community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (community_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_members TO authenticated;
GRANT ALL ON public.community_members TO service_role;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON public.community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON public.community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community_user ON public.community_members(community_id, user_id);

-- ============ PROMPT VERSIONS ============
CREATE TABLE IF NOT EXISTS public.agent_prompt_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  agent_id uuid,
  prompt_type text NOT NULL CHECK (prompt_type IN ('system', 'responses', 'fallback')),
  version_name text NOT NULL,
  content text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_prompt_versions TO authenticated;
GRANT ALL ON public.agent_prompt_versions TO service_role;
ALTER TABLE public.agent_prompt_versions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_apv_community_id ON public.agent_prompt_versions(community_id);
CREATE INDEX IF NOT EXISTS idx_apv_community_type ON public.agent_prompt_versions(community_id, prompt_type);
CREATE INDEX IF NOT EXISTS idx_apv_community_type_active ON public.agent_prompt_versions(community_id, prompt_type, is_active);

-- ============ HELPER FUNCTIONS (SECURITY DEFINER to avoid recursion) ============
CREATE OR REPLACE FUNCTION public.is_community_member(p_user_id uuid, p_community_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_members
    WHERE user_id = p_user_id AND community_id = p_community_id AND status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_community_admin(p_user_id uuid, p_community_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_members
    WHERE user_id = p_user_id
      AND community_id = p_community_id
      AND status = 'approved'
      AND role IN ('owner', 'admin')
  );
$$;

-- ============ RLS: COMMUNITIES ============
CREATE POLICY "Authenticated can create own community"
  ON public.communities FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Approved members can read their communities"
  ON public.communities FOR SELECT TO authenticated
  USING (public.is_community_member(auth.uid(), id));

CREATE POLICY "Admins can update their communities"
  ON public.communities FOR UPDATE TO authenticated
  USING (public.is_community_admin(auth.uid(), id))
  WITH CHECK (public.is_community_admin(auth.uid(), id));

-- ============ RLS: COMMUNITY MEMBERS ============
CREATE POLICY "Owner can insert self during onboarding"
  ON public.community_members FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      (role = 'owner' AND status = 'approved')
      OR public.is_community_admin(auth.uid(), community_id)
    )
  );

CREATE POLICY "Members can read members of their communities"
  ON public.community_members FOR SELECT TO authenticated
  USING (public.is_community_member(auth.uid(), community_id));

CREATE POLICY "Admins can update members"
  ON public.community_members FOR UPDATE TO authenticated
  USING (public.is_community_admin(auth.uid(), community_id))
  WITH CHECK (public.is_community_admin(auth.uid(), community_id));

CREATE POLICY "Admins can delete members"
  ON public.community_members FOR DELETE TO authenticated
  USING (public.is_community_admin(auth.uid(), community_id));

-- ============ RLS: PROMPT VERSIONS ============
CREATE POLICY "Members can read active prompts"
  ON public.agent_prompt_versions FOR SELECT TO authenticated
  USING (
    public.is_community_admin(auth.uid(), community_id)
    OR (is_active = true AND public.is_community_member(auth.uid(), community_id))
  );

CREATE POLICY "Admins can insert prompts"
  ON public.agent_prompt_versions FOR INSERT TO authenticated
  WITH CHECK (public.is_community_admin(auth.uid(), community_id));

CREATE POLICY "Admins can update prompts"
  ON public.agent_prompt_versions FOR UPDATE TO authenticated
  USING (public.is_community_admin(auth.uid(), community_id))
  WITH CHECK (public.is_community_admin(auth.uid(), community_id));

CREATE POLICY "Admins can delete prompts"
  ON public.agent_prompt_versions FOR DELETE TO authenticated
  USING (public.is_community_admin(auth.uid(), community_id));

-- ============ TRIGGERS for updated_at ============
DROP TRIGGER IF EXISTS update_communities_updated_at ON public.communities;
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_apv_updated_at ON public.agent_prompt_versions;
CREATE TRIGGER update_apv_updated_at BEFORE UPDATE ON public.agent_prompt_versions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ACTIVATE PROMPT RPC ============
CREATE OR REPLACE FUNCTION public.activate_prompt_version(p_version_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_community_id uuid;
  v_prompt_type text;
BEGIN
  SELECT community_id, prompt_type INTO v_community_id, v_prompt_type
  FROM public.agent_prompt_versions WHERE id = p_version_id;

  IF v_community_id IS NULL THEN
    RAISE EXCEPTION 'Prompt version not found';
  END IF;

  IF NOT public.is_community_admin(auth.uid(), v_community_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  UPDATE public.agent_prompt_versions
    SET is_active = false, updated_at = now()
    WHERE community_id = v_community_id
      AND prompt_type = v_prompt_type
      AND id <> p_version_id
      AND is_active = true;

  UPDATE public.agent_prompt_versions
    SET is_active = true, updated_at = now()
    WHERE id = p_version_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_prompt_version(uuid) TO authenticated;
