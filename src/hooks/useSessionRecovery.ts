import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';

export const useSessionRecovery = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (!user || !session) return;

    const checkSessionIntegrity = async () => {
      try {
        // Check if user profile exists and is accessible
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, user_id, approval_status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Session integrity check failed:', error);
          return;
        }

        if (!profile) {
          console.log('Profile missing during session check, creating...');
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              display_name: user.user_metadata?.display_name || 
                           user.user_metadata?.full_name || 
                           user.email?.split('@')[0] || 
                           t.messages.userSender,
              approval_status: 'pending'
            });

          if (insertError && !insertError.message.includes('duplicate key')) {
            console.error('Failed to create profile during recovery:', insertError);
          } else {
            console.log('Profile created successfully during session recovery');
          }
        }

      } catch (error) {
        console.error('Session integrity check error:', error);
      }
    };

    // Check session integrity on mount and when session changes
    checkSessionIntegrity();

    // Set up periodic integrity checks (every 5 minutes)
    const interval = setInterval(checkSessionIntegrity, 300000);

    return () => clearInterval(interval);
  }, [user, session, t]);

  useEffect(() => {
    // Handle auth errors and expired tokens
    const handleAuthError = (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('JWT expired') || 
          errorMessage.includes('refresh_token_not_found')) {
        console.log('Session expired, redirecting to login...');
        
        toast({
          title: t.session.expiredTitle,
          description: t.session.expiredDesc,
          variant: 'destructive',
        });

        // Clear local session and redirect
        supabase.auth.signOut();
      }
    };

    // Listen for auth errors
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' && user) {
          console.log('User signed out, clearing cache...');
          // Clear any cached data
          localStorage.removeItem('supabase.auth.token');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [user, toast, t]);
};