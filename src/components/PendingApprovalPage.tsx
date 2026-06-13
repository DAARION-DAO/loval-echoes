import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogOut, ArrowLeft, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';

export const PendingApprovalPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { memberships } = useActiveCommunity();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isUk = language === 'uk';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <Card className="glass-panel border-indigo-500/20 bg-slate-900/40 backdrop-blur-md">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-indigo-400 animate-pulse" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-slate-100">
              {isUk ? 'Заявку на розширений доступ отримано' : 'Advanced Access Application Received'}
            </CardTitle>
            <CardDescription className="text-slate-400 mt-2 leading-relaxed text-xs">
              {isUk 
                ? 'Ця сторінка стосується Founder, Partner, Sovereign або Operator доступу. Звичайну MicroDAO можна створити через onboarding.'
                : 'This page is for Founder, Partner, Sovereign, or Operator access request status. A regular MicroDAO can be created directly via onboarding.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <div className="space-y-0.5">
                  <div className="text-[9px] text-slate-500 uppercase font-semibold tracking-wider">
                    {isUk ? 'Ваш акаунт' : 'Your Account'}
                  </div>
                  <div className="text-slate-300 font-medium break-all">{user?.email}</div>
                </div>
              </div>
              <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-xs">
                <span className="text-slate-400">{isUk ? 'Статус запиту:' : 'Request Status:'}</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                  {isUk ? 'Розширений доступ очікує розгляду' : 'Advanced Access Pending Review'}
                </span>
              </div>
              <div className="text-[10px] text-indigo-300/80 pt-1 text-center font-medium">
                {isUk 
                  ? 'Звичайний доступ до MicroDAO доступний через onboarding' 
                  : 'Regular access to MicroDAO is available via onboarding'}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button 
                onClick={() => navigate(memberships.length === 0 ? '/onboarding' : '/dashboard')} 
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white h-10 font-semibold text-xs"
              >
                <Sparkles className="h-4 w-4" />
                {memberships.length === 0 
                  ? (isUk ? 'Перейти до onboarding' : 'Go to Onboarding')
                  : (isUk ? 'Перейти до панелі керування' : 'Go to Dashboard')}
              </Button>

              <Button 
                variant="outline" 
                onClick={() => navigate('/')} 
                className="w-full flex items-center justify-center gap-1.5 border-slate-800 text-slate-300 hover:bg-slate-900 h-10 font-semibold text-xs"
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
};