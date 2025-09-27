import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useAutoRefresh() {
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.refresh_token) {
          console.log('No refresh token available, skipping auto-refresh');
          return;
        }

        // Check if token will expire in the next 10 minutes
        const expiresAt = session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt ? expiresAt - now : 0;

        // Refresh if token expires in less than 10 minutes (600 seconds)
        if (timeUntilExpiry < 600) {
          console.log('Token expiring soon, refreshing session...');
          
          const response = await fetch('/functions/v1/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-refresh-token': session.refresh_token,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.session) {
              await supabase.auth.setSession(data.session);
              console.log('Session refreshed automatically');
            }
          } else {
            console.log('Failed to refresh session automatically');
          }
        }
      } catch (error) {
        console.error('Auto-refresh error:', error);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(refreshInterval);
  }, []);
}