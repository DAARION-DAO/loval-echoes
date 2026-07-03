import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

type JsonBody = Record<string, unknown>;
type SupabaseClient = ReturnType<typeof createClient>;

type AuthenticatedUser = {
  id: string;
  email?: string | null;
};

export type AuthenticatedRequest = {
  authHeader: string;
  user: AuthenticatedUser;
  userClient: SupabaseClient;
};

export const jsonResponse = (
  body: JsonBody,
  status: number,
  corsHeaders: Record<string, string>,
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

export async function requireAuthenticatedUser(
  req: Request,
  corsHeaders: Record<string, string>,
): Promise<AuthenticatedRequest | Response> {
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  if (!supabaseUrl || !anonKey) {
    return jsonResponse({ error: 'Server auth configuration is missing' }, 500, corsHeaders);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: { user }, error } = await userClient.auth.getUser();
  if (error || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
  }

  return {
    authHeader,
    user: {
      id: user.id,
      email: user.email,
    },
    userClient,
  };
}

export function createServiceClient(corsHeaders: Record<string, string>): SupabaseClient | Response {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Server database configuration is missing' }, 500, corsHeaders);
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function requireConversationAccess(
  userClient: SupabaseClient,
  userId: string,
  conversationId: string,
  corsHeaders: Record<string, string>,
): Promise<true | Response> {
  const { data, error } = await userClient.rpc('is_conversation_participant', {
    p_user_id: userId,
    p_conversation_id: conversationId,
  });

  if (error) {
    return jsonResponse({ error: 'Failed to verify conversation access' }, 500, corsHeaders);
  }

  if (data === true) {
    return true;
  }

  return jsonResponse({ error: 'Forbidden' }, 403, corsHeaders);
}

export async function resolveAccessibleKnowledgeFileIds(
  userClient: SupabaseClient,
  requestedFileIds: string[] | null | undefined,
  corsHeaders: Record<string, string>,
): Promise<string[] | Response> {
  let query = userClient
    .from('files')
    .select('id')
    .eq('is_knowledge_base', true)
    .is('deleted_at', null)
    .limit(100);

  if (requestedFileIds && requestedFileIds.length > 0) {
    query = query.in('id', requestedFileIds);
  }

  const { data, error } = await query;
  if (error) {
    return jsonResponse({ error: 'Failed to verify file access' }, 500, corsHeaders);
  }

  const accessibleIds = (data ?? [])
    .map((row: { id: string }) => row.id)
    .filter(Boolean);

  if (requestedFileIds && requestedFileIds.length > 0) {
    const accessible = new Set(accessibleIds);
    const denied = requestedFileIds.some((id) => !accessible.has(id));
    if (denied) {
      return jsonResponse({ error: 'Forbidden' }, 403, corsHeaders);
    }
  }

  return accessibleIds;
}

export async function requireFileAccess(
  userClient: SupabaseClient,
  fileId: string,
  corsHeaders: Record<string, string>,
): Promise<true | Response> {
  const { data, error } = await userClient
    .from('files')
    .select('id')
    .eq('id', fileId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    return jsonResponse({ error: 'Failed to verify file access' }, 500, corsHeaders);
  }

  if (!data) {
    return jsonResponse({ error: 'Forbidden' }, 403, corsHeaders);
  }

  return true;
}

export async function requireAdminRole(
  userClient: SupabaseClient,
  userId: string,
  corsHeaders: Record<string, string>,
): Promise<true | Response> {
  const { data, error } = await userClient.rpc('has_role', {
    _user_id: userId,
    _role: 'admin',
  });

  if (error) {
    return jsonResponse({ error: 'Failed to verify admin role' }, 500, corsHeaders);
  }

  if (data !== true) {
    return jsonResponse({ error: 'Forbidden' }, 403, corsHeaders);
  }

  return true;
}
