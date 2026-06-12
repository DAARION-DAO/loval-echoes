import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  MessageSquare, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  UserPlus, 
  Users, 
  Key, 
  Plus, 
  CheckCircle, 
  ShieldAlert, 
  Zap, 
  LogOut,
  Building,
  UserCheck
} from 'lucide-react';

interface AnswersState {
  name: string;
  type: string;
  description: string;
  mission: string;
  goal_30_days: string;
  values_rules: string;
  agent_name: string;
  tone: string;
  autonomy_level: 'assistant' | 'coordinator' | 'supervised_admin';
  can_invite_guests: boolean;
  can_create_tasks: boolean;
  can_send_welcome_messages: boolean;
  can_create_summaries: boolean;
  can_suggest_roles: boolean;
  member_code: string;
  admin_code: string;
  code_max_uses: number;
  initial_notes: string;
  first_task_title: string;
  first_task_desc: string;
}

const defaultAnswers: AnswersState = {
  name: '',
  type: 'workspace',
  description: '',
  mission: '',
  goal_30_days: '',
  values_rules: '',
  agent_name: 'Дух Спільноти',
  tone: 'warm',
  autonomy_level: 'coordinator',
  can_invite_guests: true,
  can_create_tasks: true,
  can_send_welcome_messages: true,
  can_create_summaries: true,
  can_suggest_roles: true,
  member_code: '',
  admin_code: '',
  code_max_uses: 50,
  initial_notes: '',
  first_task_title: 'Ознайомитися з Духом Спільноти',
  first_task_desc: 'Прочитати правила спільноти та провести перше знайомство з Духом Спільноти в чаті.'
};

const agentMessages: Record<number, string> = {
  1: "Вітаю! Я — ваш майбутній Дух Спільноти. Давайте разом створимо наше MicroDAO. Почнемо з ідентичності: як буде називатися наша спільнота, до якого типу вона належить та який її короткий опис?",
  2: "Чудовий початок! Тепер сформуємо місію та першу 30-денну ціль. Це стане ядром моєї пам'яті, щоб я міг допомагати координувати діяльність та тримати фокус.",
  3: "Правила спільноти визначають наші цінності та межі спілкування. Які принципи поведінки та межі ви хочете встановити? У разі суперечок я нагадуватиму про ці правила.",
  4: "Тепер налаштуємо мій характер. Як мене зватимуть (наприклад, 'Дух Спільноти' або інше ім'я)? Який тон спілкування мені обрати — дружній, філософський чи офіційний?",
  5: "Вкажіть рівень моєї автономії та дозволи. Я можу діяти як простий Помічник, Координатор (створення задач, нагадування) або Адмін під вашим наглядом. Чутливі дії завжди вимагатимуть вашого підтвердження.",
  6: "Створимо перші коди доступу. Ви можете згенерувати унікальні коди для адміністраторів або учасників. Наприклад, 'MYSPACE-MEMBER' чи 'MYSPACE-ADMIN'.",
  7: "Давайте додамо перші знання! Введіть початкові правила, замітки або інструкції. Це насіння нашої спільної бази знань, яке я проіндексую першим.",
  8: "Останній крок — заплануємо перші дії. Створимо перше завдання, яке ви побачите на дашборді. Це допоможе відразу перейти до роботи."
};

export default function MicroDAOOnboarding() {
  const { user, signOut } = useAuth();
  const { memberships, refresh, setActiveCommunityId } = useActiveCommunity();
  const navigate = useNavigate();

  // Onboarding modes: 'lobby' | 'wizard'
  const [mode, setMode] = useState<'lobby' | 'wizard'>('lobby');
  const [step, setStep] = useState(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswersState>(defaultAnswers);
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [partnerMessage, setPartnerMessage] = useState('');
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [draftSession, setDraftSession] = useState<any>(null);

  // Load existing draft setup session on mount
  useEffect(() => {
    const checkDraft = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('community_setup_sessions')
          .select('*')
          .eq('leader_id', user.id)
          .eq('status', 'draft')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (error) throw error;
        if (data && data.length > 0) {
          setDraftSession(data[0]);
        }
      } catch (err) {
        console.error('Error fetching draft session:', err);
      }
    };
    checkDraft();
  }, [user]);

  // Handle invitation code validation
  const handleJoinByCode = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Помилка",
        description: "Будь ласка, введіть код запрошення",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('join_community_by_code', {
        p_code: inviteCode.trim().toUpperCase()
      });

      if (error) throw error;

      toast({
        title: "Успішно приєднано!",
        description: "Ви стали учасником MicroDAO спільноти."
      });
      
      const newCommId = data.community_id;
      setActiveCommunityId(newCommId);
      await refresh();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Помилка приєднання",
        description: err.message || "Недійсний код запрошення."
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit Partner application
  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerMessage.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('access_requests')
        .insert({
          user_id: user?.id,
          email: user?.email,
          display_name: user?.user_metadata?.display_name || user?.email,
          use_case: partnerMessage.trim(),
          requested_tier: 'founder',
          status: 'pending'
        });

      if (error) throw error;
      setPartnerSubmitted(true);
      toast({
        title: "Заявку надіслано!",
        description: "Ми розглянемо ваш запит на партнерський доступ найближчим часом."
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Помилка надсилання",
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Restore Draft
  const handleRestoreDraft = () => {
    if (!draftSession) return;
    const restoredAnswers = { ...defaultAnswers, ...draftSession.answers };
    setAnswers(restoredAnswers);
    setSessionId(draftSession.id);
    const savedStep = parseInt(draftSession.current_step) || 1;
    setStep(savedStep);
    setMode('wizard');
    toast({
      title: "Чернетку відновлено",
      description: `Повертаємося до кроку ${savedStep}.`
    });
  };

  // Save Setup Session Draft
  const handleSaveDraft = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('community_setup_sessions')
        .upsert({
          id: sessionId || undefined,
          leader_id: user.id,
          current_step: step.toString(),
          status: 'draft',
          answers: answers,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setSessionId(data.id);
        toast({
          title: "Чернетку збережено",
          description: "Ви зможете продовжити налаштування пізніше."
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Помилка збереження",
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Start fresh setup wizard
  const handleStartSetup = () => {
    setAnswers(defaultAnswers);
    setSessionId(null);
    setStep(1);
    setMode('wizard');
  };

  // Auto-fill codes when name is entered (Step 1 -> Step 6)
  useEffect(() => {
    if (answers.name && !answers.member_code) {
      const prefix = answers.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 6);
      setAnswers(prev => ({
        ...prev,
        member_code: `${prefix}-MEMBER-${Math.floor(100 + Math.random() * 900)}`,
        admin_code: `${prefix}-ADMIN-${Math.floor(100 + Math.random() * 900)}`
      }));
    }
  }, [answers.name]);

  // Final Action: Complete creation transaction
  const handleCreateMicroDAO = async () => {
    if (!user) return;
    if (!answers.name.trim()) {
      toast({
        title: "Помилка",
        description: "Будь ласка, введіть назву спільноти на кроці 1.",
        variant: "destructive"
      });
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      // 1. Call atomic database transaction RPC
      const { data, error: rpcErr } = await supabase.rpc('create_microdao_with_spirit_agent', {
        p_name: answers.name.trim(),
        p_type: answers.type,
        p_description: answers.description.trim() || null,
        p_mission: answers.mission.trim() || null,
        p_goal_30_days: answers.goal_30_days.trim() || null,
        p_values_rules: answers.values_rules.trim() || null,
        p_agent_name: answers.agent_name.trim(),
        p_autonomy_level: answers.autonomy_level,
        p_setup_answers: answers,
        p_setup_session_id: sessionId || null
      });

      if (rpcErr) throw rpcErr;
      const { community_id } = data;

      // 2. Create custom invitation codes if specified
      if (answers.member_code) {
        await supabase.from('invitation_codes').insert({
          scope: 'community',
          community_id: community_id,
          code: answers.member_code.trim().toUpperCase(),
          role_to_grant: 'member',
          max_uses: answers.code_max_uses || null,
          is_active: true,
          created_by: user.id
        });
      }

      if (answers.admin_code) {
        await supabase.from('invitation_codes').insert({
          scope: 'community',
          community_id: community_id,
          code: answers.admin_code.trim().toUpperCase(),
          role_to_grant: 'admin',
          max_uses: answers.code_max_uses || null,
          is_active: true,
          created_by: user.id
        });
      }

      // 3. Create starter task if title is provided and conversations/projects setup is done
      // Note: We'll create a default "general" conversation for the community first if required,
      // but since project tasks require conversations, we can look up or insert a default one.
      const { data: conv, error: convErr } = await supabase
        .from('conversations')
        .insert({
          name: 'Загальний чат',
          type: 'group',
          community_id: community_id,
          created_by: user.id
        })
        .select()
        .single();

      if (!convErr && conv && answers.first_task_title.trim()) {
        await supabase.from('kanban_cards').insert({
          project_id: conv.id,
          title: answers.first_task_title.trim(),
          description: answers.first_task_desc.trim() || null,
          column_type: 'todo',
          created_by: user.id
        });
      }

      toast({
        title: "Спільноту успішно створено!",
        description: `Вітаємо у MicroDAO "${answers.name}" з Духом Спільноти "${answers.agent_name}"!`
      });

      setActiveCommunityId(community_id);
      await refresh();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Error creating microdao:', err);
      toast({
        variant: "destructive",
        title: "Помилка створення",
        description: err.message || "Сталася помилка під час створення MicroDAO."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col items-center justify-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Building className="h-8 w-8 text-indigo-400 animate-pulse" />
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-400">
            DAARION MicroDAO
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 hidden sm:inline">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-slate-300 hover:text-red-400 gap-2">
            <LogOut className="h-4 w-4" />
            <span>Вийти</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-6xl flex-grow flex items-center justify-center">
        {mode === 'lobby' ? (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side info */}
            <div className="lg:col-span-5 space-y-6 text-left pr-0 lg:pr-4 py-4">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                MicroDAO Екосистема
              </span>
              <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
                Живий простір вашої <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  мікро-спільноти
                </span>
              </h2>
              <p className="text-slate-400 leading-relaxed text-sm">
                MicroDAO — це новий підхід до організації команд та спільнот. Тут немає класичного глобального waitlist-контролю. Замість цього кожен простір формується навколо автономного **Духа Спільноти** — штучного інтелекту, що зберігає пам’ять, веде онбординг, призначає ролі та координує спільні дії.
              </p>

              {draftSession && (
                <Card className="bg-indigo-950/20 border-indigo-500/30 backdrop-blur-md">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-300">
                      <Zap className="h-5 w-5 animate-pulse" />
                      <span className="font-semibold text-sm">Знайдено незавершене налаштування</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Ви зупинилися на кроці {draftSession.current_step} для створення спільноти {draftSession.answers?.name || 'без назви'}.
                    </p>
                    <Button onClick={handleRestoreDraft} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Відновити чернетку</span>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {memberships.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Ваші чинні MicroDAO
                  </h3>
                  <div className="space-y-2">
                    {memberships.map((m) => (
                      <div 
                        key={m.community_id}
                        onClick={() => {
                          setActiveCommunityId(m.community_id);
                          navigate('/dashboard');
                        }}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all hover:translate-x-1"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase">
                            {m.community.name.substring(0, 2)}
                          </div>
                          <div>
                            <div className="text-xs font-bold">{m.community.name}</div>
                            <div className="text-[10px] text-slate-400 capitalize">{m.role} • {m.community.type}</div>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right side options */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Card 1: Create Space */}
              <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-lg hover:border-indigo-500/30 transition-all shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-400" />
                    <span>Створити нову спільноту (MicroDAO)</span>
                  </CardTitle>
                  <CardDescription>
                    Станьте лідером і запустіть простір з персональним Духом Спільноти
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Я, як Дух Спільноти, проведу вас через покроковий процес створення: ідентичність спільноти, місія, правила, мій власний характер, рівні автономії та перші запрошення.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleStartSetup} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/20">
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Почати створення з Агентом</span>
                  </Button>
                </CardFooter>
              </Card>

              {/* Card 2: Join by Invite Code */}
              <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-lg hover:border-purple-500/30 transition-all shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Key className="h-5 w-5 text-purple-400" />
                    <span>Приєднатися за кодом запрошення</span>
                  </CardTitle>
                  <CardDescription>
                    Введіть код від лідера, щоб автоматично отримати доступ
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Input 
                      placeholder="Введіть код, напр: ECO-MEMBER-492"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className="bg-slate-950/80 border-slate-800 focus-visible:ring-purple-500 uppercase tracking-widest text-center"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleJoinByCode} 
                    disabled={loading || !inviteCode.trim()}
                    className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200"
                  >
                    {loading ? "Приєднання..." : "Приєднатися до спільноти"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Card 3: Apply for Founder Tier */}
              <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-lg hover:border-pink-500/30 transition-all shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Users className="h-5 w-5 text-pink-400" />
                    <span>Подати заявку на статус Співзасновника</span>
                  </CardTitle>
                  <CardDescription>
                    Запит на розширений партнерський доступ до інструментів платформи
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {partnerSubmitted ? (
                    <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                      <CheckCircle className="h-8 w-8 text-green-400" />
                      <div className="text-xs font-semibold text-green-300">Заявку прийнято на розгляд</div>
                      <p className="text-[10px] text-slate-400 max-w-xs">
                        Дякуємо за інтерес! Ми звʼяжемося з вами за вказаною адресою email після перевірки.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handlePartnerSubmit} className="space-y-3">
                      <Textarea 
                        placeholder="Опишіть вашу мету, команду та чому ви хочете отримати статус партнера..."
                        value={partnerMessage}
                        onChange={(e) => setPartnerMessage(e.target.value)}
                        className="bg-slate-950/80 border-slate-800 text-xs min-h-[80px]"
                        required
                      />
                      <Button 
                        type="submit" 
                        disabled={loading || !partnerMessage.trim()}
                        className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-semibold text-xs"
                      >
                        {loading ? "Надсилання..." : "Подати заявку"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        ) : (
          /* Wizard Setup View */
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left: Community Spirit Agent chat bubbles */}
            <div className="lg:col-span-5 flex flex-col bg-slate-950/40 border border-slate-800/80 rounded-xl overflow-hidden backdrop-blur-md min-h-[400px]">
              
              {/* Agent Profile Header */}
              <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center relative">
                  <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border border-slate-950" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200">
                    {answers.agent_name || "Дух Спільноти"}
                  </h3>
                  <div className="text-[10px] text-indigo-400 font-semibold tracking-wide uppercase">
                    Ваш ШІ-провідник
                  </div>
                </div>
              </div>

              {/* Chat Message Bubble */}
              <div className="p-6 flex-grow flex flex-col justify-end space-y-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl rounded-bl-none p-4 shadow-lg text-left max-w-[90%] self-start space-y-3 relative group">
                  <MessageSquare className="h-4 w-4 text-indigo-400 absolute -top-2 -left-2 bg-slate-950 p-0.5 rounded-full border border-indigo-400/20" />
                  <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
                    {agentMessages[step] || "Давайте продовжувати налаштування."}
                  </p>
                </div>
                
                {/* Micro animation representation */}
                <div className="flex items-center gap-1.5 self-start pl-2 text-[10px] text-indigo-300">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
                  <span>Дух Спільноти слухає...</span>
                </div>
              </div>

              {/* Autonomy Badge */}
              <div className="p-3 bg-slate-900/30 border-t border-slate-800/50 flex justify-between items-center text-[10px] text-slate-400">
                <span>Рівень автономії: <strong className="text-indigo-400 capitalize">{answers.autonomy_level}</strong></span>
                <span>Крок {step} з 8</span>
              </div>
            </div>

            {/* Right: Embedded Form Card */}
            <div className="lg:col-span-7 flex flex-col">
              <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md shadow-2xl flex-grow flex flex-col justify-between">
                
                <CardHeader className="border-b border-slate-800/50 pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-400">
                      {step === 1 && "1. Ідентичність спільноти"}
                      {step === 2 && "2. Місія спільноти"}
                      {step === 3 && "3. Цінності та правила"}
                      {step === 4 && "4. Обличчя Духа Спільноти"}
                      {step === 5 && "5. Автономія та повноваження"}
                      {step === 6 && "6. Перші коди доступу"}
                      {step === 7 && "7. Початкові знання (Сімʼя)"}
                      {step === 8 && "8. Перші кроки (Задачі)"}
                    </CardTitle>
                    <span className="text-xs text-slate-500 font-semibold">
                      {Math.round((step / 8) * 100)}% завершено
                    </span>
                  </div>
                  <Progress value={(step / 8) * 100} className="h-1 bg-slate-950 mt-2" />
                </CardHeader>

                <CardContent className="pt-6 flex-grow space-y-4 text-left">
                  
                  {/* STEP 1: IDENTITY */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="comm-name" className="text-xs font-bold text-slate-300">Назва MicroDAO *</Label>
                        <Input 
                          id="comm-name"
                          placeholder="Введіть назву спільноти..."
                          value={answers.name}
                          onChange={(e) => setAnswers(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 focus-visible:ring-indigo-500"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="comm-type" className="text-xs font-bold text-slate-300">Тип спільноти</Label>
                        <Select 
                          value={answers.type}
                          onValueChange={(val) => setAnswers(prev => ({ ...prev, type: val }))}
                        >
                          <SelectTrigger id="comm-type" className="bg-slate-950/80 border-slate-800">
                            <SelectValue placeholder="Оберіть тип..." />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                            <SelectItem value="workspace">Робочий простір / Команда</SelectItem>
                            <SelectItem value="eco-village">Еко-поселення / Локальна громада</SelectItem>
                            <SelectItem value="dao">DAO / Web3 гільдія</SelectItem>
                            <SelectItem value="club">Закритий Клуб / Товариство</SelectItem>
                            <SelectItem value="charity">Благодійна ініціатива</SelectItem>
                            <SelectItem value="other">Інше</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="comm-desc" className="text-xs font-bold text-slate-300">Короткий опис</Label>
                        <Textarea 
                          id="comm-desc"
                          placeholder="Опишіть, чим займається ваша спільнота та хто її учасники..."
                          value={answers.description}
                          onChange={(e) => setAnswers(prev => ({ ...prev, description: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 text-xs min-h-[100px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: MISSION */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="comm-mission" className="text-xs font-bold text-slate-300">Місія та візія спільноти</Label>
                        <Textarea 
                          id="comm-mission"
                          placeholder="Чому ця спільнота існує? Яку головну проблему вона вирішує?"
                          value={answers.mission}
                          onChange={(e) => setAnswers(prev => ({ ...prev, mission: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 text-xs min-h-[100px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="comm-goal" className="text-xs font-bold text-slate-300">Ціль на перші 30 днів</Label>
                        <Textarea 
                          id="comm-goal"
                          placeholder="Що спільнота має зробити протягом наступного місяця?"
                          value={answers.goal_30_days}
                          onChange={(e) => setAnswers(prev => ({ ...prev, goal_30_days: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 text-xs min-h-[100px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 3: VALUES & RULES */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="comm-values" className="text-xs font-bold text-slate-300">Цінності, правила поведінки та межі</Label>
                        <Textarea 
                          id="comm-values"
                          placeholder="Наприклад: 1. Повага один до одного. 2. Прозорість процесів. 3. Нейтральність при суперечках. Що заборонено робити?"
                          value={answers.values_rules}
                          onChange={(e) => setAnswers(prev => ({ ...prev, values_rules: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 text-xs min-h-[180px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 4: AGENT PERSONALITY */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="agent-name" className="text-xs font-bold text-slate-300">Імʼя Духа Спільноти</Label>
                        <Input 
                          id="agent-name"
                          value={answers.agent_name}
                          onChange={(e) => setAnswers(prev => ({ ...prev, agent_name: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 focus-visible:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="agent-tone" className="text-xs font-bold text-slate-300">Тональність агента</Label>
                        <Select 
                          value={answers.tone}
                          onValueChange={(val) => setAnswers(prev => ({ ...prev, tone: val }))}
                        >
                          <SelectTrigger id="agent-tone" className="bg-slate-950/80 border-slate-800">
                            <SelectValue placeholder="Оберіть тон..." />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                            <SelectItem value="warm">Теплий та дружній (Духовний)</SelectItem>
                            <SelectItem value="philosophical">Філософський та спокійний (Еонарх)</SelectItem>
                            <SelectItem value="technical">Технічний та точний (Яромир)</SelectItem>
                            <SelectItem value="formal">Діловий та стриманий</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: AUTONOMY & PERMISSIONS */}
                  {step === 5 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-300">Рівень автономії агента</Label>
                        <RadioGroup 
                          value={answers.autonomy_level} 
                          onValueChange={(val: any) => setAnswers(prev => ({ ...prev, autonomy_level: val }))}
                          className="grid grid-cols-1 gap-2 pt-1"
                        >
                          <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-900/20 cursor-pointer">
                            <RadioGroupItem value="assistant" id="autonomy-assistant" className="mt-1" />
                            <div className="text-xs">
                              <Label htmlFor="autonomy-assistant" className="font-semibold text-slate-200">Помічник (Assistant)</Label>
                              <p className="text-slate-400 text-[10px] mt-0.5">Лише пропонує ідеї, робить підсумки та створює чернетки повідомлень.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 rounded-lg border border-indigo-500/30 bg-slate-950/40 hover:bg-slate-900/20 cursor-pointer">
                            <RadioGroupItem value="coordinator" id="autonomy-coordinator" className="mt-1" />
                            <div className="text-xs">
                              <Label htmlFor="autonomy-coordinator" className="font-semibold text-indigo-300">Координатор (Coordinator)</Label>
                              <p className="text-slate-400 text-[10px] mt-0.5">Вміє створювати чернетки завдань, готувати регламенти та нагадувати учасникам після підтвердження.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-900/20 cursor-pointer">
                            <RadioGroupItem value="supervised_admin" id="autonomy-admin" className="mt-1" />
                            <div className="text-xs">
                              <Label htmlFor="autonomy-admin" className="font-semibold text-slate-200">Адміністратор (Supervised Admin)</Label>
                              <p className="text-slate-400 text-[10px] mt-0.5">Може автоматично надсилати вітання, ставити задачі, оновлювати базу знань. Чутливі дії узгоджує.</p>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2 pt-2">
                        <Label className="text-xs font-bold text-slate-300">Дозволи для Агента</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="perm-welcome" 
                              checked={answers.can_send_welcome_messages} 
                              onCheckedChange={(checked) => setAnswers(prev => ({ ...prev, can_send_welcome_messages: !!checked }))}
                            />
                            <Label htmlFor="perm-welcome" className="text-xs text-slate-300 font-normal">Надсилати вітання новачкам</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="perm-tasks" 
                              checked={answers.can_create_tasks} 
                              onCheckedChange={(checked) => setAnswers(prev => ({ ...prev, can_create_tasks: !!checked }))}
                            />
                            <Label htmlFor="perm-tasks" className="text-xs text-slate-300 font-normal">Створювати чернетки задач</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="perm-invites" 
                              checked={answers.can_invite_guests} 
                              onCheckedChange={(checked) => setAnswers(prev => ({ ...prev, can_invite_guests: !!checked }))}
                            />
                            <Label htmlFor="perm-invites" className="text-xs text-slate-300 font-normal">Створювати інвайти для гостей</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="perm-summaries" 
                              checked={answers.can_create_summaries} 
                              onCheckedChange={(checked) => setAnswers(prev => ({ ...prev, can_create_summaries: !!checked }))}
                            />
                            <Label htmlFor="perm-summaries" className="text-xs text-slate-300 font-normal">Генерувати підсумки зустрічей</Label>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-2.5 items-start text-[10px] text-amber-300 leading-relaxed">
                        <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Чутливі дії завжди заблоковані</strong>: видалення спільноти, зміна прав доступу, передача власності та модифікація білінгу вимагають прямого підтвердження лідера.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: INVITES */}
                  {step === 6 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-member" className="text-xs font-bold text-slate-300">Код для Учасників (Members)</Label>
                        <Input 
                          id="invite-member"
                          value={answers.member_code}
                          onChange={(e) => setAnswers(prev => ({ ...prev, member_code: e.target.value.toUpperCase() }))}
                          className="bg-slate-950/80 border-slate-800 font-mono text-center tracking-widest focus-visible:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="invite-admin" className="text-xs font-bold text-slate-300">Код для Адміністраторів (Admins)</Label>
                        <Input 
                          id="invite-admin"
                          value={answers.admin_code}
                          onChange={(e) => setAnswers(prev => ({ ...prev, admin_code: e.target.value.toUpperCase() }))}
                          className="bg-slate-950/80 border-slate-800 font-mono text-center tracking-widest focus-visible:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max-uses" className="text-xs font-bold text-slate-300">Максимальна кількість використань коду</Label>
                        <Input 
                          id="max-uses"
                          type="number"
                          value={answers.code_max_uses}
                          onChange={(e) => setAnswers(prev => ({ ...prev, code_max_uses: parseInt(e.target.value) || 1 }))}
                          className="bg-slate-950/80 border-slate-800 focus-visible:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 7: KNOWLEDGE SEED */}
                  {step === 7 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="kb-seed" className="text-xs font-bold text-slate-300">Початкова заправка знаннями (Замітки / Правила)</Label>
                        <Textarea 
                          id="kb-seed"
                          placeholder="Тут ви можете ввести правила спільноти, загальний регламент або перелік корисних посилань. Я проіндексую цю інформацію, щоб миттєво відповідати на запитання..."
                          value={answers.initial_notes}
                          onChange={(e) => setAnswers(prev => ({ ...prev, initial_notes: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 text-xs min-h-[180px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 8: FIRST ACTIONS & REVIEW */}
                  {step === 8 && (
                    <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
                      <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg space-y-2 text-xs text-indigo-200">
                        <span className="font-bold flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-indigo-400" />
                          <span>Сплануємо перше завдання спільноти:</span>
                        </span>
                        <div className="space-y-2 pt-1 text-slate-100">
                          <div>
                            <Label htmlFor="task-title" className="text-[10px] text-slate-400">Назва завдання</Label>
                            <Input 
                              id="task-title"
                              value={answers.first_task_title}
                              onChange={(e) => setAnswers(prev => ({ ...prev, first_task_title: e.target.value }))}
                              className="bg-slate-950/80 border-slate-800 text-xs focus-visible:ring-indigo-500 h-8"
                            />
                          </div>
                          <div>
                            <Label htmlFor="task-desc" className="text-[10px] text-slate-400">Опис завдання</Label>
                            <Textarea 
                              id="task-desc"
                              value={answers.first_task_desc}
                              onChange={(e) => setAnswers(prev => ({ ...prev, first_task_desc: e.target.value }))}
                              className="bg-slate-950/80 border-slate-800 text-xs min-h-[50px]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <h4 className="text-xs font-bold text-slate-300">Огляд конфігурації MicroDAO:</h4>
                        <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950/60 p-3 rounded-lg border border-slate-900 text-slate-400">
                          <div><span className="font-semibold text-slate-200">Назва:</span> {answers.name}</div>
                          <div><span className="font-semibold text-slate-200">Тип:</span> {answers.type}</div>
                          <div><span className="font-semibold text-slate-200">Агент:</span> {answers.agent_name} ({answers.tone})</div>
                          <div><span className="font-semibold text-slate-200">Автономія:</span> {answers.autonomy_level}</div>
                          <div className="col-span-2 truncate"><span className="font-semibold text-slate-200">Код інвайту:</span> {answers.member_code}</div>
                        </div>
                      </div>
                    </div>
                  )}

                </CardContent>

                <CardFooter className="border-t border-slate-800/50 pt-4 flex justify-between items-center gap-4">
                  <div className="flex gap-2">
                    {step > 1 ? (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setStep(prev => prev - 1)}
                        className="text-slate-400 hover:text-slate-200 text-xs"
                      >
                        <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                        <span>Назад</span>
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setMode('lobby')}
                        className="text-slate-400 hover:text-slate-200 text-xs"
                      >
                        <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                        <span>В лобі</span>
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSaveDraft}
                      disabled={loading}
                      className="border-slate-800 text-slate-400 hover:text-slate-200 text-xs gap-1.5"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Чернетка</span>
                    </Button>
                  </div>

                  {step < 8 ? (
                    <Button 
                      onClick={() => {
                        if (step === 1 && !answers.name.trim()) {
                          toast({
                            title: "Назва обовʼязкова",
                            description: "Будь ласка, назвіть ваше MicroDAO",
                            variant: "destructive"
                          });
                          return;
                        }
                        setStep(prev => prev + 1);
                      }} 
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
                    >
                      <span>Далі</span>
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleCreateMicroDAO} 
                      disabled={loading}
                      className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20"
                    >
                      {loading ? "Створення..." : "Запустити MicroDAO"}
                    </Button>
                  )}
                </CardFooter>

              </Card>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
