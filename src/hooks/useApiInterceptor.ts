import { useEffect } from 'react';
import { authAPI } from '@/lib/authApi';
import { supabase } from '@/integrations/supabase/client';

// Get Supabase URL from environment or use current project values
const SUPABASE_URL = 'https://pbsdsdexayzfoexjdlgb.supabase.co';

// Store original fetch to avoid infinite loops
const originalFetch = window.fetch;

export const useApiInterceptor = () => {
  useEffect(() => {
    // Override fetch to automatically handle token refresh
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      // Skip interception for our own auth endpoints
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/functions/v1/auth/')) {
        return originalFetch(input, init);
      }

      // Skip non-Supabase requests
      if (!url.includes(SUPABASE_URL)) {
        return originalFetch(input, init);
      }

      // Make the original request
      let response = await originalFetch(input, init);

      // If we get a 401 and this isn't already a retry, try to refresh
      if (response.status === 401 && !init?.headers?.['x-retry-after-refresh']) {
        console.log('Got 401, attempting token refresh...');
        
        const refreshed = await authAPI.refreshToken();
        
        if (refreshed) {
          // Get the current session to get the new token
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.access_token) {
            // Retry the original request with the new token
            const retryInit = {
              ...init,
              headers: {
                ...init?.headers,
                'Authorization': `Bearer ${session.access_token}`,
                'x-retry-after-refresh': 'true', // Prevent infinite retry loops
              },
            };
            
            console.log('Retrying request with refreshed token...');
            response = await originalFetch(input, retryInit);
          }
        } else {
          console.log('Token refresh failed, user will need to log in again');
          // The authAPI.refreshToken() call already handles logout if refresh fails
        }
      }

      return response;
    };

    // Cleanup on unmount
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
};