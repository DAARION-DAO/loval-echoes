
-- Add missing columns to conversations
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS type text DEFAULT 'chat';

-- Enable RLS on all tables that don't have it yet
ALTER TABLE public.news_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_agent_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_inconsistencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create missing functions
CREATE OR REPLACE FUNCTION public.fix_approval_inconsistencies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Simple implementation: sync approved users
  UPDATE public.profiles SET approval_status = 'approved'
  WHERE approval_status = 'pending'
  AND user_id NOT IN (SELECT user_id FROM public.user_approval_requests WHERE status = 'pending');
END;
$$;

CREATE OR REPLACE FUNCTION public.log_task_event(
  p_event_type text,
  p_user_id uuid DEFAULT NULL,
  p_task_id uuid DEFAULT NULL,
  p_project_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO public.task_telemetry (event_type, user_id, task_id, project_id, metadata)
  VALUES (p_event_type, p_user_id, p_task_id, p_project_id, p_metadata)
  RETURNING id INTO event_id;
  RETURN event_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_event_data jsonb DEFAULT '{}'::jsonb,
  p_ip_address inet DEFAULT NULL::inet,
  p_user_agent text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit_log (user_id, event_type, event_data, ip_address, user_agent)
  VALUES (p_user_id, p_event_type, p_event_data, p_ip_address, p_user_agent);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_approval_status(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(approval_status, 'pending') FROM public.profiles WHERE user_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_refresh_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.refresh_tokens WHERE expires_at < NOW() OR revoked_at IS NOT NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_user_refresh_tokens(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.refresh_tokens SET revoked_at = NOW() WHERE user_id = p_user_id AND revoked_at IS NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_action text,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_attempts integer;
  is_blocked boolean;
BEGIN
  SELECT blocked_until > now() INTO is_blocked
  FROM public.rate_limits
  WHERE identifier = p_identifier AND action = p_action;

  IF is_blocked THEN
    RETURN false;
  END IF;

  INSERT INTO public.rate_limits (identifier, action, attempts, window_start)
  VALUES (p_identifier, p_action, 1, now())
  ON CONFLICT (identifier, action) DO UPDATE SET
    attempts = CASE WHEN rate_limits.window_start < now() - (p_window_minutes || ' minutes')::interval THEN 1 ELSE rate_limits.attempts + 1 END,
    window_start = CASE WHEN rate_limits.window_start < now() - (p_window_minutes || ' minutes')::interval THEN now() ELSE rate_limits.window_start END,
    blocked_until = CASE WHEN rate_limits.attempts + 1 > p_max_attempts THEN now() + (p_window_minutes || ' minutes')::interval ELSE NULL END
  RETURNING attempts INTO current_attempts;

  RETURN current_attempts <= p_max_attempts;
END;
$$;

CREATE OR REPLACE FUNCTION public.grant_admin_role(p_user_id uuid, p_granted_by uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, granted_by)
  VALUES (p_user_id, 'admin', p_granted_by)
  ON CONFLICT (user_id, role) DO UPDATE SET revoked_at = NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_admin_role(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_roles SET revoked_at = now()
  WHERE user_id = p_user_id AND role = 'admin' AND revoked_at IS NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_ai_agent_permissions(
  p_scope public.file_scope,
  p_project_id uuid DEFAULT NULL,
  p_folder_id uuid DEFAULT NULL
)
RETURNS TABLE (can_read boolean, can_write boolean, can_delete boolean, can_tag boolean)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(MAX(aap.can_read::int)::boolean, true) as can_read,
    COALESCE(MAX(aap.can_write::int)::boolean, false) as can_write,
    COALESCE(MAX(aap.can_delete::int)::boolean, false) as can_delete,
    COALESCE(MAX(aap.can_tag::int)::boolean, true) as can_tag
  FROM public.ai_agent_permissions aap
  WHERE aap.scope = p_scope
    AND (p_project_id IS NULL OR aap.project_id = p_project_id OR aap.project_id IS NULL)
    AND (p_folder_id IS NULL OR aap.folder_id = p_folder_id OR aap.folder_id IS NULL);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_conversation_participant_profiles(p_requesting_user_id uuid)
RETURNS TABLE (user_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT cp.user_id
  FROM public.conversation_participants cp
  WHERE cp.conversation_id IN (
    SELECT conversation_id FROM public.conversation_participants WHERE user_id = p_requesting_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.create_task_notification(
  p_task_id uuid,
  p_user_id uuid,
  p_type text,
  p_message text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.task_notifications (task_id, user_id, type, message, metadata)
  VALUES (p_task_id, p_user_id, p_type, p_message, p_metadata)
  RETURNING id INTO notification_id;
  RETURN notification_id;
END;
$$;
