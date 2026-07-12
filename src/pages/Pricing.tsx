import { Check, Shield, Zap, Sparkles, ArrowRight, Network, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation, Language } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useBillingPlanConfig } from "@/lib/cryptoBilling";
import { PublicHeader } from "@/components/PublicHeader";
import { Helmet } from "react-helmet-async";

const pricingUiCopy: Record<
  Language,
  {
    invitedMembers: string;
    polygonOnly: string;
    month: string;
    equivalent: string;
    founderProgram: string;
    manualReview: string;
    operators: string;
    manualVerification: string;
    technical: string;
    manualVerificationLower: string;
    popular: string;
  }
> = {
  uk: {
    invitedMembers: "для запрошених учасників",
    polygonOnly: "тільки Polygon",
    month: "міс",
    equivalent: "еквівалент",
    founderProgram: "Founder Program",
    manualReview: "Ручна перевірка",
    operators: "для операторів",
    manualVerification: "Ручне підтвердження",
    technical: "Технічний",
    manualVerificationLower: "ручна перевірка",
    popular: "Популярний",
  },
  en: {
    invitedMembers: "for invited members",
    polygonOnly: "Polygon only",
    month: "mo",
    equivalent: "equivalent",
    founderProgram: "Founder Program",
    manualReview: "Manual Review",
    operators: "for operators",
    manualVerification: "Manual Verification",
    technical: "Technical",
    manualVerificationLower: "manual verification",
    popular: "Popular",
  },
  ru: {
    invitedMembers: "для приглашенных участников",
    polygonOnly: "только Polygon",
    month: "мес",
    equivalent: "эквивалент",
    founderProgram: "Founder Program",
    manualReview: "Ручная проверка",
    operators: "для операторов",
    manualVerification: "Ручное подтверждение",
    technical: "Технический",
    manualVerificationLower: "ручная проверка",
    popular: "Популярный",
  },
  es: {
    invitedMembers: "para miembros invitados",
    polygonOnly: "solo Polygon",
    month: "mes",
    equivalent: "equivalente",
    founderProgram: "Founder Program",
    manualReview: "Revisión manual",
    operators: "para operadores",
    manualVerification: "Verificación manual",
    technical: "Técnico",
    manualVerificationLower: "verificación manual",
    popular: "Popular",
  },
};

export default function Pricing() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const { config, loading } = useBillingPlanConfig();
  const pricingCopy = pricingUiCopy[language] ?? pricingUiCopy.en;

  const tiers = [
    {
      name: t.pricingExtra.participantName,
      badge: t.pricingExtra.free,
      price: t.pricingExtra.free,
      period: pricingCopy.invitedMembers,
      desc: t.pricingExtra.participantDesc,
      features: [
        t.pricingExtra.participantFeature1,
        t.pricingExtra.participantFeature2,
        t.pricingExtra.participantFeature3,
        t.pricingExtra.participantFeature4
      ],
      cta: t.pricingExtra.joinInviteBtn,
      action: () => navigate(user ? "/onboarding" : "/auth?signup=true"),
      variant: "outline" as const,
      gradient: "from-blue-500/10 to-cyan-500/10",
      icon: Users
    },
    {
      name: t.pricingExtra.leaderPlanName,
      badge: loading ? pricingCopy.polygonOnly : `${config.paymentNetwork.charAt(0).toUpperCase() + config.paymentNetwork.slice(1)} only`,
      price: loading ? t.pricingExtra.leaderPlanPrice : `${config.priceDaar} DAAR / ${pricingCopy.month}`,
      period: loading ? t.pricingExtra.leaderPlanPeriod : `$${config.priceUsd} ${pricingCopy.equivalent} | ${config.paymentNetwork} only`,
      desc: t.pricingExtra.leaderPlanDesc,
      features: [
        t.pricingExtra.leaderPlanFeature1,
        t.pricingExtra.leaderPlanFeature2,
        t.pricingExtra.leaderPlanFeature3,
        t.pricingExtra.leaderPlanFeature4,
        t.pricingExtra.leaderPlanFeature5,
        t.pricingExtra.leaderPlanFeature6
      ],
      cta: t.pricingExtra.activateCryptoBtn,
      action: () => navigate(user ? "/billing" : "/auth?signup=true"),
      variant: "default" as const,
      gradient: "from-indigo-500/20 to-purple-500/20",
      featured: true,
      icon: Sparkles,
      secondaryCta: {
        text: t.pricingExtra.buyDaarBtn,
        link: loading ? "https://app.daarion.city/" : config.daarPurchaseUrl
      }
    },
    {
      name: pricingCopy.founderProgram,
      badge: t.pricingExtra.byInvitation,
      price: t.pricingExtra.byInvitation,
      period: t.pricingExtra.supportDevelopment,
      desc: t.pricingExtra.founderDesc,
      features: [
        t.pricingExtra.founderFeature1,
        t.pricingExtra.founderFeature2,
        t.pricingExtra.founderFeature3,
        t.pricingExtra.founderFeature4,
        t.pricingExtra.founderFeature5
      ],
      cta: t.pricingExtra.becomeFounderBtn,
      action: () => navigate(user ? "/waitlist" : "/auth?signup=true"),
      variant: "outline" as const,
      gradient: "from-amber-500/15 to-orange-500/15",
      icon: Zap
    },
    {
      name: t.pricingExtra.partnerName,
      badge: pricingCopy.manualReview,
      price: t.pricingExtra.byInvitation,
      period: pricingCopy.operators,
      desc: t.pricingExtra.partnerDesc,
      features: [
        t.pricingExtra.partnerFeature1,
        t.pricingExtra.partnerFeature2,
        t.pricingExtra.partnerFeature3,
        t.pricingExtra.partnerFeature4
      ],
      cta: t.pricingExtra.partnerCta,
      action: () => navigate(user ? "/waitlist" : "/auth?signup=true"),
      variant: "outline" as const,
      gradient: "from-purple-500/10 to-pink-500/10",
      icon: Shield
    },
    {
      name: t.pricingExtra.sovereignName,
      badge: t.pricingExtra.autonomous,
      price: t.pricingExtra.autonomous,
      period: t.pricingExtra.forDaoNetworks,
      desc: t.pricingExtra.sovereignDescNew,
      features: [
        t.pricingExtra.sovereignFeatureNew1,
        t.pricingExtra.sovereignFeatureNew2,
        t.pricingExtra.sovereignFeatureNew3,
        t.pricingExtra.sovereignFeatureNew4
      ],
      cta: t.pricingExtra.sovereignCta,
      action: () => navigate("/install"),
      variant: "outline" as const,
      gradient: "from-emerald-500/10 to-teal-500/10",
      icon: Network
    },
    {
      name: t.pricingExtra.workerNodeName,
      badge: pricingCopy.manualVerification,
      price: pricingCopy.technical,
      period: pricingCopy.manualVerificationLower,
      desc: t.pricingExtra.workerNodeDesc,
      features: [
        t.pricingExtra.workerNodeFeature1,
        t.pricingExtra.workerNodeFeature2,
        t.pricingExtra.workerNodeFeature3,
        t.pricingExtra.workerNodeFeature4
      ],
      cta: t.pricingExtra.workerNodeCta,
      action: () => navigate(user ? "/waitlist" : "/auth?signup=true"),
      variant: "outline" as const,
      gradient: "from-slate-500/10 to-slate-700/10",
      icon: Shield
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      <Helmet>
        <title>Pricing — MicroDAO plans for communities and DAOs</title>
        <meta name="description" content="MicroDAO pricing: Participant, Leader, Founder and Sovereign plans for communities, teams and DAOs. Transparent tiers, Polygon payments, manual verification options." />
        <link rel="canonical" href="https://1.daarion.city/pricing" />
        <meta property="og:title" content="Pricing — MicroDAO plans for communities and DAOs" />
        <meta property="og:description" content="Participant, Leader, Founder and Sovereign plans for MicroDAO — the Living Operating System for teams and DAOs." />
        <meta property="og:url" content="https://1.daarion.city/pricing" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "MicroDAO",
          description: "Living Operating System for teams, communities and DAOs.",
          brand: { "@type": "Brand", name: "MicroDAO" },
          offers: [
            { "@type": "Offer", name: "Participant", priceCurrency: "USD", price: "0", url: "https://1.daarion.city/pricing" },
            { "@type": "Offer", name: "Leader", priceCurrency: "USD", price: "0", url: "https://1.daarion.city/pricing" },
            { "@type": "Offer", name: "Founder", priceCurrency: "USD", price: "0", url: "https://1.daarion.city/pricing" }
          ]
        })}</script>
      </Helmet>
      <PublicHeader
        active="pricing"
        backToHome
        primaryLabel={user ? t.nav.goToDashboard : t.pricingExtra.startBtn}
        primaryIcon={<Sparkles className="h-3.5 w-3.5" />}
        onPrimaryClick={() => navigate(user ? "/dashboard" : "/auth?signup=true")}
      />

      <main>
      {/* ── Pricing Hero ── */}
      <section className="relative py-16 sm:py-24 text-center overflow-hidden border-b border-border/10">
        <div className="landing-orb absolute top-10 left-[20%] w-72 h-72 bg-primary/5 rounded-full blur-[100px]" />
        <div className="landing-orb absolute bottom-5 right-[20%] w-80 h-80 bg-violet-500/5 rounded-full blur-[120px]" />
        
        <div className="container max-w-4xl mx-auto px-4 relative z-10 space-y-6">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1">
            {t.pricingExtra.title}
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            {t.pricingExtra.subtitle}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t.pricingExtra.desc}
          </p>
        </div>
      </section>

      {/* ── Pricing Matrix ── */}
      <section className="py-20 bg-gradient-to-b from-muted/5 to-muted/15 flex-grow">
        <div className="container max-w-7xl mx-auto px-4 space-y-12">
          
          {/* Explanatory distinction block */}
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5 max-w-4xl mx-auto space-y-2 text-center shadow-[0_0_20px_-5px_rgba(99,102,241,0.15)]">
            <h2 className="font-bold text-sm text-indigo-400 flex items-center justify-center gap-2">
              <Shield className="h-4 w-4 text-indigo-450" />
              {t.pricingExtra.distinctionTitle}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {t.pricingExtra.distinctionDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {tiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative flex flex-col overflow-hidden bg-card/40 backdrop-blur-sm border ${
                  tier.featured ? 'border-indigo-500/55 shadow-[0_0_25px_-5px_rgba(99,102,241,0.25)] scale-[1.02] lg:-translate-y-2' : 'border-border/40'
                } rounded-2xl transition-all duration-300`}
              >
                {/* Gradient background on card */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} opacity-[0.03] pointer-events-none`} />
                
                {tier.featured && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-bl-xl shadow-sm">
                    {pricingCopy.popular}
                  </div>
                )}

                <CardHeader className="p-5 pb-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <Badge variant={tier.featured ? "default" : "secondary"} className="w-fit text-[9px] px-2 py-0.5">
                      {tier.badge}
                    </Badge>
                    <tier.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl font-bold mt-3">{tier.name}</CardTitle>
                  <CardDescription className="text-xs mt-1 min-h-[48px] leading-relaxed">
                    {tier.desc}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 pt-0 flex-grow relative z-10 space-y-5">
                  <div className="border-t border-b border-border/10 py-3 flex flex-col justify-center">
                    <span className="text-2xl font-extrabold tracking-tight text-foreground">{tier.price}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{tier.period}</span>
                  </div>

                  <ul className="space-y-2.5">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground/90">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-5 pt-0 mt-auto relative z-10 flex flex-col gap-2">
                  <Button 
                    variant={tier.variant}
                    onClick={tier.action}
                    className={`w-full h-10 text-xs font-semibold transition-all ${
                      tier.featured 
                        ? 'bg-indigo-600 hover:bg-indigo-550 text-indigo-100 shadow-md hover:shadow-lg border border-indigo-500/30' 
                        : 'border-border/60 hover:bg-muted/30'
                    }`}
                  >
                    {tier.cta}
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>

                  {tier.secondaryCta && (
                    <Button 
                      variant="outline"
                      asChild
                      className="w-full h-10 text-xs font-semibold border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-300 gap-1.5"
                    >
                      <a href={tier.secondaryCta.link} target="_blank" rel="noopener noreferrer">
                        {tier.secondaryCta.text}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/30 py-10 bg-card/10 backdrop-blur-sm">
        <div className="container max-w-7xl mx-auto px-4 space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.jpg" alt="MicroDAO platform logo" className="h-7 w-7 rounded-lg object-cover shadow-sm" />
            <span className="font-semibold text-sm text-foreground/80">MicroDAO</span>
          </div>
          <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <button onClick={() => navigate("/agents")} className="hover:text-foreground transition-colors">
              {t.agentDirectory.pageTitle}
            </button>
            <span className="text-border">·</span>
            <button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors text-foreground">
              {t.pricingExtra.title}
            </button>
            <span className="text-border">·</span>
            <button onClick={() => navigate("/install")} className="hover:text-foreground transition-colors">
              {t.clientInstall.installTitle}
            </button>
            <span className="text-border">·</span>
            <a href="https://github.com/DAARION-DAO/loval-echoes" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              GitHub (MicroDAO Open Source)
            </a>
          </div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 flex-wrap">
            <span>© {new Date().getFullYear()}</span>
            <a href="https://daarion.city/" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 text-foreground/80 font-medium transition-all">
              <img src="/daarion-logo.jpg" alt="DAARION.city" className="h-4 w-4 rounded-sm object-cover" />
              <span>DAARION.city</span>
            </a>
            <span>{t.clientInstall.footerCopyright}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
