import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  getLeaderPlanAmount, 
  isValidTxHash, 
  shortenAddress, 
  DAARION_TREASURY_EVM_ADDRESS, 
  DAARION_PAYMENT_NETWORK,
  useBillingPlanConfig,
  type SupportedPaymentAsset 
} from '@/lib/cryptoBilling';
import { 
  Coins, 
  Copy, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Loader2, 
  ShieldAlert,
  Wallet,
  Clock,
  ArrowRight
} from 'lucide-react';
import { DaarPurchaseLink } from './DaarPurchaseLink';

interface CryptoPaymentIntentProps {
  communityId?: string | null;
  onSuccess?: () => void;
}

export const CryptoPaymentIntent = ({ communityId = null, onSuccess }: CryptoPaymentIntentProps) => {
  const { user } = useAuth();
  const { profile, refetch: refetchProfile } = useUserProfile();
  const { isConnected, connectWallet, address: connectedAddress, truncateAddress } = useWalletConnection();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { config, loading: configLoading } = useBillingPlanConfig();

  const [loading, setLoading] = useState(false);
  const [activeSub, setActiveSub] = useState<any | null>(null);
  const [activeIntent, setActiveIntent] = useState<any | null>(null);
  
  const [selectedAsset, setSelectedAsset] = useState<SupportedPaymentAsset>('DAAR');
  const [txHash, setTxHash] = useState('');
  const [submittingHash, setSubmittingHash] = useState(false);
  const [verifyingBackend, setVerifyingBackend] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Sync selected asset if config updates and excludes the currently selected asset
  useEffect(() => {
    if (config.acceptedAssets && config.acceptedAssets.length > 0) {
      if (!config.acceptedAssets.includes(selectedAsset)) {
        setSelectedAsset(config.acceptedAssets[0]);
      }
    }
  }, [config.acceptedAssets]);

  // Fetch current subscription and latest payment intent
  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch latest subscription
      const { data: subData, error: subError } = await (supabase as any)
        .from('microdao_subscriptions')
        .select('*')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (subError) throw subError;

      const latestSub = subData && subData.length > 0 ? subData[0] : null;
      setActiveSub(latestSub);

      if (latestSub) {
        // 2. Fetch latest payment intent linked to this subscription
        const { data: intentData, error: intentError } = await (supabase as any)
          .from('crypto_payment_intents')
          .select('*')
          .eq('subscription_id', latestSub.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (intentError) throw intentError;

        const latestIntent = intentData && intentData.length > 0 ? intentData[0] : null;
        setActiveIntent(latestIntent);
        if (latestIntent?.tx_hash) {
          setTxHash(latestIntent.tx_hash);
        }
      }
    } catch (err: any) {
      console.error('[CryptoPaymentIntent] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t.identity.addressCopied,
      description: label
    });
  };

  const handleCreateIntent = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const planDetails = getLeaderPlanAmount(selectedAsset, {
        priceUsd: config.priceUsd,
        priceDaar: config.priceDaar,
        daarUsdtRate: config.daarUsdtRate,
      });

      // 1. Insert subscription
      const { data: newSub, error: subError } = await (supabase as any)
        .from('microdao_subscriptions')
        .insert({
          community_id: communityId,
          owner_user_id: user.id,
          plan: 'leader',
          status: 'pending_payment',
          price_usd: config.priceUsd,
          price_daar: config.priceDaar,
          accepted_assets: config.acceptedAssets
        })
        .select()
        .single();

      if (subError) throw subError;

      // 2. Insert payment intent
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 2); // 2 hours expiration

      const { data: newIntent, error: intentError } = await (supabase as any)
        .from('crypto_payment_intents')
        .insert({
          subscription_id: newSub.id,
          user_id: user.id,
          amount_usd: config.priceUsd,
          amount_crypto: planDetails.amount,
          crypto_asset: selectedAsset,
          chain: config.paymentNetwork,
          wallet_from: profile?.wallet_address || connectedAddress,
          wallet_to: config.treasuryAddress,
          status: 'pending',
          expires_at: expirationDate.toISOString()
        })
        .select()
        .single();

      if (intentError) throw intentError;

      setActiveSub(newSub);
      setActiveIntent(newIntent);
      setTxHash('');

      toast({
        title: t.cryptoBilling.intentCreated,
        description: t.cryptoBilling.intentCreatedDesc
      });
    } catch (err: any) {
      console.error('[CryptoPaymentIntent] Create error:', err);
      toast({
        variant: 'destructive',
        title: t.error,
        description: err.message || t.cryptoBilling.intentFailed
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTxHash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIntent) return;
    if (!isValidTxHash(txHash)) {
      toast({
        variant: 'destructive',
        title: t.cryptoBilling.invalidTxHash,
        description: 'Format should be 0x followed by 64 hexadecimal characters.'
      });
      return;
    }

    setSubmittingHash(true);
    try {
      const { error } = await (supabase as any)
        .from('crypto_payment_intents')
        .update({
          tx_hash: txHash.trim(),
          status: 'submitted'
        })
        .eq('id', activeIntent.id);

      if (error) throw error;

      // Update local subscription status to manual review
      if (activeSub) {
        await (supabase as any)
          .from('microdao_subscriptions')
          .update({
            status: 'manual_review'
          })
          .eq('id', activeSub.id);
      }

      toast({
        title: t.cryptoBilling.paymentSubmitted,
        description: t.cryptoBilling.waitingVerificationDesc
      });

      await fetchData();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('[CryptoPaymentIntent] Submit hash error:', err);
      toast({
        variant: 'destructive',
        title: t.error,
        description: err.message || t.cryptoBilling.intentFailed
      });
    } finally {
      setSubmittingHash(false);
    }
  };

  const handleBackendVerify = async () => {
    if (!activeIntent) return;
    setVerifyingBackend(true);
    setBackendError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session. Please log in again.');
      }

      const { data, error } = await supabase.functions.invoke('verify-polygon-payment', {
        body: { payment_intent_id: activeIntent.id }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: t.cryptoBilling.paymentConfirmed,
        description: data?.message || t.cryptoBilling.verifiedByBackend,
      });

      await fetchData();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('[CryptoPaymentIntent] Backend verification error:', err);
      setBackendError(err.message || 'Failed to verify transaction securely on-chain.');
      toast({
        variant: 'destructive',
        title: t.cryptoBilling.verificationFailed,
        description: err.message || 'Failed to verify transaction securely on-chain.',
      });
      await fetchData();
    } finally {
      setVerifyingBackend(false);
    }
  };

  const handleCancelIntent = async () => {
    if (!activeSub || !activeIntent) return;
    setLoading(true);
    try {
      await (supabase as any)
        .from('crypto_payment_intents')
        .update({ status: 'expired' })
        .eq('id', activeIntent.id);

      await (supabase as any)
        .from('microdao_subscriptions')
        .update({ status: 'none' })
        .eq('id', activeSub.id);

      setActiveSub(null);
      setActiveIntent(null);
      setTxHash('');

      toast({
        title: 'Cancelled',
        description: 'Payment intent cancelled successfully.'
      });
    } catch (err: any) {
      console.error('[CryptoPaymentIntent] Cancel error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Enforce identity checklist before billing actions
  const isProfileIncomplete = !user?.email || !profile?.telegram_username || !profile?.wallet_address;

  if (loading) {
    return (
      <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md">
        <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
          <span className="text-xs text-slate-400">{t.loading}</span>
        </CardContent>
      </Card>
    );
  }

  // Active or bypass subscription display
  const isSubActive = activeSub?.status === 'active' || activeSub?.status === 'founder_bypass' || activeSub?.status === 'guardian_bypass';
  if (isSubActive) {
    return (
      <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-100">Leader Plan</CardTitle>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] uppercase font-bold">
              {t.cryptoBilling.leaderActive}
            </Badge>
          </div>
          <CardDescription className="text-slate-400 text-xs">
            $20/mo equivalent active subscription.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="text-emerald-400 font-bold uppercase text-[10px]">
                {activeSub.status}
              </span>
            </div>
            {activeSub.current_period_end && (
              <div className="flex justify-between">
                <span className="text-slate-400">Expires:</span>
                <span className="text-slate-300 font-medium">
                  {new Date(activeSub.current_period_end).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pending intent / waiting for verification
  if (activeIntent && (activeIntent.status === 'pending' || activeIntent.status === 'submitted' || activeIntent.status === 'manual_review')) {
    const isSubmitted = activeIntent.status === 'submitted' || activeIntent.status === 'manual_review';
    const amountLabel = `${activeIntent.amount_crypto} ${activeIntent.crypto_asset}`;
    const paymentChain = activeIntent.chain || 'polygon';
    const treasuryWallet = activeIntent.wallet_to || DAARION_TREASURY_EVM_ADDRESS;

    return (
      <Card className="border-amber-500/20 bg-amber-500/3 backdrop-blur-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-100">
              {t.cryptoBilling.paymentInstructions}
            </CardTitle>
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] uppercase font-bold">
              {isSubmitted ? t.cryptoBilling.waitingVerification : t.cryptoBilling.leaderPendingPayment}
            </Badge>
          </div>
          <CardDescription className="text-[11px] text-slate-400">
            {t.cryptoBilling.paymentInstructionsDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Warning about Network */}
          <Alert className="border-red-500/20 bg-red-500/5 text-red-400">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-xs font-bold text-red-300">
              {paymentChain.charAt(0).toUpperCase() + paymentChain.slice(1)} Only
            </AlertTitle>
            <AlertDescription className="text-[10px] leading-relaxed mt-1 text-slate-300">
              Make sure you send funds on the <strong>{paymentChain === 'polygon' ? 'Polygon' : paymentChain}</strong> network. Transfers on other networks cannot be recovered.
            </AlertDescription>
          </Alert>

          {/* Payment info block */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3.5 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-850/60">
              <span className="text-slate-400">Send exactly:</span>
              <span className="text-slate-100 font-extrabold text-sm font-mono">
                {amountLabel}
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-400 block">Treasury Wallet ({paymentChain === 'polygon' ? 'Polygon' : paymentChain}):</span>
              <div className="flex items-center gap-1.5 bg-slate-950/60 rounded-md border border-slate-850 p-2">
                <span className="text-slate-300 font-mono text-[11px] select-all break-all flex-1">
                  {treasuryWallet}
                </span>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7 text-slate-400 hover:text-slate-200"
                  onClick={() => copyToClipboard(treasuryWallet, 'Treasury address')}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {isSubmitted ? (
            /* Pending verification status */
            <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-4 text-center space-y-3">
              <Clock className="h-8 w-8 text-amber-400 animate-pulse mx-auto" />
              <h4 className="text-xs font-bold text-slate-200">{t.cryptoBilling.waitingVerification}</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed max-w-sm mx-auto">
                {t.cryptoBilling.waitingVerificationDesc}
              </p>
              {activeIntent.tx_hash && (
                <div className="text-[10px] border-t border-slate-850 pt-2 flex flex-col items-center gap-1.5">
                  <div>
                    <span className="text-slate-500">Hash: </span>
                    <a 
                      href={`https://polygonscan.com/tx/${activeIntent.tx_hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-0.5 font-mono"
                    >
                      {truncateAddress(activeIntent.tx_hash)}
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>

                  {activeIntent.verification_status && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">Backend: </span>
                      <Badge 
                        className={`text-[9px] uppercase font-semibold border ${
                          activeIntent.verification_status === 'verified'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : activeIntent.verification_status === 'manual_review'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                      >
                        {activeIntent.verification_status}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Secure Backend Verification Trigger */}
              <div className="pt-1">
                <Button
                  onClick={handleBackendVerify}
                  disabled={verifyingBackend}
                  className="w-full bg-emerald-600 hover:bg-emerald-550 text-emerald-100 border border-emerald-500/30 h-9 font-semibold text-xs gap-1.5"
                >
                  {verifyingBackend ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Coins className="h-3.5 w-3.5" />
                  )}
                  {t.cryptoBilling.verifySecurely}
                </Button>
                <span className="text-[9px] text-slate-500 block leading-tight mt-1.5">
                  {t.cryptoBilling.authoritativeVerification}
                </span>
              </div>

              {/* Verification Error alert */}
              {(backendError || activeIntent.verification_error) && (
                <Alert className="border-red-500/20 bg-red-500/5 text-red-400 mt-2 text-left">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                  <AlertTitle className="text-xs font-bold text-red-300">
                    {t.cryptoBilling.verificationFailed}
                  </AlertTitle>
                  <AlertDescription className="text-[9px] leading-normal mt-1 text-slate-300 font-mono break-all max-h-24 overflow-y-auto">
                    {backendError || activeIntent.verification_error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Manual review warning */}
              {activeIntent.verification_status === 'manual_review' && (
                <Alert className="border-amber-500/20 bg-amber-500/5 text-amber-400 mt-2 text-left">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                  <AlertTitle className="text-xs font-bold text-amber-300">
                    {t.cryptoBilling.manualReviewRequired}
                  </AlertTitle>
                  <AlertDescription className="text-[9px] leading-normal mt-1 text-slate-300">
                    {activeIntent.verification_error || 'A transaction was found, but it requires manual Guardian approval.'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            /* Tx hash submission form */
            <form onSubmit={handleSubmitTxHash} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="tx-hash" className="text-slate-400 text-xs">
                  {t.cryptoBilling.submitTxHash}
                </Label>
                <Input
                  id="tx-hash"
                  placeholder={t.cryptoBilling.txHashPlaceholder}
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  className="bg-slate-950/40 border-slate-800 text-slate-200 h-9 text-xs"
                  required
                />
                <span className="text-[9px] text-slate-500 block leading-tight">
                  {t.cryptoBilling.txHashFormatWarning}
                </span>
              </div>
              <Button 
                type="submit" 
                disabled={submittingHash || !txHash.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-550 text-indigo-100 border border-indigo-500/30 h-9 font-semibold text-xs gap-1.5"
              >
                {submittingHash && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {t.cryptoBilling.submitTxHash}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="pt-2 pb-4 flex justify-between gap-3 border-t border-slate-850/60 text-[10px]">
          <span className="text-slate-500">
            ID: {activeIntent.id.slice(0, 8)}
          </span>
          {!isSubmitted && (
            <button 
              onClick={handleCancelIntent}
              className="text-red-400 hover:text-red-300 font-semibold transition-colors"
            >
              {t.cancel}
            </button>
          )}
        </CardFooter>
      </Card>
    );
  }

  // Incomplete profile warning
  if (isProfileIncomplete) {
    return (
      <Card className="border-amber-500/20 bg-amber-500/3 backdrop-blur-md">
        <CardHeader className="pb-2 text-center">
          <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-3">
            <ShieldAlert className="h-6 w-6 text-amber-400" />
          </div>
          <CardTitle className="text-sm font-bold text-slate-100">
            {t.identity.onboardingIdentityTitle}
          </CardTitle>
          <CardDescription className="text-slate-400 text-[11px] leading-relaxed max-w-sm mx-auto">
            {t.identity.onboardingLeaderRequires}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Email</span>
              <span className={user?.email ? "text-emerald-400" : "text-amber-400"}>
                {user?.email ? `✓ ${t.identity.walletVerified}` : `✗ ${t.identity.required}`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{t.identity.telegramTitle}</span>
              <span className={profile?.telegram_username ? "text-emerald-400" : "text-amber-400"}>
                {profile?.telegram_username ? `✓ @${profile.telegram_username}` : `✗ ${t.identity.required}`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{t.identity.walletTitle}</span>
              <span className={profile?.wallet_address ? "text-emerald-400" : "text-amber-400"}>
                {profile?.wallet_address ? `✓ ${truncateAddress(profile.wallet_address)}` : `✗ ${t.identity.required}`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create payment intent form
  return (
    <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-100">
            Leader Plan
          </CardTitle>
          <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[9px] uppercase font-bold font-mono">
            {configLoading ? '$20/mo' : `$${config.priceUsd}/mo`}
          </Badge>
        </div>
        <CardDescription className="text-slate-400 text-xs">
          Crypto subscription Leader Plan for MicroDAO activation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Purchase Link CTA */}
        <DaarPurchaseLink />

        {/* Selection */}
        <div className="space-y-2">
          <Label className="text-slate-400 text-xs">{t.cryptoBilling.selectAsset}</Label>
          <RadioGroup 
            value={selectedAsset} 
            onValueChange={(val) => setSelectedAsset(val as SupportedPaymentAsset)}
            className="grid grid-cols-2 gap-3"
          >
            {config.acceptedAssets.map((asset) => (
              <div key={asset} className="flex items-center space-x-2 rounded-lg border border-slate-800 bg-slate-950/20 p-3 hover:bg-slate-900/30 transition-colors">
                <RadioGroupItem value={asset} id={`asset-${asset.toLowerCase()}`} />
                <Label htmlFor={`asset-${asset.toLowerCase()}`} className="flex justify-between items-center w-full text-xs text-slate-300 font-semibold cursor-pointer">
                  <span>{asset}</span>
                  <span className="font-mono text-[10px] text-slate-500">
                    {getLeaderPlanAmount(asset, config).label}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Network reminder */}
        <div className="rounded-lg border border-indigo-500/10 bg-indigo-500/2 p-3 text-[10px] text-slate-400 flex gap-2">
          <AlertTriangle className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <span>
            Treasury address is located on the <strong>{config.paymentNetwork === 'polygon' ? 'Polygon Network' : config.paymentNetwork}</strong>. Please ensure you select {config.paymentNetwork === 'polygon' ? 'Polygon' : config.paymentNetwork} when transferring funds.
          </span>
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-4">
        <Button 
          onClick={handleCreateIntent}
          className="w-full bg-indigo-600 hover:bg-indigo-550 text-indigo-100 border border-indigo-500/30 h-9 font-semibold text-xs gap-1.5"
        >
          {t.cryptoBilling.createIntent}
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
};
