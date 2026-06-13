import { useState, useEffect } from 'react';
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
  HelpCircle
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

    tabs: {
      profile: "Профіль",
      personality: "Особистість",
      memory: "Пам'ять",
      modules: "Модулі",
      permissions: "Дозволи",
      actionLog: "Журнал дій",
      technical: "Технічні"
    },

    profileTab: {
      agentName: "Ім'я агента",
      communityName: "Назва спільноти (тільки читання)",
      shortMission: "Коротка місія спільноти",
      primaryLang: "Основна мова",
      secondaryLangs: "Другорядні мови"
    },

    personalityTab: {
      tone: "Тон спілкування",
      commStyle: "Стиль спілкування",
      strictness: "Рівень суворості",
      decisionStyle: "Стиль прийняття рішень",
      conflictStyle: "Вирішення конфліктів",
      tones: {
        warm: "Теплий & Дружній",
        professional: "Професійний & Стриманий",
        creative: "Творчий & Натхненний"
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
      addDoc: "Добавить документ у пам'ять",
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
      safeTitle: "Безпечні дії (может виконувати самостійно):",
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
      warningText: "Увага! Неправильне налаштування цих параметрів може порушити стабільність роботи агента."
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

    tabs: {
      profile: "Profile",
      personality: "Personality",
      memory: "Memory",
      modules: "Modules",
      permissions: "Permissions",
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
      tones: {
        warm: "Warm & Friendly",
        professional: "Professional & Reserved",
        creative: "Creative & Inspiring"
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
      warningText: "Warning! Incorrect configuration of these parameters may break agent stability."
    }
  },
  ru: {
    pageTitle: "Настройка Духа Сообщества",
    pageSubtitle: "Управление личностью, памятью, модулями и разрешениями вашего Community Spirit Agent",
    notAdminBanner: "Только владельцы или администраторы могут изменять настройки Духа Сообщества.",
    saveBtn: "Сохранить настройки",
    toastSaved: "Настройки успешно сохранены!",
    toastSaveError: "Ошибка при сохранении настроек.",
    toastSummarized: "Память сообщества успешно проанализирована и обобщена!",
    noActiveCommunity: "Выберите или создайте MicroDAO в меню слева для настройки её Духа Сообщества.",
    noSpiritAgent: "Для этой MicroDAO еще не создан Дух Сообщества.",
    repairCta: "Создать Дух Сообщества для этой MicroDAO",
    repairDesc: "Каждая MicroDAO должна иметь собственного Духа Сообщества для координации, памяти и автоматизации.",
    createAgentBtn: "Создать Дух Сообщества",

    tabs: {
      profile: "Профиль",
      personality: "Личность",
      memory: "Память",
      modules: "Модули",
      permissions: "Разрешения",
      actionLog: "Журнал действий",
      technical: "Технические"
    },

    profileTab: {
      agentName: "Имя агента",
      communityName: "Название сообщества (только чтение)",
      shortMission: "Краткая миссия сообщества",
      primaryLang: "Основной язык",
      secondaryLangs: "Второстепенные языки"
    },

    personalityTab: {
      tone: "Тон общения",
      commStyle: "Стиль общения",
      strictness: "Уровень строгости",
      decisionStyle: "Стиль принятия решений",
      conflictStyle: "Разрешение конфликтов",
      tones: {
        warm: "Теплый & Дружелюбный",
        professional: "Профессиональный & Сдержанный",
        creative: "Творческий & Вдохновенный"
      },
      strictnessLevels: {
        low: "Низкий (мягкая помощь)",
        medium: "Средний (активное модерирование)",
        high: "Высокий (строгий контроль)"
      },
      decisionStyles: {
        consensus: "Консенсус (только согласие участников)",
        autonomous: "Автономный (действует самостоятельно)",
        human_approved: "Утверждается человеком (под надзором)"
      }
    },

    memoryTab: {
      intro: "Память агента хранит все знания о ценностях, правилах и деятельности вашей MicroDAO.",
      summaryTitle: "Описание обобщенной памяти:",
      kbLink: "Открыть Базу Знаний",
      addDoc: "Добавить документ в память",
      summarizeBtn: "Составить сводку памяти сообщества",
      futureSources: "Будущие источники памяти (Roadmap):",
      sourcesList: [
        "Автоматическое индексирование Git коммитов сообщества",
        "Транскрипты еженедельных аудио/видео встреч",
        "Синхронизация с внешними базами Notion/Wiki"
      ]
    },

    modulesTab: {
      availableTitle: "Доступно сейчас (Активные модули)",
      comingTitle: "Готовится в ближайшее время",
      roadmapTitle: "В плане развития (Roadmap)",
      futureTitle: "Будущие исследования",
      stewardName: "Стюард / Модерация",
      stewardDesc: "Модерирует чаты, выявляет спам и нарушения правил, помогает участникам.",
      memoryName: "Память / RAG",
      memoryDesc: "Доступ к общей базе знаний, документам и предыдущему опыту.",
      taskName: "Органайзер задач",
      taskDesc: "Управление Kanban-карточками и назначение исполнителей.",
      onboardingName: "Онбординг / Приглашения",
      onboardingDesc: "Создание инвайт-кодов и введение новых участников в курс дел.",
      modulesList: {
        messenger: { name: "Мессенджер", desc: "Edge-to-edge чаты без центрального сервера." },
        meeting: { name: "Встречи", desc: "Голосовые комнаты с автоматическим протоколированием." },
        digest: { name: "Еженедельный Дайджест", desc: "Обобщение ключевых событий недели за секунды." },
        bridge: { name: "Интеграционный Мост", desc: "Связь с Telegram, Discord, Slack." },
        governance: { name: "Управление", desc: "Голосования, выборы, референдумы в MicroDAO." },
        treasury: { name: "Общая Казна", desc: "Мультисиг-кошельки для DAO-финансов." },
        wallet: { name: "Локальный Кошелек", desc: "Управление приватными ключами и токенами." },
        tokenFactory: { name: "Токен Фабрика", desc: "Создание и запуск токена сообщества в 1 клик." },
        tokenomics: { name: "Моделирование Токеноміки", desc: "Расчет стимулов и графиков вестинга." },
        devAgents: { name: "Разработческие Агенты", desc: "Автономный кодинг, тестирование, релиз." },
        marketplace: { name: "Маркетплейс Навыков", desc: "Каталог интеграций и агентов от комьюнити." },
        e2ee: { name: "Шифрование & Ключие", desc: "Децентрализованное управление секретами." },
        secondMe: { name: "Второй Я / Клон", desc: "Создание вашего цифрового аватара для рутинных задач." }
      }
    },

    permissionsTab: {
      intro: "Настройте права доступа для вашего Духа Сообщества. Некоторые действия безопасны, другие требуют обязательного одобрения владельцем/администратором.",
      safeTitle: "Безопасные действия (может выполнять самостоятельно):",
      sensitiveTitle: "Чувствительные действия (требуют одобрения владельцем/администратором):",
      requiresApprovalLabel: "Требует одобрения owner/admin",
      fields: {
        can_invite_guests: "Может создавать гостевые инвайт-коды",
        can_create_tasks: "Может создавать задачи на Kanban-доске",
        can_send_welcome_messages: "Может отправлять приветствия новым участникам",
        can_create_summaries: "Может готовить сводки и дайджесты дискуссий",
        can_suggest_roles: "Может предлагать роли для участников",
        can_approve_members: "Может утверждать новых участников сообщества",
        can_make_admins: "Может назначать администраторов",
        can_remove_members: "Может удалять участников из сообщества",
        can_delete_community: "Может удалить всю MicroDAO (экстремальное действие)",
        requires_human_approval_for_sensitive_actions: "Обязательное человеческое одобрение для любых финансовых/управленческих действий"
      }
    },

    actionLogTab: {
      intro: "Хронология действий, которые подготовил или выполнил ваш Дух Сообщества.",
      actionType: "Тип действия",
      status: "Статус",
      createdAt: "Создано",
      requestedBy: "Инициатор",
      approvedBy: "Одобрил",
      payload: "Детали действия",
      statuses: {
        draft: "Черновик",
        pending_approval: "Ожидает подтверждения",
        approved: "Одобрено",
        executed: "Выполнено",
        rejected: "Отклонено",
        failed: "Ошибка"
      }
    },

    technicalTab: {
      intro: "Расширенные параметры для разработчиков и продвинутых пользователей.",
      sysPrompt: "Системный промпт агента",
      sysPromptDesc: "Эта инструкция определяет базовое поведение, роли и правила обработки сообщений.",
      webhookSetting: "Тип подключения и Webhook",
      endpointUrl: "Адрес Webhook/WebSocket",
      rawConfig: "Сырая JSON конфигурация (метаданные)",
      warningText: "Внимание! Неправильная настройка этих параметров может нарушить стабильность работы агента."
    }
  },
  es: {
    pageTitle: "Configuración del Espíritu de la Comunidad",
    pageSubtitle: "Gestione la personalidad, memoria, módulos y permisos de su Agente del Espíritu de la Comunidad",
    notAdminBanner: "Solo los propietarios o administradores pueden editar la configuración del Espíritu de la Comunidad.",
    saveBtn: "Guardar Ajustes",
    toastSaved: "¡Ajustes guardados con éxito!",
    toastSaveError: "Error al guardar ajustes.",
    toastSummarized: "¡Memoria de la comunidad analizada y resumida con éxito!",
    noActiveCommunity: "Seleccione o cree una MicroDAO en el menú de la izquierda para configurar su Espíritu de la Comunidad.",
    noSpiritAgent: "Aún no se ha creado un Espíritu de la Comunidad para esta MicroDAO.",
    repairCta: "Crear Espíritu de la Comunidad para esta MicroDAO",
    repairDesc: "Cada MicroDAO debe tener su propio Agente de Espíritu de la Comunidad para coordinación, memoria y automatización.",
    createAgentBtn: "Crear Espíritu de la Comunidad",

    tabs: {
      profile: "Perfil",
      personality: "Personalidad",
      memory: "Memoria",
      modules: "Módulos",
      permissions: "Permisos",
      actionLog: "Registro de Acciones",
      technical: "Técnico"
    },

    profileTab: {
      agentName: "Nombre del Agente",
      communityName: "Nombre de la Comunidad (Solo Lectura)",
      shortMission: "Misión Corta de la Comunidad",
      primaryLang: "Idioma Principal",
      secondaryLangs: "Idiomas Secundarios"
    },

    personalityTab: {
      tone: "Tono de Comunicación",
      commStyle: "Estilo de Comunicación",
      strictness: "Nivel de Rigidez",
      decisionStyle: "Estilo de Toma de Decisiones",
      conflictStyle: "Estilo de Resolución de Conflictos",
      tones: {
        warm: "Cálido & Amigable",
        professional: "Profesional & Reservado",
        creative: "Creativo & Inspirador"
      },
      strictnessLevels: {
        low: "Bajo (asistencia suave)",
        medium: "Medio (moderación activa)",
        high: "Alto (control estricto)"
      },
      decisionStyles: {
        consensus: "Consenso (solo acuerdo)",
        autonomous: "Autónomo (actúa de manera independiente)",
        human_approved: "Aprobado por Humanos (supervisado)"
      }
    },

    memoryTab: {
      intro: "La memoria del agente almacena todo el conocimiento sobre los valores, reglas y actividades de su MicroDAO.",
      summaryTitle: "Resumen de la Memoria de la Comunidad:",
      kbLink: "Abrir Base de Conocimientos",
      addDoc: "Agregar documento a la memoria",
      summarizeBtn: "Resumir memoria de la comunidad",
      futureSources: "Futuras Fuentes de Memoria (Roadmap):",
      sourcesList: [
        "Indexación automática de commits de Git de la comunidad",
        "Transcripciones de sincronizaciones semanales de audio/video",
        "Sincronización con bases de datos Notion/Wiki externas"
      ]
    },

    modulesTab: {
      availableTitle: "Disponible Ahora (Módulos Activos)",
      comingTitle: "Próximamente",
      roadmapTitle: "En Desarrollo (Roadmap)",
      futureTitle: "Futuras Exploraciones",
      stewardName: "Steward / Moderación",
      stewardDesc: "Modera chats, detecta spam y violaciones, ayuda a miembros.",
      memoryName: "Memoria / RAG",
      memoryDesc: "Acceso a base de conocimientos común, documentos y experiencia pasada.",
      taskName: "Organizador de Tareas",
      taskDesc: "Gestionar tarjetas Kanban y asignar responsables.",
      onboardingName: "Onboarding / Invitaciones",
      onboardingDesc: "Crear códigos de invitación e incorporar nuevos participantes.",
      modulesList: {
        messenger: { name: "Mensajero", desc: "Chats edge-to-edge sin servidor central." },
        meeting: { name: "Reuniones", desc: "Salas de voz con resúmenes automáticos de reuniones." },
        digest: { name: "Resumen Semanal", desc: "Resumir eventos clave de la semana en segundos." },
        bridge: { name: "Puente de Integración", desc: "Enlace con Telegram, Discord, Slack." },
        governance: { name: "Gobernanza", desc: "Votación, elecciones y referéndums en MicroDAO." },
        treasury: { name: "Tesorería Común", desc: "Billeteras multisig para finanzas de DAO." },
        wallet: { name: "Billetera Local", desc: "Gestione claves privadas y tokens de la comunidad." },
        tokenFactory: { name: "Fábrica de Tokens", desc: "Cree y lance tokens de comunidad en 1-clic." },
        tokenomics: { name: "Modelado de Tokenomics", desc: "Calcule incentivos y cronogramas de adjudicación." },
        devAgents: { name: "Agentes Desarrolladores", desc: "Codificación autónoma, pruebas, lanzamiento." },
        marketplace: { name: "Mercado de Habilidades", desc: "Catálogo de integraciones creadas por la comunidad." },
        e2ee: { name: "Cifrado & Claves", desc: "Gestión descentralizada de secretos." },
        secondMe: { name: "Segundo Yo / Clon", desc: "Cree su avatar digital para tareas rutinarias." }
      }
    },

    permissionsTab: {
      intro: "Configure los permisos de acceso para su Agente del Espíritu de la Comunidad. Algunas acciones son seguras, mientras que otras estrictamente requieren la aprobación del propietario/administrador.",
      safeTitle: "Acciones Seguras (El agente puede ejecutar de forma autónoma):",
      sensitiveTitle: "Acciones Sensibles (Requieren aprobación del propietario/administrador):",
      requiresApprovalLabel: "Requiere aprobación del propietario/admin",
      fields: {
        can_invite_guests: "Puede crear códigos de invitación de invitados",
        can_create_tasks: "Puede crear tareas en el tablero Kanban",
        can_send_welcome_messages: "Puede enviar mensajes de bienvenida a los nuevos miembros",
        can_create_summaries: "Puede preparar resúmenes de debates y digests",
        can_suggest_roles: "Puede sugerir roles para los miembros",
        can_approve_members: "Puede aprobar nuevos miembros de la comunidad",
        can_make_admins: "Puede hacer que los miembros sean administradores",
        can_remove_members: "Puede eliminar miembros de la comunidad",
        can_delete_community: "Puede eliminar toda la MicroDAO (acción extrema)",
        requires_human_approval_for_sensitive_actions: "Se requiere aprobación humana estricta para cualquier acción financiera/de gobernanza"
      }
    },

    actionLogTab: {
      intro: "Historial de acciones preparadas o ejecutadas por su Agente del Espíritu de la Comunidad.",
      actionType: "Tipo de Acción",
      status: "Estado",
      createdAt: "Creado",
      requestedBy: "Iniciador",
      approvedBy: "Aprobado Por",
      payload: "Detalles de la Acción",
      statuses: {
        draft: "Borrador",
        pending_approval: "Pendiente de Aprobación",
        approved: "Aprobado",
        executed: "Ejecutado",
        rejected: "Rechazado",
        failed: "Fallido"
      }
    },

    technicalTab: {
      intro: "Parámetros avanzados para desarrolladores y usuarios avanzados.",
      sysPrompt: "Prompt del Sistema del Agente",
      sysPromptDesc: "Esta instrucción define comportamientos básicos, roles y reglas de procesamiento de mensajes.",
      webhookSetting: "Tipo de Conexión & Webhook",
      endpointUrl: "Endpoint de Webhook/WebSocket",
      rawConfig: "Configuración JSON en Crudo (metadatos)",
      warningText: "¡Advertencia! La configuración incorrecta de estos parámetros puede romper la estabilidad del agente."
    }
  }
};

export default function Agents() {
  const { t, language } = useTranslation();
  const ml = manageLocals[language as keyof typeof manageLocals] || manageLocals.en;
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';

  const { activeCommunity, activeCommunityId, isCommunityAdmin, refresh: refreshCommunity } = useActiveCommunity();
  
  const [spiritAgent, setSpiritAgent] = useState<any>(null);
  const [agentPerms, setAgentPerms] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
  }, [activeCommunityId]);

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

      const systemPrompt = `You are the Community Spirit Agent (Дух Спільноти) of this MicroDAO, named ${agentName}.
Community Name: ${activeCommunity?.name}
Mission: ${shortMission}
Autonomy Level: ${spiritAgent.personality?.autonomy_level || 'coordinator'}
Language: ${primaryLang}
Communication Style: ${commStyle}
Tone: ${tone}
Strictness: ${strictness}
Decision-making Style: ${decisionStyle}
Conflict Resolution Style: ${conflictStyle}

Your identity: You preserve community memory, coordinate members, onboard new people, help the leader structure roles and tasks, and act as a supervised admin under human authority. Speak in a helpful, community-focused tone, in the primary language.`;

      // 1. Update agents table
      const { error: agentUpdateErr } = await supabase
        .from('agents')
        .update({
          name: agentName,
          system_prompt: systemPrompt,
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
        system_prompt: systemPrompt,
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
        <Card className="p-8 border-slate-800 bg-slate-950/20 backdrop-blur-md">
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
        <Card className="p-8 border-amber-500/20 bg-amber-500/5 backdrop-blur-md">
          <ShieldAlert className="h-12 w-12 mx-auto text-amber-400 mb-4 animate-pulse" />
          <h2 className="text-xl font-bold text-slate-200 mb-2">{ml.noSpiritAgent}</h2>
          <p className="text-slate-400 text-sm mb-6">{ml.repairDesc}</p>
          <Button onClick={() => navigate('/onboarding')} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold">
            <Plus className="mr-2 h-4 w-4 shrink-0" />
            {ml.createAgentBtn}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl text-left">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">{ml.pageTitle}</h1>
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 bg-indigo-500/5 font-mono text-xs">
              {spiritAgent.name}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            {ml.pageSubtitle}
          </p>
        </div>
        
        {isCommunityAdmin && (
          <Button 
            disabled={saving} 
            onClick={handleSaveSettings}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
            <span>{ml.saveBtn}</span>
          </Button>
        )}
      </div>

      {!isCommunityAdmin && (
        <div className="mb-6 p-3 bg-amber-500/5 border border-amber-500/20 text-amber-300 text-xs rounded-lg flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{ml.notAdminBanner}</span>
        </div>
      )}

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <div className="border-b border-slate-800">
          <TabsList className="bg-transparent h-auto p-0 flex flex-wrap gap-2 justify-start">
            {Object.entries(ml.tabs).map(([key, label]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="bg-transparent text-slate-400 border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 rounded-none px-4 py-2 text-xs sm:text-sm font-semibold transition-all"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="space-y-4 outline-none">
          <Card className="bg-slate-950/20 border-slate-800">
            <CardHeader>
              <CardTitle className="text-md font-bold text-slate-200">{ml.tabs.profile}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="agentName" className="text-xs text-slate-300">{ml.profileTab.agentName}</Label>
                  <Input
                    id="agentName"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    disabled={!isCommunityAdmin}
                    className="bg-slate-900 border-slate-800 text-slate-100 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="communityName" className="text-xs text-slate-300">{ml.profileTab.communityName}</Label>
                  <Input
                    id="communityName"
                    value={activeCommunity?.name || ''}
                    disabled
                    className="bg-slate-900 border-slate-800/50 text-slate-500 text-xs"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="shortMission" className="text-xs text-slate-300">{ml.profileTab.shortMission}</Label>
                <Textarea
                  id="shortMission"
                  value={shortMission}
                  onChange={(e) => setShortMission(e.target.value)}
                  disabled={!isCommunityAdmin}
                  rows={4}
                  className="bg-slate-900 border-slate-800 text-slate-100 text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="primaryLang" className="text-xs text-slate-300">{ml.profileTab.primaryLang}</Label>
                  <Select
                    value={primaryLang}
                    onValueChange={setPrimaryLang}
                    disabled={!isCommunityAdmin}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-800 text-xs text-slate-100">
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
                <div className="space-y-1">
                  <Label htmlFor="secondaryLangs" className="text-xs text-slate-300">{ml.profileTab.secondaryLangs}</Label>
                  <Input
                    id="secondaryLangs"
                    placeholder="EN, ES..."
                    value={secondaryLangs}
                    onChange={(e) => setSecondaryLangs(e.target.value)}
                    disabled={!isCommunityAdmin}
                    className="bg-slate-900 border-slate-800 text-slate-100 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PERSONALITY TAB */}
        <TabsContent value="personality" className="space-y-4 outline-none">
          <Card className="bg-slate-950/20 border-slate-800">
            <CardHeader>
              <CardTitle className="text-md font-bold text-slate-200">{ml.tabs.personality}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="tone" className="text-xs text-slate-300">{ml.personalityTab.tone}</Label>
                  <Select
                    value={tone}
                    onValueChange={setTone}
                    disabled={!isCommunityAdmin}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-800 text-xs text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                      <SelectItem value="warm">{ml.personalityTab.tones.warm}</SelectItem>
                      <SelectItem value="professional">{ml.personalityTab.tones.professional}</SelectItem>
                      <SelectItem value="creative">{ml.personalityTab.tones.creative}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="commStyle" className="text-xs text-slate-300">{ml.personalityTab.commStyle}</Label>
                  <Input
                    id="commStyle"
                    value={commStyle}
                    onChange={(e) => setCommStyle(e.target.value)}
                    disabled={!isCommunityAdmin}
                    className="bg-slate-900 border-slate-800 text-slate-100 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="strictness" className="text-xs text-slate-300">{ml.personalityTab.strictness}</Label>
                  <Select
                    value={strictness}
                    onValueChange={setStrictness}
                    disabled={!isCommunityAdmin}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-800 text-xs text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                      <SelectItem value="low">{ml.personalityTab.strictnessLevels.low}</SelectItem>
                      <SelectItem value="medium">{ml.personalityTab.strictnessLevels.medium}</SelectItem>
                      <SelectItem value="high">{ml.personalityTab.strictnessLevels.high}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="decisionStyle" className="text-xs text-slate-300">{ml.personalityTab.decisionStyle}</Label>
                  <Select
                    value={decisionStyle}
                    onValueChange={setDecisionStyle}
                    disabled={!isCommunityAdmin}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-800 text-xs text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                      <SelectItem value="consensus">{ml.personalityTab.decisionStyles.consensus}</SelectItem>
                      <SelectItem value="autonomous">{ml.personalityTab.decisionStyles.autonomous}</SelectItem>
                      <SelectItem value="human_approved">{ml.personalityTab.decisionStyles.human_approved}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="conflictStyle" className="text-xs text-slate-300">{ml.personalityTab.conflictStyle}</Label>
                  <Input
                    id="conflictStyle"
                    value={conflictStyle}
                    onChange={(e) => setConflictStyle(e.target.value)}
                    disabled={!isCommunityAdmin}
                    className="bg-slate-900 border-slate-800 text-slate-100 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MEMORY TAB */}
        <TabsContent value="memory" className="space-y-4 outline-none">
          <Card className="bg-slate-950/20 border-slate-800">
            <CardHeader>
              <CardTitle className="text-md font-bold text-slate-200">{ml.tabs.memory}</CardTitle>
              <CardDescription className="text-xs">{ml.memoryTab.intro}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-900 text-xs leading-relaxed text-slate-300 space-y-2">
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
                  className="text-xs bg-slate-900 border-slate-800 hover:bg-slate-800 text-indigo-300 gap-1.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {ml.memoryTab.kbLink}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate('/knowledge-base')}
                  className="text-xs bg-slate-900 border-slate-800 hover:bg-slate-800 text-indigo-300 gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {ml.memoryTab.addDoc}
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSummarizeMemory}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5"
                >
                  <Zap className="h-3.5 w-3.5 animate-pulse" />
                  {ml.memoryTab.summarizeBtn}
                </Button>
              </div>

              <div className="border-t border-slate-900 pt-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-300">{ml.memoryTab.futureSources}</h4>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                  {ml.memoryTab.sourcesList.map((src, index) => (
                    <li key={index}>{src}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MODULES TAB */}
        <TabsContent value="modules" className="space-y-6 outline-none">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300">{ml.modulesTab.availableTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <Card className="bg-slate-900 border-indigo-500/20 p-4 flex gap-3.5 items-start">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">{ml.modulesTab.stewardName}</span>
                    <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-400 border-green-500/20 uppercase tracking-wider">Active</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{ml.modulesTab.stewardDesc}</p>
                </div>
              </Card>

              <Card className="bg-slate-900 border-indigo-500/20 p-4 flex gap-3.5 items-start">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">{ml.modulesTab.memoryName}</span>
                    <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-400 border-green-500/20 uppercase tracking-wider">Active</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{ml.modulesTab.memoryDesc}</p>
                </div>
              </Card>

              <Card className="bg-slate-900 border-indigo-500/20 p-4 flex gap-3.5 items-start">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <FolderPlus className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">{ml.modulesTab.taskName}</span>
                    <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-400 border-green-500/20 uppercase tracking-wider">Active</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{ml.modulesTab.taskDesc}</p>
                </div>
              </Card>

              <Card className="bg-slate-900 border-indigo-500/20 p-4 flex gap-3.5 items-start">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <UserPlus className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">{ml.modulesTab.onboardingName}</span>
                    <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-400 border-green-500/20 uppercase tracking-wider">Active</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{ml.modulesTab.onboardingDesc}</p>
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
                  <Card key={key} className="bg-slate-950/40 border-slate-900 p-3.5">
                    <span className="text-xs font-bold text-slate-200">{info.name}</span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">{info.desc}</p>
                    <Badge variant="outline" className="text-[8px] bg-indigo-500/5 text-indigo-300 border-indigo-500/10 mt-2.5">Soon</Badge>
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
                  <Card key={key} className="bg-slate-950/40 border-slate-900 p-3">
                    <span className="text-xs font-bold text-slate-300">{info.name}</span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">{info.desc}</p>
                    <Badge variant="outline" className="text-[8px] bg-slate-900 text-slate-400 border-slate-800 mt-2.5">Roadmap</Badge>
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
                  <Card key={key} className="bg-slate-950/40 border-slate-900 p-3">
                    <span className="text-xs font-bold text-slate-300">{info.name}</span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">{info.desc}</p>
                    <Badge variant="outline" className="text-[8px] bg-slate-900 text-slate-500 border-slate-800/50 mt-2.5">Research</Badge>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* PERMISSIONS TAB */}
        <TabsContent value="permissions" className="space-y-4 outline-none">
          <Card className="bg-slate-950/20 border-slate-800">
            <CardHeader>
              <CardTitle className="text-md font-bold text-slate-200">{ml.tabs.permissions}</CardTitle>
              <CardDescription className="text-xs">{ml.permissionsTab.intro}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">{ml.permissionsTab.safeTitle}</h4>
                <div className="space-y-3.5 bg-slate-900/50 p-4 rounded-lg border border-slate-900">
                  {['can_invite_guests', 'can_create_tasks', 'can_send_welcome_messages', 'can_create_summaries', 'can_suggest_roles'].map((key) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <Label htmlFor={key} className="text-xs font-medium text-slate-300 flex-1 leading-normal">
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
                <div className="space-y-3.5 bg-slate-900/50 p-4 rounded-lg border border-slate-900">
                  {['can_approve_members', 'can_make_admins', 'can_remove_members', 'can_delete_community', 'requires_human_approval_for_sensitive_actions'].map((key) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <Label htmlFor={key} className="text-xs font-medium text-slate-300 leading-normal block">
                          {ml.permissionsTab.fields[key as keyof typeof ml.permissionsTab.fields]}
                        </Label>
                        <span className="text-[10px] text-amber-400/80 font-medium">
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

        {/* ACTION LOG TAB */}
        <TabsContent value="actionLog" className="space-y-4 outline-none">
          <Card className="bg-slate-950/20 border-slate-800">
            <CardHeader>
              <CardTitle className="text-md font-bold text-slate-200">{ml.tabs.actionLog}</CardTitle>
              <CardDescription className="text-xs">{ml.actionLogTab.intro}</CardDescription>
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
                          <td className="py-3 pr-4 font-medium text-slate-200 capitalize">
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
                          <td className="py-3 px-4 text-slate-400">
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

        {/* TECHNICAL TAB */}
        <TabsContent value="technical" className="space-y-4 outline-none">
          <Card className="bg-slate-950/20 border-slate-800">
            <CardHeader>
              <CardTitle className="text-md font-bold text-slate-200">{ml.tabs.technical}</CardTitle>
              <CardDescription className="text-xs">{ml.technicalTab.intro}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3 bg-amber-500/5 border border-amber-500/20 text-amber-300 rounded-lg flex items-start gap-2 mb-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{ml.technicalTab.warningText}</span>
              </div>

              <details className="group border border-slate-850 bg-slate-900/30 rounded-lg overflow-hidden">
                <summary className="flex items-center justify-between p-3.5 font-semibold text-slate-200 cursor-pointer select-none hover:bg-slate-900/50">
                  <span className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-indigo-400" />
                    <span>{ml.technicalTab.sysPrompt}</span>
                  </span>
                </summary>
                <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-2">
                  <p className="text-slate-400 text-[11px] leading-normal">{ml.technicalTab.sysPromptDesc}</p>
                  <Textarea
                    readOnly
                    value={spiritAgent.system_prompt || ''}
                    rows={12}
                    className="bg-slate-950 border-slate-900 text-slate-400 font-mono text-[11px] resize-none"
                  />
                </div>
              </details>

              <details className="group border border-slate-850 bg-slate-900/30 rounded-lg overflow-hidden mt-3">
                <summary className="flex items-center justify-between p-3.5 font-semibold text-slate-200 cursor-pointer select-none hover:bg-slate-900/50">
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-indigo-400" />
                    <span>{ml.technicalTab.webhookSetting}</span>
                  </span>
                </summary>
                <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-slate-300 font-semibold">{t.agents.labelType || 'Connection type'}</Label>
                      <Input
                        readOnly
                        value={spiritAgent.connection_type || 'msp'}
                        className="bg-slate-900 border-slate-800 text-slate-400 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-slate-300 font-semibold">{ml.technicalTab.endpointUrl}</Label>
                      <Input
                        readOnly
                        value={spiritAgent.endpoint_url || 'Internal (MSP)'}
                        className="bg-slate-900 border-slate-800 text-slate-400 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </details>

              <details className="group border border-slate-850 bg-slate-900/30 rounded-lg overflow-hidden mt-3">
                <summary className="flex items-center justify-between p-3.5 font-semibold text-slate-200 cursor-pointer select-none hover:bg-slate-900/50">
                  <span className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-indigo-400" />
                    <span>{ml.technicalTab.rawConfig}</span>
                  </span>
                </summary>
                <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
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
