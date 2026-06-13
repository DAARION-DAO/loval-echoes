import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';

const IDLE_TIMEOUT_MINUTES = 30;

export const useSessionTimeout = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    let idleTimeout: ReturnType<typeof setTimeout>;

    const resetIdleTimer = () => {
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(async () => {
        await supabase.auth.signOut();
        toast({
          title: t.session.timeoutTitle,
          description: t.session.timeoutDesc,
          variant: 'destructive',
        });
        window.location.href = '/auth?reason=idle';
      }, IDLE_TIMEOUT_MINUTES * 60 * 1000);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer);
    });

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimeout);
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer);
      });
    };
  }, [toast, t]);
};
