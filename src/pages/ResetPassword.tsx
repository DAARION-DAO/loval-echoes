import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useTranslation } from '@/lib/i18n';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery tokens in the URL hash and the client
    // auto-exchanges them into a session. Wait briefly and check.
    const sub = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setHasRecoverySession(true);
        setReady(true);
      }
    });

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) setHasRecoverySession(true);
      setReady(true);
    })();

    return () => {
      sub.data.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: t.error, description: t.authForm.passwordMinLength, variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: t.error, description: t.authForm.passwordsDoNotMatch, variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      toast({ title: t.error, description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: t.authForm.updatePasswordSuccessTitle, description: t.authForm.updatePasswordSuccessDesc });
    // Clean hash and go home — session is now valid with new password.
    window.history.replaceState({}, document.title, '/');
    navigate('/', { replace: true });
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text={t.loading} />
      </div>
    );
  }

  if (!hasRecoverySession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t.authForm.recoveryLinkInvalidTitle}</CardTitle>
            <CardDescription>
              {t.authForm.recoveryLinkInvalidDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate('/auth', { replace: true })}>
              {t.authForm.btnBackToLogin}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t.authForm.newPasswordTitle}</CardTitle>
          <CardDescription>{t.authForm.newPasswordDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;