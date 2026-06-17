import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';

const LS_KEY = 'zhos-active-community-id';

export interface CommunityMembership {
  community_id: string;
  role: 'owner' | 'admin' | 'member';
  status: 'pending' | 'approved' | 'rejected';
  community: {
    id: string;
    name: string;
    slug: string | null;
    type: string;
    description: string | null;
    avatar_url: string | null;
    owner_id: string | null;
  };
}

interface ActiveCommunityState {
  loading: boolean;
  error: string | null;
  memberships: CommunityMembership[];
  activeCommunity: CommunityMembership['community'] | null;
  activeCommunityId: string | null;
  userCommunityRole: 'owner' | 'admin' | 'member' | null;
  isCommunityAdmin: boolean;
  needsOnboarding: boolean;
  setActiveCommunityId: (id: string) => void;
  refresh: () => Promise<void>;
}

const ActiveCommunityContext = createContext<ActiveCommunityState | undefined>(undefined);

export const ActiveCommunityProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [memberships, setMemberships] = useState<CommunityMembership[]>([]);
  const [activeCommunityId, setActiveCommunityIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberships = useCallback(async () => {
    if (!user) {
      setMemberships([]);
      setActiveCommunityIdState(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: qErr } = await supabase
        .from('community_members')
        .select('community_id, role, status, community:communities!inner(id, name, slug, type, description, avatar_url, owner_id)')
        .eq('user_id', user.id)
        .eq('status', 'approved');

      if (qErr) throw qErr;

      const list = (data ?? []) as unknown as CommunityMembership[];
      setMemberships(list);

      if (list.length === 0) {
        setActiveCommunityIdState(null);
        localStorage.removeItem(LS_KEY);
      } else if (list.length === 1) {
        setActiveCommunityIdState(list[0].community_id);
        localStorage.setItem(LS_KEY, list[0].community_id);
      } else {
        const saved = localStorage.getItem(LS_KEY);
        const exists = saved && list.find((m) => m.community_id === saved);
        const chosen = exists ? saved! : list[0].community_id;
        setActiveCommunityIdState(chosen);
        localStorage.setItem(LS_KEY, chosen);
      }
    } catch (err: any) {
      console.error('useActiveCommunity error:', err);
      setError(err?.message || t.errors.loadCommunitiesError);
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    if (authLoading) return;
    fetchMemberships();
  }, [authLoading, fetchMemberships]);

  const setActiveCommunityId = useCallback((id: string) => {
    setActiveCommunityIdState(id);
    localStorage.setItem(LS_KEY, id);
  }, []);

  const value = useMemo<ActiveCommunityState>(() => {
    const current = memberships.find((m) => m.community_id === activeCommunityId) ?? null;
    return {
      loading: authLoading || loading,
      error,
      memberships,
      activeCommunity: current?.community ?? null,
      activeCommunityId,
      userCommunityRole: current?.role ?? null,
      isCommunityAdmin: current ? current.role === 'owner' || current.role === 'admin' : false,
      needsOnboarding: !!user && !loading && memberships.length === 0,
      setActiveCommunityId,
      refresh: fetchMemberships,
    };
  }, [authLoading, loading, error, memberships, activeCommunityId, user, setActiveCommunityId, fetchMemberships]);

  return <ActiveCommunityContext.Provider value={value}>{children}</ActiveCommunityContext.Provider>;
};

export const useActiveCommunity = (): ActiveCommunityState => {
  const ctx = useContext(ActiveCommunityContext);
  if (!ctx) throw new Error('useActiveCommunity must be used within ActiveCommunityProvider');
  return ctx;
};
