export type DevicePurpose = 'standard_device' | 'local_agent' | 'worker_candidate';

export type DeviceConnectionIntentStatus = 'requires_backend_pairing_contract';

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

const DEVICE_INTENT_QUERY_PARAM = 'deviceIntent';

function createIntentId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `device-intent-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function encodeBase64Url(value: string): string {
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
