import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageSquarePlus, 
  FolderPlus, 
  Video, 
  Upload, 
  Search,
  User,
  Settings,
  Bot,
  Zap,
  UserPlus,
  Layers,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  CheckCircle,
  Loader2,
  Plus
} from 'lucide-react';
import { PrinciplesBanner } from '@/components/PrinciplesBanner';
import { CreateModal, CreateFormData } from '@/components/CreateModal';
import { GlobalSearchDialog } from '@/components/GlobalSearchDialog';
import { VideoIntro } from '@/components/VideoIntro';
import { UserApprovalPanel } from '@/components/UserApprovalPanel';
import { CommunityNewsFeed } from '@/components/CommunityNewsFeed';
import { NewsNotificationsPopover } from '@/components/NewsNotificationsPopover';
import { Badge } from '@/components/ui/badge';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useCommunityStats } from '@/hooks/useCommunityStats';
import { toast } from '@/hooks/use-toast';
import { createChat } from '@/services/chats';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const dashboardLocals = {
  uk: {
    widgetTitle: "Дух Спільноти",
    repairCta: "Створити Дух Спільноти для цієї MicroDAO",
    repairDesc: "Кожна MicroDAO повинна мати власного Духа Спільноти для координації, памʼяті та автоматизації.",
    createAgentBtn: "Створити Дух Спільноти",
    autonomyLevel: "Рівень автономії",
    setupCompleteness: "Готовність системи",
    memorySummary: "Памʼять спільноти",
    enabledModules: "Підключені модулі",
    pendingActions: "Дії, що потребують підтвердження",
    noPendingActions: "Немає дій для затвердження",
    approveBtn: "Затвердити",
    rejectBtn: "Відхилити",
    talkBtn: "Поговорити з Духом",
    configureBtn: "Налаштувати Дух",
    connectModulesBtn: "Підключити модулі",
    createTaskBtn: "Створити задачу",
    prepareRulesBtn: "Підготувати правила",
    inviteBtn: "Запросити учасників",
    planWeekBtn: "План тижня",
    rulesDialogTitle: "Пропозиція правил від Духа Спільноти",
    rulesDialogDesc: "Ці правила згенеровані на основі цінностей вашої MicroDAO.",
    rulesSuggested: "Пропоновані правила поведінки:",
    rule1: "1. Прозорість: Усі ключові рішення фіксуються в загальному лозі.",
    rule2: "2. Повага: Спілкування ведеться конструктивно, без переходів на особистості.",
    rule3: "3. Фокус: Кожна дискусія має завершуватись конкретним завданням чи рішенням.",
    rulesApplyBtn: "Затвердити правила",
    toastRulesApproved: "Правила успішно затверджені для вашої MicroDAO!",
    planWeekDialogTitle: "План тижня від Духа Спільноти",
    planWeekDialogDesc: "Агент підготував пропозицію планування на наступні 7 днів.",
    planWeekSuggested: "Пропонований план дій:",
    planItem1: "• Провести тижневий зідзвон та синхронізувати статус завдань.",
    planItem2: "• Скласти дайджест обговорень за попередній тиждень.",
    planItem3: "• Оновити базу знань новими регламентами.",
    planApplyBtn: "Затвердити план",
    toastPlanApproved: "План тижня затверджений та надісланий усім учасникам!",
    inviteDialogTitle: "Запросити учасників до MicroDAO",
    inviteDialogDesc: "Надішліть код запрошення або запросіть емейлом.",
    inviteMemberCode: "Код для учасника (Member):",
    inviteAdminCode: "Код для адміністратора (Admin):",
    inviteEmailLabel: "Запросити через Email:",
    inviteEmailBtn: "Надіслати інвайт",
    toastEmailSent: "Запрошення надіслано на вказаний Email!",
    actionApprovedToast: "Дію успішно схвалено та виконано!",
    actionRejectedToast: "Дію відхилено.",
  },
  en: {
    widgetTitle: "Community Spirit",
    repairCta: "Create Community Spirit for this MicroDAO",
    repairDesc: "Every MicroDAO must have its own Community Spirit Agent for coordination, memory, and automation.",
    createAgentBtn: "Create Community Spirit",
    autonomyLevel: "Autonomy Level",
    setupCompleteness: "Setup Completeness",
    memorySummary: "Community Memory",
    enabledModules: "Connected Modules",
    pendingActions: "Actions requiring approval",
    noPendingActions: "No actions pending approval",
    approveBtn: "Approve",
    rejectBtn: "Reject",
    talkBtn: "Talk to Spirit",
    configureBtn: "Configure Spirit",
    connectModulesBtn: "Connect Modules",
    createTaskBtn: "Create Task",
    prepareRulesBtn: "Prepare Rules",
    inviteBtn: "Invite Members",
    planWeekBtn: "Plan Week",
    rulesDialogTitle: "Community Spirit Rules Proposal",
    rulesDialogDesc: "These rules are generated based on your MicroDAO's values.",
    rulesSuggested: "Suggested behavior rules:",
    rule1: "1. Transparency: All key decisions are logged publicly.",
    rule2: "2. Respect: Communication is constructive and respectful.",
    rule3: "3. Focus: Every discussion should result in a concrete task or decision.",
    rulesApplyBtn: "Approve Rules",
    toastRulesApproved: "Rules successfully approved for your MicroDAO!",
    planWeekDialogTitle: "Community Spirit Weekly Plan",
    planWeekDialogDesc: "The agent has drafted a proposal for the next 7 days.",
    planWeekSuggested: "Suggested action plan:",
    planItem1: "• Conduct a weekly sync and update task statuses.",
    planItem2: "• Generate a digest of discussions from the past week.",
    planItem3: "• Update the knowledge base with new guidelines.",
    planApplyBtn: "Approve Plan",
    toastPlanApproved: "Weekly plan approved and broadcast to all members!",
    inviteDialogTitle: "Invite Members to MicroDAO",
    inviteDialogDesc: "Send invite code or invite via email.",
    inviteMemberCode: "Member Invite Code:",
    inviteAdminCode: "Admin Invite Code:",
    inviteEmailLabel: "Invite via Email:",
    inviteEmailBtn: "Send Invite",
    toastEmailSent: "Invitation sent to email!",
    actionApprovedToast: "Action approved and executed!",
    actionRejectedToast: "Action rejected.",
  },
  ru: {
    widgetTitle: "Дух Сообщества",
    repairCta: "Создать Дух Сообщества для этой MicroDAO",
    repairDesc: "Каждая MicroDAO должна иметь собственного Духа Сообщества для координации, памяти и автоматизации.",
    createAgentBtn: "Создать Дух Сообщества",
    autonomyLevel: "Уровень автономии",
    setupCompleteness: "Готовность системы",
    memorySummary: "Память сообщества",
    enabledModules: "Подключенные модули",
    pendingActions: "Действия, требующие подтверждения",
    noPendingActions: "Нет действий для утверждения",
    approveBtn: "Утвердить",
    rejectBtn: "Отклонить",
    talkBtn: "Поговорить с Духом",
    configureBtn: "Настроить Дух",
    connectModulesBtn: "Подключить модули",
    createTaskBtn: "Создать задачу",
    prepareRulesBtn: "Подготовить правила",
    inviteBtn: "Пригласить участников",
    planWeekBtn: "План недели",
    rulesDialogTitle: "Предложение правил от Духа Сообщества",
    rulesDialogDesc: "Эти правила сгенерированы на основе ценностей вашей MicroDAO.",
    rulesSuggested: "Предлагаемые правила поведения:",
    rule1: "1. Прозрачность: Все ключевые решения фиксируются в общем логе.",
    rule2: "2. Уважение: Общение ведется конструктивно и уважительно.",
    rule3: "3. Фокус: Каждая дискуссия должна завершаться задачей или решением.",
    rulesApplyBtn: "Утвердить правила",
    toastRulesApproved: "Правила успешно утверждены для вашей MicroDAO!",
    planWeekDialogTitle: "План недели от Духа Сообщества",
    planWeekDialogDesc: "Агент подготовил предложение планирования на следующие 7 дней.",
    planWeekSuggested: "Предлагаемый план действий:",
    planItem1: "• Провести еженедельный созвон и синхронизировать статус задач.",
    planItem2: "• Составить дайджест обсуждений за предыдущую неделю.",
    planItem3: "• Обновить базу знаний новыми регламентами.",
    planApplyBtn: "Утвердить план",
    toastPlanApproved: "План недели утвержден и отправлен всем участникам!",
    inviteDialogTitle: "Пригласить участников в MicroDAO",
    inviteDialogDesc: "Отправьте код приглашения или пригласите по email.",
    inviteMemberCode: "Код для участника (Member):",
    inviteAdminCode: "Код для администратора (Admin):",
    inviteEmailLabel: "Пригласить по Email:",
    inviteEmailBtn: "Отправить инвайт",
    toastEmailSent: "Приглашение отправлено на указанный Email!",
    actionApprovedToast: "Действие успешно одобрено и выполнено!",
    actionRejectedToast: "Действие отклонено.",
  },
  es: {
    widgetTitle: "Espíritu de la Comunidad",
    repairCta: "Crear Espíritu de la Comunidad para esta MicroDAO",
    repairDesc: "Cada MicroDAO debe tener su propio Agente de Espíritu de la Comunidad para coordinación, memoria y automatización.",
    createAgentBtn: "Crear Espíritu de la Comunidad",
    autonomyLevel: "Nivel de autonomía",
    setupCompleteness: "Estado de la configuración",
    memorySummary: "Memoria de comunidad",
    enabledModules: "Módulos habilitados",
    pendingActions: "Acciones que requieren aprobación",
    noPendingActions: "No hay acciones pendientes de aprobación",
    approveBtn: "Aprobar",
    rejectBtn: "Rechazar",
    talkBtn: "Hablar con el Espíritu",
    configureBtn: "Configurar el Espíritu",
    connectModulesBtn: "Conectar módulos",
    createTaskBtn: "Crear tarea",
    prepareRulesBtn: "Preparar reglas",
    inviteBtn: "Invitar miembros",
    planWeekBtn: "Planificar semana",
    rulesDialogTitle: "Propuesta de reglas del Espíritu",
    rulesDialogDesc: "Estas reglas son generadas basadas en los valores de su MicroDAO.",
    rulesSuggested: "Reglas de comportamiento sugeridas:",
    rule1: "1. Transparencia: Todas las decisiones clave se registran públicamente.",
    rule2: "2. Respeto: La comunicación es constructiva y respetuosa.",
    rule3: "3. Enfoque: Cada discusión debe terminar con una tarea o decisión.",
    rulesApplyBtn: "Aprobar Reglas",
    toastRulesApproved: "¡Reglas aprobadas con éxito para su MicroDAO!",
    planWeekDialogTitle: "Plan semanal del Espíritu",
    planWeekDialogDesc: "El agente ha preparado una propuesta para los próximos 7 días.",
    planWeekSuggested: "Plan de acción sugerido:",
    planItem1: "• Realizar sincronización semanal y actualizar tareas.",
    planItem2: "• Generar resumen de discusiones de la semana pasada.",
    planItem3: "• Actualizar la base de conocimientos con nuevas guías.",
    planApplyBtn: "Aprobar Plan",
    toastPlanApproved: "¡Plan semanal aprobado y transmitido a todos!",
    inviteDialogTitle: "Invitar miembros a MicroDAO",
    inviteDialogDesc: "Envíe un código de invitación o invite por correo electrónico.",
    inviteMemberCode: "Código de miembro:",
    inviteAdminCode: "Código de administrador:",
    inviteEmailLabel: "Invitar por correo electrónico:",
    inviteEmailBtn: "Enviar Invitación",
    toastEmailSent: "¡Invitación enviada al correo electrónico!",
    actionApprovedToast: "¡Acción aprobada y ejecutada!",
    actionRejectedToast: "Acción rechazada.",
  }
};

export const NewIndex = () => {
  const { t, language } = useTranslation();
  const dl = dashboardLocals[language as keyof typeof dashboardLocals] || dashboardLocals.en;

  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats } = useCommunityStats();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showVideoIntro, setShowVideoIntro] = useState(true);
  
  const { activeCommunity, activeCommunityId, refresh: refreshCommunity } = useActiveCommunity();
  const [spiritAgent, setSpiritAgent] = useState<any>(null);
  const [agentPerms, setAgentPerms] = useState<any>(null);
  const [loadingAgent, setLoadingAgent] = useState(false);

  // Dialog open/close states
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false);
  const [planWeekDialogOpen, setPlanWeekDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  // Data states
  const [pendingActions, setPendingActions] = useState<any[]>([]);
  const [inviteCodes, setInviteCodes] = useState<{ member: string; admin: string } | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteEmailLoading, setInviteEmailLoading] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', desc: '' });
  const [newTaskLoading, setNewTaskLoading] = useState(false);

  useEffect(() => {
    const fetchSpiritAgent = async () => {
      if (!activeCommunityId) return;
      setLoadingAgent(true);
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('community_id', activeCommunityId)
          .eq('agent_type', 'community_spirit')
          .maybeSingle();

        if (!error && data) {
          setSpiritAgent(data);
          
          const { data: pData } = await supabase
            .from('agent_permissions')
            .select('*')
            .eq('agent_id', data.id)
            .maybeSingle();
          if (pData) setAgentPerms(pData);
        } else {
          setSpiritAgent(null);
          setAgentPerms(null);
        }

        // Fetch pending action logs
        const { data: logsData } = await supabase
          .from('agent_action_logs')
          .select('*')
          .eq('community_id', activeCommunityId)
          .eq('status', 'pending_approval')
          .order('created_at', { ascending: false });
        if (logsData) {
          setPendingActions(logsData);
        } else {
          setPendingActions([]);
        }

        // Fetch invitation codes
        const { data: codesData } = await supabase
          .from('invitation_codes')
          .select('*')
          .eq('community_id', activeCommunityId);
        if (codesData) {
          const member = codesData.find(c => c.role_to_grant === 'member')?.code || '';
          const admin = codesData.find(c => c.role_to_grant === 'admin')?.code || '';
          setInviteCodes({ member, admin });
        } else {
          setInviteCodes(null);
        }
      } catch (err) {
        console.error('Error fetching spirit agent details:', err);
      } finally {
        setLoadingAgent(false);
      }
    };
    fetchSpiritAgent();
  }, [activeCommunityId]);

  const handleActionApproval = async (actionId: string, approvalStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('agent_action_logs')
        .update({ 
          status: approvalStatus === 'approved' ? 'approved' : 'rejected',
          approved_by: user?.id 
        })
        .eq('id', actionId);
      if (error) throw error;
      toast({
        title: t.success,
        description: approvalStatus === 'approved' ? dl.actionApprovedToast : dl.actionRejectedToast,
      });
      // reload logs
      const { data: logsData } = await supabase
        .from('agent_action_logs')
        .select('*')
        .eq('community_id', activeCommunityId)
        .eq('status', 'pending_approval');
      if (logsData) {
        setPendingActions(logsData);
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: t.error,
        description: err.message,
      });
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;
    setNewTaskLoading(true);
    try {
      let convId = '';
      const { data: convs } = await (supabase.from('conversations') as any)
        .select('id')
        .eq('community_id', activeCommunityId)
        .eq('type', 'group')
        .limit(1);

      if (convs && convs.length > 0) {
        convId = convs[0].id;
      } else {
        const { data: newConv, error: newConvErr } = await (supabase.from('conversations') as any)
          .insert({
            name: 'Загальний',
            type: 'group',
            community_id: activeCommunityId,
            created_by: user?.id
          })
          .select('id')
          .single();
        if (newConvErr) throw newConvErr;
        convId = newConv.id;
      }

      const { error: cardErr } = await (supabase.from('kanban_cards') as any)
        .insert({
          project_id: convId,
          title: newTask.title.trim(),
          description: newTask.desc.trim() || null,
          column_type: 'todo',
          created_by: user?.id
        });

      if (cardErr) throw cardErr;

      toast({
        title: t.success,
        description: 'Завдання успішно створено!',
      });
      setTaskDialogOpen(false);
      setNewTask({ title: '', desc: '' });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: t.error,
        description: err.message,
      });
    } finally {
      setNewTaskLoading(false);
    }
  };

  const handleInviteEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteEmailLoading(true);
    try {
      await supabase.from('agent_action_logs').insert({
        agent_id: spiritAgent?.id,
        community_id: activeCommunityId,
        action_type: 'member_invitation',
        action_payload: { email: inviteEmail.trim(), role: 'member' },
        status: 'executed',
        requested_by: user?.id,
        executed_at: new Date().toISOString()
      });

      toast({
        title: t.success,
        description: dl.toastEmailSent,
      });
      setInviteEmail('');
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: t.error,
        description: err.message,
      });
    } finally {
      setInviteEmailLoading(false);
    }
  };

  const handleApproveRules = async () => {
    try {
      await supabase.from('agent_action_logs').insert({
        agent_id: spiritAgent?.id,
        community_id: activeCommunityId,
        action_type: 'update_rules',
        action_payload: { approved: true, timestamp: new Date().toISOString() },
        status: 'executed',
        requested_by: user?.id,
        executed_at: new Date().toISOString()
      });
      toast({
        title: t.success,
        description: dl.toastRulesApproved,
      });
      setRulesDialogOpen(false);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: t.error,
        description: err.message,
      });
    }
  };

  const handleApprovePlan = async () => {
    try {
      await supabase.from('agent_action_logs').insert({
        agent_id: spiritAgent?.id,
        community_id: activeCommunityId,
        action_type: 'weekly_plan',
        action_payload: { approved: true, timestamp: new Date().toISOString() },
        status: 'executed',
        requested_by: user?.id,
        executed_at: new Date().toISOString()
      });
      toast({
        title: t.success,
        description: dl.toastPlanApproved,
      });
      setPlanWeekDialogOpen(false);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: t.error,
        description: err.message,
      });
    }
  };
  
  // Initialize push notifications (will auto-request permission)
  usePushNotifications();

  const handleCreateSubmit = async (data: CreateFormData) => {
    if (isCreating) return;
    
    try {
      setIsCreating(true);
      if (data.type === 'chat') {
        const newChat = await createChat(data.name || t.chats.newChat);
        navigate(`/chats/${newChat.id}`);
        toast({
          title: t.chats.successCreate,
          description: `${t.chats.newChat} "${data.name}"`,
        });
        setCreateModalOpen(false);
      } else if (data.type === 'project') {
        const response = await supabase.functions.invoke('projects-api', {
          body: {
            name: data.name.trim(),
            description: data.description?.trim() || '',
            participants: []
          }
        });
        
        if (response.error) {
          throw response.error;
        }

        const { project } = response.data;
        
        toast({
          title: t.projects.successCreate,
          description: `${t.projects.title} "${data.name}"`,
        });
        setCreateModalOpen(false);
        navigate(`/projects/${project.id}`);
      } else {
        toast({
          title: t.chats.wipTitle,
          description: t.chats.wipDesc,
        });
        setCreateModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating:', error);
      toast({
        variant: 'destructive',
        title: t.projects.errorCreate,
        description: error instanceof Error ? error.message : t.chats.errorCreate,
      });
    } finally {
      setIsCreating(false);
    }
  };
 
  const quickActions = [
    {
      title: t.dashboard.createChat,
      description: t.dashboard.createChatDesc,
      icon: MessageSquarePlus,
      action: () => setCreateModalOpen(true),
    },
    {
      title: t.dashboard.createProject,
      description: t.dashboard.createProjectDesc,
      icon: FolderPlus,
      action: () => setCreateModalOpen(true),
    },
    {
      title: t.dashboard.importHistory,
      description: t.dashboard.importHistoryDesc,
      icon: Upload,
      action: () => navigate('/import'),
    },
  ];

  return (
    <div className="bg-background pb-20 lg:pb-4">
      {/* Video Intro */}
      <VideoIntro onComplete={() => setShowVideoIntro(false)} />
      
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">{t.zhosBanner.line1.split(' ')[0]} {t.chats.messenger}</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchDialogOpen(true)}
                className="hidden sm:flex items-center gap-2 min-w-[200px] justify-start text-muted-foreground"
              >
                <Search className="h-4 w-4" />
                <span className="hidden md:inline">{t.chats.search}...</span>
                <span className="md:hidden">{t.chats.search}</span>
                <kbd className="ml-auto text-xs hidden md:inline">⌘K</kbd>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="default"
                size="sm"
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center gap-2"
              >
                <MessageSquarePlus className="h-4 w-4" />
                <span className="hidden sm:inline">{t.create}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSearchDialogOpen(true)}
                className="sm:hidden"
              >
                <Search className="h-4 w-4" />
              </Button>
              
              <NewsNotificationsPopover />
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* User Approval Panel */}
        <UserApprovalPanel />

        {/* Principles Banner */}
        {localStorage.getItem('zhos-principles-banner-dismissed') !== 'true' && (
          <PrinciplesBanner />
        )}

        {/* Welcome Section */}
        <div className="text-center space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{t.dashboard.welcome}</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            {t.dashboard.welcomeDesc}
          </p>
        </div>

        {/* Community Spirit Agent Card */}
        {activeCommunityId && (
          spiritAgent ? (
            <Card className="border-indigo-500/35 bg-indigo-950/10 backdrop-blur-lg shadow-elegant relative overflow-hidden group text-left border">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="h-32 w-32 text-indigo-400 rotate-12" />
              </div>
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center relative">
                    <Bot className="h-6 w-6 text-indigo-400 animate-pulse" />
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <span>{spiritAgent.name}</span>
                      <span className="px-2 py-0.5 text-[9px] font-semibold rounded bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-wider">
                        {t.spiritWidget.activeStatus}
                      </span>
                    </CardTitle>
                    <CardDescription className="text-xs text-indigo-300 font-medium tracking-wide font-mono">
                      {activeCommunity ? `${t.chats.messenger || 'MicroDAO'}: ${activeCommunity.name}` : ''}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-indigo-500/5 text-indigo-300 border-indigo-500/20 text-[10px] py-1 px-2.5">
                  {dl.widgetTitle}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/30 p-4 rounded-xl border border-slate-900">
                  <div className="space-y-2">
                    <div className="text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">{dl.autonomyLevel}:</span>{' '}
                      <span className="text-indigo-300 font-medium capitalize">
                        {spiritAgent.personality?.autonomy_level === 'supervised_admin'
                          ? t.spiritWidget.supervisorAdmin
                          : spiritAgent.personality?.autonomy_level === 'coordinator'
                          ? t.spiritWidget.coordinator
                          : t.spiritWidget.assistant}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{dl.setupCompleteness}</span>
                        <span className="font-bold text-indigo-300">
                          {(() => {
                            let score = 0;
                            let total = 6;
                            if (spiritAgent.name) score++;
                            if (spiritAgent.personality?.mission) score++;
                            if (spiritAgent.personality?.goal_30_days) score++;
                            if (spiritAgent.personality?.autonomy_level) score++;
                            if (spiritAgent.personality?.tone) score++;
                            if (spiritAgent.personality?.language) score++;
                            return Math.round((score / total) * 100);
                          })()}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${(() => {
                              let score = 0;
                              let total = 6;
                              if (spiritAgent.name) score++;
                              if (spiritAgent.personality?.mission) score++;
                              if (spiritAgent.personality?.goal_30_days) score++;
                              if (spiritAgent.personality?.autonomy_level) score++;
                              if (spiritAgent.personality?.tone) score++;
                              if (spiritAgent.personality?.language) score++;
                              return Math.round((score / total) * 100);
                            })()}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-300">{dl.memorySummary}:</span>{' '}
                      <span className="text-slate-400">
                        {spiritAgent.personality?.mission
                          ? `${spiritAgent.personality.mission.substring(0, 100)}...`
                          : t.spiritWidget.defaultMission}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-300">{dl.enabledModules}:</span>{' '}
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {(spiritAgent.personality?.enabled_modules || ['memory', 'tasks', 'steward']).map((mod: string) => (
                          <Badge key={mod} variant="secondary" className="text-[10px] bg-slate-900 text-indigo-300 border border-indigo-500/10">
                            {mod === 'memory'
                              ? 'Memory/RAG'
                              : mod === 'tasks'
                              ? 'Tasks'
                              : mod === 'steward'
                              ? 'Steward'
                              : mod === 'digest'
                              ? 'Digest'
                              : mod}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pending action approvals section */}
                {pendingActions.length > 0 && (
                  <div className="border-t border-slate-800/80 pt-3 space-y-2">
                    <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>{dl.pendingActions} ({pendingActions.length})</span>
                    </div>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {pendingActions.map((act) => (
                        <div key={act.id} className="text-xs bg-amber-500/5 border border-amber-500/20 p-2.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="text-left">
                            <div className="font-medium text-amber-200">
                              {act.action_type === 'member_invitation'
                                ? `Invite member: ${act.action_payload?.email}`
                                : act.action_type === 'update_rules'
                                ? 'Update community rules'
                                : act.action_type === 'weekly_plan'
                                ? 'Approve weekly planner draft'
                                : act.action_type}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Requested by owner/admin
                            </div>
                          </div>
                          <div className="flex gap-1.5 shrink-0 self-end sm:self-auto">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleActionApproval(act.id, 'rejected')}
                              className="h-7 px-2.5 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800"
                            >
                              {dl.rejectBtn}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleActionApproval(act.id, 'approved')}
                              className="h-7 px-2.5 text-[11px] bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold"
                            >
                              {dl.approveBtn}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/60">
                  <div className="text-xs font-semibold text-slate-400 mb-2">{t.spiritWidget.quickActions}</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate('/chats')}
                      className="text-xs border-slate-800 bg-slate-950/20 hover:bg-slate-900 text-slate-300 gap-1.5 h-9"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{dl.talkBtn}</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate('/agents/manage')}
                      className="text-xs border-slate-800 bg-slate-950/20 hover:bg-slate-900 text-slate-300 gap-1.5 h-9"
                    >
                      <Settings className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{dl.configureBtn}</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate('/agents/manage?tab=modules')}
                      className="text-xs border-slate-800 bg-slate-950/20 hover:bg-slate-900 text-slate-300 gap-1.5 h-9"
                    >
                      <Layers className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{dl.connectModulesBtn}</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setTaskDialogOpen(true)}
                      className="text-xs border-slate-800 bg-slate-950/20 hover:bg-slate-900 text-slate-300 gap-1.5 h-9"
                    >
                      <FolderPlus className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{dl.createTaskBtn}</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setRulesDialogOpen(true)}
                      className="text-xs border-slate-800 bg-slate-950/20 hover:bg-slate-900 text-slate-300 gap-1.5 h-9"
                    >
                      <ShieldAlert className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{dl.prepareRulesBtn}</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setInviteDialogOpen(true)}
                      className="text-xs border-slate-800 bg-slate-950/20 hover:bg-slate-900 text-slate-300 gap-1.5 h-9"
                    >
                      <UserPlus className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{dl.inviteBtn}</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPlanWeekDialogOpen(true)}
                      className="text-xs border-slate-800 bg-slate-950/20 hover:bg-slate-900 text-slate-300 gap-1.5 h-9"
                    >
                      <Zap className="h-3.5 w-3.5 text-indigo-400 animate-bounce" style={{ animationDuration: '3s' }} />
                      <span>{dl.planWeekBtn}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-amber-500/20 bg-amber-500/5 backdrop-blur-md p-6 text-center border">
              <Bot className="mx-auto h-12 w-12 text-amber-400 mb-3 animate-pulse" />
              <h3 className="text-lg font-bold text-slate-200 mb-1">{dl.repairCta}</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">{dl.repairDesc}</p>
              <Button onClick={() => navigate('/onboarding')} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold">
                <Plus className="mr-2 h-4 w-4 shrink-0" />
                {dl.createAgentBtn}
              </Button>
            </Card>
          )
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-semibold">{t.dashboard.quickActions}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {quickActions.map((action, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={action.action}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                      <action.icon className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-sm">{action.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-xs leading-tight">
                    {action.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats or Recent Activity */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg">{t.dashboard.communityActivity}</CardTitle>
            <CardDescription>
              {t.dashboard.activityDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex overflow-x-auto gap-4 pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-5 sm:overflow-visible">
              <div className="text-center flex-shrink-0 min-w-[80px]">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {stats.isLoading ? '...' : stats.onlineUsers}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{t.dashboard.onlineUsers}</div>
              </div>
              <div className="text-center flex-shrink-0 min-w-[80px]">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {stats.isLoading ? '...' : stats.onlineAgents}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{t.dashboard.onlineAgents}</div>
              </div>
              <div className="text-center flex-shrink-0 min-w-[80px]">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {stats.isLoading ? '...' : stats.totalUsers}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{t.dashboard.totalUsers}</div>
              </div>
              <div className="text-center flex-shrink-0 min-w-[80px]">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {stats.isLoading ? '...' : stats.totalChats}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{t.dashboard.activeChats}</div>
              </div>
              <div className="text-center flex-shrink-0 min-w-[80px]">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {stats.isLoading ? '...' : stats.todayMessages}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{t.dashboard.todayMessages}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Community News Feed */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-semibold">{t.dashboard.newsFeed}</h3>
          <CommunityNewsFeed />
        </div>
      </main>

      {/* Modals */}
      <CreateModal
        open={createModalOpen}
        onClose={() => !isCreating && setCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        loading={isCreating}
      />
      
      <GlobalSearchDialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        onNavigate={(type, id) => {
          if (type === 'chat' || type === 'message') {
            navigate(`/chats/${id}`);
          } else if (type === 'project') {
            navigate(`/projects/${id}`);
          } else if (type === 'file') {
            navigate(`/knowledge-base`);
          } else {
            navigate(`/participants`);
          }
        }}
      />

      {/* Rules Dialog */}
      <Dialog open={rulesDialogOpen} onOpenChange={setRulesDialogOpen}>
        <DialogContent className="max-w-md bg-slate-900 border border-indigo-500/20 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-indigo-300">{dl.rulesDialogTitle}</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">{dl.rulesDialogDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm">
            <p className="font-semibold text-indigo-200 text-left">{dl.rulesSuggested}</p>
            <div className="space-y-2.5 bg-slate-950/40 p-3 rounded-lg border border-slate-800 text-xs leading-relaxed text-slate-300 text-left">
              <p>{dl.rule1}</p>
              <p>{dl.rule2}</p>
              <p>{dl.rule3}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setRulesDialogOpen(false)} className="text-slate-400 hover:text-slate-200">
              {t.cancel}
            </Button>
            <Button size="sm" onClick={handleApproveRules} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {dl.rulesApplyBtn}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Weekly Plan Dialog */}
      <Dialog open={planWeekDialogOpen} onOpenChange={setPlanWeekDialogOpen}>
        <DialogContent className="max-w-md bg-slate-900 border border-indigo-500/20 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-indigo-300">{dl.planWeekDialogTitle}</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">{dl.planWeekDialogDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm">
            <p className="font-semibold text-indigo-200 text-left">{dl.planWeekSuggested}</p>
            <div className="space-y-2 bg-slate-950/40 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 text-left">
              <p>{dl.planItem1}</p>
              <p>{dl.planItem2}</p>
              <p>{dl.planItem3}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPlanWeekDialogOpen(false)} className="text-slate-400 hover:text-slate-200">
              {t.cancel}
            </Button>
            <Button size="sm" onClick={handleApprovePlan} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {dl.planApplyBtn}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="max-w-md bg-slate-900 border border-indigo-500/20 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-indigo-300">{dl.inviteDialogTitle}</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">{dl.inviteDialogDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 text-xs text-left">
            <div className="space-y-2.5 bg-slate-950/40 p-3.5 rounded-lg border border-slate-800">
              <div>
                <Label className="text-slate-400 text-[10px] uppercase font-bold">{dl.inviteMemberCode}</Label>
                <div className="font-mono text-sm text-indigo-300 select-all font-semibold mt-0.5">
                  {inviteCodes?.member || 'MEMBER-CODE-PENDING'}
                </div>
              </div>
              <div className="border-t border-slate-800/80 pt-2">
                <Label className="text-slate-400 text-[10px] uppercase font-bold">{dl.inviteAdminCode}</Label>
                <div className="font-mono text-sm text-indigo-300 select-all font-semibold mt-0.5">
                  {inviteCodes?.admin || 'ADMIN-CODE-PENDING'}
                </div>
              </div>
            </div>

            <form onSubmit={handleInviteEmail} className="space-y-2 border-t border-slate-800/80 pt-3">
              <Label htmlFor="inviteEmail" className="text-slate-300 font-semibold">{dl.inviteEmailLabel}</Label>
              <div className="flex gap-2">
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="partner@microdao.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-100 text-xs"
                />
                <Button type="submit" size="sm" disabled={inviteEmailLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
                  {inviteEmailLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : dl.inviteEmailBtn}
                </Button>
              </div>
            </form>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setInviteDialogOpen(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-100">
              {language === 'uk' ? 'Закрити' : language === 'ru' ? 'Закрыть' : language === 'es' ? 'Cerrar' : 'Close'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="max-w-md bg-slate-900 border border-indigo-500/20 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-indigo-300 text-left">{dl.createTaskBtn}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs text-left">
            <div className="space-y-1">
              <Label htmlFor="taskTitle" className="text-slate-300 font-semibold">Назва завдання</Label>
              <Input
                id="taskTitle"
                placeholder="Введіть назву..."
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                className="bg-slate-950 border-slate-800 text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="taskDesc" className="text-slate-300 font-semibold">Опис завдання</Label>
              <Textarea
                id="taskDesc"
                placeholder="Введіть детальний опис..."
                value={newTask.desc}
                onChange={(e) => setNewTask(prev => ({ ...prev, desc: e.target.value }))}
                rows={3}
                className="bg-slate-950 border-slate-800 text-slate-100 resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setTaskDialogOpen(false)} className="text-slate-400 hover:text-slate-200">
              {t.cancel}
            </Button>
            <Button size="sm" onClick={handleCreateTask} disabled={newTaskLoading || !newTask.title.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {newTaskLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Створити'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};