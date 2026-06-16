import { useTranslation } from "@/lib/i18n";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/useAuth";
import { useActiveCommunity } from "@/hooks/useActiveCommunity";
import { useNavigate } from "react-router-dom";
import { DaarPurchaseLink } from "@/components/billing/DaarPurchaseLink";
import { CryptoPaymentIntent } from "@/components/billing/CryptoPaymentIntent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Shield, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { useBillingPlanConfig } from "@/lib/cryptoBilling";

export default function Billing() {
  const { t, language } = useTranslation();
  const { profile } = useUserProfile();
  const { user } = useAuth();
  const { memberships } = useActiveCommunity();
  const navigate = useNavigate();
  const { config, loading } = useBillingPlanConfig();

  const isProfileComplete = user?.email && profile?.telegram_username && profile?.wallet_address;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent flex items-center gap-2.5">
          <CreditCard className="h-6 w-6 text-indigo-400" />
          {t.pricingExtra.billingTitle}
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          {t.pricingExtra.billingDesc}
        </p>
      </div>

      {/* Guardian Link */}
      {profile?.role === 'guardian' && (
        <Card className="border-indigo-500/20 bg-indigo-500/5">
          <CardContent className="p-4 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold">
              <Shield className="h-4 w-4 text-indigo-450" />
              <span>{t.pricingExtra.goToVerificationQueue}</span>
            </div>
            <Button 
              size="sm" 
              onClick={() => navigate('/admin/billing')}
              className="bg-indigo-600 hover:bg-indigo-550 text-indigo-100 text-[10px] h-8 font-semibold"
            >
              Open Admin Billing Queue
              <ArrowRight className="h-3 w-3 ml-1.5" />
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left column: Leader Plan details & Identity checklist */}
        <div className="space-y-6 md:col-span-1">
          {/* Plan Summary Card */}
          <Card className="border-slate-800 bg-slate-900/10">
            <CardHeader className="pb-3">
              <Badge className="w-fit bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-[9px] uppercase font-bold tracking-wider">
                Leader Plan
              </Badge>
              <CardTitle className="text-base font-bold mt-2">MicroDAO Activation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="border-t border-b border-slate-800 py-3 flex flex-col justify-center">
                <span className="text-xl font-extrabold text-slate-100">
                  {loading ? t.pricingExtra.leaderPlanPrice : `${config.priceDaar} DAAR / ${language === 'uk' ? 'міс' : language === 'ru' ? 'мес' : language === 'es' ? 'mes' : 'mo'}`}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {loading ? t.pricingExtra.leaderPlanPeriod : `$${config.priceUsd} ${language === 'uk' ? 'еквівалент' : language === 'ru' ? 'эквивалент' : language === 'es' ? 'equivalente' : 'equivalent'} | ${config.paymentNetwork} only`}
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                {t.pricingExtra.leaderPlanDesc}
              </p>
              <ul className="space-y-2 pt-2 border-t border-slate-850">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <span>{t.pricingExtra.leaderPlanFeature1}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <span>{t.pricingExtra.leaderPlanFeature2}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <span>{t.pricingExtra.leaderPlanFeature3}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Identity Checklist Card */}
          <Card className={`border-slate-800 bg-slate-900/10 ${!isProfileComplete ? 'border-amber-500/20' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Identity Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between gap-2 border-b border-slate-850 pb-2 last:border-0">
                <div className="space-y-0.5">
                  <span className="font-semibold block text-slate-200">Email:</span>
                  <span className="text-[10px] text-slate-400">{user?.email || "Missing"}</span>
                </div>
                <Badge variant={user?.email ? "default" : "destructive"} className="text-[9px] px-1.5 py-0 h-4">
                  {user?.email ? "Verified" : "Required"}
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-slate-850 pb-2 last:border-0">
                <div className="space-y-0.5">
                  <span className="font-semibold block text-slate-200">Telegram:</span>
                  <span className="text-[10px] text-slate-400">
                    {profile?.telegram_username ? `@${profile.telegram_username}` : "Not connected"}
                  </span>
                </div>
                {profile?.telegram_username ? (
                  <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4">Connected</Badge>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => navigate('/settings')}
                    className="h-6 text-[9px] border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-bold px-2 py-0"
                  >
                    Connect
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-slate-850 pb-2 last:border-0">
                <div className="space-y-0.5">
                  <span className="font-semibold block text-slate-200">Crypto Wallet:</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {profile?.wallet_address ? `${profile.wallet_address.slice(0, 6)}…${profile.wallet_address.slice(-4)}` : "Not connected"}
                  </span>
                </div>
                {profile?.wallet_address ? (
                  <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4">Connected</Badge>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => navigate('/settings')}
                    className="h-6 text-[9px] border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-bold px-2 py-0"
                  >
                    Connect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Payment Link & Main Payment Intent Flow */}
        <div className="space-y-6 md:col-span-2">
          {/* Purchase Link CTAs */}
          <DaarPurchaseLink />

          {/* Core Crypto Payment Component */}
          <CryptoPaymentIntent />
        </div>
      </div>
    </div>
  );
}
