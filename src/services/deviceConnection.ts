import { supabase } from '@/integrations/supabase/client';

export type DevicePurpose = 'standard_device' | 'local_agent' | 'worker_candidate';

export type DeviceConnectionIntentStatus = 'requires_backend_pairing_contract';

export type DeviceDashboardState =
  | 'no_device'
  | 'invite_available'
  | 'invite_created'
  | 'pairing_required'
  | 'paired_unchecked'
  | 'offline'
  | 'contract_invalid'
  | 'version_mismatch'
  | 'online'
  | 'degraded'
  | 'maintenance'
  | 'genesis_required'
  | 'genesis_pending'
  | 'device_ready'
  | 'blocked';

export type DevicePairingStatus =
  | 'not_paired'
  | 'invite_created'
  | 'pairing_required'
  | 'paired'
  | 'failed'
  | 'revoked';

export type DeviceHealthState =
  | 'not_checked'
  | 'pairing_required'
  | 'offline'
  | 'contract_invalid'
  | 'version_mismatch'
  | 'online'
  | 'degraded'
  | 'maintenance';

export type DeviceGenesisStatus =
  | 'not_started'
  | 'required'
  | 'pending'
  | 'complete'
  | 'failed'
  | 'not_required';

export interface DeviceConnectionIntentInput {
  userId: string;
  communityId: string;
  communityName: string;
  membershipRole: 'owner' | 'admin' | 'member' | string;
  purpose?: DevicePurpose;
}

export interface DeviceConnectionIntent {
  schema_version: 1;
  type: 'daarion.device_connection_intent';
  source: 'loval_echoes_dashboard';
  intent_id: string;
  community_name: string;
  membership_role: string;
  purpose: DevicePurpose;
  status: DeviceConnectionIntentStatus;
  created_at: string;
}

export interface PreparedDeviceConnection {
  status: 'ready_to_connect' | 'missing_context';
  intent: DeviceConnectionIntent | null;
  installPath: string;
}

export interface DeviceConnectionStatusView {
  ok: boolean;
  community_id: string;
  dashboard_state: DeviceDashboardState;
  pairing_status: DevicePairingStatus;
  health_state: DeviceHealthState;
  genesis_status: DeviceGenesisStatus;
  readiness_state: DeviceDashboardState;
  purpose: DevicePurpose;
  membership_role: string;
  next_action: string;
  backend_profile_configured?: boolean;
  message?: string;
  pairing_code?: string | null;
  expires_at?: string | null;
  device_id?: string | null;
  device_label?: string | null;
  platform?: string | null;
  last_seen_at?: string | null;
  capability_summary?: Record<string, unknown> | null;
}

export interface DevicePairingInvitePayload {
  schema_version: 1;
  type: 'daarion.edge_pairing_invite';
  source: 'loval_echoes';
  invite_id: string;
  community_id: string;
  community_name: string;
  membership_role: string;
  purpose: DevicePurpose;
  backendUrl: string;
  label: string;
  environment: string;
  expires_at: string;
}

type SupabaseRpcError = {
  message?: string;
};

type DeviceConnectionRpcClient = {
  rpc: (
    functionName: 'get_device_connection_status' | 'create_device_pairing_invitation',
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: SupabaseRpcError | null }>;
};

const DEVICE_INTENT_QUERY_PARAM = 'deviceIntent';
const DEVICE_INVITE_QUERY_PARAM = 'deviceInvite';
const EDGE_PAIRING_PREFIX = 'daarion-pair:';
const deviceConnectionRpc = supabase as unknown as DeviceConnectionRpcClient;

function createIntentId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `device-intent-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function encodeBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '=',
  );
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function createDeviceConnectionIntent(
  input: DeviceConnectionIntentInput,
): DeviceConnectionIntent {
  return {
    schema_version: 1,
    type: 'daarion.device_connection_intent',
    source: 'loval_echoes_dashboard',
    intent_id: createIntentId(),
    community_name: input.communityName,
    membership_role: input.membershipRole,
    purpose: input.purpose || 'standard_device',
    status: 'requires_backend_pairing_contract',
    created_at: new Date().toISOString(),
  };
}

export function encodeDeviceConnectionIntent(intent: DeviceConnectionIntent): string {
  return encodeBase64Url(JSON.stringify(intent));
}

export function decodeDeviceConnectionIntent(
  value: string | null | undefined,
): DeviceConnectionIntent | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(decodeBase64Url(value)) as Partial<DeviceConnectionIntent>;
    if (
      parsed.schema_version !== 1 ||
      parsed.type !== 'daarion.device_connection_intent' ||
      parsed.source !== 'loval_echoes_dashboard' ||
      !parsed.community_name
    ) {
      return null;
    }

    return parsed as DeviceConnectionIntent;
  } catch {
    return null;
  }
}

export function buildDeviceSetupPath(intent: DeviceConnectionIntent): string {
  const token = encodeDeviceConnectionIntent(intent);
  return `/install?${DEVICE_INTENT_QUERY_PARAM}=${encodeURIComponent(token)}`;
}

export function buildDeviceSetupPathFromPairingCode(pairingCode: string): string {
  return `/install?${DEVICE_INVITE_QUERY_PARAM}=${encodeURIComponent(pairingCode)}`;
}

export function decodeDevicePairingInvite(
  value: string | null | undefined,
): DevicePairingInvitePayload | null {
  if (!value) return null;

  const encoded = value.startsWith(EDGE_PAIRING_PREFIX)
    ? value.slice(EDGE_PAIRING_PREFIX.length)
    : value;

  try {
    const parsed = JSON.parse(decodeBase64Url(encoded)) as Partial<DevicePairingInvitePayload>;
    if (
      parsed.schema_version !== 1 ||
      parsed.type !== 'daarion.edge_pairing_invite' ||
      parsed.source !== 'loval_echoes' ||
      !parsed.invite_id ||
      !parsed.community_name ||
      !parsed.backendUrl
    ) {
      return null;
    }

    return parsed as DevicePairingInvitePayload;
  } catch {
    return null;
  }
}

export function prepareDeviceConnection(
  input: DeviceConnectionIntentInput | null,
): PreparedDeviceConnection {
  if (!input?.userId || !input.communityId || !input.communityName) {
    return {
      status: 'missing_context',
      intent: null,
      installPath: '/install',
    };
  }

  const intent = createDeviceConnectionIntent(input);
  return {
    status: 'ready_to_connect',
    intent,
    installPath: buildDeviceSetupPath(intent),
  };
}

function normalizeStatusView(value: unknown): DeviceConnectionStatusView {
  const data = (value ?? {}) as Partial<DeviceConnectionStatusView>;

  return {
    ok: data.ok !== false,
    community_id: data.community_id || '',
    dashboard_state: data.dashboard_state || 'no_device',
    pairing_status: data.pairing_status || 'not_paired',
    health_state: data.health_state || 'not_checked',
    genesis_status: data.genesis_status || 'not_started',
    readiness_state: data.readiness_state || data.dashboard_state || 'no_device',
    purpose: data.purpose || 'standard_device',
    membership_role: data.membership_role || 'member',
    next_action: data.next_action || 'connect_device',
    backend_profile_configured: data.backend_profile_configured,
    message: data.message,
    pairing_code: data.pairing_code,
    expires_at: data.expires_at,
    device_id: data.device_id,
    device_label: data.device_label,
    platform: data.platform,
    last_seen_at: data.last_seen_at,
    capability_summary: data.capability_summary,
  };
}

export async function getDeviceConnectionStatus(params: {
  communityId: string;
  purpose?: DevicePurpose;
}): Promise<DeviceConnectionStatusView> {
  const { data, error } = await deviceConnectionRpc.rpc('get_device_connection_status', {
    p_community_id: params.communityId,
    p_purpose: params.purpose || 'standard_device',
  });

  if (error) throw error;
  return normalizeStatusView(data);
}

export async function createDevicePairingInvitation(params: {
  communityId: string;
  purpose?: DevicePurpose;
  deviceLabel?: string | null;
}): Promise<DeviceConnectionStatusView> {
  const { data, error } = await deviceConnectionRpc.rpc('create_device_pairing_invitation', {
    p_community_id: params.communityId,
    p_purpose: params.purpose || 'standard_device',
    p_device_label: params.deviceLabel || null,
  });

  if (error) throw error;
  return normalizeStatusView(data);
}
