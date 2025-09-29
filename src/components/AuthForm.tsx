import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useAuth } from '@/hooks/useAuth';
import { useRememberMe } from '@/hooks/useRememberMe';


export const AuthForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading: secureAuthLoading, secureSignIn, secureSignUp } = useSecureAuth();
  const { saveCredentials, getSavedEmail, isRemembered, attemptAutoLogin } = useRememberMe();
  
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });

  // Initialize form with saved email if remembered
  useEffect(() => {
    const savedEmail = getSavedEmail();
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, [getSavedEmail]);

  // Auto-approved users list
  const autoApprovedUsers = [
    'shurik.orlov@gmail.com',
    'radosvetdamir@gmail.com', 
    'admin@zhos.com',
    'moderator@zhos.com',
    'guardian@zhos.com',
    'developer@zhos.com'
  ];


  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      console.log('User detected in AuthForm, redirecting to home');
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Check for password reset mode on mount
  useEffect(() => {
    const checkForPasswordReset = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      // Check URL search params
      if (urlParams.get('reset') === 'true') {
        setIsPasswordReset(true);
        console.log('Password reset mode activated from URL params');
      }
      
      // Check hash params (Supabase auth callback)
      if (hashParams.get('type') === 'recovery') {
        setIsPasswordReset(true);
        console.log('Password reset mode activated from hash params');
      }
      
      // Handle auth callback errors
      const error = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');
      if (error) {
        console.error('Auth callback error:', error, errorDescription);
        toast({
          title: 'Ошибка аутентификации',
          description: errorDescription || error,
          variant: 'destructive',
        });
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    checkForPasswordReset();
    
    // Listen for hash changes
    const handleHashChange = () => {
      checkForPasswordReset();
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [toast]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: t.error,
        description: 'Пожалуйста, заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Try secure auth first
      const result = await secureSignUp(
        formData.email, 
        formData.password, 
        formData.displayName || formData.email.split('@')[0]
      );

      if (result.success) {
        toast({
          title: 'Регистрация успешна',
          description: 'Проверьте email для подтверждения аккаунта. Письмо может прийти в папку "Спам".',
        });
        return;
      }

      // If secure auth fails, fallback to direct Supabase
      if (result.error?.includes('not found') || result.rateLimited) {
        console.log('Falling back to direct Supabase auth');
        
        const redirectUrl = `${window.location.origin}/`;
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              display_name: formData.displayName || formData.email.split('@')[0]
            }
          }
        });

        if (error) {
          if (error.message.includes('User already registered') || error.message.includes('already been registered')) {
            toast({
              title: 'Пользователь уже существует',
              description: 'Этот email уже зарегистрирован. Перейдите на вкладку "Вход" для входа в систему.',
              variant: 'destructive',
            });
            setTimeout(() => {
              const signinTab = document.querySelector('[value="signin"]') as HTMLButtonElement;
              if (signinTab) signinTab.click();
            }, 2000);
          } else {
            toast({
              title: t.error,
              description: error.message,
              variant: 'destructive',
            });
          }
          return;
        }

        if (data.user && !data.session) {
          toast({
            title: 'Регистрация успешна',
            description: 'Проверьте email для подтверждения аккаунта. Письмо может прийти в папку "Спам".',
          });
        } else if (data.session) {
          toast({
            title: 'Добро пожаловать!',
            description: 'Вы успешно зарегистрированы и вошли в систему',
          });
        }
      } else {
        // Show specific error from secure auth
        toast({
          title: t.error,
          description: result.error || 'Ошибка при регистрации',
          variant: 'destructive',
        });
      }

    } catch (error) {
      toast({
        title: t.error,
        description: 'Ошибка при регистрации',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: t.error,
        description: 'Пожалуйста, заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login for:', formData.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password
      });

      if (error) {
        // Handle specific error types
        if (error.message.includes('Email not confirmed')) {
          setShowResendButton(true);
          toast({
            title: 'Email не подтвержден',
            description: 'Пожалуйста, подтвердите ваш email. Проверьте почту и папку "Спам".',
            variant: 'destructive',
          });
          return;
        }

        if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid credentials')) {
          setShowResendButton(true);
          setShowForgotPassword(true);
          toast({
            title: 'Неверные данные для входа',
            description: 'Email или пароль неверны. Нажмите "Забыли пароль?" для восстановления доступа.',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'Ошибка входа',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      if (data.user) {
        // Save credentials for remember me functionality
        saveCredentials(formData.email, rememberMe);
        
        toast({
          title: 'Добро пожаловать!',
          description: 'Вы успешно вошли в систему',
        });
      }

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: t.error,
        description: 'Ошибка при входе',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      toast({
        title: t.error,
        description: 'Введите email для повторной отправки письма подтверждения',
        variant: 'destructive',
      });
      return;
    }

    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: t.error,
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Письмо отправлено',
          description: 'Проверьте email (включая папку "Спам") и перейдите по ссылке для подтверждения',
        });
      }
    } catch (error) {
      toast({
        title: t.error,
        description: 'Ошибка при отправке письма подтверждения',
        variant: 'destructive',
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!formData.email) {
      toast({
        title: t.error,
        description: 'Введите email для восстановления пароля',
        variant: 'destructive',
      });
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/`
      });

      if (error) {
        toast({
          title: t.error,
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Письмо отправлено',
          description: 'Проверьте email. Мы отправили ссылку для восстановления пароля.',
        });
        setShowForgotPassword(false);
      }
    } catch (error) {
      toast({
        title: t.error,
        description: 'Ошибка при отправке письма восстановления',
        variant: 'destructive',
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast({
        title: t.error,
        description: 'Пожалуйста, заполните оба поля пароля',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t.error,
        description: 'Пароли не совпадают',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: t.error,
        description: 'Пароль должен содержать минимум 6 символов',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Password update error:', error);
        toast({
          title: 'Ошибка обновления пароля',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Пароль обновлен',
          description: 'Ваш пароль успешно изменен. Теперь вы можете войти с новым паролем.',
        });
        
        // Reset the form and exit password reset mode
        setIsPasswordReset(false);
        setNewPassword('');
        setConfirmPassword('');
        
        // Clean up URL
        window.history.replaceState({}, document.title, '/auth');
      }
    } catch (error) {
      console.error('Password update error:', error);
      toast({
        title: t.error,
        description: 'Произошла ошибка при обновлении пароля',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Password Reset Form
  if (isPasswordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
        <Card className="w-full max-w-md shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Новый пароль</CardTitle>
            <CardDescription>
              Создайте новый пароль для вашего аккаунта
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Новый пароль</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="введите новый пароль (мин. 6 символов)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="повторите новый пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Обновление...' : 'Обновить пароль'}
              </Button>
              <div className="text-center">
                <Button 
                  type="button" 
                  variant="link" 
                  onClick={() => {
                    setIsPasswordReset(false);
                    window.history.replaceState({}, document.title, '/auth');
                  }}
                >
                  Вернуться к входу
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">ЖОС Мессенджер</CardTitle>
          <CardDescription>
            Добро пожаловать в сообщество живой операционной системы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Вход</TabsTrigger>
              <TabsTrigger value="signup">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="введите ваш email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="введите пароль"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label 
                    htmlFor="remember-me" 
                    className="text-sm font-normal cursor-pointer"
                  >
                    Запомнить меня
                  </Label>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading || secureAuthLoading}>
                  {(loading || secureAuthLoading) ? 'Вход...' : 'Войти'}
                </Button>
                
                <div className="mt-4 flex justify-center">
                  <Button 
                    type="button" 
                    variant="link" 
                    size="sm" 
                    onClick={() => setShowForgotPassword(true)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Забыли пароль?
                  </Button>
                </div>
                
                {showResendButton && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-2">
                      Не можете войти? Возможно, нужно подтвердить email.
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="w-full mb-2"
                      onClick={handleResendConfirmation}
                      disabled={resendLoading}
                    >
                      {resendLoading ? 'Отправка...' : 'Отправить письмо подтверждения повторно'}
                    </Button>
                  </div>
                )}
                
                {showForgotPassword && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-2">
                      Восстановление пароля
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Мы отправим вам ссылку для создания нового пароля на указанный email.
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={handlePasswordReset}
                        disabled={resetLoading}
                      >
                        {resetLoading ? 'Отправка...' : 'Восстановить пароль'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowForgotPassword(false)}
                      >
                        Отмена
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Имя для отображения</Label>
                  <Input
                    id="display-name"
                    type="text"
                    placeholder="как вас называть в чате"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="введите ваш email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Пароль</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="придумайте пароль (мин. 6 символов)"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    minLength={6}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading || secureAuthLoading}>
                  {(loading || secureAuthLoading) ? 'Регистрация...' : 'Зарегистрироваться'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};