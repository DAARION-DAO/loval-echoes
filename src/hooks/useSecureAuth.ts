import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecureAuthResult {
  success: boolean;
  error?: string;
  rateLimited?: boolean;
  authError?: boolean;
}

export const useSecureAuth = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getClientInfo = () => {
    return {
      userAgent: navigator.userAgent,
      // Note: Real IP will be determined server-side
      timestamp: new Date().toISOString()
    };
  };

  const secureSignIn = async (email: string, password: string): Promise<SecureAuthResult> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('auth-security', {
        body: {
          action: 'login',
          email,
          password,
          ...getClientInfo()
        }
      });

      if (error) {
        console.error('Secure sign in error:', error);
        return { success: false, error: 'Ошибка подключения к серверу' };
      }

      if (data.rateLimited) {
        toast({
          title: 'Слишком много попыток',
          description: data.error,
          variant: 'destructive'
        });
        return { success: false, rateLimited: true, error: data.error };
      }

      if (data.authError) {
        let friendlyError = 'Ошибка входа';
        if (data.error.includes('Invalid login credentials')) {
          friendlyError = 'Неверный email или пароль';
        } else if (data.error.includes('Email not confirmed')) {
          friendlyError = 'Подтвердите email для входа';
        }
        
        toast({
          title: 'Ошибка входа',
          description: friendlyError,
          variant: 'destructive'
        });
        return { success: false, authError: true, error: friendlyError };
      }

      if (data.success) {
        // Set the session on the client using the data returned from edge function
        if (data.data?.session) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: data.data.session.access_token,
            refresh_token: data.data.session.refresh_token
          });
          
          if (setSessionError) {
            console.error('Error setting session:', setSessionError);
            return { success: false, error: 'Ошибка установки сессии' };
          }
        }
        
        toast({
          title: 'Успешный вход',
          description: 'Добро пожаловать!',
        });
        return { success: true };
      }

      return { success: false, error: data.error || 'Неизвестная ошибка' };

    } catch (error: any) {
      console.error('Secure auth error:', error);
      return { success: false, error: 'Ошибка подключения' };
    } finally {
      setLoading(false);
    }
  };

  const secureSignUp = async (email: string, password: string, displayName: string): Promise<SecureAuthResult> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('auth-security', {
        body: {
          action: 'signup',
          email,
          password,
          displayName,
          ...getClientInfo()
        }
      });

      if (error) {
        console.error('Secure sign up error:', error);
        
        // Log client-side registration error
        try {
          await supabase.rpc('enhanced_log_security_event', {
            p_user_id: null,
            p_event_type: 'auth_client_error',
            p_event_data: { error: error.message, action: 'signup' },
            p_severity: 'error'
          });
        } catch (logError) {
          console.error('Failed to log security event:', logError);
        }
        
        return { success: false, error: 'Ошибка подключения к серверу' };
      }

      if (data.rateLimited) {
        // Log rate limit event
        try {
          await supabase.rpc('enhanced_log_security_event', {
            p_user_id: null,
            p_event_type: 'rate_limit_blocked_client',
            p_event_data: { email, action: 'signup' },
            p_severity: 'warning'
          });
        } catch (logError) {
          console.error('Failed to log security event:', logError);
        }
        
        toast({
          title: 'Слишком много попыток',
          description: data.error,
          variant: 'destructive'
        });
        return { success: false, rateLimited: true, error: data.error };
      }

      if (data.authError) {
        let friendlyError = 'Ошибка регистрации';
        if (data.error.includes('already registered')) {
          friendlyError = 'Пользователь с таким email уже существует';
        }
        
        // Log failed registration attempt
        try {
          await supabase.rpc('enhanced_log_security_event', {
            p_user_id: null,
            p_event_type: 'secure_auth_failed',
            p_event_data: { email, action: 'signup', error: data.error },
            p_severity: 'warning'
          });
        } catch (logError) {
          console.error('Failed to log security event:', logError);
        }
        
        toast({
          title: 'Ошибка регистрации',
          description: friendlyError,
          variant: 'destructive'
        });
        return { success: false, authError: true, error: friendlyError };
      }

      if (data.success) {
        // Set the session on the client if provided (for confirmed users)
        if (data.data?.session) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: data.data.session.access_token,
            refresh_token: data.data.session.refresh_token
          });
          
          if (setSessionError) {
            console.error('Error setting session after signup:', setSessionError);
          }
        }
        
        // Log successful registration
        try {
          await supabase.rpc('enhanced_log_security_event', {
            p_user_id: null,
            p_event_type: 'secure_auth_success',
            p_event_data: { email, action: 'signup' },
            p_severity: 'info'
          });
        } catch (logError) {
          console.error('Failed to log security event:', logError);
        }
        
        toast({
          title: 'Регистрация успешна',
          description: 'Проверьте email для подтверждения',
        });
        return { success: true };
      }

      return { success: false, error: data.error || 'Неизвестная ошибка' };

    } catch (error: any) {
      console.error('Secure signup error:', error);
      
      // Log client-side error
      try {
        await supabase.rpc('enhanced_log_security_event', {
          p_user_id: null,
          p_event_type: 'auth_client_error',
          p_event_data: { error: error.message || 'Unknown error', action: 'signup' },
          p_severity: 'error'
        });
      } catch (logError) {
        console.error('Failed to log security event:', logError);
      }
      
      return { success: false, error: 'Ошибка подключения' };
    } finally {
      setLoading(false);
    }
  };

  const securePasswordReset = async (email: string): Promise<SecureAuthResult> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('auth-security', {
        body: {
          action: 'password_reset',
          email,
          ...getClientInfo()
        }
      });

      if (error) {
        console.error('Secure password reset error:', error);
        return { success: false, error: 'Ошибка подключения к серверу' };
      }

      if (data.rateLimited) {
        toast({
          title: 'Слишком много попыток',
          description: data.error,
          variant: 'destructive'
        });
        return { success: false, rateLimited: true, error: data.error };
      }

      if (data.success) {
        toast({
          title: 'Письмо отправлено',
          description: 'Проверьте email для восстановления пароля',
        });
        return { success: true };
      }

      return { success: false, error: data.error || 'Неизвестная ошибка' };

    } catch (error) {
      console.error('Secure password reset error:', error);
      return { success: false, error: 'Ошибка подключения' };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    secureSignIn,
    secureSignUp,
    securePasswordReset
  };
};