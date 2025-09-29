import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const REMEMBER_ME_KEY = 'zhos-remember-me';
const USER_EMAIL_KEY = 'zhos-user-email';

export function useRememberMe() {
  const saveCredentials = (email: string, remember: boolean) => {
    if (remember) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
      localStorage.setItem(USER_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
      localStorage.removeItem(USER_EMAIL_KEY);
    }
  };

  const getSavedEmail = (): string => {
    const isRemembered = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
    if (isRemembered) {
      return localStorage.getItem(USER_EMAIL_KEY) || '';
    }
    return '';
  };

  const isRemembered = (): boolean => {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  };

  const clearSavedCredentials = () => {
    localStorage.removeItem(REMEMBER_ME_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
  };

  // Auto-login on app start if remembered
  const attemptAutoLogin = async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user) {
        console.log('Auto-login successful - existing session found');
        return true;
      }

      // If no session but user is remembered, refresh the session
      if (isRemembered()) {
        console.log('Attempting to refresh remembered session');
        const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
        
        if (refreshedSession && !error) {
          console.log('Session refreshed successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Auto-login failed:', error);
      clearSavedCredentials();
      return false;
    }
  };

  return {
    saveCredentials,
    getSavedEmail,
    isRemembered,
    clearSavedCredentials,
    attemptAutoLogin
  };
}