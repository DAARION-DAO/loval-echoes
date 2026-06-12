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
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
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
} from 'lucide-react';

/* ──────────────────────────────────────────────
 * Scroll-reveal hook — adds .visible to elements
 * with .landing-reveal when they enter the viewport
 * ────────────────────────────────────────────── */
function useScrollReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const targets = root.querySelectorAll('.landing-reveal');
    targets.forEach((t) => observer.observe(t));

    return () => observer.disconnect();
  }, []);

  return containerRef;
}

export function Start() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { memberships, loading: communityLoading, refresh, setActiveCommunityId } = useActiveCommunity();
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useScrollReveal();

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
        title: "Помилка",
        description: "Будь ласка, введіть назву спільноти",
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
      description: "Дані збережено. Будь ласка, зареєструйтесь для створення спільноти"
    });
    navigate('/auth?signup=true');
  };

  // Handle authenticated onboarding submission
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commName.trim()) {
      toast({
        title: "Помилка",
        description: "Будь ласка, введіть назву спільноти",
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
        title: "Спільноту створено!",
        description: `Вітаємо у вашому новому просторі "${commName}"`,
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Onboarding error:', err);
      toast({
        title: 'Помилка створення спільноти',
        description: err?.message || 'Спробуйте ще раз',
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

  /* ─── Loading state ─── */
  if (communityLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  /* ─── Onboarding for auth users without community ─── */
  if (user && memberships.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-lg border-border/80 bg-card/65 backdrop-blur-md shadow-elegant">
          <CardHeader className="text-center pb-4 border-b">
            <div className="flex flex-col items-center text-center mb-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-2.5 py-0.5 mb-2">
                ЖОС · Жива операційна система
              </Badge>
              <h2 className="text-xl font-bold tracking-tight text-foreground">MicroDAO / Дух Спільноти</h2>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
                Жива операційна система для команд, DAO та спільнот. Обʼєднуйте чати, задачі, знання, зустрічі й агентів в одному просторі.
              </p>
            </div>
            <CardTitle className="text-lg font-bold text-foreground mt-4" id="start-space">Створіть свій перший простір</CardTitle>
            <CardDescription className="text-xs">
              Налаштуйте робоче середовище для вашої команди або спільноти в MicroDAO
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleOnboardingSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="onboarding-comm-name" className="text-sm font-medium">Назва спільноти / команди *</Label>
                <Input 
                  id="onboarding-comm-name" 
                  value={commName}
                  onChange={(e) => setCommName(e.target.value)}
                  placeholder="Введіть назву..."
                  required
                  className="bg-background/60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="onboarding-comm-type" className="text-sm font-medium">Тип простору</Label>
                <Select value={commType} onValueChange={(val) => setCommType(val)}>
                  <SelectTrigger id="onboarding-comm-type" className="bg-background/60">
                    <SelectValue placeholder="Оберіть тип..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team">Команда</SelectItem>
                    <SelectItem value="dao">DAO / Децентралізована спільнота</SelectItem>
                    <SelectItem value="community">Громадська спільнота</SelectItem>
                    <SelectItem value="project">Тимчасовий проект</SelectItem>
                    <SelectItem value="other">Інше</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="onboarding-comm-desc" className="text-sm font-medium">Короткий опис</Label>
                <Textarea 
                  id="onboarding-comm-desc"
                  value={commDesc}
                  onChange={(e) => setCommDesc(e.target.value)}
                  placeholder="Опишіть цілі або сферу діяльності вашої спільноти..."
                  className="min-h-[90px] bg-background/60"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 mt-2 py-4 font-semibold text-base">
                {submitting ? 'Створення...' : 'Продовжити'}
                <ArrowRight className="h-5 w-5" />
              </Button>
              <p className="text-[11px] text-muted-foreground text-center pt-2 leading-relaxed">
                Після створення простору ви зможете додати учасників, налаштувати агента, створити чати, задачі, проєкти та базу знань.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════
   * PUBLIC LANDING PAGE — Premium redesign
   * ═══════════════════════════════════════════════ */

  const features = [
    {
      icon: MessageSquare,
      title: "Комунікація",
      desc: "Групові й персональні чати, треди, голосові повідомлення та прозорий контекст.",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: CheckSquare,
      title: "Координація",
      desc: "Задачі, проєкти, зустрічі, ролі та спільне управління діями.",
      gradient: "from-emerald-500/20 to-teal-500/20",
    },
    {
      icon: Brain,
      title: "Пам'ять",
      desc: "База знань, файли, рішення, історія та RAG для контексту агентів.",
      gradient: "from-violet-500/20 to-purple-500/20",
    },
    {
      icon: Bot,
      title: "Інтелект",
      desc: "Агенти спільноти, редактор промптів, Second Me та агентська мережа.",
      gradient: "from-amber-500/20 to-orange-500/20",
    },
  ];

  const steps = [
    { num: "01", title: "Створіть простір", desc: "Дайте назву вашій команді, DAO або спільноті." },
    { num: "02", title: "Запросіть учасників", desc: "Додайте колег, друзів або відкрийте доступ." },
    { num: "03", title: "Налаштуйте агента", desc: "Задайте інструкції, памʼять та поведінку AI-агента." },
    { num: "04", title: "Дійте разом", desc: "Чати, задачі, знання, зустрічі — все в єдиному потоці." },
  ];

  const useCases = [
    { icon: Rocket, title: "Проєктний MicroDAO", desc: "Команда створює простір для задач, рішень, файлів і координації." },
    { icon: Palette, title: "Креативний MicroDAO", desc: "Митці або креатори обʼєднують ідеї, обговорення, знання й події." },
    { icon: Globe, title: "Інфраструктурний MicroDAO", desc: "Група операторів підтримує вузол, сервіс або спільну систему." },
    { icon: Building2, title: "Міський MicroDAO", desc: "Локальна спільнота координує ініціативи, зустрічі й взаємодію." },
  ];

  const ecosystem = [
    { name: "DAGI", desc: "Мережа агентів і протокол взаємодії." },
    { name: "MicroDAO", desc: "Автономні простори спільнот, команд і DAO." },
    { name: "DAARION.city", desc: "Місто, де MicroDAO обʼєднуються у екосистему." },
  ];

  return (
    <div ref={scrollRef} className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/70 backdrop-blur-xl">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground h-9 w-9 rounded-xl flex items-center justify-center font-extrabold text-lg shadow-md landing-glow">
              M
            </div>
            <span className="font-bold text-lg tracking-tight">MicroDAO</span>
            <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] px-1.5 py-0 h-5 font-medium">
              beta
            </Badge>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="text-sm font-medium gap-1.5">
              <LogIn className="h-4 w-4" />
              <span className="hidden xs:inline">Увійти</span>
            </Button>
            <Button size="sm" onClick={() => navigate('/auth?signup=true')} className="text-sm font-semibold gap-1.5 shadow-md hover:shadow-lg transition-shadow">
              <Sparkles className="h-3.5 w-3.5" />
              Створити спільноту
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background orbs */}
        <div className="landing-orb absolute top-16 left-[15%] w-72 h-72 bg-primary/8 rounded-full blur-[100px]" />
        <div className="landing-orb absolute bottom-10 right-[10%] w-96 h-96 bg-violet-500/6 rounded-full blur-[120px]" style={{ animationDelay: '2s' }} />
        <div className="landing-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[140px]" style={{ animationDelay: '4s' }} />

        <div className="container max-w-5xl mx-auto px-4 text-center relative z-10 landing-hero-enter">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-3.5 py-1 mb-6 hover:bg-primary/15 transition-all cursor-default">
            <Zap className="h-3 w-3 mr-1" />
            ЖОС · Жива операційна система
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto landing-gradient-text bg-gradient-to-r from-foreground via-primary to-foreground pb-2">
            MicroDAO
          </h1>

          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground/80 tracking-wide mt-2 mb-6">
            Дух Спільноти
          </p>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Жива операційна система для команд, DAO та спільнот.
            <br className="hidden sm:block" />
            Чати, задачі, знання, зустрічі й агенти — в одному просторі для спільної дії.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto sm:max-w-none">
            <Button
              size="lg"
              onClick={handleScrollToForm}
              className="w-full sm:w-auto h-13 px-10 font-semibold text-base gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Створити простір
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto h-13 px-10 font-semibold text-base gap-1.5 border-border/60 hover:bg-muted/30"
            >
              Увійти
            </Button>
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
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Що таке MicroDAO?</h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              MicroDAO — це автономний цифровий простір спільноти, де комунікація, задачі, знання, зустрічі та агенти працюють як єдина система. Кожна спільнота може мати власні правила, памʼять, учасників і агентів.
            </p>
          </div>

          <div className="landing-reveal flex justify-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/15 rounded-2xl px-6 py-4">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-sm sm:text-base font-semibold text-foreground/90">
                Кожна спільнота — це живий організм. Кожен простір — це канал дії.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-muted/5 to-muted/15 border-t border-border/10">
        <div className="container max-w-6xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3 landing-reveal">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Функціонал MicroDAO</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              Базові можливості робочого простору вашої спільноти
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

      {/* ── ЖОС Principles ── */}
      <section className="py-20 md:py-28 border-t border-border/10">
        <div className="container max-w-4xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-4 landing-reveal">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Дух Спільноти / ЖОС</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              ЖОС — це Жива Операційна Система спільноти. Вона допомагає бачити контекст, памʼятати рішення, координувати дії та зберігати дух спільної роботи.
            </p>
          </div>

          <div className="landing-reveal max-w-xl mx-auto">
            <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-2xl p-6 sm:p-8 space-y-5">
              <h4 className="font-bold text-sm text-muted-foreground tracking-widest uppercase">Принципи роботи</h4>
              <ul className="space-y-4">
                {[
                  { icon: Eye, text: "Агент нейтральний і враховує контекст" },
                  { icon: HeartHandshake, text: "Рішення залишаються за людьми" },
                  { icon: Shield, text: "Памʼять простору прозора для учасників" },
                  { icon: Workflow, text: "Координація без примусу" },
                  { icon: Users, text: "Кожна дія має значення для спільноти" },
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
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Як це працює</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              Від ідеї до спільної дії — за чотири кроки
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
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Архітектура</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              Звʼязок агентів та протоколів координації в єдиній екосистемі
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 landing-stagger">
            {[
              { icon: Network, title: "DAGI Network", desc: "Мережа агентів і протокол звʼязку між людьми, командами та автономними системами." },
              { icon: Layers, title: "MicroDAO простір", desc: "Канал взаємодії для команди або спільноти з власними чатами, задачами й агентами." },
              { icon: Cpu, title: "Second Me", desc: "Персональний агент учасника, який поступово допомагає діяти в межах простору." },
              { icon: Zap, title: "Правила та економіка", desc: "У майбутньому простір може мати власні правила, ролі, токени й DAO-логіку." },
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
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Приклади використання</h2>
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
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Позиція в екосистемі DAARION</h2>
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
                <CardTitle className="text-xl font-bold">Створіть свій перший простір</CardTitle>
                <CardDescription className="text-xs">
                  Налаштуйте робоче середовище для вашої команди або спільноти в MicroDAO.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGuestSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="comm-name" className="text-sm font-medium">Назва спільноти / команди *</Label>
                    <Input 
                      id="comm-name"
                      value={commName}
                      onChange={(e) => setCommName(e.target.value)}
                      placeholder="Наприклад: Моя Крута Команда"
                      required
                      className="bg-background/60 h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comm-type" className="text-sm font-medium">Тип простору</Label>
                    <Select value={commType} onValueChange={(val) => setCommType(val)}>
                      <SelectTrigger id="comm-type" className="bg-background/60 h-11">
                        <SelectValue placeholder="Оберіть тип..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="team">Команда</SelectItem>
                        <SelectItem value="dao">DAO / Децентралізована спільнота</SelectItem>
                        <SelectItem value="community">Громадська спільнота</SelectItem>
                        <SelectItem value="project">Проектна група</SelectItem>
                        <SelectItem value="other">Інше</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comm-desc" className="text-sm font-medium">Короткий опис</Label>
                    <Textarea 
                      id="comm-desc"
                      value={commDesc}
                      onChange={(e) => setCommDesc(e.target.value)}
                      placeholder="Розкажіть чим займається ваша команда..."
                      className="min-h-[90px] bg-background/60"
                    />
                  </div>

                  <Button type="submit" className="w-full flex items-center justify-center gap-1.5 font-semibold py-5 text-base shadow-md hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]">
                    Продовжити
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  
                  <p className="text-[11px] text-muted-foreground text-center pt-2 leading-relaxed">
                    Після створення простору ви зможете додати учасників, налаштувати агента, створити чати, задачі, проєкти та базу знань.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-border/30 py-10 bg-card/10 backdrop-blur-sm">
        <div className="container max-w-7xl mx-auto px-4 space-y-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground h-7 w-7 rounded-lg flex items-center justify-center font-bold text-sm">
              M
            </div>
            <span className="font-semibold text-sm text-foreground/80">MicroDAO</span>
          </div>
          <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} DAARION.city — Всі права захищено.</div>
          <div className="text-[10px] text-muted-foreground/60">Побудовано для гнучкої координації та живих спільнот.</div>
        </div>
      </footer>
    </div>
  );
}
