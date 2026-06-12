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
  PlusCircle, 
  Sparkles, 
  Shield, 
  Zap, 
  Workflow
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
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Створіть свій перший простір</CardTitle>
            <CardDescription className="text-sm mt-1">
              Налаштуйте робоче середовище для вашої команди в MicroDAO
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleOnboardingSubmit} className="space-y-5">
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
                  className="min-h-[100px] bg-background/60"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 mt-2 py-5 font-semibold text-base">
                {submitting ? 'Створення...' : 'Продовжити'}
                <ArrowRight className="h-5 w-5" />
              </Button>
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
            <span className="font-bold text-xl tracking-tight">MicroDAO</span>
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
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background border-b border-border/20">
        <div className="container max-w-6xl mx-auto px-4 text-center space-y-6 relative z-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 mb-2 hover:bg-primary/15 transition-all">
            🤖 Нове покоління координації спільнот
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
            MicroDAO — агентська операційна система для спільнот
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Створюйте команди, чати, задачі, базу знань і власних агентів для координації спільної роботи.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" onClick={() => navigate('/auth?signup=true')} className="w-full sm:w-auto h-12 px-8 font-semibold text-base gap-2">
              Створити спільноту
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

      {/* Feature Sections */}
      <section className="py-20 container max-w-6xl mx-auto px-4 space-y-16">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">Що таке MicroDAO?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Єдина робоча екосистема, яка об'єднує інструменти управління та штучний інтелект.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <Card className="border-border/60 bg-card/40 hover:bg-card/75 transition-all">
            <CardHeader>
              <div className="p-2.5 bg-primary/10 w-fit rounded-lg mb-3">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Командна комунікація</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Швидкі та зручні чати в реальному часі для вільного обговорення ідей, інтегровані з вашими ШІ-помічниками.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/40 hover:bg-card/75 transition-all">
            <CardHeader>
              <div className="p-2.5 bg-primary/10 w-fit rounded-lg mb-3">
                <CheckSquare className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Задачі та проєкти</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Зручні Канбан-дошки, списки та трекінг завдань для прозорого розподілу обов'язків та моніторингу прогресу.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/40 hover:bg-card/75 transition-all">
            <CardHeader>
              <div className="p-2.5 bg-primary/10 w-fit rounded-lg mb-3">
                <Files className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">База знань</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Спільні документи, вікі-сторінки та файлове сховище з вбудованим розумним пошуком по всім накопиченим знанням.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/40 hover:bg-card/75 transition-all">
            <CardHeader>
              <div className="p-2.5 bg-primary/10 w-fit rounded-lg mb-3">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Агент спільноти</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                ШІ-асистенти, налаштовані під контекст вашої команди, які автоматично допомагають у вирішенні рутинних задач.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/40 hover:bg-card/75 transition-all">
            <CardHeader>
              <div className="p-2.5 bg-primary/10 w-fit rounded-lg mb-3">
                <Workflow className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Координація & Пам'ять</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Прозорий запис подій, рішень та обговорень, який дозволяє ШІ-агенту миттєво адаптуватись під потреби команди.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/40 hover:bg-card/75 transition-all">
            <CardHeader>
              <div className="p-2.5 bg-primary/10 w-fit rounded-lg mb-3">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Безпека та контроль</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Гнучкі налаштування ролей та дозволів, що забезпечують збереження чутливих даних вашого простору.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 bg-muted/20 border-t border-b border-border/20">
        <div className="container max-w-6xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Для кого створений MicroDAO?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Платформа гнучко масштабується під потреби різних типів команд.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { title: 'Команди', desc: 'Спільна робота та координація' },
              { title: 'DAO / спільноти', desc: 'Прозорість та децентралізація' },
              { title: 'Волонтери', desc: 'Швидка реакція та організація' },
              { title: 'Стартапи', desc: 'Гнучке масштабування ідей' },
              { title: 'Дослідники', desc: 'Систематизація накопичених знань' }
            ].map((card, i) => (
              <div key={i} className="bg-card border border-border/60 p-4 rounded-xl text-center space-y-2 hover:shadow-sm transition-shadow">
                <div className="font-bold text-base text-foreground">{card.title}</div>
                <div className="text-xs text-muted-foreground leading-tight">{card.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 container max-w-5xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">Як це працює?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Лише кілька простих кроків для запуску ефективної екосистеми.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6 text-center">
          {[
            { step: '1', title: 'Реєстрація', desc: 'Створіть свій особистий кабінет за кілька секунд' },
            { step: '2', title: 'Створення спільноти', desc: 'Задайте ім\'я та тип робочого простору' },
            { step: '3', title: 'Запрошення', desc: 'Додайте колег та визначте їхні ролі' },
            { step: '4', title: 'Налаштування агента', desc: 'Задайте правила для вашого ШІ-помічника' },
            { step: '5', title: 'Співдія', desc: 'Спілкуйтесь, плануйте та координуйте роботу разом' }
          ].map((item, i) => (
            <div key={i} className="space-y-3 relative group">
              <div className="mx-auto w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md">
                {item.step}
              </div>
              <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
              <p className="text-xs text-muted-foreground px-2 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Onboarding form card for guests */}
      <section className="py-20 bg-gradient-to-t from-primary/5 via-background to-background border-t border-border/20">
        <div className="container max-w-lg mx-auto px-4">
          <Card className="border-border/80 bg-card/65 backdrop-blur-md shadow-elegant">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold">Створіть простір вже зараз</CardTitle>
              <CardDescription>
                Введіть базові деталі вашої майбутньої команди, щоб розпочати
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGuestSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="comm-name">Назва спільноти / команди *</Label>
                  <Input 
                    id="comm-name"
                    value={commName}
                    onChange={(e) => setCommName(e.target.value)}
                    placeholder="Наприклад: Моя Крута Команда"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comm-type">Тип простору</Label>
                  <Select value={commType} onValueChange={(val) => setCommType(val)}>
                    <SelectTrigger id="comm-type">
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
                  <Label htmlFor="comm-desc">Короткий опис</Label>
                  <Textarea 
                    id="comm-desc"
                    value={commDesc}
                    onChange={(e) => setCommDesc(e.target.value)}
                    placeholder="Розкажіть чим займається ваша команда..."
                    className="min-h-[80px]"
                  />
                </div>

                <Button type="submit" className="w-full flex items-center justify-center gap-1.5 font-semibold">
                  Продовжити
                  <ArrowRight className="h-4 w-4" />
                </Button>
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
