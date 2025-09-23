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
        toast({
          title: 'Успешный вход',
          description: 'Добро пожаловать!',
        });
        return { success: true };
      }

      return { success: false, error: data.error || 'Неизвестная ошибка' };

    } catch (error) {
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
        let friendlyError = 'Ошибка регистрации';
        if (data.error.includes('already registered')) {
          friendlyError = 'Пользователь с таким email уже существует';
        }
        
        toast({
          title: 'Ошибка регистрации',
          description: friendlyError,
          variant: 'destructive'
        });
        return { success: false, authError: true, error: friendlyError };
      }

      if (data.success) {
        toast({
          title: 'Регистрация успешна',
          description: 'Проверьте email для подтверждения',
        });
        return { success: true };
      }

      return { success: false, error: data.error || 'Неизвестная ошибка' };

    } catch (error) {
      console.error('Secure signup error:', error);
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