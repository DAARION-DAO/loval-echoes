import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type ApprovalStatus = 'approved' | 'pending' | 'rejected' | 'loading';

export const useUserApprovalStatus = () => {
  const { user, loading: authLoading } = useAuth();
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('loading');
  const [accessTier, setAccessTier] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) {
      setApprovalStatus('loading');
      return;
    }

    const checkApprovalStatus = async () => {
      try {
        console.log('🔍 Checking approval status for user:', user.id);
        
        const { data, error } = await (supabase
          .from('profiles')
          .select('approval_status, access_tier')
          .eq('user_id', user.id)
          .maybeSingle() as any);

        if (error) {
          console.error('❌ Error checking approval status:', error);
          // Default to pending on error to be safe
          setApprovalStatus('pending');
          return;
        }

        if (!data) {
          console.log('📝 No profile found, creating one...');
          // Create profile if it doesn't exist
          const { error: insertError } = await (supabase as any)
            .from('profiles')
            .insert({
              user_id: user.id,
              display_name: user.user_metadata?.display_name || 
                           user.user_metadata?.full_name || 
                           user.email?.split('@')[0] || 
                           'Пользователь',
              approval_status: 'pending',
              access_tier: 'early_access'
            });

          if (insertError && !insertError.message.includes('duplicate key')) {
            console.error('❌ Error creating profile:', insertError);
          }
          
          setApprovalStatus('pending');
          return;
        }

        const status = data.approval_status as ApprovalStatus;
        console.log(`✅ User approval status: ${status} for user ${user.id}`);
        setApprovalStatus(status);
        setAccessTier(data.access_tier || 'early_access');
        
      } catch (error) {
        console.error('❌ Unexpected error checking approval status:', error);
        setApprovalStatus('pending');
      }
    };

    checkApprovalStatus();

    // Simple real-time subscription without complex retry logic
    const subscription = supabase
      .channel(`user_approval_${user.id}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          const newStatus = payload.new.approval_status as ApprovalStatus;
          console.log(`🔄 Real-time update: User ${user.id} status changed to ${newStatus}`);
          setApprovalStatus(newStatus);
          setAccessTier(payload.new.access_tier || 'early_access');
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, authLoading]);

  return { 
    approvalStatus, 
    isApproved: approvalStatus === 'approved', 
    accessTier 
  };
};