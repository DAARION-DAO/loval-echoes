import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';

export const AuthForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });

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
        if (error.message.includes('User already registered')) {
          toast({
            title: t.error,
            description: 'Пользователь с таким email уже зарегистрирован. Попробуйте войти.',
            variant: 'destructive',
          });
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
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setShowResendButton(true);
          toast({
            title: t.error,
            description: 'Неверный email или пароль. Если вы недавно регистрировались, проверьте email и подтвердите аккаунт.',
            variant: 'destructive',
          });
        } else if (error.message.includes('Email not confirmed')) {
          setShowResendButton(true);
          toast({
            title: t.error,
            description: 'Пожалуйста, подтвердите ваш email перед входом.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: t.error,
            description: error.message,
            variant: 'destructive',
          });
        }
        return;
      }

      toast({
        title: 'Добро пожаловать!',
        description: 'Вы успешно вошли в систему',
      });
    } catch (error) {
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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Вход...' : 'Войти'}
                </Button>
                
                {showResendButton && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-2">
                      Не можете войти? Возможно, нужно подтвердить email.
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={handleResendConfirmation}
                      disabled={resendLoading}
                    >
                      {resendLoading ? 'Отправка...' : 'Отправить письмо подтверждения повторно'}
                    </Button>
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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};