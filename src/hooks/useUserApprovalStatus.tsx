import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type ApprovalStatus = 'approved' | 'pending' | 'rejected' | 'loading';

export const useUserApprovalStatus = () => {
  const { user, loading: authLoading } = useAuth();
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('loading');
  const retryCountRef = useRef(0);
  const cacheRef = useRef<{ userId: string; status: ApprovalStatus; timestamp: number } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setApprovalStatus('loading');
      return;
    }

    // Check cache first (5 minute TTL)
    if (cacheRef.current?.userId === user.id && 
        Date.now() - cacheRef.current.timestamp < 300000) {
      setApprovalStatus(cacheRef.current.status);
      return;
    }

    const checkApprovalStatus = async () => {
      try {
        console.log('Checking approval status for user:', user.id);
        
        // Use maybeSingle() instead of single() to handle missing records
        const { data, error } = await supabase
          .from('profiles')
          .select('approval_status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking approval status:', error);
          
          // If profile doesn't exist, try to create it
          if (error.code === 'PGRST116' || error.message.includes('not found')) {
            console.log('Profile not found, attempting to create...');
            await createMissingProfile();
            return;
          }
          
          // For other errors, retry with exponential backoff
          if (retryCountRef.current < 3) {
            retryCountRef.current++;
            setTimeout(() => checkApprovalStatus(), Math.pow(2, retryCountRef.current) * 1000);
            return;
          }
          
          setApprovalStatus('pending');
          return;
        }

        if (!data) {
          console.log('No profile data found, attempting to create...');
          await createMissingProfile();
          return;
        }

        const status = data.approval_status as ApprovalStatus;
        const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
        
        console.log('🔍 useUserApprovalStatus Debug:', {
          status,
          profileData: data,
          isMobile,
          userId: user.id,
          userAgent: navigator.userAgent,
          cacheKey: `approval_status_${user.id}`
        });
        
        // Additional check for mobile devices - ensure status is properly set
        if (status === 'approved') {
          console.log('✅ User is approved and should have access to chats', {
            userId: user.id,
            status,
            isMobile,
            timestamp: new Date().toISOString()
          });
        } else {
          console.log('❌ User not approved:', {
            status,
            userId: user.id,
            isMobile,
            timestamp: new Date().toISOString()
          });
        }
        
        setApprovalStatus(status);
        
        // Cache the result
        cacheRef.current = {
          userId: user.id,
          status,
          timestamp: Date.now()
        };
        
        // Reset retry count on success
        retryCountRef.current = 0;
        
      } catch (error) {
        console.error('Error checking approval status:', error);
        
        // Retry logic
        if (retryCountRef.current < 3) {
          retryCountRef.current++;
          setTimeout(() => checkApprovalStatus(), Math.pow(2, retryCountRef.current) * 1000);
        } else {
          setApprovalStatus('pending');
        }
      }
    };

    const createMissingProfile = async () => {
      try {
        console.log('Creating missing profile for user:', user.id);
        
        const { error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            display_name: user.user_metadata?.display_name || 
                         user.user_metadata?.full_name || 
                         user.email?.split('@')[0] || 
                         'Пользователь',
            approval_status: 'pending'
          });

        if (error && !error.message.includes('duplicate key')) {
          console.error('Error creating profile:', error);
          setApprovalStatus('pending');
          return;
        }

        // Profile created or already exists, check status again
        setTimeout(() => checkApprovalStatus(), 1000);
        
      } catch (error) {
        console.error('Error in createMissingProfile:', error);
        setApprovalStatus('pending');
      }
    };

    checkApprovalStatus();

    // Subscribe to changes with reduced frequency to prevent rate limiting
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
            const newStatus = payload.new.approval_status as ApprovalStatus;
            setApprovalStatus(newStatus);
            
            // Update cache
            cacheRef.current = {
              userId: user.id,
              status: newStatus,
              timestamp: Date.now()
            };
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