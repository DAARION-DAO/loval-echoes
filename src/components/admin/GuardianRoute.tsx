import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface GuardianRouteProps {
  children: ReactNode;
}

export const GuardianRoute = ({ children }: GuardianRouteProps) => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const navigate = useNavigate();
  const { language } = useTranslation();

  const isUk = language === 'uk';

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" text={isUk ? 'Перевірка повноважень...' : 'Verifying credentials...'} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // The database only permits 'member' and 'guardian' roles in profiles table.
  // 'guardian' is the platform administrator role.
  const isGuardian = profile?.role === 'guardian';

  if (!isGuardian) {
    const handleLogout = async () => {
      await signOut();
      navigate('/auth', { replace: true });
    };

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="glass-panel border-red-500/20 bg-slate-900/40 backdrop-blur-md">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="h-8 w-8 text-red-400" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight text-slate-100">
                {isUk ? 'Недостатньо прав для Platform Admin Console' : 'Insufficient Permissions for Platform Admin Console'}
              </CardTitle>
              <CardDescription className="text-slate-400 mt-2 leading-relaxed text-xs">
                {isUk 
                  ? 'Цей розділ призначений виключно для адміністраторів платформи (Guardians). Ваш поточний акаунт не має доступу.'
                  : 'This section is restricted to platform administrators (Guardians). Your current account does not have access.'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 pt-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">{isUk ? 'Акаунт:' : 'Account:'}</span>
                  <span className="text-slate-300 font-medium break-all">{user.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">{isUk ? 'Роль:' : 'Role:'}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                    {profile?.role || 'member'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button 
                  onClick={() => navigate('/')} 
                  className="w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750 h-10 font-semibold text-xs"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {isUk ? 'Повернутися на головну' : 'Back to Home'}
                </Button>

                <Button 
                  variant="ghost" 
                  onClick={handleLogout} 
                  className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300 h-10 font-semibold text-xs"
                >
                  <LogOut className="h-4 w-4" />
                  {isUk ? 'Вийти з акаунта' : 'Sign Out'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
