-- local migration only, do not apply remotely from Antigravity

-- 1. Create access_requests table if not exists
CREATE TABLE IF NOT EXISTS public.access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  use_case text,
  requested_tier text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_info')),
  created_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on access_requests
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Policies for access_requests
DROP POLICY IF EXISTS "Users can insert their own access requests" ON public.access_requests;
CREATE POLICY "Users can insert their own access requests"
  ON public.access_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own access requests" ON public.access_requests;
CREATE POLICY "Users can view their own access requests"
  ON public.access_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update access requests" ON public.access_requests;
CREATE POLICY "Admins can update access requests"
  ON public.access_requests FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 2. Define platform admin RPCs
-- Verification check helper: role = 'guardian'
CREATE OR REPLACE FUNCTION public.check_is_platform_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Потрібна авторизація';
  END IF;
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Недостатньо прав для Platform Admin Console';
  END IF;
END;
$$;

-- get_platform_admin_overview()
CREATE OR REPLACE FUNCTION public.get_platform_admin_overview()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_total_users int;
  v_active_users int;
  v_pending_access_requests int;
  v_total_microdaos int;
  v_active_microdaos int;
  v_microdaos_without_spirit_agent int;
  v_active_spirit_agents int;
  v_pending_agent_approvals int;
  v_blocked_users int;
  v_result json;
BEGIN
  -- Security check
  PERFORM public.check_is_platform_admin();

  -- Total users
  SELECT count(*) INTO v_total_users FROM public.profiles;

  -- Active users
  SELECT count(*) INTO v_active_users FROM public.profiles WHERE approval_status = 'approved';

  -- Pending access requests (from both access_requests and user_approval_requests if any)
  SELECT (
    (SELECT count(*) FROM public.access_requests WHERE status = 'pending') +
    (SELECT count(*) FROM public.user_approval_requests WHERE status = 'pending')
  ) INTO v_pending_access_requests;

  -- Total MicroDAOs
  SELECT count(*) INTO v_total_microdaos FROM public.communities;

  -- Active MicroDAOs (let's count total communities for now)
  v_active_microdaos := v_total_microdaos;

  -- MicroDAOs without Spirit Agent
  SELECT count(*) INTO v_microdaos_without_spirit_agent
  FROM public.communities c
  WHERE NOT EXISTS (
    SELECT 1 FROM public.agents a
    WHERE a.community_id = c.id AND a.agent_type = 'spirit'
  );

  -- Active Spirit Agents
  SELECT count(*) INTO v_active_spirit_agents
  FROM public.agents
  WHERE agent_type = 'spirit' AND status = 'active';

  -- Pending agent approvals (represented as action logs that are pending execution or human approval)
  SELECT count(*) INTO v_pending_agent_approvals
  FROM public.agent_action_logs
  WHERE status = 'pending_approval';

  -- Blocked/Rejected users
  SELECT count(*) INTO v_blocked_users
  FROM public.profiles
  WHERE approval_status IN ('rejected', 'blocked');

  -- Build JSON result
  v_result := json_build_object(
    'total_users', v_total_users,
    'active_users', v_active_users,
    'pending_access_requests', v_pending_access_requests,
    'total_microdaos', v_total_microdaos,
    'active_microdaos', v_active_microdaos,
    'microdaos_without_spirit_agent', v_microdaos_without_spirit_agent,
    'active_spirit_agents', v_active_spirit_agents,
    'pending_agent_approvals', v_pending_agent_approvals,
    'blocked_users', v_blocked_users,
    'billing_active_subscriptions', 0,
    'billing_past_due', 0,
    'billing_no_subscription', v_total_microdaos
  );

  RETURN v_result;
END;
$$;

-- get_platform_admin_users()
CREATE OR REPLACE FUNCTION public.get_platform_admin_users()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  email text,
  display_name text,
  approval_status text,
  role text,
  access_tier text,
  created_at timestamp with time zone,
  microdao_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Security check
  PERFORM public.check_is_platform_admin();

  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.email,
    p.display_name,
    p.approval_status,
    p.role,
    p.access_tier,
    p.created_at,
    (SELECT count(*) FROM public.community_members cm WHERE cm.user_id = p.user_id) AS microdao_count
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;

-- get_platform_admin_microdaos()
CREATE OR REPLACE FUNCTION public.get_platform_admin_microdaos()
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  type text,
  owner_id uuid,
  owner_email text,
  owner_name text,
  created_at timestamp with time zone,
  member_count bigint,
  agent_status text,
  has_spirit_agent boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Security check
  PERFORM public.check_is_platform_admin();

  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.slug,
    c.type,
    c.owner_id,
    p.email AS owner_email,
    p.display_name AS owner_name,
    c.created_at,
    (SELECT count(*) FROM public.community_members cm WHERE cm.community_id = c.id) AS member_count,
    COALESCE((SELECT a.status::text FROM public.agents a WHERE a.community_id = c.id AND a.agent_type = 'spirit' LIMIT 1), 'none') AS agent_status,
    EXISTS (SELECT 1 FROM public.agents a WHERE a.community_id = c.id AND a.agent_type = 'spirit') AS has_spirit_agent
  FROM public.communities c
  LEFT JOIN public.profiles p ON c.owner_id = p.user_id
  ORDER BY c.created_at DESC;
END;
$$;

-- get_platform_admin_access_requests()
CREATE OR REPLACE FUNCTION public.get_platform_admin_access_requests()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  email text,
  display_name text,
  use_case text,
  requested_tier text,
  status text,
  created_at timestamp with time zone,
  reviewed_at timestamp with time zone,
  reviewed_by uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Security check
  PERFORM public.check_is_platform_admin();

  RETURN QUERY
  SELECT
    ar.id,
    ar.user_id,
    ar.email,
    ar.display_name,
    ar.use_case,
    ar.requested_tier,
    ar.status,
    ar.created_at,
    ar.reviewed_at,
    ar.reviewed_by
  FROM public.access_requests ar
  ORDER BY ar.created_at DESC;
END;
$$;

-- get_platform_admin_agent_ops()
CREATE OR REPLACE FUNCTION public.get_platform_admin_agent_ops()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_total_agents int;
  v_spirit_agents int;
  v_agents_by_status json;
  v_agents_by_type json;
  v_recent_logs json;
  v_recent_errors json;
  v_result json;
BEGIN
  -- Security check
  PERFORM public.check_is_platform_admin();

  -- Total agents
  SELECT count(*) INTO v_total_agents FROM public.agents;

  -- Spirit agents
  SELECT count(*) INTO v_spirit_agents FROM public.agents WHERE agent_type = 'spirit';

  -- Status count JSON
  SELECT json_object_agg(status, count) INTO v_agents_by_status
  FROM (
    SELECT status, count(*) as count FROM public.agents GROUP BY status
  ) t;

  -- Type count JSON
  SELECT json_object_agg(agent_type, count) INTO v_agents_by_type
  FROM (
    SELECT agent_type, count(*) as count FROM public.agents GROUP BY agent_type
  ) t;

  -- Recent logs (last 50 logs)
  SELECT COALESCE(json_agg(t), '[]'::json) INTO v_recent_logs
  FROM (
    SELECT 
      l.id,
      l.agent_id,
      a.name as agent_name,
      l.action_type,
      l.status,
      l.created_at,
      c.name as community_name
    FROM public.agent_action_logs l
    LEFT JOIN public.agents a ON l.agent_id = a.id
    LEFT JOIN public.communities c ON l.community_id = c.id
    ORDER BY l.created_at DESC
    LIMIT 50
  ) t;

  -- Recent errors/failed actions
  SELECT COALESCE(json_agg(t), '[]'::json) INTO v_recent_errors
  FROM (
    SELECT 
      l.id,
      l.agent_id,
      a.name as agent_name,
      l.action_type,
      l.status,
      l.created_at,
      l.action_payload->>'error' as error_message
    FROM public.agent_action_logs l
    LEFT JOIN public.agents a ON l.agent_id = a.id
    WHERE l.status = 'failed' OR (l.action_payload->>'error') IS NOT NULL
    ORDER BY l.created_at DESC
    LIMIT 20
  ) t;

  -- Build final JSON
  v_result := json_build_object(
    'total_agents', v_total_agents,
    'spirit_agents', v_spirit_agents,
    'agents_by_status', COALESCE(v_agents_by_status, '{}'::json),
    'agents_by_type', COALESCE(v_agents_by_type, '{}'::json),
    'recent_logs', v_recent_logs,
    'recent_errors', v_recent_errors
  );

  RETURN v_result;
END;
$$;

-- Grant EXECUTE to authenticated users
GRANT EXECUTE ON FUNCTION public.get_platform_admin_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_platform_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_platform_admin_microdaos() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_platform_admin_access_requests() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_platform_admin_agent_ops() TO authenticated;
