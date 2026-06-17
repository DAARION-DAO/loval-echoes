import { supabase } from '@/integrations/supabase/client';
import { generateCommunitySpiritPrompt } from '@/lib/communitySpiritPrompt';
import type { Database, Json } from '@/integrations/supabase/types';

type CommunityRow = Database['public']['Tables']['communities']['Row'];
type AgentRow = Database['public']['Tables']['agents']['Row'];

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const AVATAR_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const DEFAULT_SPIRIT_PERMISSIONS = {
  can_invite_guests: true,
  can_create_tasks: true,
  can_send_welcome_messages: true,
  can_create_summaries: true,
  can_suggest_roles: true,
  can_approve_members: false,
  can_make_admins: false,
  can_remove_members: false,
  can_delete_community: false,
  requires_human_approval_for_sensitive_actions: true,
};

export class AvatarUploadError extends Error {
  constructor(
    message: string,
    public readonly code: 'too_large' | 'unsupported_type' | 'not_authenticated' | 'upload_failed',
  ) {
    super(message);
    this.name = 'AvatarUploadError';
  }
}

function getAvatarExtension(file: File) {
  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    throw new AvatarUploadError('Avatar file is too large', 'too_large');
  }

  const extension = AVATAR_EXTENSIONS[file.type];
  if (!extension) {
    throw new AvatarUploadError('Avatar file type is not supported', 'unsupported_type');
  }

  return extension;
}

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new AvatarUploadError('User is not authenticated', 'not_authenticated');
  }

  return data.user.id;
}

async function uploadAvatarFile(file: File, path: string) {
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, {
      upsert: true,
      cacheControl: '3600',
      contentType: file.type,
    });

  if (error) {
    throw new AvatarUploadError(error.message, 'upload_failed');
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(path);

  return `${publicUrl}?v=${Date.now()}`;
}

async function logAvatarUpload(userId: string, eventType: string, file: File, path: string) {
  try {
    await supabase.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: eventType,
      p_event_data: {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: path,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.warn('[avatar-upload] audit log failed; upload kept:', error);
  }
}

export async function uploadProfileAvatar(file: File) {
  const userId = await getCurrentUserId();
  const extension = getAvatarExtension(file);
  const path = `${userId}/avatar.${extension}`;
  const avatarUrl = await uploadAvatarFile(file, path);

  await logAvatarUpload(userId, 'avatar_upload', file, path);

  const { data, error } = await supabase
    .from('profiles')
    .update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  return { avatarUrl, profile: data };
}

export async function uploadCommunityAvatar(file: File, communityId: string) {
  const userId = await getCurrentUserId();
  const extension = getAvatarExtension(file);
  const path = `${userId}/communities/${communityId}/avatar.${extension}`;
  const avatarUrl = await uploadAvatarFile(file, path);

  await logAvatarUpload(userId, 'community_avatar_upload', file, path);

  const { data, error } = await supabase
    .from('communities')
    .update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', communityId)
    .select('id, name, slug, type, description, avatar_url, owner_id, created_at, updated_at')
    .single();

  if (error) throw error;

  return data;
}

export async function updateActiveCommunity(params: {
  communityId: string;
  name: string;
  description: string | null;
  avatarUrl?: string | null;
}) {
  const name = params.name.trim();
  if (!name) {
    throw new Error('Community name is required');
  }

  const updates: Database['public']['Tables']['communities']['Update'] = {
    name,
    description: params.description?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  if (params.avatarUrl !== undefined) {
    updates.avatar_url = params.avatarUrl;
  }

  const { data, error } = await supabase
    .from('communities')
    .update(updates)
    .eq('id', params.communityId)
    .select('id, name, slug, type, description, avatar_url, owner_id, created_at, updated_at')
    .single();

  if (error) throw error;

  return data;
}

async function ensureSpiritPermissions(agentId: string, communityId: string) {
  const { data: existing, error: readError } = await supabase
    .from('agent_permissions')
    .select('id')
    .eq('agent_id', agentId)
    .maybeSingle();

  if (readError) throw readError;
  if (existing) return;

  const { error } = await supabase.from('agent_permissions').insert({
    agent_id: agentId,
    community_id: communityId,
    ...DEFAULT_SPIRIT_PERMISSIONS,
  });

  if (error) throw error;
}

export async function ensureCommunitySpiritAgent(params: {
  community: Pick<CommunityRow, 'id' | 'name' | 'description'>;
  userId: string;
}): Promise<{ agent: AgentRow; created: boolean }> {
  const { community, userId } = params;

  const { data: existingAgent, error: readError } = await supabase
    .from('agents')
    .select('*')
    .eq('community_id', community.id)
    .eq('agent_type', 'community_spirit')
    .maybeSingle();

  if (readError) throw readError;

  if (existingAgent) {
    await ensureSpiritPermissions(existingAgent.id, community.id);
    return { agent: existingAgent, created: false };
  }

  const agentName = `Дух ${community.name}`;
  const mission = community.description?.trim() || `Координація, пам'ять та онбординг MicroDAO ${community.name}.`;
  const personality = {
    autonomy_level: 'supervised',
    mission,
    goal_30_days: '',
    values_rules: '',
    language: 'uk',
    tone: 'warm',
    communication_style: 'friendly',
    strictness: 'medium',
    decision_style: 'human_approved',
    conflict_style: 'peaceful',
  };

  const systemPrompt = generateCommunitySpiritPrompt({
    agentName,
    communityName: community.name,
    mission,
    goal30Days: '',
    valuesRules: '',
    tone: personality.tone,
    communicationStyle: personality.communication_style,
    strictness: personality.strictness,
    decisionStyle: personality.decision_style,
    conflictStyle: personality.conflict_style,
    enabledModules: [],
    permissions: DEFAULT_SPIRIT_PERMISSIONS,
  });

  const { data: agent, error: insertError } = await supabase
    .from('agents')
    .insert({
      name: agentName,
      description: `Дух Спільноти для ${community.name}. Зберігає пам'ять, веде онбординг та допомагає з процесами.`,
      owner_user_id: userId,
      connection_type: 'msp',
      status: 'active',
      is_preset: false,
      scope: 'community',
      community_id: community.id,
      agent_type: 'community_spirit',
      memory_scope: 'community',
      system_prompt: systemPrompt,
      personality: personality as Json,
    })
    .select('*')
    .single();

  if (insertError) throw insertError;

  await ensureSpiritPermissions(agent.id, community.id);

  return { agent, created: true };
}

export { MAX_AVATAR_SIZE_BYTES };
