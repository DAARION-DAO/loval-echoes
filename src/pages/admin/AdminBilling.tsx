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
import { 
  LEADER_PLAN, 
  SUPPORTED_ASSETS, 
  SUBSCRIPTION_STATUS_LABELS,
  ADVANCED_ACCESS_PROGRAMS,
  type SubscriptionStatus 
} from '@/lib/subscriptionTypes';

export const AdminBilling = () => {
  const { t, language } = useTranslation();

  const lang = language as 'uk' | 'en' | 'ru' | 'es';

  // Subscription status display data
  const statusItems: { status: SubscriptionStatus; count: number; color: string }[] = [
    { status: 'none', count: 0, color: 'slate' },
    { status: 'active', count: 0, color: 'emerald' },
    { status: 'pending_payment', count: 0, color: 'amber' },
    { status: 'past_due', count: 0, color: 'red' },
    { status: 'expired', count: 0, color: 'slate' },
    { status: 'cancelled', count: 0, color: 'slate' },
    { status: 'manual_review', count: 0, color: 'amber' },
    { status: 'founder_bypass', count: 0, color: 'indigo' },
    { status: 'guardian_bypass', count: 0, color: 'purple' },
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
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-400" />
            <CardTitle className="text-sm font-bold text-amber-300">
              {t.identity.adminManualQueue}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-400">
            {t.identity.adminManualQueueDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-800/40 bg-slate-950/30 p-6 text-center">
            <Clock className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">
              {t.identity.adminNoSubscriptions}
            </p>
          </div>
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
