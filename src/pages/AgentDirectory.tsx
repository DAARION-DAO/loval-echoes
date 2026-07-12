import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation, Language } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { PublicHeader } from '@/components/PublicHeader';
import { Helmet } from 'react-helmet-async';
import {
  Bot,
  Shield,
  Brain,
  Workflow,
  Calendar,
  Check,
  ArrowRight,
  Download,
  Sparkles,
  MessageSquare,
  Key,
  Users,
  CheckSquare,
  FileText,
  LayoutGrid,
  Bell,
  Network,
  User,
  Settings,
  Lock,
  Coins,
  ShieldCheck,
  Terminal,
  HelpCircle,
  Clock,
  Eye,
  ChevronDown,
  Wallet,
  CheckCircle2,
  Home,
} from 'lucide-react';

/* ── Localized Text Mapping ── */
const localTexts = {
  uk: {
    heroBadge: 'Community Spirit Agent',
    heroTitle: 'Агентна система MicroDAO',
    heroSubtitle: 'Кожна MicroDAO має власного Духа Спільноти — головного агента, який памʼятає контекст, координує учасників, підключає модулі та діє в межах правил вашої спільноти.',
    ctaCreateMicroDao: 'Створити MicroDAO з Духом Спільноти',
    ctaViewModules: 'Переглянути модулі агентів',
    
    coreCardTitle: 'Дух Спільноти',
    coreCardLabel: 'Головний агент MicroDAO',
    coreCardDesc: 'Дух Спільноти — це головний агент вашої MicroDAO. Він памʼятає місію, правила, ролі, домовленості, задачі, документи й допомагає координувати дії спільноти.',
    coreCardCtaConfigure: 'Налаштувати Дух Спільноти',
    coreCardCtaCreate: 'Створити MicroDAO',
    coreCardCtaConfigureMy: 'Налаштувати агента моєї MicroDAO',
    
    customTitle: 'Кожна MicroDAO налаштовує свого агента під себе',
    customDesc: 'Один шаблон Духа Спільноти може працювати по-різному для ОСББ, фермерського кооперативу, R&D-групи, мистецької комуни або DAO-мережі. Спільнота визначає місію, тон, правила, модулі та рівень автономії агента.',
    
    modulesTitle: 'Модулі, які підключаються до Духа Спільноти',
    modulesSubtitle: 'Модулі розширюють можливості агента конкретної MicroDAO. Власник або адміністратор вмикає потрібні модулі й задає дозволи.',
    
    ctaConnect: 'Підключити до MicroDAO',
    ctaConfigure: 'Налаштувати модуль',
    ctaRoadmap: 'У roadmap',
    ctaFuture: 'Планується',
    
    statusAvailable: 'Доступно зараз',
    statusComing: 'Готується',
    statusRoadmap: 'Roadmap',
    statusFuture: 'У майбутньому',
    
    labelPermissions: 'Необхідні дозволи',
    labelApproval: 'Підтвердження людини',
    labelActions: 'Можливі дії',
    labelBehavior: 'Поведінка агента',
    labelPromptToggle: 'Технічні деталі (System Prompt)',
    approvalRequired: 'Так',
    approvalNotRequired: 'Ні',
    
    customDimension1Title: '1. Місія спільноти',
    customDimension1Desc: 'Агент узгоджує всі рішення та відповіді з головною метою спільноти.',
    customDimension2Title: '2. Тон і стиль спілкування',
    customDimension2Desc: 'Від офіційно-ділового для ОСББ до дружнього чи творчого для мистецької комуни.',
    customDimension3Title: '3. Мови спілкування',
    customDimension3Desc: 'Підтримка локальних і міжнародних мов для взаємодії з кожним учасником.',
    customDimension4Title: '4. Ролі та права доступу',
    customDimension4Desc: 'Кому агент може давати звіти, а хто має доступ до налаштувань.',
    customDimension5Title: '5. Рівень автономії',
    customDimension5Desc: 'Що агент може робити автоматично, а де потрібне затвердження спільноти.',
    customDimension6Title: '6. Правила та межі поведінки',
    customDimension6Desc: 'Фільтри спілкування, правила модерації та безпекові обмеження.',
    customDimension7Title: '7. Дозволені дії та інструменти',
    customDimension7Desc: 'Створення завдань, надсилання повідомлень, підготовка транзакцій.',
    customDimension8Title: '8. Памʼять і база знань',
    customDimension8Desc: 'Локальні документи, історія чатів та зовнішні підключені бази.',
    customDimension9Title: '9. Казна та фінансові ліміти',
    customDimension9Desc: 'На які суми агент може формувати пропозиції виплат без адміна.',
    customDimension10Title: '10. Підключені модулі',
    customDimension10Desc: 'Набір під-агентів, які розширюють можливості головного Духа Спільноти.',

    catAll: 'Всі модулі',
    catCore: 'Core / Системні',
    catOps: 'Координація',
    catKnowledge: 'Знання',
    catDao: 'DAO / Управління',
    catDev: 'Розробники / Мережа',
    catPersonal: 'Персональні',

    profilesTitle: 'Приклади профілів спільнот',
    profileHoaTitle: 'ОСББ',
    profileHoaDesc: 'правила будинку, заявки, голосування, ремонтний фонд',
    profileCoopTitle: 'Фермерський кооператив',
    profileCoopDesc: 'поставки, закупівлі, сезонні задачі, спільні рішення',
    profileRandDTitle: 'R&D-група',
    profileRandDDesc: 'документи, дослідження, зустрічі, база знань',
    profileArtTitle: 'Мистецька спільнота',
    profileArtDesc: 'події, заявки, гранти, публікації, координація учасників',
  },
  en: {
    heroBadge: 'Community Spirit Agent',
    heroTitle: 'MicroDAO Agent System',
    heroSubtitle: 'Every MicroDAO has its own Community Spirit Agent — the primary agent that remembers context, coordinates members, connects modules, and acts within community rules.',
    ctaCreateMicroDao: 'Create MicroDAO with Community Spirit',
    ctaViewModules: 'Explore agent modules',
    
    coreCardTitle: 'Community Spirit',
    coreCardLabel: 'Primary MicroDAO Agent',
    coreCardDesc: 'The Community Spirit Agent is the primary agent of your MicroDAO. It remembers the mission, rules, roles, agreements, tasks, and documents, helping to coordinate community actions.',
    coreCardCtaConfigure: 'Configure Community Spirit',
    coreCardCtaCreate: 'Create MicroDAO',
    coreCardCtaConfigureMy: 'Configure My MicroDAO Agent',
    
    customTitle: 'Each MicroDAO configures its agent for its needs',
    customDesc: 'A single Community Spirit template can work differently for a homeowners association, a farmers cooperative, an R&D group, an art community, or a DAO network. The community defines the mission, tone, rules, modules, and autonomy level of the agent.',
    
    modulesTitle: 'Modules Connected to Community Spirit',
    modulesSubtitle: 'Modules extend the capabilities of a specific MicroDAO agent. The owner or administrator enables required modules and sets permissions.',
    
    ctaConnect: 'Connect to MicroDAO',
    ctaConfigure: 'Configure Module',
    ctaRoadmap: 'Roadmap',
    ctaFuture: 'Planned',
    
    statusAvailable: 'Available Now',
    statusComing: 'Coming Soon',
    statusRoadmap: 'Roadmap',
    statusFuture: 'Future',
    
    labelPermissions: 'Permissions Required',
    labelApproval: 'Human Approval Required',
    labelActions: 'Example Actions',
    labelBehavior: 'Agent Behavior',
    labelPromptToggle: 'Technical Details (System Prompt)',
    approvalRequired: 'Yes',
    approvalNotRequired: 'No',
    
    customDimension1Title: '1. Community Mission',
    customDimension1Desc: 'The agent aligns all decisions and answers with the main goal of the community.',
    customDimension2Title: '2. Tone and Style',
    customDimension2Desc: 'From official business style for HOAs to friendly or creative for art communes.',
    customDimension3Title: '3. Languages',
    customDimension3Desc: 'Support for local and international languages to interact with every member.',
    customDimension4Title: '4. Roles and Permissions',
    customDimension4Desc: 'Who the agent can give reports to, and who has access to configuration.',
    customDimension5Title: '5. Autonomy Level',
    customDimension5Desc: 'What the agent can do automatically and where community approval is required.',
    customDimension6Title: '6. Rules and Boundaries',
    customDimension6Desc: 'Communication filters, moderation rules, and security restrictions.',
    customDimension7Title: '7. Allowed Actions & Tools',
    customDimension7Desc: 'Creating tasks, sending notifications, preparing transactions.',
    customDimension8Title: '8. Memory & Knowledge',
    customDimension8Desc: 'Local documents, chat history, and external connected databases.',
    customDimension9Title: '9. Treasury & Limits',
    customDimension9Desc: 'For what amounts the agent can draft payout proposals without admin.',
    customDimension10Title: '10. Connected Modules',
    customDimension10Desc: 'A set of sub-agents that expand the capabilities of the primary Community Spirit.',

    catAll: 'All Modules',
    catCore: 'Core / System',
    catOps: 'Coordination',
    catKnowledge: 'Knowledge',
    catDao: 'DAO / Governance',
    catDev: 'Builder / Network',
    catPersonal: 'Personal',

    profilesTitle: 'Example Community Profiles',
    profileHoaTitle: 'Condominium (HOA)',
    profileHoaDesc: 'house rules, applications, voting, maintenance fund',
    profileCoopTitle: 'Farmers Cooperative',
    profileCoopDesc: 'supplies, purchases, seasonal tasks, joint decisions',
    profileRandDTitle: 'R&D Group',
    profileRandDDesc: 'documents, research, meetings, knowledge base',
    profileArtTitle: 'Art Community',
    profileArtDesc: 'events, applications, grants, publications, member coordination',
  },
  ru: {
    heroBadge: 'Community Spirit Agent',
    heroTitle: 'Агентная система MicroDAO',
    heroSubtitle: 'Каждая MicroDAO имеет собственного Духа Сообщества — главного агента, который помнит контекст, координирует участников, подключает модули и действует в рамках правил сообщества.',
    ctaCreateMicroDao: 'Создать MicroDAO с Духом Сообщества',
    ctaViewModules: 'Просмотреть модули агентов',
    
    coreCardTitle: 'Дух Сообщества',
    coreCardLabel: 'Главный агент MicroDAO',
    coreCardDesc: 'Дух Сообщества — это главный агент вашей MicroDAO. Он помнит миссию, правила, роли, договоренности, задачи, документы и помогает координировать действия сообщества.',
    coreCardCtaConfigure: 'Настроить Дух Сообщества',
    coreCardCtaCreate: 'Создать MicroDAO',
    coreCardCtaConfigureMy: 'Настроить агента моей MicroDAO',
    
    customTitle: 'Каждая MicroDAO настраивает своего агента под себя',
    customDesc: 'Один шаблон Духа Сообщества может работать по-разному для ОСББ, фермерского кооператива, R&D-группы, художественной коммуны или DAO-сети. Сообщество определяет миссию, тон, правила, модули и уровень автономии агента.',
    
    modulesTitle: 'Модули, подключаемые к Духу Сообщества',
    modulesSubtitle: 'Модули расширяют возможности агента конкретной MicroDAO. Владелец или администратор включает нужные модули и задает разрешения.',
    
    ctaConnect: 'Подключить к MicroDAO',
    ctaConfigure: 'Настроить модуль',
    ctaRoadmap: 'В roadmap',
    ctaFuture: 'Планируется',
    
    statusAvailable: 'Доступно сейчас',
    statusComing: 'Готовится',
    statusRoadmap: 'Roadmap',
    statusFuture: 'В будущем',
    
    labelPermissions: 'Необходимые разрешения',
    labelApproval: 'Подтверждение человека',
    labelActions: 'Возможные действия',
    labelBehavior: 'Поведение агента',
    labelPromptToggle: 'Технические детали (System Prompt)',
    approvalRequired: 'Да',
    approvalNotRequired: 'Нет',
    
    customDimension1Title: '1. Миссия сообщества',
    customDimension1Desc: 'Агент согласовывает все решения и ответы с главной целью сообщества.',
    customDimension2Title: '2. Тон и стиль общения',
    customDimension2Desc: 'От официально-делового для ОСББ до дружеского или творческого для арт-коммуны.',
    customDimension3Title: '3. Языки общения',
    customDimension3Desc: 'Поддержка локальных и международных языков для взаимодействия с каждым участником.',
    customDimension4Title: '4. Роли и права доступа',
    customDimension4Desc: 'Кому агент может давать отчеты, а кто имеет доступ к настройкам.',
    customDimension5Title: '5. Уровень автономии',
    customDimension5Desc: 'Что агент может делать автоматически, а где требуется утверждение сообщества.',
    customDimension6Title: '6. Правила и границы поведения',
    customDimension6Desc: 'Фильтры общения, правила модерации и ограничения безопасности.',
    customDimension7Title: '7. Разрешенные действия и инструменты',
    customDimension7Desc: 'Создание задач, отправка сообщений, подготовка транзакций.',
    customDimension8Title: '8. Память и база знаний',
    customDimension8Desc: 'Локальные документы, история чатов и внешние подключенные базы.',
    customDimension9Title: '9. Казна и финансовые лимиты',
    customDimension9Desc: 'На какие суммы агент может формировать предложения выплат без админа.',
    customDimension10Title: '10. Подключенные модули',
    customDimension10Desc: 'Набор под-агентов, которые расширяют возможности главного Духа Сообщества.',

    catAll: 'Все модули',
    catCore: 'Core / Системные',
    catOps: 'Координация',
    catKnowledge: 'Знания',
    catDao: 'DAO / Управление',
    catDev: 'Разработчики / Сеть',
    catPersonal: 'Персональные',

    profilesTitle: 'Примеры профилей сообществ',
    profileHoaTitle: 'ОСББ (ТСЖ)',
    profileHoaDesc: 'правила дома, заявки, голосования, ремонтный фонд',
    profileCoopTitle: 'Фермерский кооператив',
    profileCoopDesc: 'поставки, закупки, сезонные задачи, совместные решения',
    profileRandDTitle: 'R&D-группа',
    profileRandDDesc: 'документы, исследования, встречи, база знаний',
    profileArtTitle: 'Арт-сообщество',
    profileArtDesc: 'события, заявки, гранты, публикации, координация участников',
  },
  es: {
    heroBadge: 'Community Spirit Agent',
    heroTitle: 'Sistema de agentes MicroDAO',
    heroSubtitle: 'Cada MicroDAO tiene su propio Agente Espíritu de Comunidad: el agente principal que recuerda el contexto, coordina miembros, conecta módulos y actúa dentro de las reglas de la comunidad.',
    ctaCreateMicroDao: 'Crear MicroDAO con Espíritu Comunitario',
    ctaViewModules: 'Ver módulos de agentes',
    
    coreCardTitle: 'Espíritu Comunitario',
    coreCardLabel: 'Agente Principal de MicroDAO',
    coreCardDesc: 'El Agente Espíritu de Comunidad es el agente principal de tu MicroDAO. Recuerda la misión, reglas, roles, acuerdos, tareas y documentos, ayudando a coordinar las acciones comunitarias.',
    coreCardCtaConfigure: 'Configurar Espíritu Comunitario',
    coreCardCtaCreate: 'Crear MicroDAO',
    coreCardCtaConfigureMy: 'Configurar el agente de mi MicroDAO',
    
    customTitle: 'Cada MicroDAO personaliza su propio agente',
    customDesc: 'Una sola plantilla de Espíritu Comunitario puede funcionar de manera diferente para una asociación de propietarios, una cooperativa agrícola, un grupo de R&D, una comunidad artística o una red DAO. La comunidad define la misión, el tono, las reglas, los módulos y el nivel de autonomía del agente.',
    
    modulesTitle: 'Módulos conectados al Espíritu Comunitario',
    modulesSubtitle: 'Los módulos extienden las capacidades de un agente MicroDAO específico. El propietario o administrador habilita los módulos requeridos y establece permisos.',
    
    ctaConnect: 'Conectar a MicroDAO',
    ctaConfigure: 'Configurar módulo',
    ctaRoadmap: 'En roadmap',
    ctaFuture: 'Planeado',
    
    statusAvailable: 'Disponible ahora',
    statusComing: 'Próximamente',
    statusRoadmap: 'Roadmap',
    statusFuture: 'Futuro',
    
    labelPermissions: 'Permisos requeridos',
    labelApproval: 'Aprobación humana requerida',
    labelActions: 'Acciones de ejemplo',
    labelBehavior: 'Comportamiento del agente',
    labelPromptToggle: 'Detalles técnicos (System Prompt)',
    approvalRequired: 'Sí',
    approvalNotRequired: 'No',
    
    customDimension1Title: '1. Misión de la comunidad',
    customDimension1Desc: 'El agente alinea todas las decisiones y respuestas con el objetivo principal de la comunidad.',
    customDimension2Title: '2. Tono y estilo',
    customDimension2Desc: 'Desde el estilo comercial oficial para las asociaciones hasta el amistoso o creativo para las comunas de arte.',
    customDimension3Title: '3. Idiomas',
    customDimension3Desc: 'Soporte para idiomas locales e internacionales para interactuar con cada miembro.',
    customDimension4Title: '4. Roles y permisos',
    customDimension4Desc: 'A quién puede dar informes el agente y quién tiene acceso a la configuración.',
    customDimension5Title: '5. Nivel de autonomía',
    customDimension5Desc: 'Qué puede hacer el agente automáticamente y dónde se requiere la aprobación de la comunidad.',
    customDimension6Title: '6. Reglas y límites',
    customDimension6Desc: 'Filtros de comunicación, reglas de moderación y restricciones de seguridad.',
    customDimension7Title: '7. Acciones y herramientas permitidas',
    customDimension7Desc: 'Creación de tareas, envío de notificaciones, preparación de transacciones.',
    customDimension8Title: '8. Memoria y conocimiento',
    customDimension8Desc: 'Documentos locales, historial de chat y bases de datos conectadas externas.',
    customDimension9Title: '9. Tesorería y límites',
    customDimension9Desc: 'Por qué montos el agente puede redactar propuestas de pago sin el administrador.',
    customDimension10Title: '10. Módulos conectados',
    customDimension10Desc: 'Un conjunto de subagentes que amplían las capacidades del Espíritu Comunitario principal.',

    catAll: 'Todos los módulos',
    catCore: 'Core / Sistema',
    catOps: 'Coordinación',
    catKnowledge: 'Conocimiento',
    catDao: 'DAO / Gobernanza',
    catDev: 'Desarrolladores / Red',
    catPersonal: 'Personal',

    profilesTitle: 'Ejemplos de perfiles de comunidad',
    profileHoaTitle: 'Condominio (HOA)',
    profileHoaDesc: 'reglas de la casa, solicitudes, votación, fondo de mantenimiento',
    profileCoopTitle: 'Cooperativa Agrícola',
    profileCoopDesc: 'suministros, compras, tareas estacionales, decisiones conjuntas',
    profileRandDTitle: 'Grupo de R&D',
    profileRandDDesc: 'documentos, investigación, reuniones, base de conocimientos',
    profileArtTitle: 'Comunidad Artística',
    profileArtDesc: 'eventos, solicitudes, subvenciones, publicaciones, coordinación de miembros',
  }
};

export default function AgentDirectory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeCommunity } = useActiveCommunity();
  const { t, language } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<'all' | 'core' | 'ops' | 'knowledge' | 'dao' | 'dev' | 'personal'>('all');
  const [expandedPromptIdx, setExpandedPromptIdx] = useState<number | null>(null);

  const texts = localTexts[language as Language] || localTexts.en;

  const handleCtaClick = () => {
    if (!user) {
      navigate('/auth?signup=true');
    } else if (activeCommunity) {
      navigate('/agents/manage');
    } else {
      navigate('/onboarding');
    }
  };

  const handleScrollToModules = () => {
    document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' });
  };

  const categories = [
    { id: 'all' as const, label: texts.catAll },
    { id: 'core' as const, label: texts.catCore },
    { id: 'ops' as const, label: texts.catOps },
    { id: 'knowledge' as const, label: texts.catKnowledge },
    { id: 'dao' as const, label: texts.catDao },
    { id: 'dev' as const, label: texts.catDev },
    { id: 'personal' as const, label: texts.catPersonal },
  ];

  // 21 Agent Modules
  const modules = [
    // Core / System
    {
      idx: 1,
      name: "Orchestrator Agent",
      catId: "core",
      category: texts.catCore,
      icon: Settings,
      status: "coming" as const,
      desc: {
        uk: "Маршрутизує запити між різними агентними модулями та інструментами, забезпечуючи злагоджену роботу всієї системи MicroDAO.",
        en: "Routes requests between different agent modules and tools, ensuring the smooth operation of the entire MicroDAO system.",
        ru: "Маршрутизирует запросы между различными агентными модулями и инструментами, обеспечивая слаженную работу всей системы MicroDAO.",
        es: "Enruta solicitudes entre diferentes módulos de agentes y herramientas, garantizando el funcionamiento fluido de todo el sistema MicroDAO."
      },
      permissions: "read.messages, write.messages, invoke.modules",
      approval: false,
      actions: {
        uk: "Аналіз контексту запиту, вибір відповідного модуля, передача параметрів виконання.",
        en: "Context analysis, target module selection, passing execution parameters."
      },
      behavior: {
        uk: "Повністю автоматичний фоновий маршрутизатор повідомлень.",
        en: "Fully automated background message router."
      },
      prompt: "ROLE: System router. Direct input request to best handling module based on capabilities."
    },
    {
      idx: 2,
      name: "Policy / Entitlements Agent",
      catId: "core",
      category: texts.catCore,
      icon: ShieldCheck,
      status: "roadmap" as const,
      desc: {
        uk: "Контролює виконання правил ролей, лімітів повідомлень, квот токенів та прав доступу учасників спільноти.",
        en: "Controls role rules execution, message limits, token quotas, and member access entitlements.",
        ru: "Контролирует выполнение правил ролей, лимитов сообщений, квот токенов и прав доступа участников сообщества.",
        es: "Controla la ejecución de reglas de roles, límites de mensajes, cuotas de tokens y permisos de acceso de miembros."
      },
      permissions: "read.roles, read.permissions, check.entitlements",
      approval: false,
      actions: {
        uk: "Перевірка доступу перед виконанням команди, аудит ролей.",
        en: "Access check before command execution, role auditing."
      },
      behavior: {
        uk: "Автоматична верифікація політик безпеки на лету.",
        en: "Automated on-the-fly verification of security policies."
      },
      prompt: "ROLE: Security auditor. Verify member permissions against system rules before executing action."
    },
    {
      idx: 3,
      name: "Identity / Onboarding Agent",
      catId: "core",
      category: texts.catCore,
      icon: User,
      status: "available" as const,
      desc: {
        uk: "Керує процесом реєстрації нових учасників, генерацією інвайтів, автоматичним призначенням ролей та прив'язкою гаманців.",
        en: "Manages registration of new members, invite generation, automated role assignment, and wallet linking.",
        ru: "Управляет процессом регистрации новых участников, генерацией инвайтов, автоматическим назначением ролей и привязкой кошельков.",
        es: "Gestiona el registro de nuevos miembros, generación de invitaciones, asignación automática de roles y vinculación de billeteras."
      },
      permissions: "create.invites, write.users, bind.wallets",
      approval: true,
      actions: {
        uk: "Створення інвайт-кодів, видача ролі гостя/учасника, верифікація акаунтів.",
        en: "Creating invite codes, assigning guest/member roles, verifying accounts."
      },
      behavior: {
        uk: "Активується при реєстрації або за запитом адміна.",
        en: "Triggers on registration or on admin request."
      },
      prompt: "ROLE: Welcomer. Guide new users through roles, guidelines, and workspace setup steps."
    },
    {
      idx: 4,
      name: "Key-Mgmt / E2EE Agent",
      catId: "core",
      category: texts.catCore,
      icon: Key,
      status: "future" as const,
      desc: {
        uk: "Керує шифруванням повідомлень, безпечним обміном E2EE ключами та конфіденційністю даних на рівні підключеного пристрою.",
        en: "Manages message encryption, secure E2EE key exchange, and data privacy on the connected device layer.",
        ru: "Управляет шифрованием сообщений, безопасным обменом E2EE ключами и конфиденциальностью данных на уровне подключенного устройства.",
        es: "Gestiona el cifrado de mensajes, intercambio seguro de claves E2EE y privacidad de datos en la capa del dispositivo conectado."
      },
      permissions: "encrypt.data, decrypt.data, rotate.keys",
      approval: false,
      actions: {
        uk: "Шифрування локальної бази знань, ротація ключів пристроїв.",
        en: "Encrypting local knowledge base, rotating device keys."
      },
      behavior: {
        uk: "Локальний агент криптографічного захисту, виконується без мережі.",
        en: "Local cryptographic protection agent, runs offline."
      },
      prompt: "ROLE: Crypto manager. Enforce end-to-end encryption key rules, rotate keys, audit storage privacy."
    },

    // Community Operations
    {
      idx: 5,
      name: "Messenger Agent",
      catId: "ops",
      category: texts.catOps,
      icon: MessageSquare,
      status: "coming" as const,
      desc: {
        uk: "Забезпечує P2P передачу повідомлень, створення тематичних тредів, генерацію підсумків розмов та інтеграцію з месенджерами.",
        en: "Provides P2P message transmission, thread creation, conversation summaries, and external messenger integration.",
        ru: "Обеспечивает P2P передачу сообщений, создание тематических тредов, генерацию сводок разговоров и интеграцию с мессенджерами.",
        es: "Proporciona transmisión de mensajes P2P, creación de hilos, resúmenes de conversación e integración de mensajería."
      },
      permissions: "send.messages, create.threads, read.history",
      approval: false,
      actions: {
        uk: "Формування дайджесту обговорень, створення гілок діалогу.",
        en: "Compiling discussion digests, creating dialogue branches."
      },
      behavior: {
        uk: "Працює у реальному часі в чатах спільноти.",
        en: "Operates in real-time inside community chats."
      },
      prompt: "ROLE: Chat facilitator. Manage thread structures, parse commands, and output summary highlights."
    },
    {
      idx: 6,
      name: "Steward / Moderation Agent",
      catId: "ops",
      category: texts.catOps,
      icon: Shield,
      status: "available" as const,
      desc: {
        uk: "Стежить за дотриманням правил простору, автоматично виявляє конфлікти або спам, дає рекомендації щодо модерації.",
        en: "Enforces workspace guidelines, automatically detects conflicts or spam, and provides moderation recommendations.",
        ru: "Следит за соблюдением правил пространства, автоматически выявляет конфликты или спам, дает рекомендации по модерации.",
        es: "Supervisa las pautas del espacio, detecta conflictos o spam automáticamente y proporciona recomendaciones de moderación."
      },
      permissions: "moderate.content, warning.users, read.messages",
      approval: true,
      actions: {
        uk: "Попередження за спам, модерація образливого вмісту, пропозиція блокування.",
        en: "Spam warnings, offensive content moderation, proposing user bans."
      },
      behavior: {
        uk: "Реагує на нові повідомлення автоматично згідно з правилами.",
        en: "Automatically responds to new messages based on rules."
      },
      prompt: "ROLE: Moderator. Flag rule violations, guide members back to community code, and alert admins if escalated."
    },
    {
      idx: 7,
      name: "Task / Project Organizer",
      catId: "ops",
      category: texts.catOps,
      icon: Workflow,
      status: "available" as const,
      desc: {
        uk: "Керує завданнями на канбан-дошці вашого MicroDAO. Створює задачі з обговорень, стежить за дедлайнами та виконавцями.",
        en: "Manages tasks on your MicroDAO Kanban board. Creates tasks from discussions, monitors deadlines, and tracks assignees.",
        ru: "Управляет задачами на канбан-доске вашего MicroDAO. Создает задачи из обсуждений, следит за дедлайнами и исполнителями.",
        es: "Gestiona tareas en el tablero Kanban de tu MicroDAO. Crea tareas a partir de discusiones, monitorea plazos y responsables."
      },
      permissions: "create.tasks, update.tasks, read.messages",
      approval: true,
      actions: {
        uk: "Автоматичне створення задачі за підсумком діалогу, нагадування про прострочені завдання.",
        en: "Auto-creating tasks from chat digests, sending overdue reminders."
      },
      behavior: {
        uk: "Інтегрується з месенджером і дошкою завдань.",
        en: "Integrates with messenger and task board."
      },
      prompt: "ROLE: Task manager. Maintain board consistency, extract task details from text, and assign deadlines."
    },
    {
      idx: 8,
      name: "Meeting Agent",
      catId: "ops",
      category: texts.catOps,
      icon: Calendar,
      status: "coming" as const,
      desc: {
        uk: "Автоматизує планування зустрічей, збирає порядок денний, транскрибує розмови та виокремлює домовленості й наступні кроки.",
        en: "Automates meeting scheduling, collects agendas, transcribes audio/video calls, and extracts decisions and next steps.",
        ru: "Автоматизирует планирование встреч, собирает повестку дня, транскрибирует разговоры и выделяет договоренности и шаги.",
        es: "Automatiza la programación de reuniones, recopila agendas, transcribe llamadas y extrae decisiones y próximos pasos."
      },
      permissions: "transcribe.audio, write.notes, schedule.meetings",
      approval: true,
      actions: {
        uk: "Генерація протоколу зустрічі, розсилка рішень учасникам.",
        en: "Generating meeting minutes, emailing action items to participants."
      },
      behavior: {
        uk: "Активується під час голосових або відеозустрічей.",
        en: "Triggers during voice or video calls."
      },
      prompt: "ROLE: Secretary. Record speech transcription, extract action points, and assign owners based on audio context."
    },
    {
      idx: 9,
      name: "Notification / Digest Agent",
      catId: "ops",
      category: texts.catOps,
      icon: Bell,
      status: "coming" as const,
      desc: {
        uk: "Готує персональні тижневі дайджести, надсилає нагадування про важливі події, дедлайни задач та нові пропозиції.",
        en: "Prepares personalized weekly digests, sends reminders about key events, task deadlines, and new governance proposals.",
        ru: "Готовит персональные еженедельные дайджесты, отправляет напоминания о важных событиях, дедлайнах задач и новых предложениях.",
        es: "Prepara resúmenes semanales personalizados, envía recordatorios sobre eventos clave, plazos de tareas y nuevas propuestas."
      },
      permissions: "send.notifications, compile.digests",
      approval: false,
      actions: {
        uk: "Формування персонального списку справ на день, сповіщення про нові голосування.",
        en: "Creating personal daily checklists, notifying on new votes."
      },
      behavior: {
        uk: "Працює за розкладом або при настанні системних подій.",
        en: "Runs on schedule or triggers on system events."
      },
      prompt: "ROLE: Digest compiler. Filter community updates down to what is personally relevant to the user."
    },

    // Knowledge / Memory
    {
      idx: 10,
      name: "Memory / RAG Archivist",
      catId: "knowledge",
      category: texts.catKnowledge,
      icon: Brain,
      status: "available" as const,
      desc: {
        uk: "Відповідає за довгострокову пам'ять MicroDAO. Індексує документи, переписки, структурує знання спільноти та дає точні відповіді з посиланнями.",
        en: "Responsible for the long-term memory of MicroDAO. Indexes documents, chats, structures community knowledge, and outputs cited answers.",
        ru: "Отвечает за долгосрочную память MicroDAO. Индексирует документы, переписки, структурирует знания сообщества и дает точные ответы со ссылками.",
        es: "Responsable de la memoria a largo plazo de MicroDAO. Indexa documentos, chats, estructura el conocimiento y da respuestas citadas."
      },
      permissions: "read.knowledge, index.files, query.rag",
      approval: false,
      actions: {
        uk: "Семантичний пошук контексту, індексування доданих PDF/TXT файлів.",
        en: "Semantic search of context, indexing uploaded PDF/TXT files."
      },
      behavior: {
        uk: "Автоматично підключається при запитах до бази знань.",
        en: "Automatically connected when querying the knowledge base."
      },
      prompt: "ROLE: Archivist. Retrieve relevant text chunks, synthesize factual answer, and strictly list source citations."
    },
    {
      idx: 11,
      name: "Ingest / Parser Agent",
      catId: "knowledge",
      category: texts.catKnowledge,
      icon: FileText,
      status: "coming" as const,
      desc: {
        uk: "Очищує, конвертує та імпортує зовнішні дані (PDF, DOCX, сайти, пошту, репозиторії GitHub) у спільну базу знань MicroDAO.",
        en: "Cleans, converts, and imports external data (PDFs, DOCX, web links, email, GitHub repositories) into the shared knowledge base.",
        ru: "Очищает, конвертирует и импортирует внешние данные (PDF, DOCX, сайты, почту, репозитории GitHub) в базу знаний MicroDAO.",
        es: "Limpia, convierte e importa datos externos (PDF, DOCX, enlaces, correo, repositorios GitHub) a la base de conocimientos."
      },
      permissions: "fetch.urls, parse.documents, write.knowledge",
      approval: true,
      actions: {
        uk: "Парсинг вмісту посилань, імпорт файлів, конвертація сканів документів.",
        en: "Parsing URL contents, file importing, converting document scans."
      },
      behavior: {
        uk: "Запускається при завантаженні файлів або імпорті зовнішніх джерел.",
        en: "Runs on file upload or external source import."
      },
      prompt: "ROLE: Document parser. Clean markdown output, strip boilerplate, extract tables and structural metadata."
    },
    {
      idx: 12,
      name: "Analytics Agent",
      catId: "knowledge",
      category: texts.catKnowledge,
      icon: LayoutGrid,
      status: "roadmap" as const,
      desc: {
        uk: "Збирає та аналізує метрики активності спільноти, ефективності виконання завдань, голосувань та фінансових витрат.",
        en: "Collects and analyzes metrics of community activity, task completion efficiency, voting turnouts, and treasury expenses.",
        ru: "Собирает и анализирует метрики активности сообщества, эффективности выполнения задач, голосований и финансовых расходов.",
        es: "Recopila y analiza métricas de actividad comunitaria, eficiencia de tareas, participación en votaciones y gastos de tesorería."
      },
      permissions: "read.analytics, compile.reports",
      approval: false,
      actions: {
        uk: "Побудова графіків активності, розрахунок балансів, оцінка продуктивності.",
        en: "Plotting activity graphs, calculating balances, evaluating productivity."
      },
      behavior: {
        uk: "Аналітичний фоновий процесор, створює щотижневі звіти.",
        en: "Analytical background processor, compiles weekly reports."
      },
      prompt: "ROLE: Business analyst. Generate structured reports summarizing operational speed, burn rate, and participation metrics."
    },

    // DAO / Economy
    {
      idx: 13,
      name: "Proposal Author Agent",
      catId: "dao",
      category: texts.catDao,
      icon: FileText,
      status: "roadmap" as const,
      desc: {
        uk: "Допомагає формулювати пропозиції для голосувань DAO. Автоматично збирає контекст з чатів, документів та завдань для обґрунтування рішень.",
        en: "Helps draft governance proposals for the DAO. Auto-collects context from chats, documents, and tasks to justify decisions.",
        ru: "Помогает формулировать предложения для голосований DAO. Автоматически собирает контекст из чатов, документов и задач для обоснования решений.",
        es: "Ayuda a redactar propuestas de gobernanza para la DAO. Recopila contexto de chats, documentos y tareas para justificar decisiones."
      },
      permissions: "read.messages, write.proposals",
      approval: true,
      actions: {
        uk: "Формулювання юридичного тексту пропозиції, збір списку аргументів за/проти.",
        en: "Drafting proposal legal text, compiling pro/con argument lists."
      },
      behavior: {
        uk: "Запускається за командою користувача при створенні ініціативи.",
        en: "Triggers on user request when creating an initiative."
      },
      prompt: "ROLE: Proposal writer. Convert casual chat consensus into formal DAO proposal language with rationale."
    },
    {
      idx: 14,
      name: "Governance Agent",
      catId: "dao",
      category: texts.catDao,
      icon: MessageSquare, // Using MessageSquare as fallback for Vote
      status: "roadmap" as const,
      desc: {
        uk: "Керує процесами голосування, фіксує результати, підраховує кворум та автоматично впроваджує прийняті правила у простір.",
        en: "Manages voting processes, records results, counts quorum, and automatically applies passed rules to the workspace.",
        ru: "Управляет процессами голосования, фиксирует результаты, подсчитывает кворум и автоматически внедряет принятые правила в пространство.",
        es: "Gestiona procesos de votación, registra resultados, cuenta quórum y aplica automáticamente reglas aprobadas al espacio."
      },
      permissions: "manage.votes, read.votes, apply.rules",
      approval: true,
      actions: {
        uk: "Запуск голосувань, підрахунок голосів за ролями, оновлення статусу пропозицій.",
        en: "Starting votes, counting weight by role, updating proposal status."
      },
      behavior: {
        uk: "Виконує регламент голосувань та повідомляє про дедлайни.",
        en: "Enforces voting regulations and notifies about deadlines."
      },
      prompt: "ROLE: Governance coordinator. Enforce quorum thresholds, count votes by weighted roles, and log official decisions."
    },
    {
      idx: 15,
      name: "Treasury Agent",
      catId: "dao",
      category: texts.catDao,
      icon: Coins,
      status: "roadmap" as const,
      desc: {
        uk: "Керує бюджетами спільноти, формує звіти про касу, контролює ліміти виплат та готує мультисіг-транзакції для підтвердження адмінами.",
        en: "Manages community budgets, compiles cash flow reports, controls payout limits, and prepares multisig transactions for admin sign-off.",
        ru: "Управляет бюджетами сообщества, формирует отчеты о кассе, контролирует лимиты выплат и готовит мультисиг-транзакции для админов.",
        es: "Gestiona presupuestos comunitarios, compila informes de flujo de caja, controla límites de pago y prepara transacciones multisig."
      },
      permissions: "read.treasury, prepare.payouts, check.limits",
      approval: true,
      actions: {
        uk: "Підготовка платіжних доручень, звірка лімітів виплат з правилами DAO.",
        en: "Preparing payment instructions, checking payout limits against DAO rules."
      },
      behavior: {
        uk: "Керує фінансами відповідно до голосувань і лімітів.",
        en: "Manages financial assets in line with votes and limits."
      },
      prompt: "ROLE: Treasury steward. Check spending rules, draft multisig payload, and alert admins for signing."
    },
    {
      idx: 16,
      name: "Wallet Agent",
      catId: "dao",
      category: texts.catDao,
      icon: Wallet,
      status: "roadmap" as const,
      desc: {
        uk: "Локальний агент для роботи з криптогаманцем спільноти: перевірка балансів, підпис транзакцій у безпечному середовищі, ліміти витрат.",
        en: "Local agent for community crypto wallet: balance checks, transaction signing in secure environment, spending limits.",
        ru: "Локальный агент для работы с криптокошельком сообщества: проверка балансов, подпись транзакций в безопасной среде, лимиты расходов.",
        es: "Agente local para billetera cripto comunitaria: verificación de saldos, firma de transacciones, límites de gasto."
      },
      permissions: "sign.transactions, get.balance, read.wallet",
      approval: true,
      actions: {
        uk: "Верифікація одержувача платежу, безпечний підпис транзакції на пристрої.",
        en: "Verifying payment recipient, secure on-device transaction signing."
      },
      behavior: {
        uk: "Локальний криптографічний гаманець, вимагає апаратного підтвердження.",
        en: "Local cryptographic wallet, requires hardware confirmation."
      },
      prompt: "ROLE: Wallet custodian. Safely hold public keys, compile transaction payloads, and require human auth before signing."
    },
    {
      idx: 17,
      name: "Token Factory Agent",
      catId: "dao",
      category: texts.catDao,
      icon: Coins,
      status: "roadmap" as const,
      desc: {
        uk: "Здійснює підготовку до випуску власних токенів MicroDAO через спільну токен-фабрику міста DAARION.",
        en: "Prepares for the issuance of own MicroDAO tokens via the shared DAARION city token factory.",
        ru: "Осуществляет подготовку к выпуску собственных токенов MicroDAO через совместную токен-фабрику города DAARION.",
        es: "Prepara la emisión de tokens propios de MicroDAO a través de la fábrica de tokens compartida de la ciudad de DAARION."
      },
      permissions: "mint.tokens, read.factory, configure.issuance",
      approval: true,
      actions: {
        uk: "Конфігурація смарт-контракту токена, ініціалізація випуску.",
        en: "Configuring token smart contract, initiating issuance."
      },
      behavior: {
        uk: "Активується за рішенням засновників для емісії токенів.",
        en: "Triggers on founder consensus to execute token emission."
      },
      prompt: "ROLE: Token factory interface. Setup contract variables, gas price limits, and trigger minting pipelines."
    },
    {
      idx: 18,
      name: "Tokenomics Agent",
      catId: "dao",
      category: texts.catDao,
      icon: Coins,
      status: "roadmap" as const,
      desc: {
        uk: "Моделює та прораховує правила емісії, розподілу токенів за внесок учасників (Contribution scoring) та токеноміку спільноти.",
        en: "Models and calculates emission rules, token distribution based on member contributions (Contribution scoring), and tokenomics.",
        ru: "Моделирует и просчитывает правила эмиссии, распределения токенов за вклад участников (Contribution scoring) и токеномику сообщества.",
        es: "Modela y calcula reglas de emisión, distribución de tokens según aportes de miembros (Contribution scoring) y tokenómica."
      },
      permissions: "calculate.rewards, read.tokenomics",
      approval: true,
      actions: {
        uk: "Розрахунок нарахувань токенів за завдання, оцінка інфляційної моделі.",
        en: "Calculating token rewards for completed tasks, evaluating inflation models."
      },
      behavior: {
        uk: "Працює за розкладом під час закриття циклів завдань.",
        en: "Runs on schedule during task cycle closeouts."
      },
      prompt: "ROLE: Tokenomics calculator. Score community actions based on configured contribution values, verify payouts."
    },

    // Developer / Network
    {
      idx: 19,
      name: "Developer Agent",
      catId: "dev",
      category: texts.catDev,
      icon: Terminal,
      status: "future" as const,
      desc: {
        uk: "Допомагає створювати власні платформи, додатки, смарт-контракти та децентралізовані соціальні мережі в екосистемі DAARION.",
        en: "Helps build custom platforms, applications, smart contracts, and decentralized social networks in the DAARION ecosystem.",
        ru: "Помогает создавать собственные платформы, приложения, смарт-контракты и децентрализованные социальные сети в экосистеме DAARION.",
        es: "Ayuda a construir plataformas personalizadas, aplicaciones, contratos inteligentes y redes sociales en el ecosistema DAARION."
      },
      permissions: "write.code, build.packages, run.tests",
      approval: true,
      actions: {
        uk: "Написання та рев'ю коду, автоматизоване тестування, вивантаження пакетів.",
        en: "Writing and reviewing code, automated testing, package deployment."
      },
      behavior: {
        uk: "Інтерактивний помічник розробника спільноти.",
        en: "Interactive assistant for community developers."
      },
      prompt: "ROLE: Developer. Generate code conforming to architecture rules, run test configurations, log failures."
    },
    {
      idx: 20,
      name: "Integration / Bridge Agent",
      catId: "dev",
      category: texts.catDev,
      icon: Network,
      status: "coming" as const,
      desc: {
        uk: "Підключає зовнішні сервіси (Telegram, Gmail, GitHub, Slack, Discord, верифікаційні вебхуки) до простору MicroDAO.",
        en: "Connects external services (Telegram, Gmail, GitHub, Slack, Discord, verification webhooks) to the MicroDAO workspace.",
        ru: "Подключает внешние сервисы (Telegram, Gmail, GitHub, Slack, Discord, верификационные вебхуки) к пространству MicroDAO.",
        es: "Conecta servicios externos (Telegram, Gmail, GitHub, Slack, Discord, webhooks de verificación) al espacio MicroDAO."
      },
      permissions: "read.integrations, invoke.webhooks",
      approval: true,
      actions: {
        uk: "Трансляція повідомлень із Telegram у чат MicroDAO, синхронізація коммітів GitHub.",
        en: "Broadcasting Telegram messages to MicroDAO chat, syncing GitHub commits."
      },
      behavior: {
        uk: "Реагує на події у підключених зовнішніх мережах.",
        en: "Triggers on events in connected external networks."
      },
      prompt: "ROLE: Bridge. Map external JSON payloads into internal message structures, dispatch commands."
    },
    {
      idx: 21,
      name: "Agent Marketplace Agent",
      catId: "dev",
      category: texts.catDev,
      icon: LayoutGrid,
      status: "future" as const,
      desc: {
        uk: "Дозволяє завантажувати готові шаблони Духа Спільноти, модулі та налаштування, розроблені іншими спільнотами міста.",
        en: "Allows downloading pre-configured Community Spirit templates, modules, and presets developed by other city communities.",
        ru: "Позволяет загружать готовые шаблоны Духа Сообщества, модули и настройки, разработанные другими сообществами города.",
        es: "Permite descargar plantillas de Espíritu Comunitario preconfiguradas, módulos y preajustes de otras comunidades."
      },
      permissions: "read.presets, download.modules",
      approval: true,
      actions: {
        uk: "Пошук шаблонів у каталозі, встановлення конфігурацій промптів.",
        en: "Preseti directory search, prompt config installation."
      },
      behavior: {
        uk: "Інтерактивний інсталятор агентних шаблонів.",
        en: "Interactive installer for agent templates."
      },
      prompt: "ROLE: Presets catalog manager. Search available presets, check integrity signatures, map prompts."
    },

    // Personal
    {
      idx: 22,
      name: "Second-Me Agent",
      catId: "personal",
      category: texts.catPersonal,
      icon: User,
      status: "future" as const,
      desc: {
        uk: "Персональний агент-двійник учасника спільноти: веде приватну пам'ять, нагадує про завдання, делегує запити іншим агентам.",
        en: "Personal avatar agent of a community member: maintains private memory, reminds about tasks, delegates queries to other agents.",
        ru: "Персональный агент-двойник участника сообщества: ведет личную память, напоминает о задачах, делегирует запросы другим агентам.",
        es: "Agente avatar personal de un miembro: mantiene memoria privada, recuerda tareas, delega consultas a otros agentes."
      },
      permissions: "read.personalMemory, delegate.actions",
      approval: true,
      actions: {
        uk: "Аналіз розкладу, створення нотаток, автоматичні відповіді на базові запитання.",
        en: "Schedule analysis, personal notes creation, automated replies to basic questions."
      },
      behavior: {
        uk: "Працює приватно для конкретного користувача.",
        en: "Runs privately for a specific user."
      },
      prompt: "ROLE: Personal avatar. Speak on behalf of the user within predefined rules, manage schedule, query group agents."
    },
    {
      idx: 23,
      name: "Personal Wallet Agent",
      catId: "personal",
      category: texts.catPersonal,
      icon: Wallet,
      status: "future" as const,
      desc: {
        uk: "Персональний криптогаманець користувача для особистих підписів, перевірки власного балансу та швидких платежів.",
        en: "Personal crypto wallet of the user for private signing, balance check, and fast payments.",
        ru: "Персональный криптокошелек пользователя для личных подписей, проверки собственного баланса и быстрых платежей.",
        es: "Billetera cripto personal del usuario para firmas privadas, control de saldo y pagos rápidos."
      },
      permissions: "sign.personal, read.personalBalance",
      approval: true,
      actions: {
        uk: "Локальний підпис особистої транзакції, перевірка особистих адрес.",
        en: "Local signing of personal transactions, checking private addresses."
      },
      behavior: {
        uk: "Локальний криптогаманець, що вимагає ручного підтвердження власника.",
        en: "Local crypto wallet, requires manual owner confirmation."
      },
      prompt: "ROLE: Personal wallet custodian. Hold private keys in client enclave, fetch user approval before signing."
    }
  ];

  const filteredModules = modules.filter(
    (mod) => activeCategory === 'all' || mod.catId === activeCategory
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-medium">
            <Check className="h-3 w-3 mr-1 inline" />
            {texts.statusAvailable}
          </Badge>
        );
      case 'coming':
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-medium">
            <Clock className="h-3 w-3 mr-1 inline" />
            {texts.statusComing}
          </Badge>
        );
      case 'roadmap':
        return (
          <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px] font-medium">
            <Clock className="h-3 w-3 mr-1 inline" />
            {texts.statusRoadmap}
          </Badge>
        );
      case 'future':
      default:
        return (
          <Badge className="bg-muted text-muted-foreground border-border/20 text-[10px] font-medium">
            {texts.statusFuture}
          </Badge>
        );
    }
  };

  const getCtaButton = (status: string) => {
    if (status === 'available') {
      return (
        <Button
          onClick={handleCtaClick}
          className="w-full h-10 font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all duration-200"
        >
          <Sparkles className="h-4 w-4" />
          <span>{user && activeCommunity ? texts.ctaConfigure : texts.coreCardCtaCreate}</span>
        </Button>
      );
    } else {
      return (
        <Button
          disabled
          variant="outline"
          className="w-full h-10 font-semibold gap-1.5 border-border/40 text-muted-foreground bg-muted/5"
        >
          <span>{status === 'coming' || status === 'roadmap' ? texts.ctaRoadmap : texts.ctaFuture}</span>
        </Button>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      <Helmet>
        <title>AI Agents Directory — MicroDAO built-in assistants</title>
        <meta name="description" content="Explore MicroDAO's directory of AI agents for communities and DAOs: task-flow, knowledge, moderation, meetings and community-spirit assistants." />
        <link rel="canonical" href="https://1.daarion.city/agents" />
        <meta property="og:title" content="AI Agents Directory — MicroDAO built-in assistants" />
        <meta property="og:description" content="AI agents for communities and DAOs: task-flow, knowledge, moderation, meetings and community-spirit assistants." />
        <meta property="og:url" content="https://1.daarion.city/agents" />
      </Helmet>
      <PublicHeader
        active="agents"
        backToHome
        primaryLabel={user && activeCommunity ? t.agentDirectory.panelBtn : t.pricingExtra.startBtn}
        primaryIcon={<Sparkles className="h-3.5 w-3.5" />}
        onPrimaryClick={handleCtaClick}
      />

      {/* ── Directory Hero ── */}
      <section 
        className="relative py-12 md:py-20 text-center overflow-hidden border-b border-border/10 sovereign-page-bg"
        style={{
          backgroundImage: 'url("/agents-hero-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Readability overlay */}
        <div className="absolute inset-0 bg-slate-950/80 via-slate-950/60 to-slate-950/90 pointer-events-none" />
        
        <div className="landing-orb absolute top-10 left-[20%] w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="landing-orb absolute bottom-5 right-[20%] w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px]" />
        
        <div className="container max-w-4xl mx-auto px-4 relative z-10">
          <div className="glass-panel-strong rounded-[2.5rem] p-8 md:p-14 space-y-6 max-w-3xl mx-auto">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs px-3.5 py-1">
              {texts.heroBadge}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-foreground via-emerald-400 to-foreground pb-2">
              {texts.heroTitle}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {texts.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Button
                size="lg"
                onClick={handleCtaClick}
                className="w-full sm:w-auto h-11 px-6 font-semibold text-sm gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all duration-200"
              >
                <Sparkles className="h-4 w-4" />
                <span>{texts.ctaCreateMicroDao}</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleScrollToModules}
                className="w-full sm:w-auto h-11 px-6 font-semibold text-sm gap-2 border-slate-700 hover:bg-slate-800/50 text-slate-200 glass-button-secondary"
              >
                <LayoutGrid className="h-4 w-4" />
                <span>{texts.ctaViewModules}</span>
              </Button>
            </div>

            {/* Bottom mini chips */}
            <div className="border-t border-slate-800/80 pt-6 mt-4 flex flex-wrap justify-center gap-2">
              <span className="glass-chip text-[11px] font-medium text-slate-300 px-3 py-1.5 rounded-full">
                {language === 'uk' ? 'Кастомний агент для кожної MicroDAO' : language === 'ru' ? 'Кастомный агент для каждой MicroDAO' : language === 'es' ? 'Agente personalizado para cada MicroDAO' : 'Customizable Agent for each MicroDAO'}
              </span>
              <span className="glass-chip text-[11px] font-medium text-slate-300 px-3 py-1.5 rounded-full">
                {language === 'uk' ? "Пам'ять + правила + модулі" : language === 'ru' ? 'Память + правила + модули' : language === 'es' ? 'Memoria + reglas + módulos' : 'Memory + Rules + Modules'}
              </span>
              <span className="glass-chip text-[11px] font-medium text-slate-300 px-3 py-1.5 rounded-full">
                {language === 'uk' ? 'Людське схвалення для чутливих дій' : language === 'ru' ? 'Человеческое одобрение для важных действий' : language === 'es' ? 'Aprobación humana para acciones sensibles' : 'Human Approval for Sensitive Actions'}
              </span>
              <span className="glass-chip text-[11px] font-medium text-slate-300 px-3 py-1.5 rounded-full">
                {language === 'uk' ? 'Roadmap: казна / голосування / токени' : language === 'ru' ? 'Roadmap: казна / голосование / токены' : language === 'es' ? 'Roadmap: tesorería / votación / tokens' : 'Roadmap: Treasury / Governance / Tokens'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it Works Section ── */}
      <section className="py-16 bg-slate-950/20 border-b border-border/10 relative">
        <div className="container max-w-5xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100">
              {language === 'uk' ? 'Як працює агентна система MicroDAO' : language === 'ru' ? 'Как работает агентная система MicroDAO' : language === 'es' ? 'Cómo funciona el sistema de agentes MicroDAO' : 'How the MicroDAO Agent System Works'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {language === 'uk' 
                ? 'Простий запуск та конфігурація суверенного координаційного шару для вашої спільноти в чотири простих кроки.' 
                : 'Simple launch and configuration of the sovereign coordination layer for your community in four easy steps.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative">
            {[
              {
                step: '01',
                title: language === 'uk' ? 'Створюєте MicroDAO' : 'Create MicroDAO',
                desc: language === 'uk' ? 'Зареєструйте простір для вашої команди за кілька секунд.' : 'Register a space for your team in seconds.'
              },
              {
                step: '02',
                title: language === 'uk' ? 'Запуск Духа Спільноти' : 'Activate Community Spirit',
                desc: language === 'uk' ? 'Система автоматично генерує вашого головного координаційного агента.' : 'The system automatically spawns your primary coordinating agent.'
              },
              {
                step: '03',
                title: language === 'uk' ? 'Налаштування під себе' : 'Configure To Your Model',
                desc: language === 'uk' ? 'Оберіть тон, місію, правила поведінки та межі автономії.' : 'Choose the tone, mission, behavior rules, and autonomy limits.'
              },
              {
                step: '04',
                title: language === 'uk' ? 'Підключення модулів' : 'Connect Agent Modules',
                desc: language === 'uk' ? 'Розширюйте можливості агента через завдання, казначейство та месенджери.' : 'Extend agent capabilities with tasks, treasury, and messengers.'
              }
            ].map((s, idx) => (
              <div key={idx} className="glass-card p-6 rounded-2xl relative border border-slate-800/80 hover:border-emerald-500/20 transition-all text-left space-y-4">
                <div className="text-3xl font-black text-emerald-500/20 font-mono absolute top-4 right-4">{s.step}</div>
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-400">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-100">{s.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core Agent (Дух Спільноти) Card ── */}
      <section className="py-16 md:py-20 relative">
        <div className="container max-w-5xl mx-auto px-4">
          <Card className="max-w-4xl mx-auto border border-emerald-500/20 bg-slate-950/45 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center hover:shadow-elegant-emerald transition-all duration-300 relative overflow-hidden group glass-panel">
            {/* Emerald glow background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="flex flex-col items-center shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg relative">
                <Bot className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-400" />
                <div className="absolute -bottom-1.5 bg-emerald-500 text-black text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full">
                  Core
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-400 mt-4 uppercase tracking-wider">{texts.coreCardLabel}</span>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">{texts.coreCardTitle}</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {texts.coreCardDesc}
                </p>
              </div>

              {/* Highlight callout box */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs sm:text-sm text-emerald-300 leading-relaxed text-left font-medium">
                {language === 'uk' 
                  ? '💡 Кожна MicroDAO створює і налаштовує власного Духа Спільноти. Це не один універсальний бот для всіх, а агентне ядро конкретної спільноти з власною місією, правилами, пам’яттю, ролями та модулями.' 
                  : language === 'ru'
                  ? '💡 Каждая MicroDAO создает и настраивает собственного Духа Сообщества. Это не один универсальный бот для всех, а агентное ядро конкретного сообщества со своей миссией, правилами, памятью, ролями и модулями.'
                  : language === 'es'
                  ? '💡 Cada MicroDAO crea y configura su propio Espíritu de Comunidad. No es un bot universal para todos, sino el núcleo de agentes de una comunidad específica con su propia misión, reglas, memoria, roles y módulos.'
                  : '💡 Every MicroDAO creates and configures its own Community Spirit. It is not a single generic bot for everyone, but the core agent of a specific community with its own mission, rules, memory, roles, and modules.'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm pt-2 text-left">
                {[
                  language === 'uk' ? 'Автоматичний онбординг нових учасників' : 'Automated member onboarding',
                  language === 'uk' ? 'Пояснення та нагляд за правилами простору' : 'Explaining and enforcing rules',
                  language === 'uk' ? 'Формування підсумків та рішень із чатів' : 'Generating summaries and decisions from chat',
                  language === 'uk' ? 'Створення завдань та контроль виконання' : 'Task management and execution tracking',
                  language === 'uk' ? 'Маршрутизація запитів до під-агентів' : 'Routing requests to sub-agents',
                  language === 'uk' ? 'Управління казною/гаманцем за дозволом' : 'Treasury/wallet control (with approvals)'
                ].map((cap, cIdx) => (
                  <div key={cIdx} className="flex items-center gap-2 text-foreground/80">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-center md:justify-start gap-3">
                {user && activeCommunity ? (
                  <Button
                    onClick={handleCtaClick}
                    className="h-10 px-5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center justify-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>{texts.coreCardCtaConfigure}</span>
                  </Button>
                ) : (
                  <Button
                    onClick={handleCtaClick}
                    className="h-10 px-5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{texts.coreCardCtaCreate}</span>
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Customization Panel ── */}
      <section className="py-16 md:py-24 bg-muted/5 border-t border-border/10 relative">
        <div className="landing-orb absolute top-20 right-[10%] w-60 h-60 bg-emerald-500/5 rounded-full blur-[80px]" />
        <div className="container max-w-5xl mx-auto px-4 space-y-12 relative z-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{texts.customTitle}</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              {texts.customDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { title: texts.customDimension1Title, desc: texts.customDimension1Desc, icon: Sparkles },
              { title: texts.customDimension2Title, desc: texts.customDimension2Desc, icon: MessageSquare },
              { title: texts.customDimension3Title, desc: texts.customDimension3Desc, icon: HelpCircle },
              { title: texts.customDimension4Title, desc: texts.customDimension4Desc, icon: Users },
              { title: texts.customDimension5Title, desc: texts.customDimension5Desc, icon: Lock },
              { title: texts.customDimension6Title, desc: texts.customDimension6Desc, icon: Shield },
              { title: texts.customDimension7Title, desc: texts.customDimension7Desc, icon: Workflow },
              { title: texts.customDimension8Title, desc: texts.customDimension8Desc, icon: Brain },
              { title: texts.customDimension9Title, desc: texts.customDimension9Desc, icon: Coins },
              { title: texts.customDimension10Title, desc: texts.customDimension10Desc, icon: LayoutGrid },
            ].map((dim, idx) => (
              <Card
                key={idx}
                className="glass-card glass-card-hover rounded-2xl p-4 flex flex-col justify-between text-left"
              >
                <div className="space-y-2">
                  <div className="p-2 bg-emerald-500/10 w-fit rounded-lg text-emerald-400 mb-2">
                    <dim.icon className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground">{dim.title}</h4>
                  <p className="text-xs text-muted-foreground leading-normal mt-1">
                    {dim.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Example Community Profiles */}
          <div className="pt-12 border-t border-slate-800/60 space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-100">
                {texts.profilesTitle}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { title: texts.profileHoaTitle, desc: texts.profileHoaDesc, icon: Home },
                { title: texts.profileCoopTitle, desc: texts.profileCoopDesc, icon: Users },
                { title: texts.profileRandDTitle, desc: texts.profileRandDDesc, icon: Brain },
                { title: texts.profileArtTitle, desc: texts.profileArtDesc, icon: Sparkles }
              ].map((prof, idx) => (
                <div 
                  key={idx} 
                  className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800/80 flex flex-col gap-4 text-left"
                >
                  <div className="p-2 bg-emerald-500/10 w-fit rounded-lg text-emerald-400 font-semibold">
                    <prof.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-100">{prof.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{prof.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Agent Modules (sub-agents) ── */}
      <section id="modules" className="py-16 md:py-24 border-t border-border/10">
        <div className="container max-w-6xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{texts.modulesTitle}</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              {texts.modulesSubtitle}
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex justify-center flex-wrap gap-2 pt-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className={`h-9 text-xs font-semibold rounded-full px-4 border-border/40 transition-all ${
                  activeCategory === cat.id
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'hover:bg-muted/30'
                }`}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {filteredModules.map((mod) => (
              <Card
                key={mod.idx}
                className="glass-card glass-card-hover rounded-2xl p-5 sm:p-6 flex flex-col justify-between text-left relative group"
              >
                <div className="space-y-4">
                  {/* Row 1: Icon, Title, Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                        <mod.icon className="h-5 w-5" />
                      </div>
                      <h4 className="font-extrabold text-sm sm:text-base text-foreground truncate">{mod.name}</h4>
                    </div>
                    {getStatusBadge(mod.status)}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {mod.desc[language as Language] || mod.desc.en}
                  </p>

                  {/* Properties table */}
                  <div className="space-y-2 pt-2 border-t border-border/10 text-xs">
                    <div className="flex items-start justify-between gap-1 leading-normal">
                      <span className="text-muted-foreground/75 font-medium">{texts.labelPermissions}:</span>
                      <code className="font-mono text-[10px] text-foreground bg-muted/45 border px-1.5 py-0.5 rounded max-w-[150px] truncate">
                        {mod.permissions}
                      </code>
                    </div>
                    <div className="flex items-center justify-between leading-normal">
                      <span className="text-muted-foreground/75 font-medium">{texts.labelApproval}:</span>
                      <span className="font-semibold text-foreground">
                        {mod.approval ? texts.approvalRequired : texts.approvalNotRequired}
                      </span>
                    </div>
                    <div className="flex items-start gap-1 flex-col pt-1">
                      <span className="text-muted-foreground/75 font-medium mb-0.5">{texts.labelActions}:</span>
                      <span className="text-[11px] text-foreground/80 leading-normal pl-2 border-l border-emerald-500/30">
                        {mod.actions[language as 'uk' | 'en'] || mod.actions.en}
                      </span>
                    </div>
                    <div className="flex items-start gap-1 flex-col pt-1">
                      <span className="text-muted-foreground/75 font-medium mb-0.5">{texts.labelBehavior}:</span>
                      <span className="text-[11px] text-foreground/80 leading-normal pl-2 border-l border-emerald-500/30">
                        {mod.behavior[language as 'uk' | 'en'] || mod.behavior.en}
                      </span>
                    </div>
                  </div>

                  {/* Technical Prompt collapsed */}
                  <div className="pt-2 border-t border-border/5">
                    <details 
                      className="group/details border border-border/30 rounded-xl bg-background/20 transition-all [&_summary::-webkit-details-marker]:hidden"
                      open={expandedPromptIdx === mod.idx}
                      onToggle={(e) => {
                        const target = e.target as HTMLDetailsElement;
                        if (target.open) {
                          setExpandedPromptIdx(mod.idx);
                        } else if (expandedPromptIdx === mod.idx) {
                          setExpandedPromptIdx(null);
                        }
                      }}
                    >
                      <summary className="flex items-center justify-between p-2.5 cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground">
                        <span>{texts.labelPromptToggle}</span>
                        <ChevronDown className="h-3.5 w-3.5 transition group-open/details:rotate-180" />
                      </summary>
                      <div className="p-3 pt-0 border-t border-border/10">
                        <pre className="text-[10px] font-mono text-foreground/70 overflow-x-auto leading-relaxed whitespace-pre-wrap max-h-24 bg-muted/10 p-2 rounded">
                          {mod.prompt}
                        </pre>
                      </div>
                    </details>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border/10">
                  {getCtaButton(mod.status)}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 md:py-24 border-t border-border/10 bg-muted/5 relative">
        <div className="container max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {language === 'uk' ? 'Готові запустити власну суверенну агентну мережу?' :
             language === 'ru' ? 'Готовы запустить собственную суверенную агентную сеть?' :
             language === 'es' ? '¿Listo para lanzar tu propia red de agentes soberanos?' :
             'Ready to launch your own sovereign agent network?'}
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {language === 'uk' ? 'Створіть MicroDAO за лічені хвилини. Налаштуйте Духа Спільноти та активуйте необхідні модулі.' :
             language === 'ru' ? 'Создайте MicroDAO за считанные минуты. Настройте Духа Сообщества и активируйте необходимые модули.' :
             language === 'es' ? 'Crea una MicroDAO en minutos. Configura el Espíritu Comunitario y activa los módulos necesarios.' :
             'Create a MicroDAO in minutes. Configure the Community Spirit and activate the required modules.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={handleCtaClick}
              className="w-full sm:w-auto h-13 px-10 font-semibold text-base gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="h-5 w-5" />
              <span>{texts.ctaCreateMicroDao}</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/install')}
              className="w-full sm:w-auto h-13 px-10 font-semibold text-base gap-1.5 border-border/60 hover:bg-muted/30 text-foreground"
            >
              <Download className="h-4 w-4" />
              <span>{t.landing.client}</span>
            </Button>
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
            <button onClick={() => navigate("/agents")} className="hover:text-foreground transition-colors text-foreground">
              AI Agents Directory
            </button>
            <span className="text-border">·</span>
            <button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">
              Pricing Plans
            </button>
            <span className="text-border">·</span>
            <button onClick={() => navigate("/install")} className="hover:text-foreground transition-colors">
              Connect Device
            </button>
            <span className="text-border">·</span>
            <a href="https://github.com/DAARION-DAO/loval-echoes" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              GitHub (MicroDAO Open Source)
            </a>
          </div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 flex-wrap pt-2">
            <span>© {new Date().getFullYear()}</span>
            <a href="https://daarion.city/" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 text-foreground/80 font-medium transition-all">
              <img src="/daarion-logo.jpg" alt="DAARION.city" className="h-4 w-4 rounded-sm object-cover" />
              <span>DAARION.city</span>
            </a>
            <span>— {t.clientInstall.footerCopyright}</span>
          </div>
          <div className="text-[10px] text-muted-foreground/60">{t.clientInstall.footerDesc}</div>
        </div>
      </footer>
    </div>
  );
}
