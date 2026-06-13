import { useState, useEffect } from 'react';
import { getAdminAgentOps, AdminAgentOpsData, isRlsOrSchemaError } from '@/lib/adminQueries';
import { 
  ShieldAlert, 
  Bot, 
  Cpu, 
  Activity, 
  AlertTriangle, 
  Clock, 
  Database,
  RefreshCw,
  Copy,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const AdminAgentOps = () => {
  const { language } = useTranslation();
  const { toast } = useToast();
  const [data, setData] = useState<AdminAgentOpsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isRpc, setIsRpc] = useState(true);

  const isUk = language === 'uk';

  const fetchAgentOps = async () => {
    setLoading(true);
    const res = await getAdminAgentOps();
    setData(res.data);
    setError(res.error);
    setIsRpc(res.isRpc);
    setLoading(false);
  };

  useEffect(() => {
    fetchAgentOps();
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: `${label} ${isUk ? 'скопійовано' : 'copied'}`,
    });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'success':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-semibold">Success</Badge>;
      case 'failed':
      case 'error':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] font-semibold">Failed</Badge>;
      case 'pending':
      case 'pending_approval':
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] font-semibold">Pending</Badge>;
      default:
        return <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[10px] font-semibold">{status || 'Unknown'}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <LoadingSpinner size="lg" text={isUk ? 'Завантаження телеметрії агентів...' : 'Loading agent telemetry...'} />
      </div>
    );
  }

  const rlsBlocked = error && isRlsOrSchemaError(error);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            {isUk ? 'Агентні операції та телеметрія' : 'Agent Operations & Telemetry'}
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            {isUk 
              ? 'Моніторинг працездатності ШІ-агентів, перегляд журналів виконання та дозволів.' 
              : 'Audit active agents, process execution states, permissions, and log events.'}
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchAgentOps}
          className="h-8 border-slate-800 text-slate-300 hover:bg-slate-900 gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {isUk ? 'Оновити' : 'Refresh'}
        </Button>
      </div>

      {rlsBlocked ? (
        <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-5 space-y-3 text-xs">
          <div className="font-bold text-red-400 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4" />
            {isUk ? 'Доступ до телеметрії агентів обмежено RLS' : 'Agent Telemetry Access Restricted by RLS'}
          </div>
          <p className="text-slate-400 leading-relaxed">
            {isUk 
              ? 'Конфіденційність ШІ-агентів захищено політиками RLS. Для перегляду загального логу та діагностики роботи агентів запустіть локальний SQL скрипт міграції.'
              : 'Detailed activity metrics are secured by RLS. Apply the local migration SQL scripts to access global agent diagnostics.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* High Level Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-850 bg-slate-900/15 backdrop-blur-sm">
              <CardContent className="pt-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{isUk ? 'Всього агентів' : 'Total Agents'}</div>
                  <div className="text-xl font-extrabold text-slate-100">{data?.total_agents || 0}</div>
                </div>
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Bot className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-850 bg-slate-900/15 backdrop-blur-sm">
              <CardContent className="pt-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{isUk ? 'Духи Спільноти' : 'Spirit Agents'}</div>
                  <div className="text-xl font-extrabold text-slate-100">{data?.spirit_agents || 0}</div>
                </div>
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Cpu className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-850 bg-slate-900/15 backdrop-blur-sm">
              <CardContent className="pt-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{isUk ? 'Збої / Помилки' : 'Failures'}</div>
                  <div className="text-xl font-extrabold text-red-400">{data?.recent_errors?.length || 0}</div>
                </div>
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-850 bg-slate-900/15 backdrop-blur-sm">
              <CardContent className="pt-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{isUk ? 'Активність' : 'Action Logs'}</div>
                  <div className="text-xl font-extrabold text-emerald-400">{data?.recent_logs?.length || 0}</div>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Activity className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Privacy Note */}
          <div className="rounded-xl border border-indigo-500/15 bg-indigo-950/10 p-4 space-y-2 text-xs leading-relaxed text-indigo-300/95 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-slate-200">{isUk ? 'Конфіденційність приватної пам’яті спільнот' : 'Confidentiality & Data Isolation'}</div>
              <p className="text-[11px] text-slate-400">
                {isUk 
                  ? 'Журнали дій показують лише тип операції, статус її виконання та ідентифікатор ШІ-агента. Доступ до внутрішнього системного промпту, діалогової історії або документів приватного простору MicroDAO закритий навіть для розробників платформи.'
                  : 'Action telemetry strictly masks context content. Platform logs show only action types and execution statuses; conversation history, private prompt setups, and files remain secure and inaccessible to platform admins.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Logs Area */}
            <Card className="border-slate-850 bg-slate-900/15 backdrop-blur-sm lg:col-span-2">
              <CardHeader className="pb-3 border-b border-slate-850">
                <CardTitle className="text-sm font-bold text-slate-200">{isUk ? 'Журнал дій агентів' : 'Agent Action Log'}</CardTitle>
                <CardDescription className="text-[10px] text-slate-500">
                  {isUk ? 'Останні 50 викликів та операцій на платформі.' : 'Recent 50 executions generated by platform agents.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-slate-355 text-xs">
                    <thead>
                      <tr className="border-b border-slate-850 bg-slate-950/20 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-3">Log ID</th>
                        <th className="p-3">Agent</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/40 font-mono text-[10px] text-slate-400">
                      {data?.recent_logs?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500 font-sans text-xs">
                            {isUk ? 'Журнал порожній' : 'No execution logs recorded.'}
                          </td>
                        </tr>
                      ) : (
                        data?.recent_logs?.map((log: any) => (
                          <tr key={log.id} className="hover:bg-slate-900/10 transition-colors">
                            <td className="p-3 text-slate-500 flex items-center gap-1 max-w-[100px] truncate">
                              {log.id.substring(0, 8)}
                              <button 
                                onClick={() => handleCopy(log.id, 'Log ID')}
                                className="text-slate-650 hover:text-slate-450 transition-colors"
                              >
                                <Copy className="h-2.5 w-2.5" />
                              </button>
                            </td>
                            <td className="p-3 text-slate-300 font-sans max-w-[120px] truncate">
                              {log.agent_name || log.agent_id?.substring(0, 8) || 'Unknown'}
                            </td>
                            <td className="p-3 text-indigo-300">
                              {log.action_type}
                            </td>
                            <td className="p-3">{getStatusBadge(log.status)}</td>
                            <td className="p-3 text-right text-slate-500">
                              {new Date(log.created_at || log.executed_at).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Diagnostics Area */}
            <Card className="border-slate-850 bg-slate-900/15 backdrop-blur-sm lg:col-span-1">
              <CardHeader className="pb-3 border-b border-slate-850">
                <CardTitle className="text-sm font-bold text-slate-200">{isUk ? 'Діагностика агентів' : 'Agent Diagnostics'}</CardTitle>
                <CardDescription className="text-[10px] text-slate-500">
                  {isUk ? 'Стан працездатності ядра ШІ спільнот.' : 'Kernel status checks and agent self-repair tools.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                <div className="rounded-lg bg-slate-950/20 border border-slate-850 p-3 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isUk ? 'Статуси агентів' : 'Agent Statuses'}</div>
                  {Object.entries(data?.agents_by_status || {}).length === 0 ? (
                    <div className="text-slate-500 text-[10px]">{isUk ? 'Дані відсутні' : 'No statuses loaded.'}</div>
                  ) : (
                    Object.entries(data?.agents_by_status || {}).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-450 uppercase font-mono text-[10px]">{status}</span>
                        <span className="font-bold text-slate-300">{count}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="rounded-lg bg-slate-950/20 border border-slate-850 p-3 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isUk ? 'Типи агентів' : 'Agent Types'}</div>
                  {Object.entries(data?.agents_by_type || {}).length === 0 ? (
                    <div className="text-slate-500 text-[10px]">{isUk ? 'Дані відсутні' : 'No types loaded.'}</div>
                  ) : (
                    Object.entries(data?.agents_by_type || {}).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-450 uppercase font-mono text-[10px]">{type}</span>
                        <span className="font-bold text-slate-300">{count}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{isUk ? 'Службові інструменти' : 'Utility Controls'}</div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="w-full block">
                          <Button 
                            disabled
                            className="w-full justify-center bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed opacity-50 text-xs h-9"
                          >
                            {isUk ? 'Відновити Spirit Agent' : 'Repair Spirit Agent'}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                        {isUk 
                          ? 'Автоматичне встановлення Духа Спільноти для порожніх MicroDAO (Потребує RPC у F2B)' 
                          : 'Autogenerates missing Community Spirit Agent for empty DAOs (Needs RPC in F2B)'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminAgentOps;
