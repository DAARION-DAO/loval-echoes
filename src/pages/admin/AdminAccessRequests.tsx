import { useState, useEffect } from 'react';
import { getAdminAccessRequests, AdminAccessRequestRow, isRlsOrSchemaError } from '@/lib/adminQueries';
import { supabase } from '@/integrations/supabase/client';
import { 
  ShieldAlert, 
  Key, 
  Copy, 
  Check, 
  X, 
  HelpCircle,
  Clock,
  Mail,
  User,
  ExternalLink,
  Gem,
  Building2,
  Shield,
  Server,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { ADVANCED_ACCESS_PROGRAMS, getAdvancedProgramInfo } from '@/lib/subscriptionTypes';

export const AdminAccessRequests = () => {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [requests, setRequests] = useState<AdminAccessRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isRpc, setIsRpc] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isUk = language === 'uk';

  const fetchRequests = async () => {
    setLoading(true);
    const res = await getAdminAccessRequests();
    if (res.data) {
      setRequests(res.data);
    }
    setError(res.error);
    setIsRpc(res.isRpc);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: `${label} ${isUk ? 'скопійовано' : 'copied'}`,
    });
  };

  const handleUpdateStatus = async (requestId: string, status: 'approved' | 'rejected' | 'needs_info', requestedTier?: string | null) => {
    setActionLoading(requestId);
    try {
      // Update the request status
      const { error } = await (supabase as any)
        .from('access_requests')
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      // On approve: attempt to set access_tier on the user's profile
      if (status === 'approved' && requestedTier) {
        const request = requests.find(r => r.id === requestId);
        if (request?.user_id) {
          const programInfo = getAdvancedProgramInfo(requestedTier);
          const tierToSet = programInfo?.accessTierOnApprove || requestedTier;
          try {
            await (supabase as any)
              .from('profiles')
              .update({ access_tier: tierToSet })
              .eq('id', request.user_id);
          } catch {
            // Profile update may fail due to RLS — non-critical
          }
        }
      }

      toast({
        title: isUk ? 'Заявку оновлено' : 'Request Updated',
        description: isUk ? `Статус встановлено: ${status}` : `Status updated to: ${status}`,
      });
      await fetchRequests();
    } catch (err: any) {
      console.warn('Direct access_requests update failed, showing read-only notification:', err);
      toast({
        variant: "destructive",
        title: isUk ? 'Запис заблоковано RLS' : 'Write Blocked by RLS',
        description: isUk 
          ? 'Потрібно налаштувати RPC для зміни статусу заявок розширеного доступу в Sprint F2B.'
          : 'Requires secure platform admin RPC to modify advanced access requests in Sprint F2B.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-semibold">{t.advancedAccess.statusApproved}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] font-semibold">{t.advancedAccess.statusRejected}</Badge>;
      case 'needs_info':
        return <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] font-semibold">{t.advancedAccess.statusNeedsInfo}</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] font-semibold">{t.advancedAccess.statusPending}</Badge>;
    }
  };

  const getTierBadge = (tier: string | null) => {
    const getProgramName = (key: string): string => {
      switch (key) {
        case 'founder': return t.advancedAccess.founderName;
        case 'partner': return t.advancedAccess.partnerName;
        case 'sovereign': return t.advancedAccess.sovereignName;
        case 'worker_node': return t.advancedAccess.workerNodeName;
        default: return tier || 'Early Access';
      }
    };

    switch (tier?.toLowerCase()) {
      case 'founder':
        return <Badge className="bg-indigo-500/15 text-indigo-300 border-indigo-500/20 font-mono text-[9px] uppercase">{getProgramName('founder')}</Badge>;
      case 'partner':
        return <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/20 font-mono text-[9px] uppercase">{getProgramName('partner')}</Badge>;
      case 'sovereign':
        return <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/20 font-mono text-[9px] uppercase">{getProgramName('sovereign')}</Badge>;
      case 'worker_node':
      case 'operator':
        return <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/20 font-mono text-[9px] uppercase">{getProgramName('worker_node')}</Badge>;
      default:
        return <Badge className="bg-slate-800 text-slate-400 border-slate-700 font-mono text-[9px] uppercase">{tier || 'Early Access'}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <LoadingSpinner size="lg" text={isUk ? 'Завантаження заявок доступу...' : 'Loading access requests...'} />
      </div>
    );
  }

  const rlsBlocked = error && isRlsOrSchemaError(error);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
          {t.advancedAccess.adminTitle}
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          {t.advancedAccess.adminDesc}
        </p>
      </div>

      {/* Approve Mapping Reference */}
      <Card className="border-slate-850 bg-slate-900/10 backdrop-blur-sm">
        <CardContent className="py-3 px-4">
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
            {t.advancedAccess.adminApproveMap}
          </div>
          <div className="flex flex-wrap gap-2">
            {ADVANCED_ACCESS_PROGRAMS.map(prog => {
              const nameKey = `${prog.key === 'worker_node' ? 'workerNode' : prog.key}Name` as keyof typeof t.advancedAccess;
              return (
                <div key={prog.key} className="flex items-center gap-1.5 text-[10px]">
                  <span className="text-slate-400">{t.advancedAccess[nameKey]}</span>
                  <ArrowRight className="h-3 w-3 text-slate-600" />
                  <code className="text-emerald-400 font-mono bg-slate-950 px-1 rounded">{prog.accessTierOnApprove}</code>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {rlsBlocked ? (
        <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-5 space-y-3 text-xs">
          <div className="font-bold text-red-400 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4" />
            {isUk ? 'Доступ до заявок обмежено RLS' : 'Access Requests Restricted by RLS'}
          </div>
          <p className="text-slate-400 leading-relaxed">
            {isUk 
              ? 'Ваш акаунт не має прав на перегляд заявок інших користувачів. Переконайтеся, що ви налаштували локальний інстанс Supabase через файл міграції.'
              : 'Supabase Row Level Security blocks direct reading of other user approval requests. Register the platform admin RPCs in your local database using the SQL script provided.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <Card className="border-slate-850 bg-slate-900/5 p-8 text-center text-slate-500 text-xs">
              {t.advancedAccess.adminNoRequests}
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {requests.map((req) => (
                <Card key={req.id} className="border-slate-850 bg-slate-900/15 backdrop-blur-sm transition-all hover:border-slate-800/80">
                  <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between pb-3 gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getTierBadge(req.requested_tier)}
                        {getStatusBadge(req.status)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-1.5">
                        <Mail className="h-3 w-3" />
                        <span>{req.email || (isUk ? 'Не вказано email' : 'No email')}</span>
                        {req.email && (
                          <button 
                            onClick={() => handleCopy(req.email!, 'Email')}
                            className="text-slate-600 hover:text-slate-400 transition-colors"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(req.created_at).toLocaleString()}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 pt-1">
                    {/* User Reason / Message */}
                    <div className="rounded-lg bg-slate-950/40 border border-slate-850/60 p-3 text-xs leading-relaxed text-slate-300">
                      <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                        {isUk ? 'Обґрунтування користувача' : 'Use Case / Reason'}
                      </div>
                      {req.use_case || '—'}
                    </div>

                    {/* Action Panel */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-850/40 text-xs">
                      <div className="text-[10px] text-slate-500 font-mono">
                        User ID: <span className="font-semibold">{req.user_id || '—'}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {req.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-[11px] font-semibold border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 flex items-center gap-1 px-3"
                              onClick={() => handleUpdateStatus(req.id, 'approved', req.requested_tier)}
                              disabled={actionLoading === req.id}
                            >
                              <Check className="h-3.5 w-3.5" />
                              {isUk ? 'Схвалити' : 'Approve'}
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-[11px] font-semibold border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-red-400 flex items-center gap-1 px-3"
                              onClick={() => handleUpdateStatus(req.id, 'rejected')}
                              disabled={actionLoading === req.id}
                            >
                              <X className="h-3.5 w-3.5" />
                              {isUk ? 'Відхилити' : 'Reject'}
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-[11px] font-semibold border-cyan-500/20 hover:border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400 flex items-center gap-1 px-3"
                              onClick={() => handleUpdateStatus(req.id, 'needs_info')}
                              disabled={actionLoading === req.id}
                            >
                              <HelpCircle className="h-3.5 w-3.5" />
                              {isUk ? 'Потребує інфо' : 'Needs Info'}
                            </Button>
                          </>
                        )}
                        {req.status !== 'pending' && (
                          <span className="text-[10px] text-slate-500 italic">
                            {isUk ? 'Запит опрацьовано' : 'Request processed'}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default AdminAccessRequests;
