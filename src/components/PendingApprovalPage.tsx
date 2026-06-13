import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, LogOut, ArrowLeft, Mail, Sparkles, Gem, Building2, Shield, Server } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { supabase } from '@/integrations/supabase/client';
import type { AdvancedAccessProgram } from '@/lib/subscriptionTypes';

const PROGRAM_ICONS: Record<string, typeof Gem> = {
  founder: Gem,
  partner: Building2,
  sovereign: Shield,
  worker_node: Server,
};

const PROGRAM_COLORS: Record<string, string> = {
  founder: 'indigo',
  partner: 'purple',
  sovereign: 'blue',
  worker_node: 'emerald',
};

export const PendingApprovalPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { memberships } = useActiveCommunity();

  const [requestedProgram, setRequestedProgram] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [loadingRequest, setLoadingRequest] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!user?.id) { setLoadingRequest(false); return; }
      try {
        const { data } = await (supabase as any)
          .from('access_requests')
          .select('requested_tier, status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) {
          setRequestedProgram(data.requested_tier);
          setRequestStatus(data.status);
        }
      } catch {
        // Table may not exist — graceful fallback
      }
      setLoadingRequest(false);
    };
    fetchRequest();
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getProgramNameKey = (tier: string | null): keyof typeof t.advancedAccess => {
    switch (tier) {
      case 'founder': return 'founderName';
      case 'partner': return 'partnerName';
      case 'sovereign': return 'sovereignName';
      case 'worker_node': return 'workerNodeName';
      default: return 'founderName';
    }
  };

  const getStatusKey = (status: string | null): keyof typeof t.advancedAccess => {
    switch (status) {
      case 'approved': return 'statusApproved';
      case 'rejected': return 'statusRejected';
      case 'needs_info': return 'statusNeedsInfo';
      default: return 'statusPending';
    }
  };

  const IconComp = PROGRAM_ICONS[requestedProgram || ''] || Clock;
  const programColor = PROGRAM_COLORS[requestedProgram || ''] || 'indigo';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <Card className="glass-panel border-indigo-500/20 bg-slate-900/40 backdrop-blur-md">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
              {loadingRequest ? (
                <Clock className="h-8 w-8 text-indigo-400 animate-pulse" />
              ) : (
                <IconComp className={`h-8 w-8 text-${programColor}-400`} />
              )}
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-slate-100">
              {t.advancedAccess.waitlistTitle}
            </CardTitle>
            <CardDescription className="text-slate-400 mt-2 leading-relaxed text-xs">
              {t.advancedAccess.waitlistDesc}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <div className="space-y-0.5">
                  <div className="text-[9px] text-slate-500 uppercase font-semibold tracking-wider">
                    {language === 'uk' ? 'Ваш акаунт' : 'Your Account'}
                  </div>
                  <div className="text-slate-300 font-medium break-all">{user?.email}</div>
                </div>
              </div>

              {!loadingRequest && requestedProgram && (
                <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-xs">
                  <span className="text-slate-400">{t.advancedAccess.waitlistRequestedProgram}:</span>
                  <Badge className={`bg-${programColor}-500/10 text-${programColor}-300 border-${programColor}-500/20 font-mono text-[10px] uppercase font-bold`}>
                    {t.advancedAccess[getProgramNameKey(requestedProgram)]}
                  </Badge>
                </div>
              )}

              <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-xs">
                <span className="text-slate-400">{language === 'uk' ? 'Статус запиту:' : 'Request Status:'}</span>
                {!loadingRequest && requestedProgram ? (
                  <Badge className={`text-[11px] font-semibold ${
                    requestStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    requestStatus === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    requestStatus === 'needs_info' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {requestStatus === 'pending' && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping mr-1.5 inline-block" />}
                    {t.advancedAccess[getStatusKey(requestStatus)]}
                  </Badge>
                ) : !loadingRequest ? (
                  <span className="text-[11px] text-slate-500 italic">
                    {t.advancedAccess.waitlistNoRequest}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500">...</span>
                )}
              </div>
              
              <div className="text-[10px] text-indigo-300/80 pt-1 text-center font-medium">
                {language === 'uk' 
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
                  ? (language === 'uk' ? 'Перейти до onboarding' : 'Go to Onboarding')
                  : (language === 'uk' ? 'Перейти до панелі керування' : 'Go to Dashboard')}
              </Button>

              <Button 
                variant="outline" 
                onClick={() => navigate('/')} 
                className="w-full flex items-center justify-center gap-1.5 border-slate-800 text-slate-300 hover:bg-slate-900 h-10 font-semibold text-xs"
              >
                <ArrowLeft className="h-4 w-4" />
                {language === 'uk' ? 'Повернутися на головну' : 'Back to Home'}
              </Button>

              <Button 
                variant="ghost" 
                onClick={handleLogout} 
                className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300 h-10 font-semibold text-xs"
              >
                <LogOut className="h-4 w-4" />
                {language === 'uk' ? 'Вийти з акаунта' : 'Sign Out'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};