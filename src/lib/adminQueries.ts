import { supabase } from '@/integrations/supabase/client';

export interface AdminOverviewData {
  total_users: number;
  active_users: number;
  pending_access_requests: number;
  total_microdaos: number;
  active_microdaos: number;
  microdaos_without_spirit_agent: number;
  active_spirit_agents: number;
  pending_agent_approvals: number;
  blocked_users: number;
  billing_active_subscriptions: number;
  billing_past_due: number;
  billing_no_subscription: number;
}

export interface AdminUserRow {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  approval_status: string | null;
  role: string | null;
  access_tier: string | null;
  created_at: string;
  microdao_count: number;
}

export interface AdminMicroDAORow {
  id: string;
  name: string;
  slug: string | null;
  type: string;
  owner_id: string | null;
  owner_email: string | null;
  owner_name: string | null;
  created_at: string;
  member_count: number;
  agent_status: string;
  has_spirit_agent: boolean;
}

export interface AdminAccessRequestRow {
  id: string;
  user_id: string | null;
  email: string | null;
  display_name: string | null;
  use_case: string | null;
  requested_tier: string | null;
  status: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface AdminAgentOpsData {
  total_agents: number;
  spirit_agents: number;
  agents_by_status: Record<string, number>;
  agents_by_type: Record<string, number>;
  recent_logs: any[];
  recent_errors: any[];
}

export const isRlsOrSchemaError = (error: any): boolean => {
  if (!error) return false;
  const code = error.code || '';
  const message = error.message || '';
  return (
    code === '42P01' || // missing table
    code === '42883' || // missing function/RPC
    code === 'PGRST116' || // RLS/single row error
    message.toLowerCase().includes('permission denied') ||
    message.toLowerCase().includes('row-level security') ||
    message.toLowerCase().includes('does not exist')
  );
};

export const getAdminOverview = async (): Promise<{ data: AdminOverviewData | null; error: any; isRpc: boolean }> => {
  try {
    const { data, error } = await (supabase as any).rpc('get_platform_admin_overview');
    if (!error) {
      return { data: data as any as AdminOverviewData, error: null, isRpc: true };
    }
    
    console.warn('RPC get_platform_admin_overview failed, falling back to direct counts:', error);
    
    // Direct counts fallback
    const { count: totalUsers, error: uErr } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    if (uErr && isRlsOrSchemaError(uErr)) {
      return { data: null, error: uErr, isRpc: false };
    }

    const { count: activeUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('approval_status', 'approved');
    const { count: blockedUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).in('approval_status', ['rejected', 'blocked']);
    const { count: totalMicrodaos } = await supabase.from('communities').select('*', { count: 'exact', head: true });
    
    let pendingAccessRequests = 0;
    try {
      const { count: pendingAR } = await (supabase as any).from('access_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      pendingAccessRequests += pendingAR || 0;
    } catch {
      // Ignored if table doesn't exist
    }
    try {
      const { count: pendingUAR } = await supabase.from('user_approval_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      pendingAccessRequests += pendingUAR || 0;
    } catch {
      // Ignored if table doesn't exist
    }
    
    const { count: activeSpiritAgents } = await supabase.from('agents').select('*', { count: 'exact', head: true }).eq('agent_type', 'spirit').eq('status', 'active');

    const fallbackData: AdminOverviewData = {
      total_users: totalUsers || 0,
      active_users: activeUsers || 0,
      pending_access_requests: pendingAccessRequests,
      total_microdaos: totalMicrodaos || 0,
      active_microdaos: totalMicrodaos || 0,
      microdaos_without_spirit_agent: 0,
      active_spirit_agents: activeSpiritAgents || 0,
      pending_agent_approvals: 0,
      blocked_users: blockedUsers || 0,
      billing_active_subscriptions: 0,
      billing_past_due: 0,
      billing_no_subscription: totalMicrodaos || 0
    };
    
    return { data: fallbackData, error: null, isRpc: false };
  } catch (err: any) {
    return { data: null, error: err, isRpc: false };
  }
};

export const getAdminUsers = async (): Promise<{ data: AdminUserRow[] | null; error: any; isRpc: boolean }> => {
  try {
    const { data, error } = await (supabase as any).rpc('get_platform_admin_users');
    if (!error) {
      return { data: data as any as AdminUserRow[], error: null, isRpc: true };
    }
    
    console.warn('RPC get_platform_admin_users failed, falling back to direct profiles query:', error);
    
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (pErr) {
      return { data: null, error: pErr, isRpc: false };
    }

    // Since we're client-side, we can map profiles to AdminUserRow structure
    const mapped: AdminUserRow[] = (profiles || []).map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      email: p.email,
      display_name: p.display_name,
      approval_status: p.approval_status,
      role: p.role,
      access_tier: p.access_tier || 'early_access',
      created_at: p.created_at,
      microdao_count: 0 // Fetching count for all users client-side is expensive; default to 0
    }));

    return { data: mapped, error: null, isRpc: false };
  } catch (err: any) {
    return { data: null, error: err, isRpc: false };
  }
};

export const getAdminMicroDAOs = async (): Promise<{ data: AdminMicroDAORow[] | null; error: any; isRpc: boolean }> => {
  try {
    const { data, error } = await (supabase as any).rpc('get_platform_admin_microdaos');
    if (!error) {
      return { data: data as any as AdminMicroDAORow[], error: null, isRpc: true };
    }
    
    console.warn('RPC get_platform_admin_microdaos failed, falling back to communities query:', error);
    
    const { data: communities, error: cErr } = await supabase
      .from('communities')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (cErr) {
      return { data: null, error: cErr, isRpc: false };
    }

    const mapped: AdminMicroDAORow[] = (communities || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      type: c.type || 'standard',
      owner_id: c.owner_id,
      owner_email: null,
      owner_name: null,
      created_at: c.created_at,
      member_count: 0,
      agent_status: 'none',
      has_spirit_agent: false
    }));

    return { data: mapped, error: null, isRpc: false };
  } catch (err: any) {
    return { data: null, error: err, isRpc: false };
  }
};

export const getAdminAccessRequests = async (): Promise<{ data: AdminAccessRequestRow[] | null; error: any; isRpc: boolean }> => {
  try {
    const { data, error } = await (supabase as any).rpc('get_platform_admin_access_requests');
    if (!error) {
      return { data: data as any as AdminAccessRequestRow[], error: null, isRpc: true };
    }
    
    console.warn('RPC get_platform_admin_access_requests failed, falling back to access_requests table:', error);
    
    // Fallback to table access_requests
    const { data: requests, error: rErr } = await (supabase as any)
      .from('access_requests')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!rErr) {
      return { data: requests as any as AdminAccessRequestRow[], error: null, isRpc: false };
    }

    // If access_requests doesn't exist, try user_approval_requests
    console.warn('Table access_requests query failed, trying user_approval_requests:', rErr);
    const { data: uarRequests, error: uarErr } = await supabase
      .from('user_approval_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (uarErr) {
      return { data: null, error: uarErr, isRpc: false };
    }

    const mapped: AdminAccessRequestRow[] = (uarRequests || []).map((uar: any) => ({
      id: uar.id,
      user_id: uar.user_id,
      email: null,
      display_name: null,
      use_case: `Total existing users at request: ${uar.total_existing_users}`,
      requested_tier: 'Waitlist',
      status: uar.status,
      created_at: uar.created_at || uar.requested_at || new Date().toISOString(),
      reviewed_at: uar.updated_at,
      reviewed_by: uar.approved_by?.[0] || uar.rejected_by?.[0] || null
    }));

    return { data: mapped, error: null, isRpc: false };
  } catch (err: any) {
    return { data: null, error: err, isRpc: false };
  }
};

export const getAdminAgentOps = async (): Promise<{ data: AdminAgentOpsData | null; error: any; isRpc: boolean }> => {
  try {
    const { data, error } = await (supabase as any).rpc('get_platform_admin_agent_ops');
    if (!error) {
      return { data: data as any as AdminAgentOpsData, error: null, isRpc: true };
    }
    
    console.warn('RPC get_platform_admin_agent_ops failed, falling back to direct queries:', error);
    
    const { data: agents, error: aErr } = await supabase.from('agents').select('*');
    if (aErr) {
      return { data: null, error: aErr, isRpc: false };
    }

    const totalAgents = agents?.length || 0;
    const spiritAgents = agents?.filter((a: any) => a.agent_type === 'spirit').length || 0;

    const agentsByStatus: Record<string, number> = {};
    const agentsByType: Record<string, number> = {};

    agents?.forEach((a: any) => {
      agentsByStatus[a.status] = (agentsByStatus[a.status] || 0) + 1;
      agentsByType[a.agent_type] = (agentsByType[a.agent_type] || 0) + 1;
    });

    let recentLogs: any[] = [];
    try {
      const { data: logs } = await supabase
        .from('agent_action_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      recentLogs = logs || [];
    } catch {
      // Ignored
    }

    const fallbackData: AdminAgentOpsData = {
      total_agents: totalAgents,
      spirit_agents: spiritAgents,
      agents_by_status: agentsByStatus,
      agents_by_type: agentsByType,
      recent_logs: recentLogs,
      recent_errors: recentLogs.filter((l: any) => l.status === 'failed')
    };

    return { data: fallbackData, error: null, isRpc: false };
  } catch (err: any) {
    return { data: null, error: err, isRpc: false };
  }
};
