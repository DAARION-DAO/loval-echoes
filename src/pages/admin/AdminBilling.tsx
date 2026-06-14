/**
 * Sprint F3 — Admin Billing Page (Crypto-First)
 * 
 * Complete rewrite from Stripe-first to crypto-first.
 * Shows Leader Plan pricing in DAAR/USDT/USDC/ETH.
 * No Stripe integration.
 */

import { 
  Wallet,
  CheckSquare, 
  ArrowRight,
  TrendingUp,
  Coins,
  AlertCircle,
  Clock,
  Shield,
  Zap,
  Circle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { 
  LEADER_PLAN, 
  SUPPORTED_ASSETS, 
  SUBSCRIPTION_STATUS_LABELS,
  ADVANCED_ACCESS_PROGRAMS,
  type SubscriptionStatus 
} from '@/lib/subscriptionTypes';

export const AdminBilling = () => {
  const { t, language } = useTranslation();
  const { toast } = useToast();

  const lang = language as 'uk' | 'en' | 'ru' | 'es';

  const [stats, setStats] = useState<Record<string, number>>({});
  const [loadingStats, setLoadingStats] = useState(true);
  
  const [intents, setIntents] = useState<any[]>([]);
  const [loadingIntents, setLoadingIntents] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const { data, error } = await (supabase as any).rpc('admin_get_subscription_stats');
      if (!error && data) {
        setStats(data as any);
      }
    } catch (err) {
      console.warn('Failed to fetch subscription stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchIntents = async () => {
    setLoadingIntents(true);
    try {
      let query = (supabase as any)
        .from('crypto_payment_intents')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeFilter !== 'all') {
        query = query.eq('status', activeFilter);
      }

      const { data, error } = await query;
      if (!error && data) {
        setIntents(data);
      }
    } catch (err) {
      console.error('Failed to fetch payment intents:', err);
    } finally {
      setLoadingIntents(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchIntents();
  }, [activeFilter]);

  const handleApprove = async (intentId: string) => {
    setProcessingId(intentId);
    try {
      const { error } = await (supabase as any).rpc('admin_approve_crypto_payment_intent', { intent_id: intentId });
      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Payment intent approved successfully.'
      });
      fetchStats();
      fetchIntents();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Approval Failed',
        description: err.message || 'Make sure the admin RPC migration is applied.'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (intentId: string) => {
    setProcessingId(intentId);
    try {
      const { error } = await (supabase as any).rpc('admin_reject_crypto_payment_intent', { intent_id: intentId, reason: 'Rejected by admin' });
      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Payment intent rejected successfully.'
      });
      fetchStats();
      fetchIntents();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Rejection Failed',
        description: err.message || 'Make sure the admin RPC migration is applied.'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const truncateAddress = (addr: string): string => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  };

  // Subscription status display data
  const statusItems: { status: SubscriptionStatus; count: number; color: string }[] = [
    { status: 'none', count: stats.none || 0, color: 'slate' },
    { status: 'active', count: stats.active || 0, color: 'emerald' },
    { status: 'pending_payment', count: stats.pending_payment || 0, color: 'amber' },
    { status: 'past_due', count: stats.past_due || 0, color: 'red' },
    { status: 'expired', count: stats.expired || 0, color: 'slate' },
    { status: 'cancelled', count: stats.cancelled || 0, color: 'slate' },
    { status: 'manual_review', count: stats.manual_review || 0, color: 'amber' },
    { status: 'founder_bypass', count: stats.founder_bypass || 0, color: 'indigo' },
    { status: 'guardian_bypass', count: stats.guardian_bypass || 0, color: 'purple' },
  ];

  // Roadmap items
  const roadmapItems = [
    {
      label: t.identity.adminF3B,
      done: false,
      icon: <Coins className="h-4 w-4 text-amber-400" />,
    },
    {
      label: t.identity.adminF3C,
      done: false,
      icon: <Zap className="h-4 w-4 text-sky-400" />,
    },
    {
      label: t.identity.adminFiatFallback,
      done: false,
      icon: <Circle className="h-4 w-4 text-slate-500" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
          {t.identity.adminBillingTitle}
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          {t.identity.adminBillingDesc}
        </p>
      </div>

      {/* Crypto Pricing Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm md:col-span-2">
          <CardHeader className="pb-2">
            <Badge className="w-fit bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[9px] uppercase font-bold tracking-wider">
              {t.identity.adminCryptoModel}
            </Badge>
            <CardTitle className="text-lg font-bold text-slate-100 mt-2">
              {t.identity.adminPricingBanner}
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs leading-relaxed space-y-1">
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded text-[11px]">
                  {LEADER_PLAN.priceDaar} DAAR/{lang === 'uk' ? 'міс' : lang === 'ru' ? 'мес' : lang === 'es' ? 'mes' : 'mo'}
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-[10px] text-slate-500">
                  {t.identity.daarRate}
                </span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Features list */}
            <div className="space-y-1">
              {LEADER_PLAN.features[lang]?.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[10px] text-slate-300">
                  <CheckSquare className="h-3 w-3 text-indigo-400 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Accepted Assets */}
        <Card className="border-slate-800/60 bg-slate-900/15 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-slate-400 tracking-wider font-bold">
              {t.identity.adminAcceptedLabel}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {SUPPORTED_ASSETS.map((asset) => (
              <div 
                key={asset.symbol}
                className="flex items-center justify-between border-b border-slate-850/60 pb-2 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{asset.icon}</span>
                  <div>
                    <span className="text-xs font-semibold text-slate-200">{asset.symbol}</span>
                    <span className="text-[9px] text-slate-500 ml-1.5">{asset.name}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[8px] text-slate-500 border-slate-700/50">
                  {asset.chain}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Subscription States Overview */}
      <Card className="border-slate-800/60 bg-slate-900/15 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              {t.identity.adminSubscriptionStates}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {statusItems.map((item) => (
              <div
                key={item.status}
                className={`rounded-lg border border-${item.color}-500/20 bg-${item.color}-500/5 p-3 space-y-1`}
                style={{
                  borderColor: `var(--${item.color}-border, rgba(100,116,139,0.2))`,
                  backgroundColor: `var(--${item.color}-bg, rgba(100,116,139,0.03))`,
                }}
              >
                <div className="text-[10px] font-medium text-slate-400">
                  {SUBSCRIPTION_STATUS_LABELS[item.status][lang]}
                </div>
                <div className="text-xl font-bold text-slate-200 font-mono">{item.count}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-md border border-slate-800/40 bg-slate-950/30 p-3">
            <AlertCircle className="h-4 w-4 text-slate-500 flex-shrink-0" />
            <span className="text-[10px] text-slate-500">
              {t.identity.adminNoSubscriptions}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Manual Verification Queue */}
      <Card className="border-amber-500/10 bg-amber-500/3 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-400" />
                <CardTitle className="text-sm font-bold text-amber-300">
                  {t.identity.adminManualQueue}
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-400">
                {t.identity.adminManualQueueDesc}
              </CardDescription>
            </div>
            <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-auto">
              <TabsList className="bg-slate-950 border border-slate-800 h-8">
                <TabsTrigger value="all" className="text-[10px] h-7 px-2.5">All</TabsTrigger>
                <TabsTrigger value="submitted" className="text-[10px] h-7 px-2.5">Pending Queue</TabsTrigger>
                <TabsTrigger value="confirmed" className="text-[10px] h-7 px-2.5">Confirmed</TabsTrigger>
                <TabsTrigger value="rejected" className="text-[10px] h-7 px-2.5">Rejected</TabsTrigger>
                <TabsTrigger value="expired" className="text-[10px] h-7 px-2.5">Expired</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {loadingIntents ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-500 mx-auto mb-2" />
              <span className="text-xs text-slate-400">{t.loading}</span>
            </div>
          ) : intents.length === 0 ? (
            <div className="rounded-lg border border-slate-800/40 bg-slate-950/30 p-8 text-center">
              <Clock className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">
                {t.cryptoBilling.verifyQueueEmpty}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-850 bg-slate-950/20">
              <Table>
                <TableHeader className="bg-slate-950/60 border-b border-slate-850">
                  <TableRow className="hover:bg-transparent border-slate-850">
                    <TableHead className="text-[10px] font-bold text-slate-400">{t.cryptoBilling.verifyTableUser}</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400">{t.cryptoBilling.verifyTableAsset}</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400">{t.cryptoBilling.verifyTableAmount}</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400">{t.cryptoBilling.verifyTableHash}</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400">{t.cryptoBilling.verifyTableStatus}</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400 text-right">{t.cryptoBilling.verifyTableActions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {intents.map((intent) => {
                    const isPendingAction = intent.status === 'submitted' || intent.status === 'manual_review' || intent.status === 'pending';
                    return (
                      <TableRow key={intent.id} className="hover:bg-slate-900/10 border-slate-850">
                        <TableCell className="py-2.5 text-[11px] font-medium text-slate-200">
                          <div className="font-mono text-[10px]">{truncateAddress(intent.user_id)}</div>
                        </TableCell>
                        <TableCell className="py-2.5 text-[11px] text-slate-300">
                          <span className="font-bold">{intent.crypto_asset}</span>
                        </TableCell>
                        <TableCell className="py-2.5 text-[11px] font-mono text-slate-200 font-semibold">
                          {intent.amount_crypto}
                        </TableCell>
                        <TableCell className="py-2.5 text-[11px]">
                          {intent.tx_hash ? (
                            <a
                              href={`https://polygonscan.com/tx/${intent.tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-0.5 font-mono text-[10px]"
                            >
                              {truncateAddress(intent.tx_hash)}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-slate-600 italic text-[10px]">No hash submitted</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2.5 text-[11px]">
                          <Badge 
                            variant="outline" 
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 ${
                              intent.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                              : intent.status === 'rejected' || intent.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/25'
                              : intent.status === 'submitted' || intent.status === 'manual_review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/25 animate-pulse'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {intent.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2.5 text-right">
                          {isPendingAction ? (
                            <div className="flex justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={processingId !== null}
                                onClick={() => handleApprove(intent.id)}
                                className="h-7 text-[10px] bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border-emerald-500/25 font-bold gap-1"
                              >
                                {processingId === intent.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3 w-3" />
                                )}
                                {t.cryptoBilling.verifyActionApprove}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={processingId !== null}
                                onClick={() => handleReject(intent.id)}
                                className="h-7 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/5 font-bold gap-1"
                              >
                                <XCircle className="h-3 w-3" />
                                {t.cryptoBilling.verifyActionReject}
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">No actions</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Access Programs */}
      <Card className="border-slate-800/60 bg-slate-900/15 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-purple-400" />
            {t.advancedAccess.billingProgramsTitle}
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            {t.advancedAccess.billingProgramsDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Leader Plan — paid */}
            <div className="flex items-center justify-between rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-indigo-400" />
                <div>
                  <div className="text-xs font-bold text-slate-200">Leader Plan</div>
                  <div className="text-[10px] text-slate-400">${LEADER_PLAN.priceUsd}/{lang === 'uk' ? 'міс' : lang === 'ru' ? 'мес' : lang === 'es' ? 'mes' : 'mo'} = {LEADER_PLAN.priceDaar} DAAR</div>
                </div>
              </div>
              <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-[9px] uppercase font-bold">Paid Subscription</Badge>
            </div>

            {/* Advanced access programs */}
            {ADVANCED_ACCESS_PROGRAMS.map((prog) => {
              const nameKey = `${prog.key === 'worker_node' ? 'workerNode' : prog.key}Name` as keyof typeof t.advancedAccess;
              const descKey = `${prog.key === 'worker_node' ? 'workerNode' : prog.key}Desc` as keyof typeof t.advancedAccess;
              return (
                <div key={prog.key} className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-950/30 p-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded-full bg-${prog.color}-500/20 flex items-center justify-center`}>
                      <div className={`h-2 w-2 rounded-full bg-${prog.color}-400`} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-300">{t.advancedAccess[nameKey]}</div>
                      <div className="text-[10px] text-slate-500">{t.advancedAccess[descKey]}</div>
                    </div>
                  </div>
                  <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[9px] uppercase font-bold">Manual Review</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Development Roadmap */}
      <Card className="border-slate-800/60 bg-slate-900/15 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-sky-400" />
            {t.identity.adminFutureRoadmap}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {roadmapItems.map((item, idx) => (
            <div key={idx} className="flex gap-3 rounded-lg border border-slate-800/60 bg-slate-950/30 p-3">
              {item.icon}
              <div className="space-y-0.5">
                <div className="text-[11px] font-bold text-slate-200">{item.label}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBilling;
