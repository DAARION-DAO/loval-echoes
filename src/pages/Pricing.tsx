import { Check, Shield, Zap, Sparkles, Download, LogIn, ArrowRight, Network, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation, Language } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePwaInstall } from "@/hooks/usePwaInstall";

export default function Pricing() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation();
  const { isInstallable, install } = usePwaInstall();

  const tiers = [
    {
      name: "Early Access",
      badge: t.pricingExtra.testing,
      price: t.pricingExtra.free,
      period: t.pricingExtra.forFirstCommunities,
      desc: t.pricingExtra.earlyAccessDesc,
      features: [
        t.pricingExtra.earlyAccessFeature1,
        t.pricingExtra.earlyAccessFeature2,
        t.pricingExtra.earlyAccessFeature3,
        t.pricingExtra.earlyAccessFeature4,
        t.pricingExtra.earlyAccessFeature5
      ],
      cta: t.pricingExtra.applyBtn,
      action: () => navigate("/auth?signup=true"),
      variant: "outline" as const,
      gradient: "from-blue-500/10 to-cyan-500/10",
      icon: Sparkles
    },
    {
      name: "Community",
      badge: t.pricingExtra.scaling,
      price: t.pricingExtra.pendingLaunch,
      period: t.pricingExtra.forSmallTeams,
      desc: t.pricingExtra.communityDesc,
      features: [
        t.pricingExtra.communityFeature1,
        t.pricingExtra.communityFeature2,
        t.pricingExtra.communityFeature3,
        t.pricingExtra.communityFeature4,
        t.pricingExtra.communityFeature5
      ],
      cta: t.pricingExtra.requestAccessBtn,
      action: () => navigate("/auth?signup=true"),
      variant: "outline" as const,
      gradient: "from-indigo-500/10 to-purple-500/10",
      icon: Users
    },
    {
      name: "Founder Program",
      badge: t.pricingExtra.recommended,
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
      action: () => navigate("/auth?signup=true"),
      variant: "default" as const,
      gradient: "from-amber-500/20 to-orange-500/20",
      featured: true,
      icon: Zap
    },
    {
      name: "Network / Sovereign",
      badge: t.pricingExtra.selfHosted,
      price: t.pricingExtra.autonomous,
      period: t.pricingExtra.forDaoNetworks,
      desc: t.pricingExtra.sovereignDesc,
      features: [
        t.pricingExtra.sovereignFeature1,
        t.pricingExtra.sovereignFeature2,
        t.pricingExtra.sovereignFeature3,
        t.pricingExtra.sovereignFeature4,
        t.pricingExtra.sovereignFeature5
      ],
      cta: t.pricingExtra.requestAccessBtn,
      action: () => navigate("/install"),
      variant: "outline" as const,
      gradient: "from-emerald-500/10 to-teal-500/10",
      icon: Network
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/70 backdrop-blur-xl">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <img src="/logo.jpg" alt="MicroDAO" className="h-9 w-9 rounded-xl object-cover shadow-md" />
            <span className="font-bold text-lg tracking-tight">MicroDAO</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-medium">
              beta
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/agents")} className="text-xs sm:text-sm font-medium h-9 px-2 sm:px-3">
              {t.nav.agents}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/pricing")} className="text-xs sm:text-sm font-semibold h-9 px-2 sm:px-3 text-primary">
              {t.pricingExtra.title}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/install")} className="text-xs sm:text-sm font-medium gap-1.5 h-9 px-2 sm:px-3">
              <Download className="h-4 w-4" />
              <span className="hidden xxs:inline">{t.landing.client}</span>
            </Button>
            
            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <SelectTrigger className="h-9 w-[70px] sm:w-[90px] bg-background/50 border-border/30 px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uk">UA</SelectItem>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="ru">RU</SelectItem>
                <SelectItem value="es">ES</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="text-xs sm:text-sm font-medium gap-1 h-9 px-2">
              <LogIn className="h-4 w-4" />
              <span className="hidden xs:inline">{t.landing.login}</span>
            </Button>
            <Button size="sm" onClick={() => navigate("/auth?signup=true")} className="text-xs sm:text-sm font-semibold gap-1 sm:gap-1.5 shadow-md hover:shadow-lg transition-shadow px-3 sm:px-4 h-9">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t.pricingExtra.startBtn}</span>
            </Button>
          </div>
        </div>
      </header>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {tiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative flex flex-col overflow-hidden bg-card/40 backdrop-blur-sm border ${
                  tier.featured ? 'border-amber-500/50 shadow-elegant-amber scale-[1.02] lg:-translate-y-2' : 'border-border/40'
                } rounded-2xl transition-all duration-300`}
              >
                {/* Gradient background on card */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} opacity-[0.03] pointer-events-none`} />
                
                {tier.featured && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-black text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-bl-xl shadow-sm">
                    Founder
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

                <CardFooter className="p-5 pt-0 mt-auto relative z-10">
                  <Button 
                    variant={tier.variant}
                    onClick={tier.action}
                    className={`w-full h-10 text-xs font-semibold transition-all ${
                      tier.featured 
                        ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-md hover:shadow-lg' 
                        : 'border-border/60 hover:bg-muted/30'
                    }`}
                  >
                    {tier.cta}
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/30 py-10 bg-card/10 backdrop-blur-sm">
        <div className="container max-w-7xl mx-auto px-4 space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.jpg" alt="MicroDAO" className="h-7 w-7 rounded-lg object-cover shadow-sm" />
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
