import { useState, useEffect } from 'react';
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
  Network
} from 'lucide-react';

export function Start() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { memberships, loading: communityLoading, refresh, setActiveCommunityId } = useActiveCommunity();
  const [submitting, setSubmitting] = useState(false);

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

  if (communityLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  // Render onboarding screen if user is authenticated but has no community
  if (user && memberships.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-lg border-border/80 bg-card/65 backdrop-blur-md shadow-elegant">
          <CardHeader className="text-center pb-4 border-b">
            <div className="flex flex-col items-center text-center mb-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-2.5 py-0.5 mb-2">
                ЖОС · Жива операційна система
              </Badge>
              <h2 className="text-xl font-bold tracking-tight text-foreground">MicroDAO — Дух Спільноти</h2>
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

  // Render Landing Page for guests
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Landing Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground h-9 w-9 rounded-lg flex items-center justify-center font-bold text-lg">
              M
            </div>
            <span className="font-bold text-lg tracking-tight">MicroDAO</span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="text-sm font-medium">
              <LogIn className="h-4 w-4 mr-1.5" />
              Увійти
            </Button>
            <Button size="sm" onClick={() => navigate('/auth?signup=true')} className="text-sm font-medium">
              Створити спільноту
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background border-b border-border/20">
        <div className="container max-w-5xl mx-auto px-4 text-center space-y-6 relative z-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 mb-2 hover:bg-primary/15 transition-all">
            ЖОС · Жива операційна система
          </Badge>
          
          <div className="space-y-1">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
              MicroDAO
            </h1>
            <p className="text-2xl sm:text-3xl font-semibold text-muted-foreground tracking-wide">
              Дух Спільноти
            </p>
          </div>
          
          <p className="text-lg sm:text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
            Жива операційна система для команд, DAO та спільнот. Обʼєднуйте чати, задачі, знання, зустрічі й агентів в одному просторі для спільної дії.
          </p>

          <p className="text-sm text-muted-foreground italic">
            Не просто чат. Не тільки governance. Це цифровий осередок спільноти.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 max-w-md mx-auto sm:max-w-none">
            <Button size="lg" onClick={handleScrollToForm} className="w-full sm:w-auto h-12 px-8 font-semibold text-base gap-2">
              Створити простір
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="w-full sm:w-auto h-12 px-8 font-semibold text-base gap-1.5">
              Увійти
            </Button>
          </div>
        </div>
        
        {/* Decorative glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      </section>

      {/* What is MicroDAO Section */}
      <section className="py-16 container max-w-5xl mx-auto px-4 space-y-8 border-b border-border/10">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Що таке MicroDAO?</h2>
        </div>
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            MicroDAO — це автономний цифровий простір спільноти, де комунікація, задачі, знання, зустрічі та агенти працюють як єдина система. Кожна спільнота може мати власні правила, памʼять, учасників і агентів.
          </p>
          <p className="text-md sm:text-lg font-semibold text-primary/90 bg-primary/5 p-3 rounded-lg inline-block border border-primary/10">
            ✨ Кожна спільнота — це живий організм. Кожен простір — це канал дії.
          </p>
        </div>
      </section>

      {/* ЖОС / Дух Спільноти Section */}
      <section className="py-16 bg-muted/20 border-b border-border/10">
        <div className="container max-w-4xl mx-auto px-4 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Дух Спільноти / ЖОС</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              ЖОС — це Жива Операційна Система спільноти. Вона допомагає бачити контекст, памʼятати рішення, координувати дії та зберігати дух спільної роботи.
            </p>
          </div>

          <div className="bg-card/40 border border-border/40 rounded-xl p-5 sm:p-6 space-y-4 max-w-xl mx-auto">
            <h4 className="font-bold text-sm text-foreground/80 tracking-wide uppercase border-b pb-2">Принципи роботи ЖОС:</h4>
            <ul className="space-y-3">
              {[
                "Агент нейтральний і враховує контекст",
                "Рішення залишаються за людьми",
                "Памʼять простору прозора для учасників",
                "Координація без примусу",
                "Кожна дія має значення для спільноти"
              ].map((principle, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm">
                  <span className="text-primary mt-0.5">✔</span>
                  <span>{principle}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-16 container max-w-5xl mx-auto px-4 space-y-10 border-b border-border/10">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Як це працює</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Зв'язок агентів та протоколів координації в єдиній екосистемі
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <Card className="border-border/60 bg-card/45 hover:bg-card/75 transition-all">
            <CardHeader className="pb-2">
              <div className="p-2 bg-primary/10 w-fit rounded-lg mb-2">
                <Network className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base font-bold">DAGI Network</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Мережа агентів і протокол звʼязку між людьми, командами та автономними системами.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/45 hover:bg-card/75 transition-all">
            <CardHeader className="pb-2">
              <div className="p-2 bg-primary/10 w-fit rounded-lg mb-2">
                <Layers className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base font-bold">MicroDAO простір</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Канал взаємодії для команди або спільноти з власними чатами, задачами, знаннями й агентами.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/45 hover:bg-card/75 transition-all">
            <CardHeader className="pb-2">
              <div className="p-2 bg-primary/10 w-fit rounded-lg mb-2">
                <Cpu className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base font-bold">Second Me</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Персональний агент учасника, який поступово допомагає діяти в межах простору.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/45 hover:bg-card/75 transition-all">
            <CardHeader className="pb-2">
              <div className="p-2 bg-primary/10 w-fit rounded-lg mb-2">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base font-bold">Правила та економіка</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                У майбутньому простір може мати власні правила, ролі, токени, доступи й DAO-логіку.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Functional Block Section */}
      <section className="py-16 container max-w-5xl mx-auto px-4 space-y-10 border-b border-border/10">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Функціонал MicroDAO</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Базові можливості робочого простору вашої спільноти
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Комунікація",
              desc: "Групові й персональні чати, треди, голосові повідомлення та прозорий контекст.",
              icon: MessageSquare
            },
            {
              title: "Координація",
              desc: "Задачі, проєкти, зустрічі, ролі та спільне управління діями.",
              icon: CheckSquare
            },
            {
              title: "Пам'ять",
              desc: "База знань, файли, рішення, історія та майбутній RAG для агентів.",
              icon: Files
            },
            {
              title: "Інтелект",
              desc: "Агенти спільноти, редактор промптів, Second Me та майбутня агентська мережа.",
              icon: Bot
            }
          ].map((item, index) => (
            <div key={index} className="bg-card/20 border border-border/40 p-4 rounded-xl space-y-3">
              <div className="p-2 bg-primary/10 w-fit rounded-lg">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 container max-w-5xl mx-auto px-4 space-y-10 border-b border-border/10">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Приклади використання</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Проєктний MicroDAO",
              desc: "Команда створює простір для задач, рішень, файлів і координації."
            },
            {
              title: "Креативний MicroDAO",
              desc: "Митці або креатори обʼєднують ідеї, обговорення, знання й події."
            },
            {
              title: "Інфраструктурний MicroDAO",
              desc: "Група операторів підтримує вузол, сервіс або спільну систему."
            },
            {
              title: "Міський MicroDAO",
              desc: "Локальна спільнота координує ініціативи, зустрічі й взаємодію."
            }
          ].map((item, index) => (
            <div key={index} className="bg-card/30 border border-border/40 p-4 rounded-xl space-y-2">
              <h4 className="font-bold text-sm text-foreground/90">{item.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Position in Ecosystem Section */}
      <section className="py-16 bg-muted/10 border-b border-border/10">
        <div className="container max-w-3xl mx-auto px-4 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Позиція в екосистемі DAARION</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {[
              { title: "DAGI", desc: "Мережа агентів і протокол взаємодії." },
              { title: "MicroDAO", desc: "Автономні простори спільнот, команд і DAO." },
              { title: "DAARION.city", desc: "Місто, де MicroDAO можуть обʼєднуватися у більшу екосистему." }
            ].map((item, index) => (
              <div key={index} className="bg-card/40 border border-border/40 p-4 rounded-xl space-y-2">
                <h4 className="font-extrabold text-sm text-primary tracking-wide">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Onboarding form card for guests */}
      <section className="py-16 bg-gradient-to-t from-primary/5 via-background to-background" id="start-space">
        <div className="container max-w-lg mx-auto px-4">
          <Card className="border-border/80 bg-card/65 backdrop-blur-md shadow-elegant">
            <CardHeader className="text-center">
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
                    className="bg-background/60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comm-type" className="text-sm font-medium">Тип простору</Label>
                  <Select value={commType} onValueChange={(val) => setCommType(val)}>
                    <SelectTrigger id="comm-type" className="bg-background/60">
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

                <Button type="submit" className="w-full flex items-center justify-center gap-1.5 font-semibold py-4">
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
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/40 py-8 bg-card/20 text-center text-xs text-muted-foreground">
        <div className="container max-w-7xl mx-auto px-4 space-y-2">
          <div>© {new Date().getFullYear()} MicroDAO. Всі права захищено.</div>
          <div className="text-[10px]">Побудовано для гнучкої координації та живих спільнот.</div>
        </div>
      </footer>
    </div>
  );
}
