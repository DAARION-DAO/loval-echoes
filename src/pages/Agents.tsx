import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateCommunitySpiritPrompt } from '@/lib/communitySpiritPrompt';
import { ensureCommunitySpiritAgent } from '@/services/microdaoSettings';
import { 
  Bot, 
  Sparkles, 
  ShieldAlert, 
  Layers, 
  Settings, 
  MessageSquare, 
  FolderPlus, 
  UserPlus, 
  Zap, 
  CheckCircle, 
  Loader2, 
  Lock, 
  Unlock, 
  Clock, 
  Terminal, 
  ExternalLink, 
  FileText, 
  Plus,
  HelpCircle,
  Home,
  Check,
  AlertTriangle,
  Play,
  RotateCcw,
  Copy,
  ChevronDown
} from 'lucide-react';

const manageLocals = {
  uk: {
    pageTitle: "Налаштування Духа Спільноти",
    pageSubtitle: "Керування особистістю, памʼяттю, модулями та дозволами вашого Community Spirit Agent",
    notAdminBanner: "Тільки власники або адміністратори можуть редагувати налаштування Духа Спільноти.",
    saveBtn: "Зберегти налаштування",
    toastSaved: "Налаштування успішно збережено!",
    toastSaveError: "Помилка при збереженні налаштувань.",
    toastSummarized: "Памʼять спільноти успішно проаналізовано та узагальнено!",
    noActiveCommunity: "Виберіть або створіть MicroDAO у меню зліва для налаштування її Духа Спільноти.",
    noSpiritAgent: "Для цієї MicroDAO ще не створено Дух Спільноти.",
    repairCta: "Створити Дух Спільноти для цієї MicroDAO",
    repairDesc: "Кожна MicroDAO повинна мати власного Духа Спільноти для координації, памʼяті та автоматизації.",
    createAgentBtn: "Створити Дух Спільноти",
    spiritCreatedToast: "Дух Спільноти створено. Тепер його можна налаштувати.",
    spiritRepairError: "Не вдалося створити Дух Спільноти.",
    unsavedBadge: "Є незбережені зміни",
    roleLabel: "Ваша роль у DAO",
    autonomyLabel: "Автономія",
    actionTalk: "Поговорити з агентом",
    actionLogs: "Журнал дій",

    tabs: {
      profile: "Профіль",
      personality: "Особистість",
      memory: "Пам'ять",
      modules: "Модулі",
      permissions: "Дозволи",
      approvals: "Дії на схвалення",
      actionLog: "Журнал дій",
      technical: "Технічні"
    },

    profileTab: {
      agentName: "Ім'я агента",
      communityName: "Назва спільноти (тільки читання)",
      shortMission: "Коротка місія спільноти",
      primaryLang: "Основна мова",
      secondaryLangs: "Додаткові мови"
    },

    personalityTab: {
      tone: "Тон спілкування",
      commStyle: "Стиль спілкування",
      strictness: "Рівень суворості",
      decisionStyle: "Стиль прийняття рішень",
      conflictStyle: "Вирішення конфліктів",
      previewTitle: "Так Дух Спільноти буде звучати для учасників:",
      tones: {
        warm: "Теплий & Дружній",
        professional: "Професійний & Стриманий",
        creative: "Творчий & Натхненний",
        calm: "Спокійний & Зважений",
        direct: "Прямий & Лаконічний",
        visionary: "Вдалечинь дивлячий",
        playful: "Грайливый & З гумором"
      },
      styles: {
        friendly: "Дружній (facilitator)",
        short: "Короткий & Чіткий",
        detailed: "Детальний & Повний",
        mentor: "Наставник (mentor-like)",
        operator: "Оператор дій"
      },
      strictnessLevels: {
        low: "Низький (м'яка допомога)",
        medium: "Середній (активне модерування)",
        high: "Високий (суворий контроль)"
      },
      decisionStyles: {
        consensus: "Консенсус (тільки згода учасників)",
        autonomous: "Автономний (діє самостійно)",
        human_approved: "Затверджується людиною (під наглядом)"
      }
    },

    memoryTab: {
      intro: "Пам'ять агента зберігає всі знання про цінності, правила та діяльність вашої MicroDAO.",
      summaryTitle: "Опис узагальненої пам'яті:",
      kbLink: "Відкрити Базу Знань",
      addDoc: "Додати документ у пам'ять",
      summarizeBtn: "Скласти підсумок пам'яті спільноти",
      futureSources: "Майбутні джерела пам'яті (Roadmap):",
      sourcesList: [
        "Автоматична індексація Git коммітів спільноти",
        "Транскрипти щотижневих аудіо/відео зустрічей",
        "Синхронізація з зовнішніми базами Notion/Wiki"
      ]
    },

    modulesTab: {
      availableTitle: "Доступно зараз (Активні модулі)",
      comingTitle: "Готується найближчим часом",
      roadmapTitle: "У плані розвитку (Roadmap)",
      futureTitle: "Майбутні дослідження",
      stewardName: "Стюард / Модерація",
      stewardDesc: "Модерує чати, виявляє спам та порушення правил, допомагає учасникам.",
      memoryName: "Памʼять / RAG",
      memoryDesc: "Доступ до спільної бази знань, документів та попереднього досвіду.",
      taskName: "Органайзер задач",
      taskDesc: "Керування Kanban-картками та призначення відповідальних.",
      onboardingName: "Онбординг / Запрошення",
      onboardingDesc: "Створення інвайт-кодів та введення нових учасників у курс справ.",
      modulesList: {
        messenger: { name: "Месенджер", desc: "Edge-to-edge чати без центрального сервера." },
        meeting: { name: "Зустрічі", desc: "Голосові кімнати з авто-протоколюванням результатів." },
        digest: { name: "Тижневий Дайджест", desc: "Узагальнення ключових подій тижня за секунди." },
        bridge: { name: "Інтеграційний Міст", desc: "Зв'язок з Telegram, Discord, Slack." },
        governance: { name: "Управління", desc: "Голосування, вибори, референдуми в MicroDAO." },
        treasury: { name: "Спільна Казна", desc: "Мультисиг-гаманці для DAO-фінансів." },
        wallet: { name: "Локальний Гаманець", desc: "Управління приватними ключами та токенами." },
        tokenFactory: { name: "Токен Фабрика", desc: "Створення та запуск токена спільноти в 1 клік." },
        tokenomics: { name: "Моделювання Токеноміки", desc: "Розрахунок стимулів та графіків вестингу." },
        devAgents: { name: "Розробницькі Агенти", desc: "Автономний кодинг, тестування, реліз." },
        marketplace: { name: "Маркетплейс Навичок", desc: "Каталог інтеграцій та агентів від ком'юніті." },
        e2ee: { name: "Шифрування & Ключі", desc: "Децентралізоване керування секретами." },
        secondMe: { name: "Другий Я / Клон", desc: "Створення вашого цифрового аватара для рутинних задач." }
      }
    },

    permissionsTab: {
      intro: "Налаштуйте права доступу для вашого Духа Спільноти. Деякі дії є безпечними, інші потребують обов'язкового підтвердження власником/адміністратором.",
      safeTitle: "Безпечні дії (може виконувати самостійно):",
      sensitiveTitle: "Чутливі дії (потребують підтвердження власником/адміністратором):",
      requiresApprovalLabel: "Потребує підтвердження owner/admin",
      fields: {
        can_invite_guests: "Може створювати гостьові інвайт-коди",
        can_create_tasks: "Може створювати завдання на Kanban-дошці",
        can_send_welcome_messages: "Може надсилати привітання новим учасникам",
        can_create_summaries: "Може готувати підсумки та дайджести дискусій",
        can_suggest_roles: "Може пропонувати ролі для учасників",
        can_approve_members: "Може затверджувати нових учасників спільноти",
        can_make_admins: "Може призначати адміністраторів",
        can_remove_members: "Може видаляти учасників зі спільноти",
        can_delete_community: "Може видалити всю MicroDAO (екстремальна дія)",
        requires_human_approval_for_sensitive_actions: "Обов'язкове людське підтвердження для будь-яких фінансових/управлінських дій"
      }
    },

    approvalsTab: {
      title: "Черга схвалення дій агента",
      subtitle: "Дії, які Дух Спільноти підготував і які потребують схвалення лідером перед виконанням.",
      demoBadge: "Демо черги схвалення",
      approveBtn: "Затвердити",
      rejectBtn: "Відхилити",
      riskSafe: "Низький ризик",
      riskMedium: "Середній ризик",
      riskSensitive: "Високий ризик",
      emptyState: "Немає дій, які очікують на схвалення.",
      actionTypes: {
        member_invitation: "Запрошення учасника",
        update_rules: "Оновлення правил",
        weekly_plan: "Щотижневий план",
        treasury_payout: "Виплата з казни"
      }
    },

    actionLogTab: {
      intro: "Хронологія дій, які підготував або виконав ваш Дух Спільноти.",
      actionType: "Тип дії",
      status: "Статус",
      createdAt: "Створено",
      requestedBy: "Ініціатор",
      approvedBy: "Схвалив",
      payload: "Деталі дії",
      statuses: {
        draft: "Чернетка",
        pending_approval: "Очікує підтвердження",
        approved: "Схвалено",
        executed: "Виконано",
        rejected: "Відхилено",
        failed: "Невдало"
      }
    },

    technicalTab: {
      intro: "Розширені параметри для розробників та просунутих користувачів.",
      sysPrompt: "Системний промпт агента",
      sysPromptDesc: "Ця інструкція визначає базову поведінку, ролі та правила обробки повідомлень.",
      webhookSetting: "Тип підключення та Webhook",
      endpointUrl: "Адреса Webhook/WebSocket",
      rawConfig: "Сира JSON конфігурація (метадані)",
      warningText: "Увага! Неправильне налаштування цих параметрів може порушити стабільність роботи агента.",
      copyBtn: "Скопіювати промпт",
      regenBtn: "Перегенерувати",
      resetBtn: "Скинути до шаблону"
    }
  },
  en: {
    pageTitle: "Community Spirit Configuration",
    pageSubtitle: "Manage the personality, memory, modules, and permissions of your Community Spirit Agent",
    notAdminBanner: "Only owners or administrators can edit the Community Spirit Agent configuration.",
    saveBtn: "Save Settings",
    toastSaved: "Settings successfully saved!",
    toastSaveError: "Error saving settings.",
    toastSummarized: "Community memory successfully analyzed and summarized!",
    noActiveCommunity: "Please select or create a MicroDAO from the left sidebar to configure its Spirit Agent.",
    noSpiritAgent: "No Community Spirit Agent has been created for this MicroDAO yet.",
    repairCta: "Create Community Spirit for this MicroDAO",
    repairDesc: "Every MicroDAO must have its own Community Spirit Agent for coordination, memory, and automation.",
    createAgentBtn: "Create Community Spirit",
    spiritCreatedToast: "Community Spirit was created. You can configure it now.",
    spiritRepairError: "Could not create Community Spirit.",
    unsavedBadge: "Unsaved changes exist",
    roleLabel: "DAO Role",
    autonomyLabel: "Autonomy",
    actionTalk: "Talk to Agent",
    actionLogs: "Action Log",

    tabs: {
      profile: "Profile",
      personality: "Personality",
      memory: "Memory",
      modules: "Modules",
      permissions: "Permissions",
      approvals: "Approvals",
      actionLog: "Action Log",
      technical: "Technical"
    },

    profileTab: {
      agentName: "Agent Display Name",
      communityName: "Community Name (Read Only)",
      shortMission: "Community Short Mission",
      primaryLang: "Primary Language",
      secondaryLangs: "Secondary Languages"
    },

    personalityTab: {
      tone: "Communication Tone",
      commStyle: "Communication Style",
      strictness: "Strictness Level",
      decisionStyle: "Decision-making Style",
      conflictStyle: "Conflict Resolution Style",
      previewTitle: "How Community Spirit will sound to members:",
      tones: {
        warm: "Warm & Friendly",
        professional: "Professional & Reserved",
        creative: "Creative & Inspiring",
        calm: "Calm & Centered",
        direct: "Direct & Clear",
        visionary: "Visionary & Bold",
        playful: "Playful & Witty"
      },
      styles: {
        friendly: "Friendly Facilitator",
        short: "Short & Clear",
        detailed: "Detailed & Complete",
        mentor: "Mentor-like Guide",
        operator: "Action Operator"
      },
      strictnessLevels: {
        low: "Low (soft assistance)",
        medium: "Medium (active moderation)",
        high: "High (strict control)"
      },
      decisionStyles: {
        consensus: "Consensus (agreement only)",
        autonomous: "Autonomous (acts independently)",
        human_approved: "Human Approved (supervised)"
      }
    },

    memoryTab: {
      intro: "The agent's memory stores all knowledge about the values, rules, and activities of your MicroDAO.",
      summaryTitle: "Community Memory Summary:",
      kbLink: "Open Knowledge Base",
      addDoc: "Add document to memory",
      summarizeBtn: "Summarize community memory",
      futureSources: "Future Memory Sources (Roadmap):",
      sourcesList: [
        "Automated indexing of community Git commits",
        "Transcripts of weekly audio/video syncs",
        "Syncing with external Notion/Wiki databases"
      ]
    },

    modulesTab: {
      availableTitle: "Available Now (Active Modules)",
      comingTitle: "Coming Soon",
      roadmapTitle: "Under Development (Roadmap)",
      futureTitle: "Future Explorations",
      stewardName: "Steward / Moderation",
      stewardDesc: "Moderates chats, detects spam and violations, helps members.",
      memoryName: "Memory / RAG",
      memoryDesc: "Access to common knowledge base, documents, and past experience.",
      taskName: "Task Organizer",
      taskDesc: "Manage Kanban cards and assign assignees.",
      onboardingName: "Onboarding / Invites",
      onboardingDesc: "Create invite codes and onboard new participants.",
      modulesList: {
        messenger: { name: "Messenger", desc: "Edge-to-edge chats without central servers." },
        meeting: { name: "Meetings", desc: "Voice rooms with automated meeting summaries." },
        digest: { name: "Weekly Digest", desc: "Summarize key weekly events in seconds." },
        bridge: { name: "Integration Bridge", desc: "Link with Telegram, Discord, Slack." },
        governance: { name: "Governance", desc: "Voting, elections, and referendums in MicroDAO." },
        treasury: { name: "Treasury", desc: "Multisig wallets for DAO finances." },
        wallet: { name: "Local Wallet", desc: "Manage private keys and community tokens." },
        tokenFactory: { name: "Token Factory", desc: "Create and launch community tokens in 1-click." },
        tokenomics: { name: "Tokenomics", desc: "Calculate incentives and vesting schedules." },
        devAgents: { name: "Developer Agents", desc: "Autonomous coding, testing, release." },
        marketplace: { name: "Skills Marketplace", desc: "Catalog of community-built integrations." },
        e2ee: { name: "Encryption & Keys", desc: "Decentralized secrets management." },
        secondMe: { name: "Second Me / Clone", desc: "Create your digital avatar for routine tasks." }
      }
    },

    permissionsTab: {
      intro: "Configure access permissions for your Community Spirit Agent. Some actions are safe, while others strictly require approval from the owner/administrator.",
      safeTitle: "Safe Actions (Agent can execute autonomously):",
      sensitiveTitle: "Sensitive Actions (Require owner/admin approval):",
      requiresApprovalLabel: "Requires owner/admin approval",
      fields: {
        can_invite_guests: "Can create guest invite codes",
        can_create_tasks: "Can create tasks on the Kanban board",
        can_send_welcome_messages: "Can send welcome messages to new members",
        can_create_summaries: "Can prepare debate summaries and digests",
        can_suggest_roles: "Can suggest roles for members",
        can_approve_members: "Can approve new community members",
        can_make_admins: "Can make members admins",
        can_remove_members: "Can remove members from the community",
        can_delete_community: "Can delete the entire MicroDAO (extreme action)",
        requires_human_approval_for_sensitive_actions: "Strict human approval required for any financial/governance action"
      }
    },

    approvalsTab: {
      title: "Agent Approvals Queue",
      subtitle: "Actions prepared by the Community Spirit Agent requiring leader sign-off before execution.",
      demoBadge: "Demo Approvals Queue",
      approveBtn: "Approve",
      rejectBtn: "Reject",
      riskSafe: "Low Risk",
      riskMedium: "Medium Risk",
      riskSensitive: "High Risk",
      emptyState: "No actions pending approvals.",
      actionTypes: {
        member_invitation: "Invite Member",
        update_rules: "Update Rules",
        weekly_plan: "Weekly Plan",
        treasury_payout: "Treasury Payout"
      }
    },

    actionLogTab: {
      intro: "History of actions prepared or executed by your Community Spirit Agent.",
      actionType: "Action Type",
      status: "Status",
      createdAt: "Created",
      requestedBy: "Initiator",
      approvedBy: "Approved By",
      payload: "Action Details",
      statuses: {
        draft: "Draft",
        pending_approval: "Pending Approval",
        approved: "Approved",
        executed: "Executed",
        rejected: "Rejected",
        failed: "Failed"
      }
    },

    technicalTab: {
      intro: "Advanced parameters for developers and advanced users.",
      sysPrompt: "Agent System Prompt",
      sysPromptDesc: "This instruction defines base behaviors, roles, and message processing rules.",
      webhookSetting: "Connection Type & Webhook",
      endpointUrl: "Webhook/WebSocket Endpoint",
      rawConfig: "Raw JSON Configuration (metadata)",
      warningText: "Warning! Incorrect configuration of these parameters may break agent stability.",
      copyBtn: "Copy Prompt",
      regenBtn: "Regenerate",
      resetBtn: "Reset to Default"
    }
  }
};

export default function Agents() {
  const { t, language } = useTranslation();
  const ml = (manageLocals as any)[language] || manageLocals.en;
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';

  const { activeCommunity, activeCommunityId, isCommunityAdmin, userCommunityRole, refresh: refreshCommunity } = useActiveCommunity();
  
  const [spiritAgent, setSpiritAgent] = useState<any>(null);
  const [agentPerms, setAgentPerms] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingSpirit, setCreatingSpirit] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Profile fields
  const [agentName, setAgentName] = useState('');
  const [shortMission, setShortMission] = useState('');
  const [primaryLang, setPrimaryLang] = useState('uk');
  const [secondaryLangs, setSecondaryLangs] = useState('');

  // Personality fields
  const [tone, setTone] = useState('warm');
  const [commStyle, setCommStyle] = useState('friendly');
  const [strictness, setStrictness] = useState('medium');
  const [decisionStyle, setDecisionStyle] = useState('human_approved');
  const [conflictStyle, setConflictStyle] = useState('peaceful');

  // Permissions fields
  const [permsState, setPermsState] = useState({
    can_invite_guests: true,
    can_create_tasks: true,
    can_send_welcome_messages: true,
    can_create_summaries: true,
    can_suggest_roles: true,
    can_approve_members: false,
    can_make_admins: false,
    can_remove_members: false,
    can_delete_community: false,
    requires_human_approval_for_sensitive_actions: true,
  });

  // Action Log
  const [actionLogs, setActionLogs] = useState<any[]>([]);

  // Approvals List (real DB + mock queue)
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

  // Initialize Approvals list based on language
  useEffect(() => {
    setPendingApprovals([
      {
        id: 'mock-1',
        action_type: 'member_invitation',
        action_payload: { email: 'oleksiy@example.com', role: 'member' },
        risk: 'safe',
        summary: language === 'uk' 
          ? 'Запросити Олексія (oleksiy@example.com) з роллю "Member"' 
          : 'Invite Alex (oleksiy@example.com) as Member',
      },
      {
        id: 'mock-2',
        action_type: 'update_rules',
        action_payload: { new_rule: 'Повага до думок колег та конструктивний зворотний зв\'язок' },
        risk: 'medium',
        summary: language === 'uk' 
          ? 'Додати правило: "Повага до думок колег та конструктивний зворотний зв\'язок у тредах"' 
          : 'Add rule: "Respect for peer opinions and constructive feedback in threads"',
      },
      {
        id: 'mock-3',
        action_type: 'weekly_plan',
        action_payload: { start_date: '2026-06-15', tasks_count: 4 },
        risk: 'safe',
        summary: language === 'uk' 
          ? 'План робіт з 15 по 21 червня: 4 завдання на канбані, підготовка демо-релізу' 
          : 'Weekly work plan Jun 15-21: 4 tasks on kanban, demo release preparation',
      },
      {
        id: 'mock-4',
        action_type: 'treasury_payout',
        action_payload: { amount: 500, recipient: '0xabc...123', currency: 'USDC' },
        risk: 'sensitive',
        summary: language === 'uk' 
          ? 'Виплата 500 USDC розробнику за закриття завдання #12' 
          : 'Payout 500 USDC to developer for completing task #12',
      }
    ]);
  }, [language]);

  useEffect(() => {
    const fetchAgentAndPermissions = async () => {
      if (!activeCommunityId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data: agentData, error: agentErr } = await supabase
          .from('agents')
          .select('*')
          .eq('community_id', activeCommunityId)
          .eq('agent_type', 'community_spirit')
          .maybeSingle();

        if (agentErr) throw agentErr;

        if (agentData) {
          setSpiritAgent(agentData);
          setAgentName(agentData.name || '');
          
          const personality = (agentData.personality as any) || {};
          setShortMission(personality.mission || '');
          setPrimaryLang(personality.language || 'uk');
          setSecondaryLangs(personality.secondary_languages || '');
          
          setTone(personality.tone || 'warm');
          setCommStyle(personality.communication_style || 'friendly');
          setStrictness(personality.strictness || 'medium');
          setDecisionStyle(personality.decision_style || 'human_approved');
          setConflictStyle(personality.conflict_style || 'peaceful');

          // Fetch permissions
          const { data: permsData, error: permsErr } = await supabase
            .from('agent_permissions')
            .select('*')
            .eq('agent_id', agentData.id)
            .maybeSingle();

          if (permsErr) throw permsErr;

          if (permsData) {
            setAgentPerms(permsData);
            setPermsState({
              can_invite_guests: !!permsData.can_invite_guests,
              can_create_tasks: !!permsData.can_create_tasks,
              can_send_welcome_messages: !!permsData.can_send_welcome_messages,
              can_create_summaries: !!permsData.can_create_summaries,
              can_suggest_roles: !!permsData.can_suggest_roles,
              can_approve_members: !!permsData.can_approve_members,
              can_make_admins: !!permsData.can_make_admins,
              can_remove_members: !!permsData.can_remove_members,
              can_delete_community: !!permsData.can_delete_community,
              requires_human_approval_for_sensitive_actions: !!permsData.requires_human_approval_for_sensitive_actions,
            });
          }

          // Fetch action logs
          const { data: logsData } = await supabase
            .from('agent_action_logs')
            .select('*')
            .eq('agent_id', agentData.id)
            .order('created_at', { ascending: false });

          if (logsData) {
            setActionLogs(logsData);
            
            // Add real database pending approvals if any
            const pendingDbLogs = logsData.filter(log => log.status === 'pending_approval');
            if (pendingDbLogs.length > 0) {
              const mappedDb = pendingDbLogs.map(log => ({
                id: log.id,
                action_type: log.action_type,
                action_payload: log.action_payload,
                risk: log.action_type === 'treasury_payout' || log.action_type === 'delete_community' ? 'sensitive' : 'safe',
                summary: language === 'uk' 
                  ? `Системна дія (${log.action_type}): ${JSON.stringify(log.action_payload)}` 
                  : `System action (${log.action_type}): ${JSON.stringify(log.action_payload)}`,
                isDb: true
              }));
              
              setPendingApprovals(prev => {
                // Filter out any db logs already in list to prevent duplicate render
                const cleanPrev = prev.filter(p => !p.isDb);
                return [...mappedDb, ...cleanPrev];
              });
            }
          }
        } else {
          setSpiritAgent(null);
          setAgentPerms(null);
        }
      } catch (err) {
        console.error('Error loading Community Spirit Agent settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentAndPermissions();
  }, [activeCommunityId, language]);

  const handleEnsureCommunitySpirit = async () => {
    if (!activeCommunity) return;

    try {
      setCreatingSpirit(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw userError || new Error('User not authenticated');

      const result = await ensureCommunitySpiritAgent({
        community: activeCommunity,
        userId: userData.user.id,
      });

      setSpiritAgent(result.agent);
      setAgentName(result.agent.name || '');

      const personality = (result.agent.personality as any) || {};
      setShortMission(personality.mission || '');
      setPrimaryLang(personality.language || 'uk');
      setSecondaryLangs(personality.secondary_languages || '');
      setTone(personality.tone || 'warm');
      setCommStyle(personality.communication_style || 'friendly');
      setStrictness(personality.strictness || 'medium');
      setDecisionStyle(personality.decision_style || 'human_approved');
      setConflictStyle(personality.conflict_style || 'peaceful');

      const { data: permsData, error: permsErr } = await supabase
        .from('agent_permissions')
        .select('*')
        .eq('agent_id', result.agent.id)
        .maybeSingle();
      if (permsErr) throw permsErr;

      if (permsData) {
        setAgentPerms(permsData);
        setPermsState({
          can_invite_guests: !!permsData.can_invite_guests,
          can_create_tasks: !!permsData.can_create_tasks,
          can_send_welcome_messages: !!permsData.can_send_welcome_messages,
          can_create_summaries: !!permsData.can_create_summaries,
          can_suggest_roles: !!permsData.can_suggest_roles,
          can_approve_members: !!permsData.can_approve_members,
          can_make_admins: !!permsData.can_make_admins,
          can_remove_members: !!permsData.can_remove_members,
          can_delete_community: !!permsData.can_delete_community,
          requires_human_approval_for_sensitive_actions: !!permsData.requires_human_approval_for_sensitive_actions,
        });
      }

      await refreshCommunity();

      toast({
        title: t.success,
        description: result.created ? ml.spiritCreatedToast : ml.pageTitle,
      });
    } catch (err: any) {
      console.error('Error ensuring Community Spirit Agent:', err);
      toast({
        variant: 'destructive',
        title: t.error,
        description: err?.message || ml.spiritRepairError,
      });
    } finally {
      setCreatingSpirit(false);
    }
  };

  // Live compiled prompt based on unsaved state
  const currentGeneratedPrompt = useMemo(() => {
    if (!spiritAgent) return '';
    return generateCommunitySpiritPrompt({
      agentName,
      communityName: activeCommunity?.name || '',
      mission: shortMission,
      goal30Days: spiritAgent.personality?.goal_30_days || '',
      valuesRules: spiritAgent.personality?.values_rules || '',
      tone,
      communicationStyle: commStyle,
      strictness,
      decisionStyle,
      conflictStyle,
      enabledModules: ['Steward', 'Memory/RAG', 'Tasks', 'Onboarding'],
      permissions: permsState,
    });
  }, [spiritAgent, agentName, activeCommunity, shortMission, tone, commStyle, strictness, decisionStyle, conflictStyle, permsState]);

  // Unsaved changes detection
  const hasUnsavedChanges = useMemo(() => {
    if (!spiritAgent) return false;
    const initialPersonality = spiritAgent.personality || {};
    const personalityDiff =
      shortMission !== (initialPersonality.mission || '') ||
      primaryLang !== (initialPersonality.language || 'uk') ||
      secondaryLangs !== (initialPersonality.secondary_languages || '') ||
      tone !== (initialPersonality.tone || 'warm') ||
      commStyle !== (initialPersonality.communication_style || 'friendly') ||
      strictness !== (initialPersonality.strictness || 'medium') ||
      decisionStyle !== (initialPersonality.decision_style || 'human_approved') ||
      conflictStyle !== (initialPersonality.conflict_style || 'peaceful') ||
      agentName !== (spiritAgent.name || '');

    if (personalityDiff) return true;

    if (!agentPerms) return false;
    const permsDiff =
      permsState.can_invite_guests !== !!agentPerms.can_invite_guests ||
      permsState.can_create_tasks !== !!agentPerms.can_create_tasks ||
      permsState.can_send_welcome_messages !== !!agentPerms.can_send_welcome_messages ||
      permsState.can_create_summaries !== !!agentPerms.can_create_summaries ||
      permsState.can_suggest_roles !== !!agentPerms.can_suggest_roles ||
      permsState.can_approve_members !== !!agentPerms.can_approve_members ||
      permsState.can_make_admins !== !!agentPerms.can_make_admins ||
      permsState.can_remove_members !== !!agentPerms.can_remove_members ||
      permsState.can_delete_community !== !!agentPerms.can_delete_community ||
      permsState.requires_human_approval_for_sensitive_actions !== !!agentPerms.requires_human_approval_for_sensitive_actions;

    return permsDiff;
  }, [spiritAgent, agentPerms, agentName, shortMission, primaryLang, secondaryLangs, tone, commStyle, strictness, decisionStyle, conflictStyle, permsState]);

  // Access control tabs filtering
  const visibleTabs = useMemo(() => {
    const isGuest = !userCommunityRole;
    const isAdmin = isCommunityAdmin;

    return (Object.entries(ml.tabs) as [string, string][]).filter(([key]) => {
      if (key === 'technical') return isAdmin;
      if (key === 'permissions' || key === 'approvals') return !isGuest;
      return true;
    });
  }, [userCommunityRole, isCommunityAdmin, ml.tabs]);

  const handleSaveSettings = async () => {
    if (!spiritAgent || !activeCommunityId || !isCommunityAdmin) return;
    setSaving(true);
    try {
      const updatedPersonality = {
        ...(spiritAgent.personality || {}),
        mission: shortMission,
        language: primaryLang,
        secondary_languages: secondaryLangs,
        tone,
        communication_style: commStyle,
        strictness,
        decision_style: decisionStyle,
        conflict_style: conflictStyle,
      };

      // 1. Update agents table
      const { error: agentUpdateErr } = await supabase
        .from('agents')
        .update({
          name: agentName,
          system_prompt: currentGeneratedPrompt,
          personality: updatedPersonality,
        })
        .eq('id', spiritAgent.id);

      if (agentUpdateErr) throw agentUpdateErr;

      // 2. Update permissions table
      if (agentPerms) {
        const { error: permsUpdateErr } = await supabase
          .from('agent_permissions')
          .update({
            ...permsState,
          })
          .eq('id', agentPerms.id);

        if (permsUpdateErr) throw permsUpdateErr;
      }

      toast({
        title: t.success,
        description: ml.toastSaved,
      });

      // Update state
      setSpiritAgent((prev: any) => ({
        ...prev,
        name: agentName,
        system_prompt: currentGeneratedPrompt,
        personality: updatedPersonality,
      }));
    } catch (err: any) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: t.error,
        description: err.message || ml.toastSaveError,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSummarizeMemory = async () => {
    if (!spiritAgent || !activeCommunityId) return;
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('agent_action_logs').insert({
        agent_id: spiritAgent.id,
        community_id: activeCommunityId,
        action_type: 'memory_summarization',
        action_payload: { trigger: 'manual', timestamp: new Date().toISOString() },
        status: 'executed',
        requested_by: userData.user?.id,
        executed_at: new Date().toISOString()
      });
      if (error) throw error;
      
      toast({
        title: t.success,
        description: ml.toastSummarized,
      });
      
      // refresh logs
      const { data: logsData } = await supabase
        .from('agent_action_logs')
        .select('*')
        .eq('agent_id', spiritAgent.id)
        .order('created_at', { ascending: false });
      if (logsData) {
        setActionLogs(logsData);
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: t.error,
        description: err.message,
      });
    }
  };

  const handleApproveAction = async (actionId: string) => {
    if (!isCommunityAdmin) {
      toast({
        variant: 'destructive',
        title: t.error,
        description: ml.notAdminBanner,
      });
      return;
    }

    const action = pendingApprovals.find(a => a.id === actionId);
    if (!action) return;

    try {
      const { data: userData } = await supabase.auth.getUser();

      if (action.isDb) {
        // Update database record
        const { error } = await supabase
          .from('agent_action_logs')
          .update({
            status: 'executed',
            approved_by: userData.user?.id,
            executed_at: new Date().toISOString()
          })
          .eq('id', actionId);
        if (error) throw error;
      } else {
        // For mock, insert a real action log showing execution
        const { error } = await supabase
          .from('agent_action_logs')
          .insert({
            agent_id: spiritAgent.id,
            community_id: activeCommunityId,
            action_type: action.action_type,
            action_payload: action.action_payload,
            status: 'executed',
            requested_by: userData.user?.id,
            approved_by: userData.user?.id,
            executed_at: new Date().toISOString()
          });
        if (error) throw error;
      }

      toast({
        title: t.success,
        description: language === 'uk' ? 'Дію успішно схвалено та виконано!' : 'Action successfully approved and executed!',
      });

      // Remove from pending list
      setPendingApprovals(prev => prev.filter(a => a.id !== actionId));

      // Reload action logs
      const { data: logsData } = await supabase
        .from('agent_action_logs')
        .select('*')
        .eq('agent_id', spiritAgent.id)
        .order('created_at', { ascending: false });
      if (logsData) {
        setActionLogs(logsData);
      }
    } catch (err: any) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: t.error,
        description: err.message,
      });
    }
  };

  const handleRejectAction = async (actionId: string) => {
    if (!isCommunityAdmin) {
      toast({
        variant: 'destructive',
        title: t.error,
        description: ml.notAdminBanner,
      });
      return;
    }

    const action = pendingApprovals.find(a => a.id === actionId);
    if (!action) return;

    try {
      const { data: userData } = await supabase.auth.getUser();

      if (action.isDb) {
        // Update database record
        const { error } = await supabase
          .from('agent_action_logs')
          .update({
            status: 'rejected',
            approved_by: userData.user?.id,
            executed_at: new Date().toISOString()
          })
          .eq('id', actionId);
        if (error) throw error;
      } else {
        // Insert a rejected action log
        const { error } = await supabase
          .from('agent_action_logs')
          .insert({
            agent_id: spiritAgent.id,
            community_id: activeCommunityId,
            action_type: action.action_type,
            action_payload: action.action_payload,
            status: 'rejected',
            requested_by: userData.user?.id,
            approved_by: userData.user?.id,
            executed_at: new Date().toISOString()
          });
        if (error) throw error;
      }

      toast({
        title: t.success,
        description: language === 'uk' ? 'Дію відхилено.' : 'Action rejected.',
      });

      // Remove from pending list
      setPendingApprovals(prev => prev.filter(a => a.id !== actionId));

      // Reload action logs
      const { data: logsData } = await supabase
        .from('agent_action_logs')
        .select('*')
        .eq('agent_id', spiritAgent.id)
        .order('created_at', { ascending: false });
      if (logsData) {
        setActionLogs(logsData);
      }
    } catch (err: any) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: t.error,
        description: err.message,
      });
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(currentGeneratedPrompt);
    toast({
      title: t.success,
      description: language === 'uk' ? 'Системний промпт скопійовано!' : 'System prompt copied!',
    });
  };

  const handleResetPrompt = () => {
    if (!isCommunityAdmin) return;
    setAgentName('Дух Спільноти');
    setTone('warm');
    setCommStyle('friendly');
    setStrictness('medium');
    setDecisionStyle('human_approved');
    setConflictStyle('peaceful');
    toast({
      title: t.success,
      description: language === 'uk' ? 'Параметри скинуто до значень за замовчуванням.' : 'Parameters reset to defaults.',
    });
  };

  const getAgentVoicePreview = () => {
    let greeting = "Вітаю!";
    let body = "Я допомагаю координувати нашу MicroDAO.";

    if (tone === 'playful') {
      greeting = "Привіт, друзі! 🤖✨";
      body = "Я ваш кишеньковий Дух Спільноти. Давайте творити великі справи разом!";
    } else if (tone === 'professional') {
      greeting = "Шановні колеги, вітаю.";
      body = "Я готовий надати звітність або структурувати задачі відповідно до наших регламентів.";
    } else if (tone === 'visionary') {
      greeting = "Вітаю, будівничі майбутнього! 🚀";
      body = "Наша місія — це орієнтир. Я тут, щоб допомогти нам рухатися вперед та досягати цілей.";
    } else if (tone === 'warm') {
      greeting = "Привіт! Радий бачити кожного з вас. 🤗";
      body = "Якщо потрібна допомога з завданнями чи правилами, просто запитайте мене. Я завжди поруч.";
    } else if (tone === 'direct') {
      greeting = "Привіт.";
      body = "Коротко про головне: задачі оновлено, чекаю ваших звітів.";
    } else if (tone === 'calm') {
      greeting = "Вітаю вас.";
      body = "Все під контролем. Давайте спокійно розглянемо поточний стан справ.";
    }

    if (commStyle === 'short') {
      body = body.slice(0, 50) + "...";
    } else if (commStyle === 'mentor') {
      body += " Пам'ятайте, що кожен крок наближає нас до спільного результату.";
    } else if (commStyle === 'facilitator') {
      body += " Які думки з цього приводу? Обговорімо у треді.";
    }

    return `"${greeting} ${body}"`;
  };

  const getAutonomyBadge = () => {
    if (decisionStyle === 'consensus') {
      return (
        <Badge variant="outline" className="border-indigo-500/20 text-indigo-400 bg-indigo-500/5 text-xs font-semibold">
          Consensus
        </Badge>
      );
    }
    if (decisionStyle === 'autonomous') {
      return (
        <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 bg-emerald-500/5 text-xs font-semibold">
          Autonomous
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-amber-500/20 text-amber-400 bg-amber-500/5 text-xs font-semibold">
        Supervised Admin
      </Badge>
    );
  };

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'owner':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'admin':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'member':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default:
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!activeCommunityId) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <Card className="p-8 border-slate-800 bg-slate-950/20 backdrop-blur-md glass-panel">
          <Bot className="h-12 w-12 mx-auto text-indigo-400 mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-slate-200 mb-2">{ml.pageTitle}</h2>
          <p className="text-slate-400 text-sm mb-6">{ml.noActiveCommunity}</p>
        </Card>
      </div>
    );
  }

  if (!spiritAgent) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <Card className="p-8 border-amber-500/20 bg-amber-500/5 backdrop-blur-md glass-panel">
          <ShieldAlert className="h-12 w-12 mx-auto text-amber-400 mb-4 animate-pulse" />
          <h2 className="text-xl font-bold text-slate-200 mb-2">{ml.noSpiritAgent}</h2>
          <p className="text-slate-400 text-sm mb-6">{ml.repairDesc}</p>
          <Button onClick={handleEnsureCommunitySpirit} disabled={creatingSpirit} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold shadow-md">
            {creatingSpirit ? (
              <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4 shrink-0" />
            )}
            {ml.createAgentBtn}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl text-left sovereign-page-bg min-h-screen text-foreground space-y-6">
      
      {/* ── Page Header / Cockpit Status Card ── */}
      <div className="glass-panel-strong rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">{ml.pageTitle}</h1>
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 bg-indigo-500/5 font-mono text-xs">
              {spiritAgent.name}
            </Badge>
            {hasUnsavedChanges && (
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse text-[10px]">
                {ml.unsavedBadge}
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
            <span>MicroDAO: <span className="font-semibold text-slate-200">{activeCommunity?.name}</span></span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              {ml.roleLabel}: 
              <Badge variant="outline" className={`text-[10px] uppercase ${getRoleColor(userCommunityRole)}`}>
                {userCommunityRole || 'guest'}
              </Badge>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              {ml.autonomyLabel}: {getAutonomyBadge()}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <Button 
            variant="outline" 
            onClick={() => navigate('/chats')}
            className="text-xs bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200 h-10 px-4 glass-button-secondary font-semibold gap-1.5"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{ml.actionTalk}</span>
          </Button>

          {isCommunityAdmin && (
            <Button 
              disabled={saving || !hasUnsavedChanges} 
              onClick={handleSaveSettings}
              className={`h-10 px-5 font-semibold text-xs flex items-center gap-2 shadow-md transition-all duration-200 ${
                hasUnsavedChanges 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
              <span>{ml.saveBtn}</span>
            </Button>
          )}

          <Button 
            variant="ghost" 
            onClick={() => setActiveTab('actionLog')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold h-10 px-3"
          >
            {ml.actionLogs}
          </Button>
        </div>
      </div>

      {!isCommunityAdmin && (
        <div className="p-3 bg-amber-500/5 border border-amber-500/20 text-amber-300 text-xs rounded-xl flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{ml.notAdminBanner}</span>
        </div>
      )}

      {/* ── Main Tabbed Panel ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        
        {/* Navigation list */}
        <div className="border-b border-slate-800">
          <TabsList className="bg-transparent h-auto p-0 flex flex-wrap gap-1 justify-start">
            {visibleTabs.map(([key, label]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="bg-transparent text-slate-400 border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 rounded-none px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* 1. PROFILE TAB */}
        <TabsContent value="profile" className="space-y-4 outline-none">
          <Card className="glass-panel border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-md font-bold text-slate-200">{ml.tabs.profile}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="agentName" className="text-xs text-slate-300 font-semibold">{ml.profileTab.agentName}</Label>
                  <Input
                    id="agentName"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    disabled={!isCommunityAdmin}
                    className="bg-slate-900/50 border-slate-800 text-slate-100 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="communityName" className="text-xs text-slate-300 font-semibold">{ml.profileTab.communityName}</Label>
                  <Input
                    id="communityName"
                    value={activeCommunity?.name || ''}
                    disabled
                    className="bg-slate-900/35 border-slate-800/50 text-slate-500 text-xs"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="shortMission" className="text-xs text-slate-300 font-semibold">{ml.profileTab.shortMission}</Label>
                <Textarea
                  id="shortMission"
                  value={shortMission}
                  onChange={(e) => setShortMission(e.target.value)}
                  disabled={!isCommunityAdmin}
                  rows={4}
                  className="bg-slate-900/50 border-slate-800 text-slate-100 text-xs resize-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="primaryLang" className="text-xs text-slate-300 font-semibold">{ml.profileTab.primaryLang}</Label>
                  <Select
                    value={primaryLang}
                    onValueChange={setPrimaryLang}
                    disabled={!isCommunityAdmin}
                  >
                    <SelectTrigger className="bg-slate-900/50 border-slate-800 text-xs text-slate-100 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                      <SelectItem value="uk">Ukrainian (Українська)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ru">Russian (Русский)</SelectItem>
                      <SelectItem value="es">Spanish (Español)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="secondaryLangs" className="text-xs text-slate-300 font-semibold">{ml.profileTab.secondaryLangs}</Label>
                  <Input
                    id="secondaryLangs"
                    placeholder="EN, ES..."
                    value={secondaryLangs}
                    onChange={(e) => setSecondaryLangs(e.target.value)}
                    disabled={!isCommunityAdmin}
                    className="bg-slate-900/50 border-slate-800 text-slate-100 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. PERSONALITY TAB */}
        <TabsContent value="personality" className="space-y-4 outline-none">
          <Card className="glass-panel border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-md font-bold text-slate-200">{ml.tabs.personality}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tone" className="text-xs text-slate-300 font-semibold">{ml.personalityTab.tone}</Label>
                  <Select
                    value={tone}
                    onValueChange={setTone}
                    disabled={!isCommunityAdmin}
                  >
                    <SelectTrigger className="bg-slate-900/50 border-slate-800 text-xs text-slate-100 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                      <SelectItem value="warm">{ml.personalityTab.tones.warm}</SelectItem>
                      <SelectItem value="professional">{ml.personalityTab.tones.professional}</SelectItem>
                      <SelectItem value="creative">{ml.personalityTab.tones.creative}</SelectItem>
                      <SelectItem value="calm">{ml.personalityTab.tones.calm}</SelectItem>
                      <SelectItem value="direct">{ml.personalityTab.tones.direct}</SelectItem>
                      <SelectItem value="visionary">{ml.personalityTab.tones.visionary}</SelectItem>
                      <SelectItem value="playful">{ml.personalityTab.tones.playful}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="commStyle" className="text-xs text-slate-300 font-semibold">{ml.personalityTab.commStyle}</Label>
                  <Select
                    value={commStyle}
                    onValueChange={setCommStyle}
                    disabled={!isCommunityAdmin}
                  >
                    <SelectTrigger className="bg-slate-900/50 border-slate-800 text-xs text-slate-100 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                      <SelectItem value="friendly">{ml.personalityTab.styles.friendly}</SelectItem>
                      <SelectItem value="short">{ml.personalityTab.styles.short}</SelectItem>
                      <SelectItem value="detailed">{ml.personalityTab.styles.detailed}</SelectItem>
                      <SelectItem value="mentor">{ml.personalityTab.styles.mentor}</SelectItem>
                      <SelectItem value="operator">{ml.personalityTab.styles.operator}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="strictness" className="text-xs text-slate-300 font-semibold">{ml.personalityTab.strictness}</Label>
                  <Select
                    value={strictness}
                    onValueChange={setStrictness}
                    disabled={!isCommunityAdmin}
                  >
                    <SelectTrigger className="bg-slate-900/50 border-slate-800 text-xs text-slate-100 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                      <SelectItem value="low">{ml.personalityTab.strictnessLevels.low}</SelectItem>
                      <SelectItem value="medium">{ml.personalityTab.strictnessLevels.medium}</SelectItem>
                      <SelectItem value="high">{ml.personalityTab.strictnessLevels.high}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="decisionStyle" className="text-xs text-slate-300 font-semibold">{ml.personalityTab.decisionStyle}</Label>
                  <Select
                    value={decisionStyle}
                    onValueChange={setDecisionStyle}
                    disabled={!isCommunityAdmin}
                  >
                    <SelectTrigger className="bg-slate-900/50 border-slate-800 text-xs text-slate-100 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                      <SelectItem value="consensus">{ml.personalityTab.decisionStyles.consensus}</SelectItem>
                      <SelectItem value="autonomous">{ml.personalityTab.decisionStyles.autonomous}</SelectItem>
                      <SelectItem value="human_approved">{ml.personalityTab.decisionStyles.human_approved}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="conflictStyle" className="text-xs text-slate-300 font-semibold">{ml.personalityTab.conflictStyle}</Label>
                  <Input
                    id="conflictStyle"
                    value={conflictStyle}
                    onChange={(e) => setConflictStyle(e.target.value)}
                    disabled={!isCommunityAdmin}
                    className="bg-slate-900/50 border-slate-800 text-slate-100 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Live voice preview */}
              <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/25 space-y-2">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <Play className="h-3.5 w-3.5 fill-indigo-400" />
                  {ml.personalityTab.previewTitle}
                </span>
                <p className="text-sm italic text-slate-200 leading-relaxed font-medium">
                  {getAgentVoicePreview()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. MEMORY TAB */}
        <TabsContent value="memory" className="space-y-4 outline-none">
          <Card className="glass-panel border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-md font-bold text-slate-200">{ml.tabs.memory}</CardTitle>
              <CardDescription className="text-xs text-slate-400">{ml.memoryTab.intro}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-xs leading-relaxed text-slate-300 space-y-2">
                <span className="font-semibold text-indigo-300">{ml.memoryTab.summaryTitle}</span>
                <p>
                  {shortMission 
                    ? `Місія: ${shortMission}. Рівень суворості: ${strictness}. Конфігурація мов: ${primaryLang} (${secondaryLangs || 'немає додаткових мов'}).`
                    : 'Памʼять пуста. Перейдіть у вкладку Профіль, щоб налаштувати місію та цілі спільноти.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate('/knowledge-base')}
                  className="text-xs bg-slate-900 border-slate-800 hover:bg-slate-800 text-indigo-300 gap-1.5 h-10 px-4 glass-button-secondary font-semibold"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {ml.memoryTab.kbLink}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  disabled={!isCommunityAdmin}
                  onClick={() => navigate('/knowledge-base')}
                  className="text-xs bg-slate-900 border-slate-800 hover:bg-slate-800 text-indigo-300 gap-1.5 h-10 px-4 glass-button-secondary font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {ml.memoryTab.addDoc}
                </Button>
                <Button 
                  size="sm" 
                  disabled={!isCommunityAdmin}
                  onClick={handleSummarizeMemory}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5 h-10 px-4 shadow-md"
                >
                  <Zap className="h-3.5 w-3.5 animate-pulse" />
                  {ml.memoryTab.summarizeBtn}
                </Button>
              </div>

              <div className="border-t border-slate-900 pt-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-300">{ml.memoryTab.futureSources}</h4>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                  {ml.memoryTab.sourcesList.map((src: string, index: number) => (
                    <li key={index}>{src}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. MODULES TAB */}
        <TabsContent value="modules" className="space-y-6 outline-none">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300">{ml.modulesTab.availableTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <Card className="glass-panel p-5 flex gap-4 items-start relative hover:border-emerald-500/20 transition-all duration-200">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-100">{ml.modulesTab.stewardName}</span>
                    <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-400 border-green-500/20 uppercase font-black">Active</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{ml.modulesTab.stewardDesc}</p>
                </div>
              </Card>

              <Card className="glass-panel p-5 flex gap-4 items-start relative hover:border-emerald-500/20 transition-all duration-200">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-100">{ml.modulesTab.memoryName}</span>
                    <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-400 border-green-500/20 uppercase font-black">Active</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{ml.modulesTab.memoryDesc}</p>
                </div>
              </Card>

              <Card className="glass-panel p-5 flex gap-4 items-start relative hover:border-emerald-500/20 transition-all duration-200">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <FolderPlus className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-100">{ml.modulesTab.taskName}</span>
                    <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-400 border-green-500/20 uppercase font-black">Active</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{ml.modulesTab.taskDesc}</p>
                </div>
              </Card>

              <Card className="glass-panel p-5 flex gap-4 items-start relative hover:border-emerald-500/20 transition-all duration-200">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <UserPlus className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-100">{ml.modulesTab.onboardingName}</span>
                    <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-400 border-green-500/20 uppercase font-black">Active</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{ml.modulesTab.onboardingDesc}</p>
                </div>
              </Card>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400">{ml.modulesTab.comingTitle}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {['messenger', 'meeting', 'digest', 'bridge'].map((key) => {
                const info = ml.modulesTab.modulesList[key as keyof typeof ml.modulesTab.modulesList];
                return (
                  <Card key={key} className="glass-card border-slate-900 p-4">
                    <span className="text-xs font-bold text-slate-200">{info.name}</span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">{info.desc}</p>
                    <Badge variant="outline" className="text-[8px] bg-indigo-500/5 text-indigo-300 border-indigo-500/10 mt-2.5 font-bold uppercase tracking-wider">Soon</Badge>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400">{ml.modulesTab.roadmapTitle}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {['governance', 'treasury', 'wallet', 'tokenFactory', 'tokenomics'].map((key) => {
                const info = ml.modulesTab.modulesList[key as keyof typeof ml.modulesTab.modulesList];
                return (
                  <Card key={key} className="glass-card border-slate-900 p-3.5">
                    <span className="text-xs font-bold text-slate-300">{info.name}</span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">{info.desc}</p>
                    <Badge variant="outline" className="text-[8px] bg-slate-900 text-slate-400 border-slate-800 mt-2.5 font-semibold">Roadmap</Badge>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400">{ml.modulesTab.futureTitle}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {['devAgents', 'marketplace', 'e2ee', 'secondMe'].map((key) => {
                const info = ml.modulesTab.modulesList[key as keyof typeof ml.modulesTab.modulesList];
                return (
                  <Card key={key} className="glass-card border-slate-900 p-3.5">
                    <span className="text-xs font-bold text-slate-300">{info.name}</span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">{info.desc}</p>
                    <Badge variant="outline" className="text-[8px] bg-slate-900 text-slate-500 border-slate-800/50 mt-2.5 font-semibold">Research</Badge>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* 5. PERMISSIONS TAB */}
        <TabsContent value="permissions" className="space-y-4 outline-none">
          <Card className="glass-panel border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-md font-bold text-slate-200">{ml.tabs.permissions}</CardTitle>
              <CardDescription className="text-xs text-slate-400">{ml.permissionsTab.intro}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">{ml.permissionsTab.safeTitle}</h4>
                <div className="space-y-3.5 bg-slate-950/20 p-5 rounded-2xl border border-slate-900">
                  {['can_invite_guests', 'can_create_tasks', 'can_send_welcome_messages', 'can_create_summaries', 'can_suggest_roles'].map((key) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <Label htmlFor={key} className="text-xs font-semibold text-slate-300 flex-1 leading-normal cursor-pointer">
                        {ml.permissionsTab.fields[key as keyof typeof ml.permissionsTab.fields]}
                      </Label>
                      <Switch
                        id={key}
                        checked={(permsState as any)[key]}
                        onCheckedChange={(val) => {
                          if (isCommunityAdmin) {
                            setPermsState(prev => ({ ...prev, [key]: val }));
                          }
                        }}
                        disabled={!isCommunityAdmin}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-900 pt-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">{ml.permissionsTab.sensitiveTitle}</h4>
                <div className="space-y-3.5 bg-slate-950/20 p-5 rounded-2xl border border-slate-900">
                  {['can_approve_members', 'can_make_admins', 'can_remove_members', 'can_delete_community', 'requires_human_approval_for_sensitive_actions'].map((key) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <Label htmlFor={key} className="text-xs font-semibold text-slate-300 leading-normal block cursor-pointer">
                          {ml.permissionsTab.fields[key as keyof typeof ml.permissionsTab.fields]}
                        </Label>
                        <span className="text-[10px] text-amber-400/85 font-medium flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="h-3 w-3 text-amber-400" />
                          {ml.permissionsTab.requiresApprovalLabel}
                        </span>
                      </div>
                      <Switch
                        id={key}
                        checked={(permsState as any)[key]}
                        onCheckedChange={(val) => {
                          if (isCommunityAdmin) {
                            setPermsState(prev => ({ ...prev, [key]: val }));
                          }
                        }}
                        disabled={!isCommunityAdmin}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. APPROVALS TAB [NEW] */}
        <TabsContent value="approvals" className="space-y-4 outline-none">
          <Card className="glass-panel border-slate-800/80">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-md font-bold text-slate-200">{ml.approvalsTab.title}</CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-1">{ml.approvalsTab.subtitle}</CardDescription>
              </div>
              <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/25 w-fit">
                {ml.approvalsTab.demoBadge}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingApprovals.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  {ml.approvalsTab.emptyState}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingApprovals.map((act) => (
                    <Card key={act.id} className="glass-card p-5 border-slate-900 flex flex-col justify-between hover:border-slate-800 transition-all duration-200">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-300">
                            {ml.approvalsTab.actionTypes[act.action_type as keyof typeof ml.approvalsTab.actionTypes] || act.action_type}
                          </span>
                          
                          <Badge 
                            variant="outline" 
                            className={`text-[9px] uppercase font-bold tracking-wider ${
                              act.risk === 'sensitive'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : act.risk === 'medium'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-green-500/10 text-green-400 border-green-500/20'
                            }`}
                          >
                            {act.risk === 'sensitive' 
                              ? ml.approvalsTab.riskSensitive 
                              : act.risk === 'medium' 
                              ? ml.approvalsTab.riskMedium 
                              : ml.approvalsTab.riskSafe}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-slate-200 font-medium leading-relaxed">
                          {act.summary}
                        </p>
                        
                        <div className="bg-slate-950/30 p-2.5 rounded border border-slate-900 text-[10px] font-mono text-slate-400 overflow-x-auto">
                          {JSON.stringify(act.action_payload, null, 2)}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-900/60 justify-end">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleRejectAction(act.id)}
                          disabled={!isCommunityAdmin}
                          className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/5 font-semibold h-9 px-3"
                        >
                          {ml.approvalsTab.rejectBtn}
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveAction(act.id)}
                          disabled={!isCommunityAdmin}
                          className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-9 px-4 shadow-sm"
                        >
                          {ml.approvalsTab.approveBtn}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7. ACTION LOG TAB */}
        <TabsContent value="actionLog" className="space-y-4 outline-none">
          <Card className="glass-panel border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-md font-bold text-slate-200">{ml.tabs.actionLog}</CardTitle>
              <CardDescription className="text-xs text-slate-400">{ml.actionLogTab.intro}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-2.5 pr-4">{ml.actionLogTab.actionType}</th>
                      <th className="py-2.5 px-4">{ml.actionLogTab.status}</th>
                      <th className="py-2.5 px-4">{ml.actionLogTab.createdAt}</th>
                      <th className="py-2.5 px-4">{ml.actionLogTab.requestedBy}</th>
                      <th className="py-2.5 px-4">{ml.actionLogTab.payload}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actionLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500">
                          {t.chats.emptyState || 'Журнал дій пустий'}
                        </td>
                      </tr>
                    ) : (
                      actionLogs.map((log) => (
                        <tr key={log.id} className="border-b border-slate-900 text-slate-300 hover:bg-slate-900/10">
                          <td className="py-3 pr-4 font-semibold text-slate-200 capitalize">
                            {log.action_type === 'member_invitation'
                              ? 'Invite member'
                              : log.action_type === 'update_rules'
                              ? 'Update Rules'
                              : log.action_type === 'weekly_plan'
                              ? 'Weekly Plan'
                              : log.action_type === 'community_creation'
                              ? 'Community Genesis'
                              : log.action_type === 'memory_summarization'
                              ? 'Memory Summary'
                              : log.action_type}
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant="outline" 
                              className={
                                log.status === 'executed' || log.status === 'approved'
                                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                  : log.status === 'pending_approval'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : log.status === 'rejected'
                                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                  : 'bg-slate-800 text-slate-400'
                              }
                            >
                              {ml.actionLogTab.statuses[log.status as keyof typeof ml.actionLogTab.statuses] || log.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-slate-400 font-semibold">
                            System / Leader
                          </td>
                          <td className="py-3 px-4 max-w-[200px] truncate text-slate-400 font-mono text-[10px]" title={JSON.stringify(log.action_payload)}>
                            {JSON.stringify(log.action_payload)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 8. TECHNICAL TAB */}
        <TabsContent value="technical" className="space-y-4 outline-none">
          <Card className="glass-panel border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-md font-bold text-slate-200">{ml.tabs.technical}</CardTitle>
              <CardDescription className="text-xs text-slate-400">{ml.technicalTab.intro}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 text-amber-300 rounded-xl flex items-start gap-2 mb-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{ml.technicalTab.warningText}</span>
              </div>

              {/* LIVE COMPILED SYSTEM PROMPT Accordion */}
              <div className="border border-slate-800 bg-slate-950/20 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-3.5 font-bold text-slate-200 bg-slate-900/30">
                  <span className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-indigo-400" />
                    <span>{ml.technicalTab.sysPrompt}</span>
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleCopyPrompt}
                      className="text-xs h-8 bg-slate-900 border-slate-800 text-indigo-300 gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{ml.technicalTab.copyBtn}</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleResetPrompt}
                      className="text-xs h-8 bg-slate-900 border-slate-800 text-indigo-300 gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>{ml.technicalTab.resetBtn}</span>
                    </Button>
                  </div>
                </div>
                <div className="p-4 border-t border-slate-850 bg-slate-950/60 space-y-2">
                  <p className="text-slate-400 text-[11px] leading-normal">{ml.technicalTab.sysPromptDesc}</p>
                  <Textarea
                    readOnly
                    value={currentGeneratedPrompt}
                    rows={12}
                    className="bg-slate-950 border-slate-900 text-slate-300 font-mono text-[11px] resize-none focus:ring-0 focus:ring-offset-0"
                  />
                </div>
              </div>

              <details className="group border border-slate-850 bg-slate-900/30 rounded-xl overflow-hidden mt-3">
                <summary className="flex items-center justify-between p-3.5 font-bold text-slate-200 cursor-pointer select-none hover:bg-slate-900/50">
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-indigo-400" />
                    <span>{ml.technicalTab.webhookSetting}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 transition group-open:rotate-180 text-slate-400" />
                </summary>
                <div className="p-4 border-t border-slate-850 bg-slate-950/60 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-slate-300 font-semibold">{t.agents.labelType || 'Connection type'}</Label>
                      <Input
                        readOnly
                        value={spiritAgent.connection_type || 'msp'}
                        className="bg-slate-900 border-slate-850 text-slate-400 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-slate-300 font-semibold">{ml.technicalTab.endpointUrl}</Label>
                      <Input
                        readOnly
                        value={spiritAgent.endpoint_url || 'Internal (MSP)'}
                        className="bg-slate-900 border-slate-850 text-slate-400 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </details>

              <details className="group border border-slate-850 bg-slate-900/30 rounded-xl overflow-hidden mt-3">
                <summary className="flex items-center justify-between p-3.5 font-bold text-slate-200 cursor-pointer select-none hover:bg-slate-900/50">
                  <span className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-indigo-400" />
                    <span>{ml.technicalTab.rawConfig}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 transition group-open:rotate-180 text-slate-400" />
                </summary>
                <div className="p-4 border-t border-slate-850 bg-slate-950/60">
                  <pre className="bg-slate-950 p-3 rounded border border-slate-900 font-mono text-[10px] text-slate-400 overflow-x-auto">
                    {JSON.stringify(spiritAgent, null, 2)}
                  </pre>
                </div>
              </details>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
