import { supabase } from '@/integrations/supabase/client';

export type CommunityRole = 'owner' | 'admin' | 'member';
export type InviteRole = 'admin' | 'member';

export interface CommunityMemberProfile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
}

export interface CommunityMemberView {
  id: string;
  community_id: string;
  user_id: string;
  role: string;
  status: string;
  created_at: string;
  profile: CommunityMemberProfile | null;
}

export interface InviteCodeView {
  id: string;
  code: string;
  role_to_grant: string | null;
  is_active: boolean | null;
  used_count: number | null;
  max_uses: number | null;
  expires_at: string | null;
}

const normalizeCodePart = (value: string) => {
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  return clean || 'MICRODAO';
};

const randomSuffix = () => {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(36).toUpperCase().padStart(2, '0'))
    .join('')
    .slice(0, 5);
};

export const buildInviteCode = (communityName: string, role: InviteRole) =>
  `${normalizeCodePart(communityName)}-${role.toUpperCase()}-${randomSuffix()}`;

import { getPublicSiteUrl } from '@/lib/publicUrl';

export const buildInviteUrl = (code: string, origin = getPublicSiteUrl()) =>
  `${origin}/onboarding?inviteCode=${encodeURIComponent(code)}`;

export async function loadCommunityMembers(communityId: string): Promise<CommunityMemberView[]> {
  const { data: rows, error } = await supabase
    .from('community_members')
    .select('id, community_id, user_id, role, status, created_at')
    .eq('community_id', communityId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const userIds = [...new Set((rows ?? []).map((row) => row.user_id).filter(Boolean))];
  const { data: profiles, error: profilesError } = userIds.length > 0
    ? await supabase.rpc('get_public_profiles', { p_user_ids: userIds })
    : { data: [], error: null };

  if (profilesError) {
    console.warn('Unable to load public profiles for members:', profilesError.message);
  }

  const profileByUserId = new Map(
    (profiles ?? []).map((profile) => [
      profile.user_id,
      {
        user_id: profile.user_id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
      },
    ]),
  );

  return (rows ?? []).map((row) => ({
    ...row,
    profile: profileByUserId.get(row.user_id) ?? null,
  }));
}

export async function loadInviteCodes(communityId: string): Promise<InviteCodeView[]> {
  const { data, error } = await supabase
    .from('invitation_codes')
    .select('id, code, role_to_grant, is_active, used_count, max_uses, expires_at')
    .eq('community_id', communityId)
    .eq('is_active', true)
    .in('role_to_grant', ['member', 'admin'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function regenerateInviteCode(params: {
  communityId: string;
  communityName: string;
  role: InviteRole;
  createdBy: string;
  maxUses?: number | null;
}): Promise<InviteCodeView> {
  const { communityId, communityName, role, createdBy, maxUses = 50 } = params;

  const { data: existingCodes, error: existingError } = await supabase
    .from('invitation_codes')
    .select('id')
    .eq('community_id', communityId)
    .eq('role_to_grant', role)
    .eq('is_active', true);

  if (existingError) throw existingError;

  const { data, error } = await supabase
    .from('invitation_codes')
    .insert({
      scope: 'community',
      community_id: communityId,
      code: buildInviteCode(communityName, role),
      role_to_grant: role,
      max_uses: maxUses,
      is_active: true,
      created_by: createdBy,
    })
    .select('id, code, role_to_grant, is_active, used_count, max_uses, expires_at')
    .single();

  if (error) throw error;

  const existingIds = (existingCodes ?? []).map((code) => code.id);
  if (existingIds.length === 0) return data;

  const { error: deactivateError } = await supabase
    .from('invitation_codes')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .in('id', existingIds);

  if (deactivateError) throw deactivateError;
  return data;
}

export async function updateCommunityMemberRole(memberId: string, role: CommunityRole) {
  const { error } = await supabase
    .from('community_members')
    .update({ role })
    .eq('id', memberId);

  if (error) throw error;
}

export async function removeCommunityMember(memberId: string) {
  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('id', memberId);

  if (error) throw error;
}
