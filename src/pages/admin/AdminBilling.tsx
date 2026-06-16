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
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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

  // On-chain Verification State
  const [verifyingIntent, setVerifyingIntent] = useState<any | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Billing Config Form State
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  
  const [priceUsd, setPriceUsd] = useState<number>(20);
  const [priceDaar, setPriceDaar] = useState<number>(2);
  const [daarUsdtRate, setDaarUsdtRate] = useState<number>(10);
  const [acceptedAssets, setAcceptedAssets] = useState<string[]>(['DAAR', 'USDT', 'USDC', 'POL']);
  const [paymentNetwork, setPaymentNetwork] = useState<string>('polygon');
  const [treasuryAddress, setTreasuryAddress] = useState<string>('');
  const [daarPurchaseUrl, setDaarPurchaseUrl] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);

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

  const fetchConfig = async () => {
    try {
      const { data, error } = await (supabase as any).rpc('get_active_billing_plan_config', { p_plan_key: 'leader' });
      if (!error && data && data.length > 0) {
        const item = data[0];
        setPriceUsd(Number(item.price_usd));
        setPriceDaar(Number(item.price_daar));
        setDaarUsdtRate(Number(item.daar_usdt_rate));
        setAcceptedAssets(item.accepted_assets || []);
        setPaymentNetwork(item.payment_network || 'polygon');
        setTreasuryAddress(item.treasury_address || '');
        setDaarPurchaseUrl(item.daar_purchase_url || '');
        setIsActive(item.is_active !== false);
      }
    } catch (err) {
      console.warn('Failed to fetch billing plan config:', err);
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchIntents();
    fetchConfig();
  }, [activeFilter]);

  const handleAssetToggle = (asset: string) => {
    setAcceptedAssets(prev => 
      prev.includes(asset) 
        ? prev.filter(a => a !== asset)
        : [...prev, asset]
    );
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (priceUsd <= 0 || priceDaar <= 0 || daarUsdtRate <= 0) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'All rates and prices must be greater than zero.'
      });
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(treasuryAddress.trim())) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: t.cryptoBilling.invalidTreasuryAddressError || 'Invalid treasury EVM address.'
      });
      return;
    }

    const urlTrimmed = daarPurchaseUrl.trim();
    if (urlTrimmed && !/^https?:\/\/.+/.test(urlTrimmed)) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: t.cryptoBilling.invalidDaarPurchaseUrlError || 'Invalid purchase URL format.'
      });
      return;
    }

    if (acceptedAssets.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'You must accept at least one crypto asset.'
      });
      return;
    }

    setConfigSaving(true);
    try {
      const { error } = await (supabase as any).rpc('admin_update_billing_plan_config', {
        p_plan_key: 'leader',
        p_price_usd: Number(priceUsd),
        p_price_daar: Number(priceDaar),
        p_daar_usdt_rate: Number(daarUsdtRate),
        p_accepted_assets: acceptedAssets,
        p_payment_network: paymentNetwork,
        p_treasury_address: treasuryAddress.trim(),
        p_daar_purchase_url: urlTrimmed,
        p_is_active: isActive
      });

      if (error) throw error;

      toast({
        title: t.cryptoBilling.pricingConfigUpdatedSuccess || 'Config Updated',
        description: 'Billing plan config saved and audit logged successfully.'
      });
      
      // Refresh configurations
      fetchConfig();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: err.message || 'Failed to update billing config.'
      });
    } finally {
      setConfigSaving(false);
    }
  };

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

  const handleVerifyOnchain = async (intent: any) => {
    setVerifyingIntent(intent);
    setVerificationLoading(true);
    setVerificationResult(null);
    setVerificationError(null);

    if (!intent.tx_hash) {
      setVerificationError('No transaction hash submitted.');
      setVerificationLoading(false);
      return;
    }

    const cleanHash = intent.tx_hash.trim();
    if (!/^0x[a-fA-F0-9]{64}$/.test(cleanHash)) {
      setVerificationError('Invalid transaction hash format.');
      setVerificationLoading(false);
      return;
    }

    try {
      const rpcUrls = [
        'https://polygon-rpc.com/',
        'https://rpc.ankr.com/polygon',
        'https://polygon.llamarpc.com'
      ];
      
      let fetchedData = null;
      let rpcError = null;

      for (const url of rpcUrls) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([
              {
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getTransactionByHash',
                params: [cleanHash],
              },
              {
                jsonrpc: '2.0',
                id: 2,
                method: 'eth_getTransactionReceipt',
                params: [cleanHash],
              }
            ]),
          });
          
          if (!response.ok) continue;
          const data = await response.json();
          if (Array.isArray(data) && data[0]?.result) {
            fetchedData = {
              tx: data[0].result,
              receipt: data[1]?.result || null
            };
            break;
          }
        } catch (err) {
          rpcError = err;
        }
      }

      if (!fetchedData) {
        // Try individual fallback requests in case batching failed
        for (const url of rpcUrls) {
          try {
            const txRes = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getTransactionByHash',
                params: [cleanHash],
              }),
            });
            const txData = await txRes.json();
            if (txData.result) {
              const receiptRes = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  id: 2,
                  method: 'eth_getTransactionReceipt',
                  params: [cleanHash],
                }),
              });
              const receiptData = await receiptRes.json();
              fetchedData = {
                tx: txData.result,
                receipt: receiptData.result || null
              };
              break;
            }
          } catch (err) {
            rpcError = err;
          }
        }
      }

      if (!fetchedData || !fetchedData.tx) {
        throw new Error('Transaction not found on Polygon mainnet. Please wait for a few blocks or confirm the hash.');
      }

      const tx = fetchedData.tx;
      const receipt = fetchedData.receipt;

      let decodedAsset = 'POL';
      let decodedAmount = 0;
      let decodedRecipient = '';

      if (tx.input && tx.input.startsWith('0xa9059cbb')) {
        // ERC20 transfer
        const contractAddress = tx.to.toLowerCase();
        
        decodedRecipient = '0x' + tx.input.slice(34, 74).toLowerCase();
        
        const rawAmountHex = '0x' + tx.input.slice(74, 138);
        const rawAmount = BigInt(rawAmountHex);
        
        const isUsdt = contractAddress === '0xc2132d05d31c914a87c6611c10748aeb04b58e8f';
        const isUsdc = contractAddress === '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359' || contractAddress === '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';
        
        if (isUsdt) {
          decodedAsset = 'USDT';
          decodedAmount = Number(rawAmount) / 1e6;
        } else if (isUsdc) {
          decodedAsset = 'USDC';
          decodedAmount = Number(rawAmount) / 1e6;
        } else {
          decodedAsset = 'DAAR';
          decodedAmount = Number(rawAmount) / 1e18;
        }
      } else {
        decodedAsset = 'POL';
        decodedAmount = Number(BigInt(tx.value)) / 1e18;
        decodedRecipient = tx.to ? tx.to.toLowerCase() : '';
      }

      const successOnchain = receipt ? receipt.status === '0x1' : true;
      const targetRecipientMatched = decodedRecipient.toLowerCase() === treasuryAddress.toLowerCase();
      const amountMatched = decodedAmount >= Number(intent.amount_crypto);
      const assetMatched = decodedAsset.toUpperCase() === intent.crypto_asset.toUpperCase();
      const doubleSpend = intents.some(
        (other: any) => other.id !== intent.id && other.tx_hash === intent.tx_hash && other.status === 'confirmed'
      );

      setVerificationResult({
        blockNumber: receipt ? parseInt(receipt.blockNumber, 16) : null,
        sender: tx.from,
        recipient: decodedRecipient,
        amount: decodedAmount,
        asset: decodedAsset,
        status: successOnchain ? 'success' : 'failed',
        checks: {
          successOnchain,
          targetRecipientMatched,
          amountMatched,
          assetMatched,
          doubleSpend
        }
      });
    } catch (err: any) {
      console.error('On-chain verification error:', err);
      setVerificationError(err.message || 'Failed to verify transaction on-chain.');
    } finally {
      setVerificationLoading(false);
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
                  {configLoading ? LEADER_PLAN.priceDaar : priceDaar} DAAR/{lang === 'uk' ? 'міс' : lang === 'ru' ? 'мес' : lang === 'es' ? 'mes' : 'mo'}
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-[10px] text-slate-500">
                  {configLoading ? `$${LEADER_PLAN.priceUsd} USD equivalent` : `$${priceUsd} USD equivalent`}
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
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className={`text-[8px] ${acceptedAssets.includes(asset.symbol) ? 'text-emerald-450 border-emerald-550/30 bg-emerald-500/5' : 'text-slate-500 border-slate-700/50'}`}>
                    {acceptedAssets.includes(asset.symbol) ? 'Active' : 'Disabled'}
                  </Badge>
                  <Badge variant="outline" className="text-[8px] text-slate-500 border-slate-700/50">
                    {asset.chain}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Billing Config Editor Form */}
      <Card className="border-indigo-500/20 bg-slate-900/10 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-400" />
            <CardTitle className="text-sm font-bold text-slate-100">
              {t.cryptoBilling.billingConfigTitle}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-400">
            Configure price points, payment targets, and accepted tokens.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {configLoading ? (
            <div className="py-6 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500 mx-auto mb-2" />
              <span className="text-xs text-slate-400">{t.loading}</span>
            </div>
          ) : (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price-usd" className="text-xs text-slate-300">
                    {t.cryptoBilling.leaderPlanUsdPrice}
                  </Label>
                  <Input
                    id="price-usd"
                    type="number"
                    step="0.01"
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(Number(e.target.value))}
                    className="bg-slate-950/40 border-slate-800 text-xs text-slate-200 h-9"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="price-daar" className="text-xs text-slate-300">
                    {t.cryptoBilling.daarMonthlyAmount}
                  </Label>
                  <Input
                    id="price-daar"
                    type="number"
                    step="0.1"
                    value={priceDaar}
                    onChange={(e) => setPriceDaar(Number(e.target.value))}
                    className="bg-slate-950/40 border-slate-800 text-xs text-slate-200 h-9"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="daar-usdt-rate" className="text-xs text-slate-300">
                    {t.cryptoBilling.daarUsdtRateLabel}
                  </Label>
                  <Input
                    id="daar-usdt-rate"
                    type="number"
                    step="0.1"
                    value={daarUsdtRate}
                    onChange={(e) => setDaarUsdtRate(Number(e.target.value))}
                    className="bg-slate-950/40 border-slate-800 text-xs text-slate-200 h-9"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="treasury-address" className="text-xs text-slate-300">
                    {t.cryptoBilling.treasuryAddressLabel}
                  </Label>
                  <Input
                    id="treasury-address"
                    value={treasuryAddress}
                    onChange={(e) => setTreasuryAddress(e.target.value)}
                    placeholder="0x..."
                    className="bg-slate-950/40 border-slate-800 text-xs text-slate-200 h-9 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="daar-purchase-url" className="text-xs text-slate-300">
                    {t.cryptoBilling.daarPurchaseUrlLabel}
                  </Label>
                  <Input
                    id="daar-purchase-url"
                    value={daarPurchaseUrl}
                    onChange={(e) => setDaarPurchaseUrl(e.target.value)}
                    placeholder="https://..."
                    className="bg-slate-950/40 border-slate-800 text-xs text-slate-200 h-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-300">
                  {t.cryptoBilling.acceptedAssetsLabel}
                </Label>
                <div className="flex flex-wrap gap-4 pt-1">
                  {['DAAR', 'USDT', 'USDC', 'POL'].map((asset) => (
                    <div key={asset} className="flex items-center space-x-2">
                      <Checkbox
                        id={`check-${asset}`}
                        checked={acceptedAssets.includes(asset)}
                        onCheckedChange={() => handleAssetToggle(asset)}
                      />
                      <Label htmlFor={`check-${asset}`} className="text-xs text-slate-300 font-semibold cursor-pointer">
                        {asset}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="plan-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="plan-active" className="text-xs text-slate-300 cursor-pointer font-semibold">
                  {t.cryptoBilling.planActiveLabel}
                </Label>
              </div>

              <Alert className="border-indigo-500/20 bg-indigo-500/5 text-indigo-300 py-2.5">
                <AlertCircle className="h-4 w-4 text-indigo-400" />
                <AlertDescription className="text-[10px] leading-relaxed text-indigo-200">
                  {t.cryptoBilling.changesApplyWarning}
                </AlertDescription>
              </Alert>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={configSaving}
                  className="bg-indigo-600 hover:bg-indigo-550 text-indigo-100 text-xs font-semibold h-9 px-4 gap-1.5"
                >
                  {configSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {t.cryptoBilling.savePricingConfigBtn}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

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
                              {intent.tx_hash && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={processingId !== null}
                                  onClick={() => handleVerifyOnchain(intent)}
                                  className="h-7 text-[10px] bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 border-indigo-500/25 font-bold gap-1"
                                >
                                  <Shield className="h-3 w-3" />
                                  {t.cryptoBilling.verifyOnPolygon || 'Verify on Polygon'}
                                </Button>
                              )}
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
                  <div className="text-[10px] text-slate-400">
                    {configLoading 
                      ? `$${LEADER_PLAN.priceUsd}/${lang === 'uk' ? 'міс' : lang === 'ru' ? 'мес' : lang === 'es' ? 'mes' : 'mo'} = ${LEADER_PLAN.priceDaar} DAAR`
                      : `$${priceUsd}/${lang === 'uk' ? 'міс' : lang === 'ru' ? 'мес' : lang === 'es' ? 'mes' : 'mo'} = ${priceDaar} DAAR`
                    }
                  </div>
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

      {/* On-chain Verification Dialog */}
      <Dialog open={verifyingIntent !== null} onOpenChange={(open) => { if (!open) setVerifyingIntent(null); }}>
        <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2 text-indigo-400">
              <Shield className="h-4 w-4" />
              {t.cryptoBilling.onchainVerification || 'On-chain Verification'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Checking transaction details directly from the Polygon network.
            </DialogDescription>
          </DialogHeader>

          {verificationLoading ? (
            <div className="py-8 text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mx-auto" />
              <p className="text-xs text-slate-400">
                {t.cryptoBilling.verificationPending || 'Verification pending...'}
              </p>
            </div>
          ) : verificationError ? (
            <div className="py-4 space-y-4">
              <Alert variant="destructive" className="border-red-500/20 bg-red-500/5 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{verificationError}</AlertDescription>
              </Alert>
              <div className="text-center">
                <a
                  href={`https://polygonscan.com/tx/${verifyingIntent?.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-semibold"
                >
                  {t.cryptoBilling.viewOnPolygonScan || 'View on PolygonScan'}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ) : verificationResult ? (
            <div className="space-y-4 pt-2">
              {/* Overall Status Badge */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs text-slate-400">Verification Status:</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 ${
                    verificationResult.status === 'success' &&
                    verificationResult.checks.targetRecipientMatched &&
                    verificationResult.checks.amountMatched &&
                    verificationResult.checks.assetMatched &&
                    !verificationResult.checks.doubleSpend
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                      : 'bg-red-500/10 text-red-400 border-red-500/25'
                  }`}
                >
                  {verificationResult.status === 'success' &&
                  verificationResult.checks.targetRecipientMatched &&
                  verificationResult.checks.amountMatched &&
                  verificationResult.checks.assetMatched &&
                  !verificationResult.checks.doubleSpend
                    ? (t.cryptoBilling.verifiedOnchain || 'Verified Onchain')
                    : (t.cryptoBilling.manualReviewRequired || 'Manual Review Required')}
                </Badge>
              </div>

              {/* Warnings List */}
              {verificationResult.checks.doubleSpend && (
                <Alert variant="destructive" className="border-red-500/20 bg-red-500/5 text-red-400 py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-[10px]">
                    {t.cryptoBilling.txAlreadyUsed || 'Warning: This transaction hash has already been used for another confirmed intent.'}
                  </AlertDescription>
                </Alert>
              )}

              {!verificationResult.checks.targetRecipientMatched && (
                <Alert variant="destructive" className="border-red-500/20 bg-red-500/5 text-red-400 py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-[10px]">
                    {t.cryptoBilling.recipientMismatch || 'Warning: The transaction recipient does not match the configured treasury address.'}
                  </AlertDescription>
                </Alert>
              )}

              {!verificationResult.checks.assetMatched && (
                <Alert variant="destructive" className="border-red-500/20 bg-red-500/5 text-red-400 py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-[10px]">
                    {t.cryptoBilling.assetMismatch || 'Warning: The transaction token does not match the expected intent asset.'}
                  </AlertDescription>
                </Alert>
              )}

              {!verificationResult.checks.amountMatched && (
                <Alert variant="destructive" className="border-red-500/20 bg-red-500/5 text-red-400 py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-[10px]">
                    {t.cryptoBilling.amountTooLow || 'Warning: The transaction amount is lower than the expected amount.'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Data Table */}
              <div className="space-y-2 rounded-lg bg-slate-950/40 border border-slate-800 p-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Token Asset:</span>
                  <span className="font-semibold font-mono flex items-center gap-1.5">
                    {verificationResult.checks.assetMatched ? (
                      <CheckCircle className="h-3 w-3 text-emerald-450" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-400" />
                    )}
                    Decoded: {verificationResult.asset} (Expected: {verifyingIntent?.crypto_asset})
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Amount Sent:</span>
                  <span className="font-semibold font-mono flex items-center gap-1.5">
                    {verificationResult.checks.amountMatched ? (
                      <CheckCircle className="h-3 w-3 text-emerald-450" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-400" />
                    )}
                    Decoded: {verificationResult.amount} (Expected: {verifyingIntent?.amount_crypto})
                  </span>
                </div>

                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-400 whitespace-nowrap">Recipient:</span>
                  <span className="font-semibold font-mono flex items-center gap-1.5 text-right break-all">
                    {verificationResult.checks.targetRecipientMatched ? (
                      <CheckCircle className="h-3 w-3 text-emerald-450 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-400 flex-shrink-0" />
                    )}
                    Decoded: {truncateAddress(verificationResult.recipient)} (Expected: {truncateAddress(treasuryAddress)})
                  </span>
                </div>

                <div className="border-t border-slate-800/60 my-2 pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sender Wallet:</span>
                    <span className="font-mono text-slate-350">{truncateAddress(verificationResult.sender)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Block Height:</span>
                    <span className="font-mono text-slate-350">{verificationResult.blockNumber || 'Pending'}</span>
                  </div>
                </div>
              </div>

              <div className="text-center pt-1">
                <a
                  href={`https://polygonscan.com/tx/${verifyingIntent?.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-semibold"
                >
                  {t.cryptoBilling.viewOnPolygonScan || 'View on PolygonScan'}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ) : null}

          <DialogFooter className="flex gap-2 sm:gap-0 mt-4 border-t border-slate-800 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVerifyingIntent(null)}
              className="text-xs border-slate-800 hover:bg-slate-850 h-8"
            >
              Cancel
            </Button>
            {verifyingIntent && !verificationLoading && (
              <div className="flex gap-1.5 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={processingId !== null}
                  onClick={() => {
                    handleReject(verifyingIntent.id);
                    setVerifyingIntent(null);
                  }}
                  className="text-xs text-red-400 hover:text-red-350 hover:bg-red-500/5 h-8 font-bold"
                >
                  {t.cryptoBilling.verifyActionReject}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={processingId !== null}
                  onClick={() => {
                    handleApprove(verifyingIntent.id);
                    setVerifyingIntent(null);
                  }}
                  className="text-xs bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border-emerald-500/25 h-8 font-bold"
                >
                  {t.cryptoBilling.verifyActionApprove}
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBilling;
