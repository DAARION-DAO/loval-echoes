import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type ApprovalStatus = 'approved' | 'pending' | 'rejected' | 'loading';

export const useUserApprovalStatus = () => {
  const { user, loading: authLoading } = useAuth();
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('loading');

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setApprovalStatus('loading');
      return;
    }

    const checkApprovalStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('approval_status')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error checking approval status:', error);
          setApprovalStatus('pending');
          return;
        }

        setApprovalStatus(data.approval_status as ApprovalStatus);
      } catch (error) {
        console.error('Error checking approval status:', error);
        setApprovalStatus('pending');
      }
    };

    checkApprovalStatus();

    // Subscribe to changes
    const subscription = supabase
      .channel('user_approval_status')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          if (payload.new.approval_status) {
            setApprovalStatus(payload.new.approval_status as ApprovalStatus);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, authLoading]);

  return { approvalStatus, isApproved: approvalStatus === 'approved' };
};