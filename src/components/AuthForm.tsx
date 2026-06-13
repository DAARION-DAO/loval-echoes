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
import { useAuth } from '@/hooks/useAuth';
import { useRememberMe } from '@/hooks/useRememberMe';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export const AuthForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveCredentials, getSavedEmail, isRemembered, attemptAutoLogin } = useRememberMe();
  
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Always remember the device. Session is cleared only on explicit sign-out.
  const rememberMe = true;
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    useCase: '',
    founderCode: '',
    communityName: '',
    communityType: 'team'
  });

  // Initialize form with saved email if remembered
  useEffect(() => {
    const savedEmail = getSavedEmail();
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
    }
  }, []);

  // Always try to restore the session on mount — device is remembered by default
  useEffect(() => {
    let active = true;
    (async () => {
      const restored = await attemptAutoLogin();
      if (restored && active) {
        navigate('/', { replace: true });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

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
          title: t.authForm.authErrorTitle,
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
        description: t.authForm.fillRequired,
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
        if (error.message.includes('User already registered') || error.message.includes('already been registered')) {
          toast({
            title: t.authForm.userExistsTitle,
            description: t.authForm.userExistsDesc,
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
          title: t.authForm.regSuccessTitle,
          description: t.authForm.regSuccessDesc,
        });
      } else if (data.session) {
        toast({
          title: t.authForm.welcomeTitle,
          description: t.authForm.welcomeDesc,
        });
      }
    } catch (error) {
      toast({
        title: t.error,
        description: t.authForm.regErrorDesc,
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
        description: t.authForm.fillRequired,
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
            title: t.authForm.emailNotVerifiedTitle,
            description: t.authForm.emailNotVerifiedDesc,
            variant: 'destructive',
          });
          return;
        }

        if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid credentials')) {
          setShowResendButton(true);
          setShowForgotPassword(true);
          toast({
            title: t.authForm.invalidCredentialsTitle,
            description: t.authForm.invalidCredentialsDesc,
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: t.authForm.loginErrorTitle,
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      if (data.user) {
        // Save credentials for remember me functionality
        saveCredentials(formData.email, rememberMe);
        
        toast({
          title: t.authForm.welcomeTitle,
          description: t.authForm.welcomeLoginDesc,
        });
      }

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: t.error,
        description: t.authForm.loginErrorDesc,
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
        description: t.authForm.resendConfirmRequired,
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
          title: t.authForm.resendConfirmSuccessTitle,
          description: t.authForm.resendConfirmSuccessDesc,
        });
      }
    } catch (error) {
      toast({
        title: t.error,
        description: t.authForm.resendConfirmErrorDesc,
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
        description: t.authForm.forgotPasswordRequired,
        variant: 'destructive',
      });
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        toast({
          title: t.error,
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: t.authForm.forgotPasswordSuccessTitle,
          description: t.authForm.forgotPasswordSuccessDesc,
        });
        setShowForgotPassword(false);
      }
    } catch (error) {
      toast({
        title: t.error,
        description: t.authForm.forgotPasswordErrorDesc,
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
        description: t.authForm.fillBothPasswords,
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t.error,
        description: t.authForm.passwordsDoNotMatch,
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: t.error,
        description: t.authForm.passwordMinLength,
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
          title: t.authForm.updatePasswordErrorTitle,
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: t.authForm.updatePasswordSuccessTitle,
          description: t.authForm.updatePasswordSuccessDesc,
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
        description: t.authForm.updatePasswordErrorDesc,
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
            <CardTitle className="text-2xl font-bold">{t.authForm.newPasswordTitle}</CardTitle>
            <CardDescription>
              {t.authForm.newPasswordDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">{t.authForm.labelNewPassword}</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder={t.authForm.placeholderNewPassword}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t.authForm.labelConfirmPassword}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder={t.authForm.placeholderConfirmPassword}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t.authForm.btnUpdatingPassword : t.authForm.btnUpdatePassword}
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
                  {t.authForm.btnBackToLogin}
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
      <div className="w-full max-w-md space-y-4">
        {/* Temporary help banner */}
        <div className="rounded-lg border border-accent/30 bg-accent/10 p-4 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">
            🔑 {t.authForm.cantLoginTitle}
          </p>
          <p className="text-xs text-muted-foreground">
            {t.authForm.cantLoginDesc}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setShowForgotPassword(true);
              const signinTab = document.querySelector('[value="signin"]') as HTMLButtonElement;
              if (signinTab) signinTab.click();
            }}
          >
            {t.authForm.btnResetPassword}
          </Button>
        </div>

        <Card className="shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">MicroDAO</CardTitle>
            <CardDescription>
              Community Agent Operating System
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">{t.auth.signIn}</TabsTrigger>
                <TabsTrigger value="signup">{t.auth.signUp}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.auth.email}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t.auth.emailPlaceholder}
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t.auth.password}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={t.auth.passwordPlaceholder}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    🔒 {t.authForm.deviceRemembered}
                  </p>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? `${t.loading}` : t.auth.loginBtn}
                  </Button>
                
                <div className="mt-4 flex justify-center">
                  <Button 
                    type="button" 
                    variant="link" 
                    size="sm" 
                    onClick={() => setShowForgotPassword(true)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t.authForm.forgotPasswordLink}
                  </Button>
                </div>
                
                {showResendButton && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-2">
                      {t.authForm.emailUnconfirmedAlert}
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="w-full mb-2"
                      onClick={handleResendConfirmation}
                      disabled={resendLoading}
                    >
                      {resendLoading ? t.authForm.btnResendingConfirm : t.authForm.btnResendConfirm}
                    </Button>
                  </div>
                )}
                
                {showForgotPassword && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-2">
                      {t.authForm.forgotPasswordSectionTitle}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {t.authForm.forgotPasswordSectionDesc}
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
                        {resetLoading ? t.authForm.btnResendingConfirm : t.authForm.btnResetPassword}
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowForgotPassword(false)}
                      >
                        {t.cancel}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="rounded-lg bg-accent/10 border border-accent/20 p-3 text-center mb-2">
                  <p className="text-xs text-muted-foreground">
                    {t.onboarding.errorLimitDesc}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display-name">{t.auth.displayName}</Label>
                  <Input
                    id="display-name"
                    type="text"
                    placeholder={t.auth.displayNamePlaceholder}
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t.auth.email}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={t.auth.emailPlaceholder}
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t.auth.password}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder={t.auth.passwordPlaceholder}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    minLength={6}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                  {loading ? t.loading : t.auth.signUp}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};