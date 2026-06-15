import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation, Language } from '@/lib/i18n';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useUserApprovalStatus } from '@/hooks/useUserApprovalStatus';

import {
  Users,
  MessageSquare,
  CheckSquare,
  Files,
  Bot,
  ArrowRight,
  LogIn,
  Sparkles,
  Shield,
  Zap,
  Workflow,
  Cpu,
  Layers,
  Network,
  Globe,
  Palette,
  Building2,
  Rocket,
  Brain,
  HeartHandshake,
  Eye,
  ArrowDown,
  Download,
} from 'lucide-react';

/* ──────────────────────────────────────────────
 * Scroll-reveal hook — adds .visible to elements
 * with .landing-reveal when they enter the viewport.
 * Includes fallback timeout for iframe environments.
 * ────────────────────────────────────────────── */
function useScrollReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const targets = root.querySelectorAll('.landing-reveal');

    // Fallback: if IntersectionObserver doesn't fire (e.g. in iframes),
    // reveal all elements after a short delay
    const fallbackTimer = setTimeout(() => {
      targets.forEach((t) => t.classList.add('visible'));
    }, 1500);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01 }
    );

    targets.forEach((t) => observer.observe(t));

    return () => {
      clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, []);

  return containerRef;
}

export function Start() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { memberships, loading: communityLoading, refresh, setActiveCommunityId } = useActiveCommunity();
  const { accessTier } = useUserApprovalStatus();
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useScrollReveal();
  const { t, language, setLanguage } = useTranslation();
  
  const isOverLimit = (accessTier === 'early_access' && memberships.length >= 1) || 
                      (accessTier === 'community' && memberships.length >= 3);

  const { isInstallable, install } = usePwaInstall();

  // Onboarding form state
  const [commName, setCommName] = useState('');
  const [commType, setCommType] = useState('team');
  const [commDesc, setCommDesc] = useState('');

  useEffect(() => {
    // Prefill from guest draft if available
    if (!user) {
      const draft = localStorage.getItem('zhos-onboarding-draft');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setCommName(parsed.name || '');
          setCommType(parsed.type || 'team');
          setCommDesc(parsed.description || '');
        } catch (e) {
          console.error('Error parsing onboarding draft:', e);
        }
      }
    } else {
      // Prefill onboarding from draft after signup
      const draft = localStorage.getItem('zhos-onboarding-draft');
      if (draft && !commName) {
        try {
          const parsed = JSON.parse(draft);
          setCommName(parsed.name || '');
          setCommType(parsed.type || 'team');
          setCommDesc(parsed.description || '');
        } catch (e) {
          console.error('Error parsing onboarding draft:', e);
        }
      }
    }
  }, [user]);

  // Handle guest submission: Save draft & redirect to signup
  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commName.trim()) {
      toast({
        title: t.error,
        description: t.onboarding.errorSelectCommunityName,
        variant: "destructive"
      });
      return;
    }

    const draft = {
      name: commName,
      type: commType,
      description: commDesc
    };
    
    localStorage.setItem('zhos-onboarding-draft', JSON.stringify(draft));
    toast({
      title: t.onboarding.saveDraftSuccessTitle,
      description: t.onboarding.saveDraftSuccessDesc
    });
    navigate('/auth?signup=true');
  };

  // Handle authenticated onboarding submission
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commName.trim()) {
      toast({
        title: t.error,
        description: t.onboarding.errorSelectCommunityName,
        variant: "destructive"
      });
      return;
    }
    if (isOverLimit) {
      toast({
        title: t.onboarding.errorLimitTitle,
        description: t.onboarding.errorLimitDesc,
        variant: "destructive"
      });
      return;
    }
    if (!user) return;

    setSubmitting(true);
    try {
      const { data: community, error: insErr } = await supabase
        .from('communities')
        .insert({
          name: commName.trim(),
          type: commType,
          description: commDesc.trim() || null,
          owner_id: user.id,
        })
        .select()
        .single();
      if (insErr) throw insErr;

      const { error: memErr } = await supabase
        .from('community_members')
        .insert({
          community_id: community.id,
          user_id: user.id,
          role: 'owner',
          status: 'approved',
        });
      if (memErr) throw memErr;

      localStorage.removeItem('zhos-onboarding-draft');
      localStorage.removeItem('zhos-community');
      setActiveCommunityId(community.id);
      await refresh();

      toast({
        title: t.onboarding.creationSuccessTitle,
        description: t.onboarding.creationSuccessDesc.replace('{name}', commName).replace('{agentName}', 'Community Spirit'),
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Onboarding error:', err);
      toast({
        title: t.onboarding.errorCreationTitle,
        description: err?.message || t.onboarding.errorCreationDesc,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleScrollToForm = () => {
    const el = document.getElementById('start-space');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  /* Note: do NOT early-return a spinner here. The parent PublicStartRoute
   * already gates loading. Returning early before the ref-bearing <div>
   * mounts causes useScrollReveal's effect to run with a null ref, which
   * leaves every .landing-reveal section permanently invisible until the
   * user navigates away and back. */

  /* ═══════════════════════════════════════════════
   * PUBLIC LANDING PAGE — Premium redesign
   * ═══════════════════════════════════════════════ */

  const features = [
    {
      icon: MessageSquare,
      title: t.start.featureChatTitle,
      desc: t.start.featureChatDesc,
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: CheckSquare,
      title: t.start.featureCoordTitle,
      desc: t.start.featureCoordDesc,
      gradient: "from-emerald-500/20 to-teal-500/20",
    },
    {
      icon: Brain,
      title: t.start.featureMemoryTitle,
      desc: t.start.featureMemoryDesc,
      gradient: "from-violet-500/20 to-purple-500/20",
    },
    {
      icon: Bot,
      title: t.start.featureAgentTitle,
      desc: t.start.featureAgentDesc,
      gradient: "from-amber-500/20 to-orange-500/20",
    },
  ];

  const steps = [
    { num: t.start.step1Num, title: t.start.step1Title, desc: t.start.step1Desc },
    { num: t.start.step2Num, title: t.start.step2Title, desc: t.start.step2Desc },
    { num: t.start.step3Num, title: t.start.step3Title, desc: t.start.step3Desc },
    { num: t.start.step4Num, title: t.start.step4Title, desc: t.start.step4Desc },
  ];

  const useCases = [
    { icon: Rocket, title: t.start.typeProjectTitle, desc: t.start.typeProjectDesc },
    { icon: Palette, title: t.start.typeCreativeTitle, desc: t.start.typeCreativeDesc },
    { icon: Globe, title: t.start.typeInfraTitle, desc: t.start.typeInfraDesc },
    { icon: Building2, title: t.start.typeCityTitle, desc: t.start.typeCityDesc },
  ];

  const ecosystem = [
    { name: "DAGI", desc: t.start.dagiDesc },
    { name: "MicroDAO", desc: t.start.microDaoDesc },
    { name: "DAARION.city", desc: t.start.cityDesc },
  ];

  return (
    <div ref={scrollRef} className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/70 backdrop-blur-xl">
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="MicroDAO" className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl object-cover shadow-md landing-glow" />
            <span className="font-bold text-base sm:text-lg tracking-tight">MicroDAO</span>
            <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] px-1.5 py-0 h-5 font-medium">
              beta
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Language Selector */}
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

            {isInstallable && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={install} 
                className="text-xs sm:text-sm font-semibold gap-1.5 h-9 px-2 sm:px-3 border-primary/30 hover:bg-primary/5 text-primary"
              >
                <Download className="h-4 w-4" />
                <span className="hidden xs:inline">{t.landing.installPwa}</span>
                <span className="xs:hidden">PWA</span>
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={() => navigate('/agents')} className="text-xs sm:text-sm font-medium h-9 px-2 sm:px-3">
              {t.agentDirectory.navbarAgents}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/pricing')} className="text-xs sm:text-sm font-medium h-9 px-2 sm:px-3">
              {t.agentDirectory.navbarPricing}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/install')} className="text-xs sm:text-sm font-medium gap-1.5 h-9 px-2 sm:px-3">
              <Download className="h-4 w-4" />
              <span className="hidden xxs:inline">{t.landing.client}</span>
            </Button>
            {user ? (
              <Button size="sm" onClick={() => navigate('/dashboard')} className="text-xs sm:text-sm font-semibold gap-1 sm:gap-1.5 shadow-md hover:shadow-lg transition-shadow px-3 sm:px-4 h-9">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t.nav.goToDashboard}</span>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="text-xs sm:text-sm font-medium gap-1 h-9 px-2">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden xs:inline">{t.landing.login}</span>
                </Button>
                <Button size="sm" onClick={() => navigate('/auth?signup=true')} className="text-xs sm:text-sm font-semibold gap-1 sm:gap-1.5 shadow-md hover:shadow-lg transition-shadow px-3 sm:px-4 h-9">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{t.create}</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative py-12 sm:py-20 md:py-32 overflow-hidden">
        {/* Background Photo for Hero */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src="/hero-bg.jpg" 
            alt="Hero Background" 
            className="w-full h-full object-cover object-center opacity-75 dark:opacity-30 select-none transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,hsl(var(--background))_80%)]" />
        </div>

        {/* Background orbs */}
        <div className="landing-orb absolute top-16 left-[15%] w-72 h-72 bg-primary/8 rounded-full blur-[100px]" />
        <div className="landing-orb absolute bottom-10 right-[10%] w-96 h-96 bg-violet-500/6 rounded-full blur-[120px]" style={{ animationDelay: '2s' }} />
        <div className="landing-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[140px]" style={{ animationDelay: '4s' }} />

        <div className="container max-w-5xl mx-auto px-4 text-center relative z-10 landing-hero-enter">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-3.5 py-1 mb-6 hover:bg-primary/15 transition-all cursor-default">
            <Zap className="h-3 w-3 mr-1" />
            {t.start.heroTagline}
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto landing-gradient-text bg-gradient-to-r from-foreground via-primary to-foreground pb-2">
            {t.landing.heroTitle}
          </h1>

          <p className="text-lg sm:text-xl md:text-3xl font-bold text-foreground/80 tracking-wide mt-2 mb-4 sm:mb-6">
            {t.landing.heroSubtitle}
          </p>

          <p className="text-sm sm:text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-10 px-2 sm:px-0">
            {t.landing.heroDesc}
          </p>

          {/* ── Agent-First Pillars Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8 mb-12 text-left">
            <div className="bg-card/40 backdrop-blur-md border border-amber-500/20 p-5 rounded-2xl space-y-2 relative overflow-hidden group hover:border-amber-500/40 transition-all">
              <div className="absolute top-0 right-0 p-3 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
                <Shield className="h-12 w-12" />
              </div>
              <h3 className="font-bold text-lg text-amber-500 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t.start.featureRuleTitle}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t.start.featureRuleDesc}
              </p>
            </div>

            <div className="bg-card/40 backdrop-blur-md border border-indigo-500/20 p-5 rounded-2xl space-y-2 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
              <div className="absolute top-0 right-0 p-3 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors">
                <Brain className="h-12 w-12" />
              </div>
              <h3 className="font-bold text-lg text-indigo-500 flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {t.start.featureMemoryTitle}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t.start.featureMemoryDesc}
              </p>
            </div>

            <div className="bg-card/40 backdrop-blur-md border border-emerald-500/20 p-5 rounded-2xl space-y-2 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
              <div className="absolute top-0 right-0 p-3 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                <Workflow className="h-12 w-12" />
              </div>
              <h3 className="font-bold text-lg text-emerald-500 flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                {t.start.featureCoordTitle}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t.start.featureCoordDesc}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto sm:max-w-none">
            {user ? (
              <Button
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto h-13 px-10 font-semibold text-base gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary hover:bg-primary/90"
              >
                {t.nav.goToDashboard}
                <ArrowRight className="h-5 w-5" />
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={handleScrollToForm}
                  className="w-full sm:w-auto h-13 px-10 font-semibold text-base gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t.landing.createSpace}
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/auth')}
                  className="w-full sm:w-auto h-13 px-10 font-semibold text-base gap-1.5 border-border/60 hover:bg-muted/30"
                >
                  {t.landing.login}
                </Button>
              </>
            )}
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 flex justify-center animate-bounce">
            <ArrowDown className="h-5 w-5 text-muted-foreground/40" />
          </div>
        </div>
      </section>

      {/* ── What is MicroDAO ── */}
      <section className="py-20 md:py-28 border-t border-border/10">
        <div className="container max-w-4xl mx-auto px-4 space-y-8">
          <div className="text-center space-y-4 landing-reveal">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t.landing.whatIsMicroDAO}</h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {t.landing.whatIsMicroDAODesc}
            </p>
          </div>

          <div className="landing-reveal flex justify-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/15 rounded-2xl px-6 py-4">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-sm sm:text-base font-semibold text-foreground/90">
                {t.start.heroIntro}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-muted/5 to-muted/15 border-t border-border/10">
        <div className="container max-w-6xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3 landing-reveal">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t.landing.featuresTitle}</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              {t.start.spaceCapTitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 landing-stagger">
            {features.map((item, index) => (
              <div
                key={index}
                className={`landing-reveal landing-card-hover group relative bg-card/30 backdrop-blur-sm border border-border/40 p-6 rounded-2xl space-y-4 overflow-hidden`}
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />
                <div className="relative z-10">
                  <div className="p-2.5 bg-primary/10 w-fit rounded-xl group-hover:bg-primary/20 transition-colors">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-bold text-base text-foreground mt-4">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──   Principles ── */}
      <section className="py-20 md:py-28 border-t border-border/10">
        <div className="container max-w-4xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-4 landing-reveal">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t.start.spiritZhosTitle}</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t.start.spiritZhosDesc}
            </p>
          </div>

          <div className="landing-reveal max-w-xl mx-auto">
            <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-2xl p-6 sm:p-8 space-y-5">
              <h4 className="font-bold text-sm text-muted-foreground tracking-widest uppercase">{t.start.spiritPrinciplesTitle}</h4>
              <ul className="space-y-4">
                {[
                  { icon: Eye, text: t.start.principle1 },
                  { icon: HeartHandshake, text: t.start.principle2 },
                  { icon: Shield, text: t.start.principle3 },
                  { icon: Workflow, text: t.start.principle4 },
                  { icon: Users, text: t.start.principle5 },
                ].map((principle, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm group">
                    <div className="p-1.5 rounded-lg bg-primary/8 group-hover:bg-primary/15 transition-colors flex-shrink-0">
                      <principle.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-foreground/90">{principle.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works — Steps ── */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-muted/5 to-muted/15 border-t border-border/10">
        <div className="container max-w-5xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3 landing-reveal">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t.start.howItWorksTitle}</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              {t.start.howItWorksSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 landing-stagger">
            {steps.map((step, index) => (
              <div key={index} className="landing-reveal landing-card-hover relative bg-card/20 backdrop-blur-sm border border-border/30 rounded-2xl p-6 text-center space-y-3">
                <div className="landing-number inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10 text-primary font-extrabold text-lg mx-auto">
                  {step.num}
                </div>
                <h4 className="font-bold text-base text-foreground">{step.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture Layer ── */}
      <section className="py-20 md:py-28 border-t border-border/10">
        <div className="container max-w-5xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3 landing-reveal">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t.start.archTitle}</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              {t.start.archSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 landing-stagger">
            {[
              { icon: Network, title: t.start.archDagiTitle, desc: t.start.archDagiDesc },
              { icon: Layers, title: t.start.archSpaceTitle, desc: t.start.archSpaceDesc },
              { icon: Cpu, title: t.start.archSecondMeTitle, desc: t.start.archSecondMeDesc },
              { icon: Zap, title: t.start.archRuleTitle, desc: t.start.archRuleDesc },
            ].map((item, index) => (
              <div key={index} className="landing-reveal landing-card-hover bg-card/20 backdrop-blur-sm border border-border/30 rounded-2xl p-6 space-y-3">
                <div className="p-2.5 bg-primary/10 w-fit rounded-xl">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-bold text-base text-foreground">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-muted/5 to-muted/15 border-t border-border/10">
        <div className="container max-w-5xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3 landing-reveal">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t.start.spaceTypesTitle}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 landing-stagger">
            {useCases.map((item, index) => (
              <div key={index} className="landing-reveal landing-card-hover bg-card/20 backdrop-blur-sm border border-border/30 rounded-2xl p-6 space-y-3">
                <div className="p-2.5 bg-primary/10 w-fit rounded-xl">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ecosystem Ribbon ── */}
      <section className="py-20 md:py-24 border-t border-border/10">
        <div className="container max-w-4xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-3 landing-reveal">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t.start.ecosystemTitle}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 landing-stagger">
            {ecosystem.map((item, index) => (
              <div key={index} className="landing-reveal landing-card-hover text-center bg-card/20 backdrop-blur-sm border border-border/30 rounded-2xl p-6 space-y-2">
                <h4 className="font-extrabold text-base text-primary tracking-wide">{item.name}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Onboarding Form (CTA) ── */}
      <section className="py-20 md:py-28 bg-gradient-to-t from-primary/5 via-background to-background border-t border-border/10" id="start-space">
        <div className="container max-w-lg mx-auto px-4">
          <div className="landing-reveal">
            <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl shadow-primary/5 rounded-2xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg landing-glow">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl font-bold">{t.onboarding.createCommunity}</CardTitle>
                <CardDescription className="text-xs">
                  {t.onboarding.createCommunityDesc}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 pb-6">
                <Button 
                  onClick={() => navigate(user ? '/onboarding' : '/auth?signup=true')} 
                  className="w-full flex items-center justify-center gap-1.5 font-semibold py-5 text-base shadow-md hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-500 text-white"
                >
                  {t.onboarding.startOnboardingBtn}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-border/30 py-10 bg-card/10 backdrop-blur-sm">
        <div className="container max-w-7xl mx-auto px-4 space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.jpg" alt="MicroDAO" className="h-7 w-7 rounded-lg object-cover shadow-sm" />
            <span className="font-semibold text-sm text-foreground/80">MicroDAO</span>
          </div>
          <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <button onClick={() => navigate('/agents')} className="hover:text-foreground transition-colors">
              AI Agents Directory
            </button>
            <span className="text-border">·</span>
            <button onClick={() => navigate('/pricing')} className="hover:text-foreground transition-colors">
              Pricing Plans
            </button>
            <span className="text-border">·</span>
            <button onClick={() => navigate('/install')} className="hover:text-foreground transition-colors">
              DAARION Edge Client
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
            <span>{t.agentDirectory.footerCopyright}</span>
          </div>
          <div className="text-[10px] text-muted-foreground/60">{t.clientInstall.footerDesc}</div>
        </div>
      </footer>
    </div>
  );
}
