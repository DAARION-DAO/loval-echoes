import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const IDLE_TIMEOUT_MINUTES = 30;

export const useSessionTimeout = () => {
  const { toast } = useToast();

  useEffect(() => {
    let idleTimeout: ReturnType<typeof setTimeout>;

    const resetIdleTimer = () => {
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(async () => {
        await supabase.auth.signOut();
        toast({
          title: 'Сессия истекла',
          description: 'Вы были автоматически выведены из системы из-за неактивности',
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
  }, [toast]);
};
