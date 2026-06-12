import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const usePendingApprovals = () => {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPendingCount = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_approval_requests')
        .select('id')
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching pending approvals:', error);
        return;
      }

      setPendingCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCount();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to changes in approval requests (unique channel per mount to avoid reuse)
    const channel = supabase
      .channel(`pending_approvals_${user.id}_${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'user_approval_requests'
        },
        () => {
          fetchPendingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { pendingCount, loading, refetch: fetchPendingCount };
};