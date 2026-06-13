import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
  UserCheck,
  Gem,
  Building2,
  Shield,
  Server
} from 'lucide-react';
import { type AdvancedAccessProgram, ADVANCED_ACCESS_PROGRAMS } from '@/lib/subscriptionTypes';

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
  // New fields for Sprint C onboarding flow
  desired_result: string;
  boundaries: string;
  language: 'uk' | 'en' | 'ru' | 'es';
  communication_style: string;
  enabled_modules: string[];
  invite_emails: string;
  suggested_roles: string;
}

const defaultAnswers: AnswersState = {
  name: '',
  type: 'workspace',
  description: '',
  mission: '',
  goal_30_days: '',
  values_rules: '',
  agent_name: '',
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
  first_task_title: '',
  first_task_desc: '',
  desired_result: '',
  boundaries: '',
  language: 'uk',
  communication_style: 'friendly',
  enabled_modules: ['memory', 'tasks', 'steward'],
  invite_emails: '',
  suggested_roles: 'Coordinator, Moderator'
};

const wizardLocals = {
  uk: {
    step1: "Ідентичність Спільноти",
    step2: "Місія Спільноти",
    step3: "Правила та Цінності",
    step4: "Особистість Духа Спільноти",
    step5: "Рівень Автономії",
    step6: "Стартові Модулі",
    step7: "Перші Запрошення",
    step8: "Огляд та Створення",
    desiredResultLabel: "Бажаний результат спільноти",
    desiredResultPlaceholder: "Опишіть очікуваний результат вашої діяльності...",
    boundariesLabel: "Межі поведінки спільноти",
    boundariesPlaceholder: "Наприклад: жодного спаму, повага до приватности, табу на рекламу...",
    agentLanguageLabel: "Основна мова спілкування агента",
    agentCommStyleLabel: "Стиль спілкування агента",
    agentCommStylePlaceholder: "Наприклад: дружній, але стриманий, професійний, творчий...",
    modulesTitle: "Виберіть модулі для підключення",
    modulesDesc: "Ви можете підключити або налаштувати їх пізніше у будь-який час.",
    moduleNames: {
      memory: "Памʼять спільноти / RAG",
      tasks: "Органайзер задач",
      steward: "Стюард / Модерація чату",
      digest: "Автоматичні дайджести",
      messenger: "Месенджер (Roadmap)",
      governance: "Управління / Голосування (Roadmap)",
      wallet: "Казна / Гаманець (Roadmap)",
    } as Record<string, string>,
    moduleDescs: {
      memory: "Дозволяє агенту запамʼятовувати контекст, правила та завантажені документи.",
      tasks: "Створення та відслідковування завдань у Kanban-дошках.",
      steward: "Модерація повідомлень, попередження та автоматична допомога учасникам.",
      digest: "Періодичний огляд найважливіших обговорень та рішень.",
      messenger: "Суверенні edge-чати для комунікації без сторонніх серверів.",
      governance: "Формування пропозицій, голосування та фіксація рішень у блокчейні.",
      wallet: "Керування спільним бюджетом та виплати.",
    } as Record<string, string>,
    suggestedRolesLabel: "Пропоновані ролі для перших учасників",
    suggestedRolesPlaceholder: "Наприклад: Координатор, Розробник, Модератор...",
    inviteEmailsLabel: "Емейли для запрошення (через кому)",
    inviteEmailsPlaceholder: "example1@dao.com, example2@dao.com...",
    agentMsgs: {
      1: "Привіт! Я — ваш майбутній Дух Спільноти. Давайте разом створимо нову MicroDAO. Спочатку вкажіть назву, тип та опис нашого майбутнього простору.",
      2: "Чудово! Тепер давайте сформулюємо нашу місію, ціль на перші 30 днів та бажаний результат, щоб я міг допомагати вам рухатись у правильному напрямку.",
      3: "Які правила, принципи та межі (boundaries) діятимуть у нашій спільноті? Це допоможе мені модерувати чати та нагадувати учасникам про цінності.",
      4: "А тепер налаштуємо мене. Як мене зватимуть? Який тон, стиль та мову спілкування мені обрати для роботи з вашою спільнотою?",
      5: "Визначте мій рівень автономії. Що я можу робити самостійно, а де мені обовʼязково знадобиться підтвердження власника або адміністратора?",
      6: "Які стартові модулі ви хочете активувати прямо зараз? Деякі з них працюватимуть у локальному клієнті, інші перебувають у нашому плані розвитку.",
      7: "Давайте підготуємо перші запрошення. Ви можете створити індивідуальні інвайт-коди або одразу надіслати запрошення на емейли.",
      8: "Все готово! Перевірте конфігурацію. Коли ви натиснете «Запустити», народиться ваша MicroDAO, а разом з нею — я, ваш Дух Спільноти.",
    } as Record<number, string>
  },
  en: {
    step1: "Community Identity",
    step2: "Mission",
    step3: "Rules and Values",
    step4: "Spirit Agent Personality",
    step5: "Autonomy Level",
    step6: "Starter Modules",
    step7: "First Invites",
    step8: "Review & Create",
    desiredResultLabel: "Desired result of the community",
    desiredResultPlaceholder: "Describe the expected outcome of your activities...",
    boundariesLabel: "Community boundaries",
    boundariesPlaceholder: "e.g., no spam, respect privacy, no advertising taboos...",
    agentLanguageLabel: "Primary communication language",
    agentCommStyleLabel: "Agent communication style",
    agentCommStylePlaceholder: "e.g., friendly but reserved, professional, creative...",
    modulesTitle: "Select starter modules to connect",
    modulesDesc: "You can enable or disable these at any time in the future.",
    moduleNames: {
      memory: "Community Memory / RAG",
      tasks: "Task Organizer",
      steward: "Steward / Chat Moderation",
      digest: "Automated Digests",
      messenger: "Messenger (Roadmap)",
      governance: "Governance / Voting (Roadmap)",
      wallet: "Treasury / Wallet (Roadmap)",
    } as Record<string, string>,
    moduleDescs: {
      memory: "Allows the agent to remember context, rules, and uploaded documents.",
      tasks: "Create and track tasks in Kanban boards.",
      steward: "Moderate messages, issue warnings, and automatically assist members.",
      digest: "Periodic summaries of the most important discussions and decisions.",
      messenger: "Sovereign edge chats for communication without third-party servers.",
      governance: "Drafting proposals, voting, and recording decisions on-chain.",
      wallet: "Manage shared budget and payouts.",
    } as Record<string, string>,
    suggestedRolesLabel: "Suggested roles for initial members",
    suggestedRolesPlaceholder: "e.g., Coordinator, Developer, Moderator...",
    inviteEmailsLabel: "Invite emails (comma separated)",
    inviteEmailsPlaceholder: "example1@dao.com, example2@dao.com...",
    agentMsgs: {
      1: "Hello! I am your future Community Spirit Agent. Let's create a new MicroDAO together. First, enter the name, type, and description of our space.",
      2: "Great! Now let's define our mission, first 30-day goal, and desired outcome so that I can help guide your community in the right direction.",
      3: "What rules, principles, and boundaries will govern our community? This helps me moderate chats and reinforce our shared values.",
      4: "Now let's configure my personality. What is my name? What tone, style, and language should I adopt to interact with your community?",
      5: "Define my autonomy level. What can I do on my own, and where will I strictly need approval from the owner or admin?",
      6: "Which starter modules would you like to activate now? Some will run in the local client, while others are on our roadmap.",
      7: "Let's prepare the first invites. You can set up invite codes or draft email invites right away.",
      8: "Everything is ready! Review the configuration. Once you click 'Launch', your MicroDAO will be born, and I, your Community Spirit, will come to life.",
    } as Record<number, string>
  },
  ru: {
    step1: "Идентичность Сообщества",
    step2: "Миссия",
    step3: "Правила и Ценности",
    step4: "Личность Духа Сообщества",
    step5: "Уровень Автономии",
    step6: "Стартовые Модули",
    step7: "Первые Приглашения",
    step8: "Обзор и Создание",
    desiredResultLabel: "Желаемый результат сообщества",
    desiredResultPlaceholder: "Опишите ожидаемый результат вашей деятельности...",
    boundariesLabel: "Границы поведения в сообществе",
    boundariesPlaceholder: "Например: спам запрещен, уважение к приватности, табу на рекламу...",
    agentLanguageLabel: "Основной язык общения агента",
    agentCommStyleLabel: "Стиль общения агента",
    agentCommStylePlaceholder: "Например: дружелюбный, но сдержанный, профессиональный, творческий...",
    modulesTitle: "Выберите стартовые модули",
    modulesDesc: "Вы можете подключить или отключить их позже в любое время.",
    moduleNames: {
      memory: "Память сообщества / RAG",
      tasks: "Органайзер задач",
      steward: "Стюард / Модерация чата",
      digest: "Автоматические дайджесты",
      messenger: "Мессенджер (Roadmap)",
      governance: "Управление / Голосование (Roadmap)",
      wallet: "Казна / Кошелек (Roadmap)",
    } as Record<string, string>,
    moduleDescs: {
      memory: "Позволяет агенту помнить контекст, правила и загруженные документы.",
      tasks: "Создание и отслеживание задач на Kanban-досках.",
      steward: "Модерация сообщений, предупреждения и автоматическая помощь участникам.",
      digest: "Периодический обзор важнейших обсуждений и решений.",
      messenger: "Суверенные edge-чаты для общения без сторонних серверов.",
      governance: "Формирование предложений, голосование и фиксация решений в блокчейне.",
      wallet: "Управление общим бюджетом и выплаты.",
    } as Record<string, string>,
    suggestedRolesLabel: "Предлагаемые роли для первых участников",
    suggestedRolesPlaceholder: "Например: Координатор, Разработчик, Модератор...",
    inviteEmailsLabel: "Email-адреса для приглашения (через запятую)",
    inviteEmailsPlaceholder: "example1@dao.com, example2@dao.com...",
    agentMsgs: {
      1: "Привет! Я — ваш будущий Дух Сообщества. Давайте вместе создадим новую MicroDAO. Сначала укажите имя, тип и описание нашего пространства.",
      2: "Отлично! Теперь давайте сформулируем нашу миссию, цель на первые 30 дней и желаемый результат, чтобы я мог помогать вам двигаться в нужном направлении.",
      3: "Какие правила, принципы и границы (boundaries) будут действовать в сообществе? Это поможет мне модерировать чаты и напоминать о ценностях.",
      4: "А теперь настроим меня. Как меня будут звать? Какой тон, стиль и язык общения мне выбрать для работы с вашим сообществом?",
      5: "Определите мой уровень автономии. Что я могу делать самостоятельно, а где мне обязательно потребуется подтверждение владельца или администратора?",
      6: "Какие стартовые модули вы хотите активировать прямо сейчас? Некоторые будут работать в локальном клиенте, другие — в планах развития.",
      7: "Давайте подготовим первые приглашения. Вы можете настроить инвайт-коды или сразу вписать email-адреса для отправки приглашений.",
      8: "Все готово! Проверьте конфигурацию. Когда вы нажмете «Запустить», родится ваша MicroDAO, а вместе с ней — я, ваш Дух Сообщества.",
    } as Record<number, string>
  },
  es: {
    step1: "Identidad de la Comunidad",
    step2: "Misión",
    step3: "Reglas y Valores",
    step4: "Personalidad del Espíritu",
    step5: "Nivel de Autonomía",
    step6: "Módulos Iniciales",
    step7: "Primeras Invitaciones",
    step8: "Revisión y Creación",
    desiredResultLabel: "Resultado deseado de la comunidad",
    desiredResultPlaceholder: "Describa el resultado esperado de sus actividades...",
    boundariesLabel: "Límites de comportamiento",
    boundariesPlaceholder: "Por ejemplo: no spam, respeto a la privacidad, sin anuncios...",
    agentLanguageLabel: "Idioma principal del agente",
    agentCommStyleLabel: "Estilo de comunicación del agente",
    agentCommStylePlaceholder: "Por ejemplo: amigable pero reservado, profesional, creativo...",
    modulesTitle: "Seleccione módulos iniciales",
    modulesDesc: "Puede activarlos o desactivarlos en cualquier momento en el futuro.",
    moduleNames: {
      memory: "Memoria de Comunidad / RAG",
      tasks: "Organizador de Tareas",
      steward: "Administrador / Moderación de Chat",
      digest: "Resúmenes Automáticos",
      messenger: "Mensajero (Roadmap)",
      governance: "Gobernanza / Votación (Roadmap)",
      wallet: "Tesorería / Billetera (Roadmap)",
    } as Record<string, string>,
    moduleDescs: {
      memory: "Permite al agente recordar contexto, reglas y documentos cargados.",
      tasks: "Crear y rastrear tareas en tableros Kanban.",
      steward: "Moderar mensajes, advertencias y ayuda automática a los miembros.",
      digest: "Resumen periódico de las discusiones y decisiones más importantes.",
      messenger: "Chats edge soberanos para comunicarse sin servidores de terceros.",
      governance: "Crear propuestas, votar y registrar decisiones en cadena.",
      wallet: "Administrar presupuesto compartido y pagos.",
    } as Record<string, string>,
    suggestedRolesLabel: "Roles sugeridos para miembros iniciales",
    suggestedRolesPlaceholder: "Por ejemplo: Coordinador, Desarrollador, Moderador...",
    inviteEmailsLabel: "Correos electrónicos para invitar (separados por comas)",
    inviteEmailsPlaceholder: "example1@dao.com, example2@dao.com...",
    agentMsgs: {
      1: "¡Hola! Soy tu futuro Agente del Espíritu de la Comunidad. Creemos una nueva MicroDAO juntos. Primero, ingresa el nombre, tipo y descripción.",
      2: "¡Excelente! Ahora definamos nuestra misión, objetivo para los primeros 30 días y resultado esperado para poder guiar a tu comunidad.",
      3: "¿Qué reglas, principios y límites regirán nuestra comunidad? Esto me ayuda a moderar los chats y recordar los valores compartidos.",
      4: "Ahora configuremos mi personalidad. ¿Cuál es mi nombre? ¿Qué tono, estilo e idioma debo adoptar para interactuar con tu comunidad?",
      5: "Define mi nivel de autonomía. ¿Qué puedo hacer por mi cuenta y dónde necesitaré estrictamente la aprobación del propietario o administrador?",
      6: "¿Qué módulos iniciales te gustaría activar ahora? Algunos se ejecutarán en el cliente local, otros están en nuestra hoja de ruta.",
      7: "Preparemos las primeras invitaciones. Puedes configurar códigos de invitación o redactar correos de invitación de inmediato.",
      8: "¡Todo está listo! Revisa la configuración. Al hacer clic en 'Iniciar', nacerá tu MicroDAO y yo, tu Espíritu de la Comunidad, cobraré vida.",
    } as Record<number, string>
  }
};

export default function MicroDAOOnboarding() {
  const { user, signOut } = useAuth();
  const { memberships, refresh, setActiveCommunityId } = useActiveCommunity();
  const navigate = useNavigate();
  const { t, language } = useTranslation();

  // Retrieve localized strings
  const wl = wizardLocals[language as keyof typeof wizardLocals] || wizardLocals.en;

  // Onboarding modes: 'lobby' | 'wizard'
  const [mode, setMode] = useState<'lobby' | 'wizard'>('lobby');
  const [step, setStep] = useState(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswersState>(defaultAnswers);

  const agentMessages: Record<number, string> = {
    1: wl.agentMsgs[1],
    2: wl.agentMsgs[2],
    3: wl.agentMsgs[3],
    4: wl.agentMsgs[4],
    5: wl.agentMsgs[5],
    6: wl.agentMsgs[6],
    7: wl.agentMsgs[7],
    8: wl.agentMsgs[8],
  };

  const stepsTitle = [
    wl.step1,
    wl.step2,
    wl.step3,
    wl.step4,
    wl.step5,
    wl.step6,
    wl.step7,
    wl.step8
  ];

  useEffect(() => {
    setAnswers(prev => ({
      ...prev,
      agent_name: prev.agent_name || t.onboardingWizard.defaultAgentName,
      first_task_title: prev.first_task_title || t.onboardingWizard.defaultFirstTaskTitle,
      first_task_desc: prev.first_task_desc || t.onboardingWizard.defaultFirstTaskDesc,
    }));
  }, [t]);
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [partnerMessage, setPartnerMessage] = useState('');
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<AdvancedAccessProgram | null>(null);
  const [draftSession, setDraftSession] = useState<any>(null);

  const toggleModule = (mod: string) => {
    setAnswers(prev => {
      const list = prev.enabled_modules.includes(mod)
        ? prev.enabled_modules.filter(m => m !== mod)
        : [...prev.enabled_modules, mod];
      return { ...prev, enabled_modules: list };
    });
  };

  // Redirect unauthenticated users or users who already have communities
  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
    } else if (memberships.length > 0) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, memberships, navigate]);

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
        title: t.onboardingWizard.toastErrorTitle,
        description: t.onboardingWizard.toastEnterInviteCode,
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
        title: t.onboardingWizard.toastJoinSuccessTitle,
        description: t.onboardingWizard.toastJoinSuccessDesc
      });
      
      const newCommId = (data as any).community_id;
      setActiveCommunityId(newCommId);
      await refresh();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t.onboardingWizard.toastJoinErrorTitle,
        description: err.message || t.onboardingWizard.toastJoinErrorDesc
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
      const { error } = await (supabase as any)
        .from('access_requests')
        .insert({
          user_id: user?.id,
          email: user?.email,
          display_name: user?.user_metadata?.display_name || user?.email,
          use_case: partnerMessage.trim(),
          requested_tier: selectedProgram || 'founder',
          status: 'pending'
        });

      if (error) throw error;
      setPartnerSubmitted(true);
      toast({
        title: t.onboardingWizard.toastPartnerSuccessTitle,
        description: t.onboardingWizard.toastPartnerSuccessDesc
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t.onboardingWizard.toastPartnerErrorTitle,
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
      title: t.onboardingWizard.toastDraftRestoredTitle,
      description: t.onboardingWizard.toastDraftRestoredDesc.replace('{step}', savedStep.toString())
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
          answers: answers as any,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setSessionId(data.id);
        toast({
          title: t.onboardingWizard.toastDraftSavedTitle,
          description: t.onboardingWizard.toastDraftSavedDesc
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t.onboardingWizard.toastDraftSaveErrorTitle,
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
        title: t.onboardingWizard.toastStep1ErrorTitle,
        description: t.onboardingWizard.toastStep1ErrorDesc,
        variant: "destructive"
      });
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const combinedMission = answers.mission.trim() + (answers.desired_result ? `\nDesired Result: ${answers.desired_result.trim()}` : '');
      const combinedRules = answers.values_rules.trim() + (answers.boundaries ? `\nBoundaries: ${answers.boundaries.trim()}` : '');

      // TODO Sprint F3: enforce Leader Plan subscription before activating paid MicroDAO resources.
      // 1. Call atomic database transaction RPC
      const { data, error: rpcErr } = await supabase.rpc('create_microdao_with_spirit_agent', {
        p_name: answers.name.trim(),
        p_type: answers.type,
        p_description: answers.description.trim() || null,
        p_mission: combinedMission || null,
        p_goal_30_days: answers.goal_30_days.trim() || null,
        p_values_rules: combinedRules || null,
        p_agent_name: answers.agent_name.trim(),
        p_autonomy_level: answers.autonomy_level,
        p_setup_answers: answers as any,
        p_setup_session_id: sessionId || null
      });

      if (rpcErr) throw rpcErr;
      const { community_id } = data as any;

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
      const { data: conv, error: convErr } = await (supabase as any)
        .from('conversations')
        .insert({
          name: t.onboardingWizard.defaultChatName,
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
        title: t.onboardingWizard.toastCreateSuccessTitle,
        description: t.onboardingWizard.toastCreateSuccessDesc.replace('{name}', answers.name).replace('{agentName}', answers.agent_name)
      });

      setActiveCommunityId(community_id);
      await refresh();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Error creating microdao:', err);
      toast({
        variant: "destructive",
        title: t.onboardingWizard.toastCreateErrorTitle,
        description: err.message || t.onboardingWizard.toastCreateErrorDesc
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
            <span>{t.onboardingWizard.exitBtn}</span>
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
                {t.onboardingWizard.ecosystemTitle}
              </span>
              <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
                {t.onboardingWizard.ecosystemSubtitle1} <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  {t.onboardingWizard.ecosystemSubtitle2}
                </span>
              </h2>
              <p className="text-slate-400 leading-relaxed text-sm">
                {t.onboardingWizard.ecosystemDesc}
              </p>

              {draftSession && (
                <Card className="bg-indigo-950/20 border-indigo-500/30 backdrop-blur-md">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-300">
                      <Zap className="h-5 w-5 animate-pulse" />
                      <span className="font-semibold text-sm">{t.onboardingWizard.draftFoundTitle}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {t.onboardingWizard.draftFoundDesc
                        .replace('{step}', draftSession.current_step)
                        .replace('{name}', draftSession.answers?.name || '...')}
                    </p>
                    <Button onClick={handleRestoreDraft} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>{t.onboardingWizard.restoreDraftBtn}</span>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {memberships.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t.onboardingWizard.existingCommTitle}
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
                    <span>{t.onboardingWizard.createCommTitle}</span>
                  </CardTitle>
                  <CardDescription>
                    {t.onboardingWizard.createCommDesc}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t.onboarding.createCommunityDesc}
                  </p>
                  {/* Sprint F3 — Identity Requirements Info */}
                  <div className="mt-3 space-y-2">
                    <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10 space-y-2">
                      <div className="text-[11px] font-semibold text-indigo-300">
                        {t.identity.onboardingIdentityTitle}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {t.identity.onboardingIdentityDesc}
                      </p>
                      <div className="space-y-1 text-[10px]">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <span>✅</span> Email
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <span>⬜</span> Telegram
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <span>⬜</span> {t.identity.walletTitle}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <span>⬜</span> {t.identity.subscriptionTitle} (Leader Plan)
                        </div>
                      </div>
                    </div>
                    <div className="p-2 rounded bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-300/80">
                      🧪 {t.identity.onboardingTestingNote}
                    </div>
                    <div className="text-[10px] text-indigo-300/60">
                      💎 {t.identity.onboardingPriceNote}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleStartSetup} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/20">
                    <Plus className="mr-2 h-4 w-4" />
                    <span>{t.onboardingWizard.startCreationBtn}</span>
                  </Button>
                </CardFooter>
              </Card>

              {/* Card 2: Join by Invite Code */}
              <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-lg hover:border-purple-500/30 transition-all shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Key className="h-5 w-5 text-purple-400" />
                    <span>{t.onboardingWizard.joinCommTitle}</span>
                  </CardTitle>
                  <CardDescription>
                    {t.onboardingWizard.joinCommDesc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Input 
                      placeholder={t.onboardingWizard.joinCommPlaceholder}
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
                    {loading ? t.onboardingWizard.joiningBtn : t.onboardingWizard.joinBtn}
                  </Button>
                </CardFooter>
              </Card>

              {/* Card 3: Apply for Advanced Access */}
              <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-lg hover:border-pink-500/30 transition-all shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Users className="h-5 w-5 text-pink-400" />
                    <span>{t.advancedAccess.sectionTitle}</span>
                  </CardTitle>
                  <CardDescription>
                    {t.advancedAccess.sectionDesc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Program Selector Tiles */}
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    {t.advancedAccess.selectProgram}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {ADVANCED_ACCESS_PROGRAMS.map((prog) => {
                      const isSelected = selectedProgram === prog.key;
                      const IconComp = prog.key === 'founder' ? Gem 
                        : prog.key === 'partner' ? Building2 
                        : prog.key === 'sovereign' ? Shield 
                        : Server;
                      const nameKey = `${prog.key === 'worker_node' ? 'workerNode' : prog.key}Name` as keyof typeof t.advancedAccess;
                      const descKey = `${prog.key === 'worker_node' ? 'workerNode' : prog.key}Desc` as keyof typeof t.advancedAccess;
                      return (
                        <button
                          key={prog.key}
                          type="button"
                          onClick={() => setSelectedProgram(isSelected ? null : prog.key)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            isSelected 
                              ? `border-${prog.color}-500/40 bg-${prog.color}-500/10 ring-1 ring-${prog.color}-500/30` 
                              : 'border-slate-800 bg-slate-950/30 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <IconComp className={`h-4 w-4 text-${prog.color}-400`} />
                            <span className="text-xs font-bold text-slate-200">
                              {t.advancedAccess[nameKey]}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-snug">
                            {t.advancedAccess[descKey]}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {partnerSubmitted ? (
                    <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                      <CheckCircle className="h-8 w-8 text-green-400" />
                      <div className="text-xs font-semibold text-green-300">
                        {t.advancedAccess.applicationSent}
                      </div>
                      <p className="text-[10px] text-slate-400 max-w-xs">
                        {t.advancedAccess.applicationSentDesc}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handlePartnerSubmit} className="space-y-3">
                      <Textarea 
                        placeholder={t.advancedAccess.describePlaceholder}
                        value={partnerMessage}
                        onChange={(e) => setPartnerMessage(e.target.value)}
                        className="bg-slate-950/80 border-slate-800 text-xs min-h-[80px] focus-visible:ring-pink-500"
                        required
                      />
                      <Button 
                        type="submit" 
                        disabled={loading || !partnerMessage.trim() || !selectedProgram}
                        className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-semibold text-xs"
                      >
                        {loading ? t.onboardingWizard.sendingBtn : t.advancedAccess.submitApplication}
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
                    {answers.agent_name || t.onboardingWizard.defaultAgentName}
                  </h3>
                  <div className="text-[10px] text-indigo-400 font-semibold tracking-wide uppercase">
                    {t.onboardingWizard.aiGuide}
                  </div>
                </div>
              </div>

              {/* Chat Message Bubble */}
              <div className="p-6 flex-grow flex flex-col justify-end space-y-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl rounded-bl-none p-4 shadow-lg text-left max-w-[90%] self-start space-y-3 relative group">
                  <MessageSquare className="h-4 w-4 text-indigo-400 absolute -top-2 -left-2 bg-slate-950 p-0.5 rounded-full border border-indigo-400/20" />
                  <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
                    {agentMessages[step] || t.onboardingWizard.defaultStepMsg}
                  </p>
                </div>
                
                {/* Micro animation representation */}
                <div className="flex items-center gap-1.5 self-start pl-2 text-[10px] text-indigo-300">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
                  <span>{t.onboardingWizard.listening}</span>
                </div>
              </div>

              {/* Autonomy Badge */}
              <div className="p-3 bg-slate-900/30 border-t border-slate-800/50 flex justify-between items-center text-[10px] text-slate-400">
                <span>{t.onboardingWizard.autonomy}: <strong className="text-indigo-400 capitalize">{t.onboardingWizard.autonomyLevels[answers.autonomy_level === 'supervised_admin' ? 'admin' : answers.autonomy_level]}</strong></span>
                <span>{t.onboardingWizard.stepOf.replace('{step}', step.toString()).replace('{total}', '8')}</span>
              </div>
            </div>

            {/* Right: Embedded Form Card */}
            <div className="lg:col-span-7 flex flex-col">
              <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md shadow-2xl flex-grow flex flex-col justify-between">
                
                <CardHeader className="border-b border-slate-800/50 pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-400">
                      {stepsTitle[step - 1]}
                    </CardTitle>
                    <span className="text-xs text-slate-500 font-semibold">
                      {Math.round((step / 8) * 100)}% {t.onboardingWizard.completed}
                    </span>
                  </div>
                  <Progress value={(step / 8) * 100} className="h-1 bg-slate-950 mt-2" />
                </CardHeader>

                <CardContent className="pt-6 flex-grow space-y-4 text-left">
                  
                  {/* STEP 1: IDENTITY */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="comm-name" className="text-xs font-bold text-slate-300">{t.onboardingWizard.labelCommName}</Label>
                        <Input 
                          id="comm-name"
                          placeholder={t.onboardingWizard.placeholderCommName}
                          value={answers.name}
                          onChange={(e) => setAnswers(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 focus-visible:ring-indigo-500"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="comm-type" className="text-xs font-bold text-slate-300">{t.onboardingWizard.labelCommType}</Label>
                        <Select 
                          value={answers.type}
                          onValueChange={(val) => setAnswers(prev => ({ ...prev, type: val }))}
                        >
                          <SelectTrigger id="comm-type" className="bg-slate-950/80 border-slate-800">
                            <SelectValue placeholder={t.onboardingWizard.placeholderCommType} />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                            <SelectItem value="workspace">{t.onboardingWizard.types.workspace}</SelectItem>
                            <SelectItem value="eco-village">{t.onboardingWizard.types.village}</SelectItem>
                            <SelectItem value="dao">{t.onboardingWizard.types.dao}</SelectItem>
                            <SelectItem value="club">{t.onboardingWizard.types.club}</SelectItem>
                            <SelectItem value="charity">{t.onboardingWizard.types.charity}</SelectItem>
                            <SelectItem value="other">{t.onboardingWizard.types.other}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="comm-desc" className="text-xs font-bold text-slate-300">{t.onboardingWizard.labelCommDesc}</Label>
                        <Textarea 
                          id="comm-desc"
                          placeholder={t.onboardingWizard.placeholderCommDesc}
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
                        <Label htmlFor="comm-mission" className="text-xs font-bold text-slate-300">{t.onboarding.labelMission}</Label>
                        <Textarea 
                          id="comm-mission"
                          placeholder={t.onboardingWizard.placeholderCommMission}
                          value={answers.mission}
                          onChange={(e) => setAnswers(prev => ({ ...prev, mission: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 text-xs min-h-[80px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="comm-goal" className="text-xs font-bold text-slate-300">{t.onboarding.labelGoal30Days}</Label>
                        <Textarea 
                          id="comm-goal"
                          placeholder={t.onboardingWizard.placeholderCommGoal}
                          value={answers.goal_30_days}
                          onChange={(e) => setAnswers(prev => ({ ...prev, goal_30_days: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 text-xs min-h-[80px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="comm-result" className="text-xs font-bold text-slate-300">{wl.desiredResultLabel}</Label>
                        <Textarea 
                          id="comm-result"
                          placeholder={wl.desiredResultPlaceholder}
                          value={answers.desired_result}
                          onChange={(e) => setAnswers(prev => ({ ...prev, desired_result: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 text-xs min-h-[80px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 3: RULES & VALUES */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="comm-values" className="text-xs font-bold text-slate-300">{t.onboarding.labelCommunityRules}</Label>
                        <Textarea 
                          id="comm-values"
                          placeholder={t.onboardingWizard.placeholderCommValues}
                          value={answers.values_rules}
                          onChange={(e) => setAnswers(prev => ({ ...prev, values_rules: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 text-xs min-h-[100px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="comm-boundaries" className="text-xs font-bold text-slate-300">{wl.boundariesLabel}</Label>
                        <Textarea 
                          id="comm-boundaries"
                          placeholder={wl.boundariesPlaceholder}
                          value={answers.boundaries}
                          onChange={(e) => setAnswers(prev => ({ ...prev, boundaries: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 text-xs min-h-[100px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 4: SPIRIT AGENT PERSONALITY */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="agent-name" className="text-xs font-bold text-slate-300">{t.onboardingWizard.labelAgentName}</Label>
                        <Input 
                          id="agent-name"
                          value={answers.agent_name}
                          onChange={(e) => setAnswers(prev => ({ ...prev, agent_name: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 focus-visible:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="agent-tone" className="text-xs font-bold text-slate-300">{t.onboardingWizard.labelAgentTone}</Label>
                        <Select 
                          value={answers.tone}
                          onValueChange={(val) => setAnswers(prev => ({ ...prev, tone: val }))}
                        >
                          <SelectTrigger id="agent-tone" className="bg-slate-950/80 border-slate-800">
                            <SelectValue placeholder={t.onboardingWizard.placeholderAgentTone} />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                            <SelectItem value="warm">{t.onboardingWizard.tones.warm}</SelectItem>
                            <SelectItem value="philosophical">{t.onboardingWizard.tones.philosophical}</SelectItem>
                            <SelectItem value="technical">{t.onboardingWizard.tones.technical}</SelectItem>
                            <SelectItem value="formal">{t.onboardingWizard.tones.formal}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="agent-lang" className="text-xs font-bold text-slate-300">{wl.agentLanguageLabel}</Label>
                        <Select 
                          value={answers.language}
                          onValueChange={(val: any) => setAnswers(prev => ({ ...prev, language: val }))}
                        >
                          <SelectTrigger id="agent-lang" className="bg-slate-950/80 border-slate-800">
                            <SelectValue placeholder="Мова / Language" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                            <SelectItem value="uk">Українська (UA)</SelectItem>
                            <SelectItem value="en">English (EN)</SelectItem>
                            <SelectItem value="ru">Русский (RU)</SelectItem>
                            <SelectItem value="es">Español (ES)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="agent-style" className="text-xs font-bold text-slate-300">{wl.agentCommStyleLabel}</Label>
                        <Input 
                          id="agent-style"
                          placeholder={wl.agentCommStylePlaceholder}
                          value={answers.communication_style}
                          onChange={(e) => setAnswers(prev => ({ ...prev, communication_style: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 focus-visible:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 5: AUTONOMY LEVEL */}
                  {step === 5 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-300">{t.onboardingWizard.autonomyLevelLabel}</Label>
                        <RadioGroup 
                          value={answers.autonomy_level} 
                          onValueChange={(val: any) => setAnswers(prev => ({ ...prev, autonomy_level: val }))}
                          className="grid grid-cols-1 gap-2 pt-1"
                        >
                          <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-900/20 cursor-pointer">
                            <RadioGroupItem value="assistant" id="autonomy-assistant" className="mt-1" />
                            <div className="text-xs">
                              <Label htmlFor="autonomy-assistant" className="font-semibold text-slate-200">{t.onboardingWizard.autonomyLevels.assistant}</Label>
                              <p className="text-slate-400 text-[10px] mt-0.5">{t.onboardingWizard.autonomyLevels.assistantDesc}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 rounded-lg border border-indigo-500/30 bg-slate-950/40 hover:bg-slate-900/20 cursor-pointer">
                            <RadioGroupItem value="coordinator" id="autonomy-coordinator" className="mt-1" />
                            <div className="text-xs">
                              <Label htmlFor="autonomy-coordinator" className="font-semibold text-indigo-300">{t.onboardingWizard.autonomyLevels.coordinator}</Label>
                              <p className="text-slate-400 text-[10px] mt-0.5">{t.onboardingWizard.autonomyLevels.coordinatorDesc}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-900/20 cursor-pointer">
                            <RadioGroupItem value="supervised_admin" id="autonomy-admin" className="mt-1" />
                            <div className="text-xs">
                              <Label htmlFor="autonomy-admin" className="font-semibold text-slate-200">{t.onboardingWizard.autonomyLevels.admin}</Label>
                              <p className="text-slate-400 text-[10px] mt-0.5">{t.onboardingWizard.autonomyLevels.adminDesc}</p>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2 pt-2">
                        <Label className="text-xs font-bold text-slate-300">{t.onboardingWizard.permissionsLabel}</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="perm-welcome" 
                              checked={answers.can_send_welcome_messages} 
                              onCheckedChange={(checked) => setAnswers(prev => ({ ...prev, can_send_welcome_messages: !!checked }))}
                            />
                            <Label htmlFor="perm-welcome" className="text-xs text-slate-300 font-normal">{t.onboardingWizard.permissions.welcome}</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="perm-tasks" 
                              checked={answers.can_create_tasks} 
                              onCheckedChange={(checked) => setAnswers(prev => ({ ...prev, can_create_tasks: !!checked }))}
                            />
                            <Label htmlFor="perm-tasks" className="text-xs text-slate-300 font-normal">{t.onboardingWizard.permissions.tasks}</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="perm-invites" 
                              checked={answers.can_invite_guests} 
                              onCheckedChange={(checked) => setAnswers(prev => ({ ...prev, can_invite_guests: !!checked }))}
                            />
                            <Label htmlFor="perm-invites" className="text-xs text-slate-300 font-normal">{t.onboardingWizard.permissions.invites}</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="perm-summaries" 
                              checked={answers.can_create_summaries} 
                              onCheckedChange={(checked) => setAnswers(prev => ({ ...prev, can_create_summaries: !!checked }))}
                            />
                            <Label htmlFor="perm-summaries" className="text-xs text-slate-300 font-normal">{t.onboardingWizard.permissions.summaries}</Label>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-2.5 items-start text-[10px] text-amber-300 leading-relaxed">
                        <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          {t.onboardingWizard.sensitiveActionsWarning}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: MODULES TO START WITH */}
                  {step === 6 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-300">{wl.modulesTitle}</Label>
                        <p className="text-[10px] text-slate-400">{wl.modulesDesc}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-2">
                        {[
                          { id: 'memory', type: 'now' },
                          { id: 'tasks', type: 'now' },
                          { id: 'steward', type: 'now' },
                          { id: 'digest', type: 'now' },
                          { id: 'messenger', type: 'roadmap' },
                          { id: 'governance', type: 'roadmap' },
                          { id: 'wallet', type: 'roadmap' },
                        ].map(m => {
                          const isEnabled = answers.enabled_modules.includes(m.id);
                          return (
                            <div 
                              key={m.id}
                              onClick={() => toggleModule(m.id)}
                              className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                                isEnabled 
                                  ? 'border-indigo-500/50 bg-indigo-950/20 text-indigo-100 shadow-md shadow-indigo-500/5' 
                                  : 'border-slate-800 bg-slate-950/30 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-semibold text-slate-200">
                                  {wl.moduleNames[m.id]}
                                </span>
                                <Badge variant="outline" className={`text-[8px] uppercase font-bold py-0.5 px-1.5 leading-none shrink-0 ${
                                  m.type === 'now' 
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                  {m.type === 'now' ? 'active' : 'roadmap'}
                                </Badge>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                                {wl.moduleDescs[m.id]}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 7: FIRST INVITES */}
                  {step === 7 && (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      <div className="space-y-2">
                        <Label htmlFor="invite-emails" className="text-xs font-bold text-slate-300">{wl.inviteEmailsLabel}</Label>
                        <Textarea 
                          id="invite-emails"
                          placeholder={wl.inviteEmailsPlaceholder}
                          value={answers.invite_emails}
                          onChange={(e) => setAnswers(prev => ({ ...prev, invite_emails: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 text-xs min-h-[60px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="suggested-roles" className="text-xs font-bold text-slate-300">{wl.suggestedRolesLabel}</Label>
                        <Input 
                          id="suggested-roles"
                          placeholder={wl.suggestedRolesPlaceholder}
                          value={answers.suggested_roles}
                          onChange={(e) => setAnswers(prev => ({ ...prev, suggested_roles: e.target.value }))}
                          className="bg-slate-950/80 border-slate-800 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
                        <div className="space-y-1">
                          <Label htmlFor="invite-member" className="text-[10px] font-bold text-slate-400">{t.onboardingWizard.labelInviteMember}</Label>
                          <Input 
                            id="invite-member"
                            value={answers.member_code}
                            onChange={(e) => setAnswers(prev => ({ ...prev, member_code: e.target.value.toUpperCase() }))}
                            className="bg-slate-950/80 border-slate-800 font-mono text-center text-xs tracking-wider focus-visible:ring-indigo-500 h-8"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="invite-admin" className="text-[10px] font-bold text-slate-400">{t.onboardingWizard.labelInviteAdmin}</Label>
                          <Input 
                            id="invite-admin"
                            value={answers.admin_code}
                            onChange={(e) => setAnswers(prev => ({ ...prev, admin_code: e.target.value.toUpperCase() }))}
                            className="bg-slate-950/80 border-slate-800 font-mono text-center text-xs tracking-wider focus-visible:ring-indigo-500 h-8"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 8: REVIEW AND CREATE */}
                  {step === 8 && (
                    <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
                      <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg space-y-2 text-xs text-indigo-200">
                        <span className="font-bold flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-indigo-400" />
                          <span>{t.onboardingWizard.taskPlanningTitle}</span>
                        </span>
                        <div className="space-y-2 pt-1 text-slate-100">
                          <div>
                            <Label htmlFor="task-title" className="text-[10px] text-slate-400">{t.onboardingWizard.taskTitleLabel}</Label>
                            <Input 
                              id="task-title"
                              value={answers.first_task_title}
                              onChange={(e) => setAnswers(prev => ({ ...prev, first_task_title: e.target.value }))}
                              className="bg-slate-950/80 border-slate-800 text-xs focus-visible:ring-indigo-500 h-8"
                            />
                          </div>
                          <div>
                            <Label htmlFor="task-desc" className="text-[10px] text-slate-400">{t.onboardingWizard.taskDescLabel}</Label>
                            <Textarea 
                              id="task-desc"
                              value={answers.first_task_desc}
                              onChange={(e) => setAnswers(prev => ({ ...prev, first_task_desc: e.target.value }))}
                              className="bg-slate-950/80 border-slate-800 text-xs min-h-[50px]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-500/5 border border-amber-500/20 text-amber-300 rounded-lg text-xs space-y-1 leading-normal">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5 text-amber-400" />
                          <span>Leader Plan — $20/міс після запуску білінгу</span>
                        </span>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Зараз створення та тестування MicroDAO з Духом Спільноти повністю безкоштовне.
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <h4 className="text-xs font-bold text-slate-300">{t.onboardingWizard.configReviewTitle}</h4>
                        <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950/60 p-3 rounded-lg border border-slate-900 text-slate-400">
                          <div><span className="font-semibold text-slate-200">{t.onboardingWizard.reviewLabels.name}</span> {answers.name}</div>
                          <div><span className="font-semibold text-slate-200">{t.onboardingWizard.reviewLabels.type}</span> {t.onboardingWizard.types[answers.type as keyof typeof t.onboardingWizard.types] || answers.type}</div>
                          <div><span className="font-semibold text-slate-200">{t.onboardingWizard.reviewLabels.agent}</span> {answers.agent_name} ({t.onboardingWizard.tones[answers.tone as keyof typeof t.onboardingWizard.tones] || answers.tone})</div>
                          <div><span className="font-semibold text-slate-200">{t.onboardingWizard.reviewLabels.autonomy}</span> {t.onboardingWizard.autonomyLevels[answers.autonomy_level === 'supervised_admin' ? 'admin' : answers.autonomy_level]}</div>
                          <div><span className="font-semibold text-slate-200">Мова агента / Language:</span> {answers.language.toUpperCase()}</div>
                          <div><span className="font-semibold text-slate-200">Стиль / Style:</span> {answers.communication_style}</div>
                          <div className="col-span-2"><span className="font-semibold text-slate-200">Активні модулі / Modules:</span> {answers.enabled_modules.map(m => wl.moduleNames[m] || m).join(', ')}</div>
                          {answers.invite_emails && <div className="col-span-2 truncate"><span className="font-semibold text-slate-200">Email запрошення:</span> {answers.invite_emails}</div>}
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
                        <span>{t.onboarding.btnPrevStep}</span>
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setMode('lobby')}
                        className="text-slate-400 hover:text-slate-200 text-xs"
                      >
                        <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                        <span>{t.onboardingWizard.lobbyBtn}</span>
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
                      <span>{t.onboardingWizard.draftBtn}</span>
                    </Button>
                  </div>

                  {step < 8 ? (
                    <Button 
                      onClick={() => {
                        if (step === 1 && !answers.name.trim()) {
                          toast({
                            title: t.onboardingWizard.errorNameRequired,
                            description: t.onboardingWizard.errorNameDesc,
                            variant: "destructive"
                          });
                          return;
                        }
                        setStep(prev => prev + 1);
                      }} 
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
                    >
                      <span>{t.onboardingWizard.nextBtn}</span>
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleCreateMicroDAO} 
                      disabled={loading}
                      className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20"
                    >
                      {loading ? t.onboarding.btnCompleting : t.onboardingWizard.launchBtn}
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
