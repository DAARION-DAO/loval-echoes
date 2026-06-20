-- Backend-backed device pairing invitations and MicroDAO device status.
--
-- This migration keeps community invites separate from device pairing invites.
-- Device pairing codes are short-lived, MicroDAO-scoped, and consumable by the
-- current DAARION Edge pairing parser as `daarion-pair:<base64url-json>`.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.device_backend_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  environment text NOT NULL DEFAULT 'production'
    CHECK (environment IN ('production', 'staging', 'development')),
  backend_url text NOT NULL UNIQUE
    CHECK (backend_url ~ '^https?://[^[:space:]]+$'),
  CHECK (environment <> 'production' OR backend_url ~ '^https://[^[:space:]]+$'),
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.device_backend_profiles ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.device_backend_profiles TO service_role;

CREATE INDEX IF NOT EXISTS idx_device_backend_profiles_active
  ON public.device_backend_profiles(is_active, environment);

CREATE UNIQUE INDEX IF NOT EXISTS idx_device_backend_profiles_one_active
  ON public.device_backend_profiles(is_active)
  WHERE is_active = true;

CREATE TABLE IF NOT EXISTS public.device_pairing_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  membership_role text NOT NULL,
  backend_profile_id uuid REFERENCES public.device_backend_profiles(id) ON DELETE RESTRICT,
  purpose text NOT NULL DEFAULT 'standard_device'
    CHECK (purpose IN ('standard_device', 'local_agent', 'worker_candidate')),
  device_label text,
  pairing_code text NOT NULL UNIQUE,
  pairing_payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'consumed', 'expired', 'revoked')),
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  consumed_device_id text,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.device_pairing_invitations ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.device_pairing_invitations TO authenticated;
GRANT ALL ON public.device_pairing_invitations TO service_role;

CREATE INDEX IF NOT EXISTS idx_device_pairing_invitations_community_user
  ON public.device_pairing_invitations(community_id, created_by, purpose, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_device_pairing_invitations_expires
  ON public.device_pairing_invitations(expires_at)
  WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS public.microdao_device_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latest_invitation_id uuid REFERENCES public.device_pairing_invitations(id) ON DELETE SET NULL,
  device_id text,
  device_label text,
  platform text,
  purpose text NOT NULL DEFAULT 'standard_device'
    CHECK (purpose IN ('standard_device', 'local_agent', 'worker_candidate')),
  pairing_status text NOT NULL DEFAULT 'not_paired'
    CHECK (pairing_status IN ('not_paired', 'invite_created', 'pairing_required', 'paired', 'failed', 'revoked')),
  health_state text NOT NULL DEFAULT 'not_checked'
    CHECK (health_state IN ('not_checked', 'pairing_required', 'offline', 'contract_invalid', 'version_mismatch', 'online', 'degraded', 'maintenance')),
  genesis_status text NOT NULL DEFAULT 'not_started'
    CHECK (genesis_status IN ('not_started', 'required', 'pending', 'complete', 'failed', 'not_required')),
  readiness_state text NOT NULL DEFAULT 'no_device'
    CHECK (readiness_state IN (
      'no_device',
      'invite_available',
      'invite_created',
      'pairing_required',
      'paired_unchecked',
      'offline',
      'contract_invalid',
      'version_mismatch',
      'online',
      'degraded',
      'maintenance',
      'genesis_required',
      'genesis_pending',
      'device_ready',
      'blocked'
    )),
  next_action text NOT NULL DEFAULT 'connect_device',
  capability_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (community_id, user_id, purpose)
);

ALTER TABLE public.microdao_device_statuses ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.microdao_device_statuses TO authenticated;
GRANT ALL ON public.microdao_device_statuses TO service_role;

CREATE INDEX IF NOT EXISTS idx_microdao_device_statuses_community_user
  ON public.microdao_device_statuses(community_id, user_id, purpose);

DROP TRIGGER IF EXISTS update_device_backend_profiles_updated_at ON public.device_backend_profiles;
CREATE TRIGGER update_device_backend_profiles_updated_at
  BEFORE UPDATE ON public.device_backend_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_device_pairing_invitations_updated_at ON public.device_pairing_invitations;
CREATE TRIGGER update_device_pairing_invitations_updated_at
  BEFORE UPDATE ON public.device_pairing_invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_microdao_device_statuses_updated_at ON public.microdao_device_statuses;
CREATE TRIGGER update_microdao_device_statuses_updated_at
  BEFORE UPDATE ON public.microdao_device_statuses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Members can read own device pairing invitations" ON public.device_pairing_invitations;
CREATE POLICY "Members can read own device pairing invitations"
  ON public.device_pairing_invitations
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.is_community_admin(auth.uid(), community_id)
  );

DROP POLICY IF EXISTS "Members can read own device status" ON public.microdao_device_statuses;
CREATE POLICY "Members can read own device status"
  ON public.microdao_device_statuses
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_community_admin(auth.uid(), community_id)
  );

CREATE OR REPLACE FUNCTION public.encode_device_pairing_payload(p_payload jsonb)
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT rtrim(
    translate(
      replace(encode(convert_to(p_payload::text, 'UTF8'), 'base64'), E'\n', ''),
      '+/',
      '-_'
    ),
    '='
  );
$$;

REVOKE ALL ON FUNCTION public.encode_device_pairing_payload(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.encode_device_pairing_payload(jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.get_device_connection_status(
  p_community_id uuid,
  p_purpose text DEFAULT 'standard_device'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_membership_role text;
  v_status RECORD;
  v_profile_configured boolean;
  v_message text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_purpose NOT IN ('standard_device', 'local_agent', 'worker_candidate') THEN
    RAISE EXCEPTION 'Unsupported device purpose';
  END IF;

  SELECT cm.role INTO v_membership_role
  FROM public.community_members cm
  WHERE cm.community_id = p_community_id
    AND cm.user_id = v_user_id
    AND cm.status = 'approved'
  LIMIT 1;

  IF v_membership_role IS NULL THEN
    RAISE EXCEPTION 'Approved MicroDAO membership required';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.device_backend_profiles dbp
    WHERE dbp.is_active = true
  ) INTO v_profile_configured;

  SELECT
    mds.*,
    dpi.pairing_code,
    dpi.expires_at AS invitation_expires_at,
    dpi.status AS invitation_status
  INTO v_status
  FROM public.microdao_device_statuses mds
  LEFT JOIN public.device_pairing_invitations dpi
    ON dpi.id = mds.latest_invitation_id
  WHERE mds.community_id = p_community_id
    AND mds.user_id = v_user_id
    AND mds.purpose = p_purpose
  ORDER BY mds.updated_at DESC
  LIMIT 1;

  IF FOUND THEN
    IF v_status.readiness_state = 'invite_created'
       AND (
         v_status.invitation_status IS DISTINCT FROM 'pending'
         OR v_status.invitation_expires_at IS NULL
         OR v_status.invitation_expires_at <= now()
       )
    THEN
      RETURN jsonb_build_object(
        'ok', true,
        'community_id', p_community_id,
        'dashboard_state', 'no_device',
        'pairing_status', 'not_paired',
        'health_state', 'not_checked',
        'genesis_status', 'not_started',
        'readiness_state', 'no_device',
        'purpose', p_purpose,
        'membership_role', v_membership_role,
        'next_action', 'connect_device',
        'backend_profile_configured', v_profile_configured,
        'message', 'Previous device connection code expired. Create a new code to continue.'
      );
    END IF;

    RETURN jsonb_build_object(
      'ok', true,
      'community_id', v_status.community_id,
      'dashboard_state', v_status.readiness_state,
      'pairing_status', v_status.pairing_status,
      'health_state', v_status.health_state,
      'genesis_status', v_status.genesis_status,
      'readiness_state', v_status.readiness_state,
      'purpose', v_status.purpose,
      'membership_role', v_membership_role,
      'device_id', v_status.device_id,
      'device_label', v_status.device_label,
      'platform', v_status.platform,
      'pairing_code', CASE
        WHEN v_status.invitation_status = 'pending'
         AND v_status.invitation_expires_at > now()
        THEN v_status.pairing_code
        ELSE NULL
      END,
      'expires_at', CASE
        WHEN v_status.invitation_status = 'pending'
         AND v_status.invitation_expires_at > now()
        THEN v_status.invitation_expires_at
        ELSE NULL
      END,
      'next_action', v_status.next_action,
      'last_seen_at', v_status.last_seen_at,
      'capability_summary', v_status.capability_summary,
      'backend_profile_configured', v_profile_configured,
      'message', CASE
        WHEN v_status.readiness_state = 'invite_created' THEN 'Device connection code is ready.'
        WHEN v_status.readiness_state = 'device_ready' THEN 'Device is ready.'
        ELSE 'Device status is available.'
      END
    );
  END IF;

  v_message := CASE
    WHEN v_profile_configured THEN 'No device is connected yet.'
    ELSE 'Device connection is not configured yet. Try again later.'
  END;

  RETURN jsonb_build_object(
    'ok', true,
    'community_id', p_community_id,
    'dashboard_state', 'no_device',
    'pairing_status', 'not_paired',
    'health_state', 'not_checked',
    'genesis_status', 'not_started',
    'readiness_state', 'no_device',
    'purpose', p_purpose,
    'membership_role', v_membership_role,
    'next_action', 'connect_device',
    'backend_profile_configured', v_profile_configured,
    'message', v_message
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_device_connection_status(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_device_connection_status(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_device_pairing_invitation(
  p_community_id uuid,
  p_purpose text DEFAULT 'standard_device',
  p_device_label text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_membership_role text;
  v_community_name text;
  v_profile RECORD;
  v_invitation_id uuid := gen_random_uuid();
  v_expires_at timestamptz := now() + interval '30 minutes';
  v_payload jsonb;
  v_pairing_code text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_purpose NOT IN ('standard_device', 'local_agent', 'worker_candidate') THEN
    RAISE EXCEPTION 'Unsupported device purpose';
  END IF;

  SELECT cm.role, c.name
    INTO v_membership_role, v_community_name
  FROM public.community_members cm
  JOIN public.communities c ON c.id = cm.community_id
  WHERE cm.community_id = p_community_id
    AND cm.user_id = v_user_id
    AND cm.status = 'approved'
  LIMIT 1;

  IF v_membership_role IS NULL THEN
    RAISE EXCEPTION 'Approved MicroDAO membership required';
  END IF;

  SELECT *
    INTO v_profile
  FROM public.device_backend_profiles
  WHERE is_active = true
  ORDER BY
    CASE environment
      WHEN 'production' THEN 0
      WHEN 'staging' THEN 1
      ELSE 2
    END,
    created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', false,
      'community_id', p_community_id,
      'dashboard_state', 'blocked',
      'pairing_status', 'not_paired',
      'health_state', 'not_checked',
      'genesis_status', 'not_started',
      'readiness_state', 'blocked',
      'purpose', p_purpose,
      'membership_role', v_membership_role,
      'next_action', 'wait_for_backend_profile',
      'backend_profile_configured', false,
      'message', 'Device connection is not configured yet. Try again later.'
    );
  END IF;

  UPDATE public.device_pairing_invitations
  SET status = 'revoked',
      revoked_at = now(),
      updated_at = now()
  WHERE community_id = p_community_id
    AND created_by = v_user_id
    AND purpose = p_purpose
    AND status = 'pending';

  v_payload := jsonb_build_object(
    'schema_version', 1,
    'type', 'daarion.edge_pairing_invite',
    'source', 'loval_echoes',
    'invite_id', v_invitation_id,
    'community_id', p_community_id,
    'community_name', v_community_name,
    'membership_role', v_membership_role,
    'purpose', p_purpose,
    'backendUrl', v_profile.backend_url,
    'label', v_profile.label,
    'environment', v_profile.environment,
    'expires_at', v_expires_at
  );

  v_pairing_code := 'daarion-pair:' || public.encode_device_pairing_payload(v_payload);

  INSERT INTO public.device_pairing_invitations (
    id,
    community_id,
    created_by,
    membership_role,
    backend_profile_id,
    purpose,
    device_label,
    pairing_code,
    pairing_payload,
    status,
    expires_at
  )
  VALUES (
    v_invitation_id,
    p_community_id,
    v_user_id,
    v_membership_role,
    v_profile.id,
    p_purpose,
    NULLIF(trim(COALESCE(p_device_label, '')), ''),
    v_pairing_code,
    v_payload,
    'pending',
    v_expires_at
  );

  INSERT INTO public.microdao_device_statuses (
    community_id,
    user_id,
    latest_invitation_id,
    device_label,
    purpose,
    pairing_status,
    health_state,
    genesis_status,
    readiness_state,
    next_action
  )
  VALUES (
    p_community_id,
    v_user_id,
    v_invitation_id,
    NULLIF(trim(COALESCE(p_device_label, '')), ''),
    p_purpose,
    'invite_created',
    'not_checked',
    'not_started',
    'invite_created',
    'enter_invitation_code'
  )
  ON CONFLICT (community_id, user_id, purpose)
  DO UPDATE SET
    latest_invitation_id = EXCLUDED.latest_invitation_id,
    device_label = EXCLUDED.device_label,
    pairing_status = EXCLUDED.pairing_status,
    health_state = EXCLUDED.health_state,
    genesis_status = EXCLUDED.genesis_status,
    readiness_state = EXCLUDED.readiness_state,
    next_action = EXCLUDED.next_action,
    updated_at = now();

  RETURN public.get_device_connection_status(p_community_id, p_purpose);
END;
$$;

REVOKE ALL ON FUNCTION public.create_device_pairing_invitation(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_device_pairing_invitation(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.record_device_readiness(
  p_invitation_id uuid,
  p_device_id text,
  p_device_label text DEFAULT NULL,
  p_platform text DEFAULT NULL,
  p_pairing_status text DEFAULT 'paired',
  p_health_state text DEFAULT 'not_checked',
  p_genesis_status text DEFAULT 'not_started',
  p_capability_summary jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_invitation RECORD;
  v_readiness_state text;
  v_next_action text;
BEGIN
  IF p_device_id IS NULL OR trim(p_device_id) = '' THEN
    RAISE EXCEPTION 'Device id is required';
  END IF;

  IF p_pairing_status NOT IN ('pairing_required', 'paired', 'failed') THEN
    RAISE EXCEPTION 'Unsupported pairing status';
  END IF;

  IF p_health_state NOT IN ('not_checked', 'pairing_required', 'offline', 'contract_invalid', 'version_mismatch', 'online', 'degraded', 'maintenance') THEN
    RAISE EXCEPTION 'Unsupported health state';
  END IF;

  IF p_genesis_status NOT IN ('not_started', 'required', 'pending', 'complete', 'failed', 'not_required') THEN
    RAISE EXCEPTION 'Unsupported Genesis status';
  END IF;

  SELECT *
    INTO v_invitation
  FROM public.device_pairing_invitations
  WHERE id = p_invitation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Device pairing invitation not found';
  END IF;

  IF v_invitation.status NOT IN ('pending', 'consumed') THEN
    RAISE EXCEPTION 'Device pairing invitation is not active';
  END IF;

  IF v_invitation.expires_at <= now() THEN
    UPDATE public.device_pairing_invitations
    SET status = 'expired',
        updated_at = now()
    WHERE id = p_invitation_id;
    RAISE EXCEPTION 'Device pairing invitation expired';
  END IF;

  v_readiness_state := CASE
    WHEN p_health_state IN ('offline', 'contract_invalid', 'version_mismatch') THEN p_health_state
    WHEN p_pairing_status = 'failed' THEN 'pairing_required'
    WHEN p_pairing_status = 'pairing_required' THEN 'pairing_required'
    WHEN p_pairing_status = 'paired' AND p_genesis_status = 'complete' THEN 'device_ready'
    WHEN p_pairing_status = 'paired' AND p_genesis_status = 'pending' THEN 'genesis_pending'
    WHEN p_pairing_status = 'paired' AND p_genesis_status IN ('required', 'not_started') THEN 'genesis_required'
    WHEN p_pairing_status = 'paired' AND p_health_state IN ('online', 'degraded', 'maintenance') THEN p_health_state
    WHEN p_pairing_status = 'paired' THEN 'paired_unchecked'
    ELSE 'pairing_required'
  END;

  v_next_action := CASE
    WHEN v_readiness_state = 'device_ready' THEN 'start_first_useful_action'
    WHEN v_readiness_state IN ('online', 'degraded', 'maintenance') THEN 'continue'
    WHEN v_readiness_state IN ('genesis_required', 'genesis_pending') THEN 'complete_device_setup'
    WHEN v_readiness_state IN ('offline', 'contract_invalid', 'version_mismatch') THEN 'check_connection'
    ELSE 'continue_device_setup'
  END;

  UPDATE public.device_pairing_invitations
  SET status = 'consumed',
      consumed_at = COALESCE(consumed_at, now()),
      consumed_device_id = p_device_id,
      updated_at = now()
  WHERE id = p_invitation_id;

  INSERT INTO public.microdao_device_statuses (
    community_id,
    user_id,
    latest_invitation_id,
    device_id,
    device_label,
    platform,
    purpose,
    pairing_status,
    health_state,
    genesis_status,
    readiness_state,
    next_action,
    capability_summary,
    last_seen_at
  )
  VALUES (
    v_invitation.community_id,
    v_invitation.created_by,
    v_invitation.id,
    trim(p_device_id),
    NULLIF(trim(COALESCE(p_device_label, v_invitation.device_label, '')), ''),
    NULLIF(trim(COALESCE(p_platform, '')), ''),
    v_invitation.purpose,
    p_pairing_status,
    p_health_state,
    p_genesis_status,
    v_readiness_state,
    v_next_action,
    COALESCE(p_capability_summary, '{}'::jsonb),
    now()
  )
  ON CONFLICT (community_id, user_id, purpose)
  DO UPDATE SET
    latest_invitation_id = EXCLUDED.latest_invitation_id,
    device_id = EXCLUDED.device_id,
    device_label = EXCLUDED.device_label,
    platform = EXCLUDED.platform,
    pairing_status = EXCLUDED.pairing_status,
    health_state = EXCLUDED.health_state,
    genesis_status = EXCLUDED.genesis_status,
    readiness_state = EXCLUDED.readiness_state,
    next_action = EXCLUDED.next_action,
    capability_summary = EXCLUDED.capability_summary,
    last_seen_at = EXCLUDED.last_seen_at,
    updated_at = now();

  RETURN jsonb_build_object(
    'ok', true,
    'community_id', v_invitation.community_id,
    'device_id', trim(p_device_id),
    'readiness_state', v_readiness_state,
    'next_action', v_next_action
  );
END;
$$;

REVOKE ALL ON FUNCTION public.record_device_readiness(uuid, text, text, text, text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_device_readiness(uuid, text, text, text, text, text, text, jsonb) TO service_role;
