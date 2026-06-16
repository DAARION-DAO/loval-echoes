import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminAgentContext } from '@/hooks/useAdminAgentContext';
import { 
  Bot, Send, ShieldAlert, Sparkles, HelpCircle, Terminal, 
  CheckSquare, Coins, Users, AlertCircle, ExternalLink, 
  Database, RefreshCw, ChevronRight, MessageSquare 
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

const LOCALIZED_RESPONSES: Record<string, Record<string, string | ((ctx: any) => string)>> = {
  en: {
    welcome: "Welcome, Guardian. I am your Platform Administration Assistant. I can help you compile SQL queries, review manual payment checklists, or answer questions regarding MicroDAO administration.\n\nPlease select a topic below or ask me a question.",
    default: "Hello! I am your Guardian Assistant. I help you monitor the platform context, prepare SQL queries, and keep track of administration tasks.\n\nTry asking me about **billing**, **access requests**, **team invites**, **agent operations**, or ask for **SQL queries**.",
    sql: () => `### SQL Templates for Platform Verification

You can execute these SQL queries in the Supabase SQL Editor to verify database state:

1. **Verify Subscription Statuses**:
\`\`\`sql
SELECT p.email, s.status, s.expires_at, s.tx_hash
FROM public.microdao_subscriptions s
JOIN public.profiles p ON s.user_id = p.id
ORDER BY s.created_at DESC LIMIT 10;
\`\`\`

2. **Check Pending Access Requests**:
\`\`\`sql
SELECT email, requested_tier, status, created_at
FROM public.access_requests
WHERE status = 'pending'
ORDER BY created_at DESC;
\`\`\`

3. **Check platform audit logs**:
\`\`\`sql
SELECT action, target_type, details, created_at
FROM public.audit_logs
ORDER BY created_at DESC LIMIT 15;
\`\`\``,
    billing: (ctx) => {
      const active = ctx?.billing?.activeSubscriptions ?? 0;
      const pending = ctx?.billing?.pendingPayments ?? 0;
      const review = ctx?.billing?.manualReviewPayments ?? 0;
      const priceUsd = ctx?.billing?.currentLeaderPlan?.priceUsd ?? 20;
      const priceDaar = ctx?.billing?.currentLeaderPlan?.priceDaar ?? 2;
      const treasury = ctx?.billing?.currentLeaderPlan?.treasuryAddress ?? '0x39c8...b7e8';
      const assets = ctx?.billing?.currentLeaderPlan?.acceptedAssets?.join(', ') || 'DAAR, USDT, USDC, POL';
      
      let res = `### Live Billing & Subscriptions Context

* **Active Subscriptions**: ${active}
* **Pending Payments**: ${pending}
* **Manual Review Required**: ${review}

**Current Leader Plan Configuration**:
* **Price (USD)**: $${priceUsd}
* **Price (DAAR)**: ${priceDaar} DAAR/month
* **Treasury EVM Address**: \`${treasury}\`
* **Accepted Assets**: ${assets}

To approve or reject pending crypto payment intents, navigate to the **[Billing Console](/admin/billing)**.`;

      if (pending > 0) {
        res += `\n\n> [!TIP]\n> There are ${pending} payment intents waiting. Please verify their tx hashes on Polygonscan before approving.`;
      }
      return res;
    },
    access: (ctx) => {
      const pending = ctx?.access?.pendingRequests ?? 0;
      const founder = ctx?.access?.founderRequests ?? 0;
      const partner = ctx?.access?.partnerRequests ?? 0;
      const sovereign = ctx?.access?.sovereignRequests ?? 0;
      const worker = ctx?.access?.workerNodeRequests ?? 0;
      
      return `### Access Requests Context

* **Pending Requests**: ${pending} (Founder: ${founder}, Partner: ${partner}, Sovereign/Network: ${sovereign}, Worker Node: ${worker})

**Guardian Manual Review Checklist**:
1. Confirm applicant email alignment and verification.
2. Review the stated use case/purpose.
3. Validate access requirements for requested tier.
4. Navigate to the **[Access Requests Panel](/admin/access-requests)** to Approve/Reject.

*Note: Approving a request automatically updates the user's \`access_tier\` parameter accordingly.*`;
    },
    team: (ctx) => {
      const count = ctx?.team?.guardiansCount ?? 1;
      const pending = ctx?.team?.pendingInvites ?? 0;
      
      return `### Platform Team & Guardians

* **Active Guardians**: ${count}
* **Pending Invites**: ${pending}

You can invite new administrators (Guardians) by generating secure one-time invite tokens from the **[Platform Team Console](/admin/team)**.`;
    },
    ops: (ctx) => {
      const total = ctx?.microdaos?.total ?? 0;
      const active = ctx?.microdaos?.active ?? 0;
      const without = ctx?.microdaos?.withoutSpiritAgent ?? 0;
      const agents = ctx?.agentOps?.activeAgents ?? 0;
      const pending = ctx?.agentOps?.pendingApprovals ?? 0;
      const failed = ctx?.agentOps?.failedActions ?? 0;
      
      return `### MicroDAO & Agent Operations

* **Total MicroDAOs**: ${total} (Active: ${active})
* **MicroDAOs without Spirit Agent**: ${without}
* **Active Platform Agents**: ${agents}
* **Pending Agent Approvals**: ${pending}
* **Recent Failed Actions**: ${failed}

To view detailed agent execution logs and troubleshoot failed tasks, navigate to the **[Agent Operations Console](/admin/agent-ops)**.`;
    }
  },
  uk: {
    welcome: "Вітаю, Guardian. Я твій асистент з управління платформою MicroDAO. Я можу допомогти тобі підготувати SQL-запити, переглянути чек-лісти для перевірки платежів або відповісти на питання щодо адміністрування платформи.\n\nБудь ласка, оберіть тему або введіть запит.",
    default: "Вітаю! Я твій Guardian-асистент. Я допомагаю відстежувати контекст платформи, створювати SQL-запити та керувати завданнями адміністрування.\n\nСпробуйте запитати мене про **білінг**, **запити на доступ**, **запрошення команди**, **операції агентів** або попросіть **SQL-запити**.",
    sql: () => `### SQL-шаблони для перевірки платформи

Ви можете виконати ці SQL-запити в Supabase SQL Editor для перевірки стану бази даних:

1. **Перевірка статусів підписок**:
\`\`\`sql
SELECT p.email, s.status, s.expires_at, s.tx_hash
FROM public.microdao_subscriptions s
JOIN public.profiles p ON s.user_id = p.id
ORDER BY s.created_at DESC LIMIT 10;
\`\`\`

2. **Перевірка запитів на доступ в очікуванні**:
\`\`\`sql
SELECT email, requested_tier, status, created_at
FROM public.access_requests
WHERE status = 'pending'
ORDER BY created_at DESC;
\`\`\`

3. **Перевірка аудит-логів платформи**:
\`\`\`sql
SELECT action, target_type, details, created_at
FROM public.audit_logs
ORDER BY created_at DESC LIMIT 15;
\`\`\``,
    billing: (ctx) => {
      const active = ctx?.billing?.activeSubscriptions ?? 0;
      const pending = ctx?.billing?.pendingPayments ?? 0;
      const review = ctx?.billing?.manualReviewPayments ?? 0;
      const priceUsd = ctx?.billing?.currentLeaderPlan?.priceUsd ?? 20;
      const priceDaar = ctx?.billing?.currentLeaderPlan?.priceDaar ?? 2;
      const treasury = ctx?.billing?.currentLeaderPlan?.treasuryAddress ?? '0x39c8...b7e8';
      const assets = ctx?.billing?.currentLeaderPlan?.acceptedAssets?.join(', ') || 'DAAR, USDT, USDC, POL';
      
      let res = `### Контекст білінгу та підписок

* **Активні підписки**: ${active}
* **Платежі в очікуванні**: ${pending}
* **Потрібна ручна перевірка**: ${review}

**Поточна конфігурація Leader Plan**:
* **Ціна (USD)**: $${priceUsd}
* **Ціна (DAAR)**: ${priceDaar} DAAR/місяць
* **EVM-адреса скарбниці**: \`${treasury}\`
* **Дозволені активи**: ${assets}

Щоб схвалити або відхилити платежі в очікуванні, перейдіть до **[Панелі білінгу](/admin/billing)**.`;

      if (pending > 0) {
        res += `\n\n> [!TIP]\n> Наразі є ${pending} платежів в очікуванні. Будь ласка, перевірте їхні хеші транзакцій у Polygonscan перед схваленням.`;
      }
      return res;
    },
    access: (ctx) => {
      const pending = ctx?.access?.pendingRequests ?? 0;
      const founder = ctx?.access?.founderRequests ?? 0;
      const partner = ctx?.access?.partnerRequests ?? 0;
      const sovereign = ctx?.access?.sovereignRequests ?? 0;
      const worker = ctx?.access?.workerNodeRequests ?? 0;
      
      return `### Контекст запитів на доступ

* **Запити в очікуванні**: ${pending} (Founder: ${founder}, Partner: ${partner}, Sovereign/Network: ${sovereign}, Worker Node: ${worker})

**Чек-ліст ручної перевірки для Guardian**:
1. Перевірте правильність та верифікацію email користувача.
2. Перегляньте вказаний варіант використання (use case).
3. Перевірте відповідність вимогам до обраного рівня доступу.
4. Перейдіть до **[Панелі запитів на доступ](/admin/access-requests)**, щоб Схвалити/Відхилити запит.

*Примітка: Схвалення запиту автоматично оновлює параметр \`access_tier\` користувача.*`;
    },
    team: (ctx) => {
      const count = ctx?.team?.guardiansCount ?? 1;
      const pending = ctx?.team?.pendingInvites ?? 0;
      
      return `### Команда платформи та Guardians

* **Активні Guardians**: ${count}
* **Запрошення в очікуванні**: ${pending}

Ви можете запросити нових адміністраторів (Guardians), згенерувавши захищені одноразові токени на сторінці **[Команда платформи](/admin/team)**.`;
    },
    ops: (ctx) => {
      const total = ctx?.microdaos?.total ?? 0;
      const active = ctx?.microdaos?.active ?? 0;
      const without = ctx?.microdaos?.withoutSpiritAgent ?? 0;
      const agents = ctx?.agentOps?.activeAgents ?? 0;
      const pending = ctx?.agentOps?.pendingApprovals ?? 0;
      const failed = ctx?.agentOps?.failedActions ?? 0;
      
      return `### Операції MicroDAO та Агентів

* **Всього MicroDAO**: ${total} (Активні: ${active})
* **MicroDAO без Spirit-агента**: ${without}
* **Активні агенти платформи**: ${agents}
* **Агенти в очікуванні схвалення**: ${pending}
* **Останні помилки операцій**: ${failed}

Щоб переглянути детальні логи виконання агентів та усунути помилки, перейдіть до **[Панелі операцій агентів](/admin/agent-ops)**.`;
    }
  },
  ru: {
    welcome: "Приветствую, Guardian. Я твой ассистент по управлению платформой MicroDAO. Я могу помочь тебе подготовить SQL-запросы, просмотреть чек-листы для проверки платежей или ответить на вопросы по администрированию платформы.\n\nПожалуйста, выберите тему или введите запрос.",
    default: "Привет! Я твой Guardian-ассистент. Я помогаю отслеживать контекст платформы, готовить SQL-запросы и управлять задачами администрирования.\n\nПопробуйте спросить меня про **биллинг**, **запросы доступа**, **приглашения команды**, **операции агентов** или попросите **SQL-запросы**.",
    sql: () => `### SQL-шаблоны для проверки платформы

Вы можете выполнить эти SQL-запросы в Supabase SQL Editor для проверки состояния базы данных:

1. **Проверка статусов подписок**:
\`\`\`sql
SELECT p.email, s.status, s.expires_at, s.tx_hash
FROM public.microdao_subscriptions s
JOIN public.profiles p ON s.user_id = p.id
ORDER BY s.created_at DESC LIMIT 10;
\`\`\`

2. **Проверка запросов на доступ в ожидании**:
\`\`\`sql
SELECT email, requested_tier, status, created_at
FROM public.access_requests
WHERE status = 'pending'
ORDER BY created_at DESC;
\`\`\`

3. **Проверка аудит-логов платформы**:
\`\`\`sql
SELECT action, target_type, details, created_at
FROM public.audit_logs
ORDER BY created_at DESC LIMIT 15;
\`\`\`\``,
    billing: (ctx) => {
      const active = ctx?.billing?.activeSubscriptions ?? 0;
      const pending = ctx?.billing?.pendingPayments ?? 0;
      const review = ctx?.billing?.manualReviewPayments ?? 0;
      const priceUsd = ctx?.billing?.currentLeaderPlan?.priceUsd ?? 20;
      const priceDaar = ctx?.billing?.currentLeaderPlan?.priceDaar ?? 2;
      const treasury = ctx?.billing?.currentLeaderPlan?.treasuryAddress ?? '0x39c8...b7e8';
      const assets = ctx?.billing?.currentLeaderPlan?.acceptedAssets?.join(', ') || 'DAAR, USDT, USDC, POL';
      
      let res = `### Контекст биллинга и подписок

* **Активные подписки**: ${active}
* **Платежи в ожидании**: ${pending}
* **Требуется ручная проверка**: ${review}

**Текущая конфигурация Leader Plan**:
* **Цена (USD)**: $${priceUsd}
* **Цена (DAAR)**: ${priceDaar} DAAR/месяц
* **EVM-адрес казначейства**: \`${treasury}\`
* **Разрешенные активы**: ${assets}

Чтобы одобрить или отклонить платежи в ожидании, перейдите в **[Панель биллинга](/admin/billing)**.`;

      if (pending > 0) {
        res += `\n\n> [!TIP]\n> Сейчас ожидает проверки ${pending} платежей. Пожалуйста, верифицируйте их хэши транзакций в Polygonscan перед одобрением.`;
      }
      return res;
    },
    access: (ctx) => {
      const pending = ctx?.access?.pendingRequests ?? 0;
      const founder = ctx?.access?.founderRequests ?? 0;
      const partner = ctx?.access?.partnerRequests ?? 0;
      const sovereign = ctx?.access?.sovereignRequests ?? 0;
      const worker = ctx?.access?.workerNodeRequests ?? 0;
      
      return `### Контекст запросов на доступ

* **Запросы в ожидании**: ${pending} (Founder: ${founder}, Partner: ${partner}, Sovereign/Network: ${sovereign}, Worker Node: ${worker})

**Чек-лист ручной проверки для Guardian**:
1. Проверьте правильность и верификацию email пользователя.
2. Просмотрите указанный вариант использования (use case).
3. Проверьте соответствие требованиям к выбранному уровню доступа.
4. Перейдите в **[Panel запросов доступа](/admin/access-requests)**, чтобы Одобрить/Отклонить запрос.

*Примечание: Одобрение запроса автоматически обновляет параметр \`access_tier\` пользователя.*`;
    },
    team: (ctx) => {
      const count = ctx?.team?.guardiansCount ?? 1;
      const pending = ctx?.team?.pendingInvites ?? 0;
      
      return `### Команда платформы и Guardians

* **Активные Guardians**: ${count}
* **Приглашения в ожидании**: ${pending}

Вы можете пригласить новых администраторов (Guardians), сгенерировав безопасные одноразовые токены на странице **[Команда платформы](/admin/team)**.`;
    },
    ops: (ctx) => {
      const total = ctx?.microdaos?.total ?? 0;
      const active = ctx?.microdaos?.active ?? 0;
      const without = ctx?.microdaos?.withoutSpiritAgent ?? 0;
      const agents = ctx?.agentOps?.activeAgents ?? 0;
      const pending = ctx?.agentOps?.pendingApprovals ?? 0;
      const failed = ctx?.agentOps?.failedActions ?? 0;
      
      return `### Операции MicroDAO и Агентов

* **Всего MicroDAO**: ${total} (Активные: ${active})
* **MicroDAO без Spirit-агента**: ${without}
* **Активные агенты платформы**: ${agents}
* **Агенты в ожидании одобрения**: ${pending}
* **Последние ошибки операций**: ${failed}

Чтобы просмотреть детальные логи выполнения агентов и устранить ошибки, перейдите в **[Панель операций агентов](/admin/agent-ops)**.`;
    }
  },
  es: {
    welcome: "Bienvenido, Guardian. Soy tu Asistente de Administración de la Plataforma. Puedo ayudarte a compilar consultas SQL, revisar listas de verificación de pagos manuales o responder preguntas sobre la administración de MicroDAO.\n\nSeleccione un tema a continuación o hágame una pregunta.",
    default: "¡Hola! Soy tu Asistente Guardian. Te ayudo a monitorear el contexto de la plataforma, preparar consultas SQL y realizar un seguimiento de las tareas de administración.\n\nIntente preguntarme sobre **facturación**, **solicitudes de acceso**, **invitaciones de equipo**, **operaciones de agentes** o solicite **consultas SQL**.",
    sql: () => `### Plantillas SQL para Verificación de Plataforma

Puede ejecutar estas consultas SQL en el editor SQL de Supabase para verificar el estado de la base de datos:

1. **Verificar estados de suscripción**:
\`\`\`sql
SELECT p.email, s.status, s.expires_at, s.tx_hash
FROM public.microdao_subscriptions s
JOIN public.profiles p ON s.user_id = p.id
ORDER BY s.created_at DESC LIMIT 10;
\`\`\`

2. **Verificar solicitudes de acceso pendientes**:
\`\`\`sql
SELECT email, requested_tier, status, created_at
FROM public.access_requests
WHERE status = 'pending'
ORDER BY created_at DESC;
\`\`\`

3. **Verificar registros de auditoría de la plataforma**:
\`\`\`sql
SELECT action, target_type, details, created_at
FROM public.audit_logs
ORDER BY created_at DESC LIMIT 15;
\`\`\`\``,
    billing: (ctx) => {
      const active = ctx?.billing?.activeSubscriptions ?? 0;
      const pending = ctx?.billing?.pendingPayments ?? 0;
      const review = ctx?.billing?.manualReviewPayments ?? 0;
      const priceUsd = ctx?.billing?.currentLeaderPlan?.priceUsd ?? 20;
      const priceDaar = ctx?.billing?.currentLeaderPlan?.priceDaar ?? 2;
      const treasury = ctx?.billing?.currentLeaderPlan?.treasuryAddress ?? '0x39c8...b7e8';
      const assets = ctx?.billing?.currentLeaderPlan?.acceptedAssets?.join(', ') || 'DAAR, USDT, USDC, POL';
      
      let res = `### Contexto de Suscripciones y Facturación

* **Suscripciones Activas**: ${active}
* **Pagos Pendientes**: ${pending}
* **Revisión Manual Requerida**: ${review}

**Configuración actual del Leader Plan**:
* **Precio (USD)**: $${priceUsd}
* **Precio (DAAR)**: ${priceDaar} DAAR/mes
* **Dirección EVM del Tesoro**: \`${treasury}\`
* **Activos Aceptados**: ${assets}

Para aprobar o rechazar intenciones de pago criptográficas pendientes, navegue a la **[Consola de Facturación](/admin/billing)**.`;

      if (pending > 0) {
        res += `\n\n> [!TIP]\n> Actualmente hay ${pending} intenciones de pago pendientes. Verifique sus hashes de transacción en Polygonscan antes de aprobar.`;
      }
      return res;
    },
    access: (ctx) => {
      const pending = ctx?.access?.pendingRequests ?? 0;
      const founder = ctx?.access?.founderRequests ?? 0;
      const partner = ctx?.access?.partnerRequests ?? 0;
      const sovereign = ctx?.access?.sovereignRequests ?? 0;
      const worker = ctx?.access?.workerNodeRequests ?? 0;
      
      return `### Contexto de Solicitudes de Acceso

* **Solicitudes Pendientes**: ${pending} (Founder: ${founder}, Partner: ${partner}, Sovereign/Network: ${sovereign}, Worker Node: ${worker})

**Lista de verificación del Guardian para revisión manual**:
1. Confirme la alineación y verificación del correo electrónico del solicitante.
2. Revise el caso de uso o propósito declarado.
3. Valide los requisitos de acceso para el nivel solicitado.
4. Navegue al **[Panel de Solicitudes de Acceso](/admin/access-requests)** para Aprobar/Rechazar.

*Nota: La aprobación de una solicitud actualiza automáticamente el parámetro \`access_tier\` del usuario.*`;
    },
    team: (ctx) => {
      const count = ctx?.team?.guardiansCount ?? 1;
      const pending = ctx?.team?.pendingInvites ?? 0;
      
      return `### Equipo de la Plataforma y Guardians

* **Guardians Activos**: ${count}
* **Invitaciones Pendientes**: ${pending}

Puede invitar a nuevos administradores (Guardians) generando tokens de invitación seguros de un solo uso desde la **[Consola de Equipo de la Plataforma](/admin/team)**.`;
    },
    ops: (ctx) => {
      const total = ctx?.microdaos?.total ?? 0;
      const active = ctx?.microdaos?.active ?? 0;
      const without = ctx?.microdaos?.withoutSpiritAgent ?? 0;
      const agents = ctx?.agentOps?.activeAgents ?? 0;
      const pending = ctx?.agentOps?.pendingApprovals ?? 0;
      const failed = ctx?.agentOps?.failedActions ?? 0;
      
      return `### Operaciones de MicroDAO y Agentes

* **Total de MicroDAOs**: ${total} (Activas: ${active})
* **MicroDAOs sin agente Spirit**: ${without}
* **Agentes de Plataforma Activos**: ${agents}
* **Aprobaciones de Agentes Pendientes**: ${pending}
* **Acciones Fallidas Recientes**: ${failed}

Para ver registros detallados de ejecución de agentes y solucionar problemas de tareas fallidas, navegue a la **[Consola de Operaciones de Agentes](/admin/agent-ops)**.`;
    }
  }
};

export default function AdminAgent() {
  const { t, language } = useTranslation();
  const { context, loading: contextLoading, refetch } = useAdminAgentContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedContext, setSelectedContext] = useState<'billing' | 'access' | 'ops' | 'team' | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set localized welcome message on language change
  useEffect(() => {
    const l = ['uk', 'en', 'ru', 'es'].includes(language) ? language : 'en';
    const welcomeText = LOCALIZED_RESPONSES[l].welcome as string;
    setMessages([
      {
        id: 'welcome',
        sender: 'agent',
        text: welcomeText,
        timestamp: new Date()
      }
    ]);
  }, [language]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');

    setTimeout(() => {
      const responseText = getAgentResponse(currentInput, context, language);
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentMsg]);
    }, 600);
  };

  const selectContextChip = (ctx: 'billing' | 'access' | 'ops' | 'team') => {
    setSelectedContext(ctx);
    const l = ['uk', 'en', 'ru', 'es'].includes(language) ? language : 'en';
    const langResponses = LOCALIZED_RESPONSES[l];
    
    let introText = '';
    if (ctx === 'billing') {
      const fn = langResponses.billing;
      introText = typeof fn === 'function' ? fn(context) : fn;
    } else if (ctx === 'access') {
      const fn = langResponses.access;
      introText = typeof fn === 'function' ? fn(context) : fn;
    } else if (ctx === 'ops') {
      const fn = langResponses.ops;
      introText = typeof fn === 'function' ? fn(context) : fn;
    } else if (ctx === 'team') {
      const fn = langResponses.team;
      introText = typeof fn === 'function' ? fn(context) : fn;
    }

    const agentMsg: Message = {
      id: Date.now().toString(),
      sender: 'agent',
      text: introText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, agentMsg]);
  };

  const getAgentResponse = (text: string, ctx: any, locale: string): string => {
    const query = text.toLowerCase();
    const l = ['uk', 'en', 'ru', 'es'].includes(locale) ? locale : 'en';
    const langResponses = LOCALIZED_RESPONSES[l];

    if (query.includes('sql') || query.includes('запит') || query.includes('запрос') || query.includes('db') || query.includes('database') || query.includes('баз')) {
      const sqlFn = langResponses.sql;
      return typeof sqlFn === 'function' ? sqlFn(ctx) : sqlFn;
    }

    if (query.includes('bill') || query.includes('pay') || query.includes('оплат') || query.includes('платіж') || query.includes('цін') || query.includes('tarif') || query.includes('rate') || query.includes('treasury') || query.includes('платеж') || query.includes('тариф') || query.includes('цен') || query.includes('казначей') || query.includes('factur') || query.includes('tesor')) {
      const billingFn = langResponses.billing;
      return typeof billingFn === 'function' ? billingFn(ctx) : billingFn;
    }

    if (query.includes('access') || query.includes('дост') || query.includes('tier') || query.includes('founder') || query.includes('partner') || query.includes('sovereign') || query.includes('запрос') || query.includes('вход') || query.includes('solicitud')) {
      const accessFn = langResponses.access;
      return typeof accessFn === 'function' ? accessFn(ctx) : accessFn;
    }

    if (query.includes('team') || query.includes('guard') || query.includes('invit') || query.includes('запрош') || query.includes('команд') || query.includes('адмін') || query.includes('команд') || query.includes('приглаш') || query.includes('админ') || query.includes('equipo') || query.includes('miembros')) {
      const teamFn = langResponses.team;
      return typeof teamFn === 'function' ? teamFn(ctx) : teamFn;
    }

    if (query.includes('dao') || query.includes('agent') || query.includes('ops') || query.includes('операц') || query.includes('агент') || query.includes('spirit') || query.includes('ejecuc')) {
      const opsFn = langResponses.ops;
      return typeof opsFn === 'function' ? opsFn(ctx) : opsFn;
    }

    const defaultVal = langResponses.default;
    return typeof defaultVal === 'function' ? defaultVal(ctx) : defaultVal;
  };

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\`\`\`[\s\S]*?\`\`\`|\*\*.*?\*\*|\n|> \[!TIP\][\s\S]*?\n|> \[!WARNING\][\s\S]*?\n)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0] === 'sql' ? 'SQL' : '';
        const code = lines[0] === 'sql' ? lines.slice(1).join('\n') : lines.join('\n');
        return (
          <div key={idx} className="my-2.5 rounded-lg border border-slate-800 bg-slate-950 p-3.5 font-mono text-[11px] text-slate-300 relative group overflow-x-auto shadow-inner">
            {lang && <div className="absolute top-1 right-2.5 text-[9px] text-indigo-400 uppercase font-bold tracking-wider">{lang}</div>}
            <pre className="leading-relaxed">{code}</pre>
          </div>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-semibold text-white bg-indigo-500/10 px-1 rounded">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('> [!TIP]')) {
        const tipContent = part.replace('> [!TIP]', '').trim();
        return (
          <div key={idx} className="my-2.5 p-3 rounded-lg bg-indigo-650/10 border-l-2 border-indigo-500 text-[11px] text-indigo-300 leading-normal flex items-start gap-2 shadow-sm">
            <Sparkles className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <span>{tipContent}</span>
          </div>
        );
      }
      if (part.startsWith('> [!WARNING]')) {
        const warnContent = part.replace('> [!WARNING]', '').trim();
        return (
          <div key={idx} className="my-2.5 p-3 rounded-lg bg-amber-500/5 border-l-2 border-amber-500 text-[11px] text-amber-300 leading-normal flex items-start gap-2 shadow-sm">
            <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <span>{warnContent}</span>
          </div>
        );
      }
      if (part === '\n') {
        return <br key={idx} />;
      }
      
      const linkRegex = /\[(.*?)\]\((.*?)\)/g;
      if (linkRegex.test(part)) {
        const linkParts = [];
        let lastIndex = 0;
        let match;
        linkRegex.lastIndex = 0;
        while ((match = linkRegex.exec(part)) !== null) {
          if (match.index > lastIndex) {
            linkParts.push(part.substring(lastIndex, match.index));
          }
          linkParts.push(
            <a key={match.index} href={match[2]} className="text-indigo-400 hover:text-indigo-300 font-medium underline inline-flex items-center gap-0.5 hover:gap-1 transition-all">
              {match[1]}
              <ChevronRight className="h-3 w-3" />
            </a>
          );
          lastIndex = linkRegex.lastIndex;
        }
        if (lastIndex < part.length) {
          linkParts.push(part.substring(lastIndex));
        }
        return <span key={idx}>{linkParts}</span>;
      }
      
      return part;
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto p-4 sm:p-6 h-[calc(100vh-8rem)]">
      {/* Left Column: Chat Console */}
      <div className="flex-grow flex flex-col min-w-0 h-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-indigo-200 bg-clip-text text-transparent flex items-center gap-2.5">
              <Bot className="h-6 w-6 text-indigo-400 animate-pulse" />
              {t.adminAgent.guardianAssistant}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {t.adminAgent.title} — {t.adminAgent.readonlyMode}
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/5 px-2 py-0.5 flex items-center gap-1 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            Safe Mode
          </Badge>
        </div>

        {/* Safety Notice Banner */}
        <Card className="border-indigo-500/20 bg-indigo-950/20 flex-shrink-0 shadow-sm backdrop-blur-md">
          <CardContent className="p-3.5 flex items-start gap-3 text-xs leading-relaxed text-indigo-300">
            <ShieldAlert className="h-5 w-5 text-indigo-455 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-[11px] text-slate-350">
                <strong>{t.adminAgent.readonlyMode}:</strong> {t.adminAgent.cannotPerformActions} • {t.adminAgent.privateDataProtected}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Chat Space */}
        <Card className="border-slate-800/80 bg-slate-950/10 flex-grow flex flex-col overflow-hidden min-h-0 shadow-lg backdrop-blur-sm">
          {/* Messages list */}
          <CardContent className="p-4 flex-grow overflow-y-auto space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-slate-800">
            {messages.map((msg) => {
              const isAgent = msg.sender === 'agent';
              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 max-w-[85%] ${isAgent ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md ${
                    isAgent ? 'bg-indigo-650/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-200 border border-slate-700/50'
                  }`}>
                    {isAgent ? <Bot className="h-4 w-4" /> : <span className="text-xs font-bold">U</span>}
                  </div>
                  <div className={`rounded-xl p-3.5 text-xs leading-relaxed shadow-sm transition-all duration-200 ${
                    isAgent ? 'bg-slate-900/60 text-slate-100 border border-slate-800/50' : 'bg-indigo-650 text-indigo-100'
                  }`}>
                    {renderFormattedText(msg.text)}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Action Suggestion Chips */}
          <div className="px-4 py-2.5 border-t border-slate-850 flex items-center gap-2 overflow-x-auto flex-shrink-0 bg-slate-950/30">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex-shrink-0 tracking-wider">Topics:</span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => selectContextChip('billing')}
              className={`text-[10px] gap-1 px-3 h-7 border-slate-800 hover:border-slate-700 rounded-full transition-colors ${selectedContext === 'billing' ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30' : 'bg-slate-900/30'}`}
            >
              <Coins className="h-3 w-3" />
              {t.adminAgent.billingContext}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => selectContextChip('access')}
              className={`text-[10px] gap-1 px-3 h-7 border-slate-800 hover:border-slate-700 rounded-full transition-colors ${selectedContext === 'access' ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30' : 'bg-slate-900/30'}`}
            >
              <HelpCircle className="h-3 w-3" />
              {t.adminAgent.accessRequestsContext}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => selectContextChip('ops')}
              className={`text-[10px] gap-1 px-3 h-7 border-slate-800 hover:border-slate-700 rounded-full transition-colors ${selectedContext === 'ops' ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30' : 'bg-slate-900/30'}`}
            >
              <Terminal className="h-3 w-3" />
              {t.adminAgent.microdaoOpsContext}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => selectContextChip('team')}
              className={`text-[10px] gap-1 px-3 h-7 border-slate-800 hover:border-slate-700 rounded-full transition-colors ${selectedContext === 'team' ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30' : 'bg-slate-900/30'}`}
            >
              <CheckSquare className="h-3 w-3" />
              {t.adminAgent.platformTeamContext}
            </Button>
          </div>

          {/* Input box */}
          <CardFooter className="p-3 border-t border-slate-850 bg-slate-950/40 flex-shrink-0">
            <form onSubmit={handleSend} className="w-full flex items-center gap-2">
              <Input
                type="text"
                placeholder={t.adminAgent.placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-slate-950 border-slate-800 h-10 text-xs flex-grow focus-visible:ring-indigo-500 focus-visible:ring-offset-0 placeholder:text-slate-500 text-slate-100"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="h-10 w-10 bg-indigo-600 hover:bg-indigo-550 text-indigo-100 flex-shrink-0 shadow-md transition-colors"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>

      {/* Right Column: Platform Context Panel */}
      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col h-full lg:h-auto lg:max-h-full overflow-y-auto">
        <Card className="border-slate-800/80 bg-slate-950/20 shadow-lg backdrop-blur-sm h-full flex flex-col">
          <CardHeader className="p-4 border-b border-slate-900/80 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-xs uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-indigo-400" />
                {t.adminAgent.platformContext}
              </CardTitle>
              <CardDescription className="text-[10px] text-slate-500 mt-0.5">
                Live aggregated telemetry
              </CardDescription>
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => refetch()} 
              disabled={contextLoading}
              className="h-7 w-7 text-slate-400 hover:text-indigo-400 rounded-full hover:bg-slate-900/50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${contextLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-4 flex-grow overflow-y-auto text-xs leading-relaxed scrollbar-none">
            {contextLoading && !context ? (
              <div className="space-y-3 py-6 text-center text-slate-500 text-[11px]">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto text-indigo-500/50" />
                <p>Loading live telemetry...</p>
              </div>
            ) : (
              <>
                {/* Billing Summary */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                    <Coins className="h-3 w-3 text-amber-500" />
                    {t.adminAgent.billingContext}
                  </h4>
                  <div className="bg-slate-900/55 rounded-lg p-2.5 border border-slate-850 space-y-1.5 shadow-inner">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Active Subscriptions</span>
                      <span className="font-semibold text-slate-200">{context?.billing?.activeSubscriptions ?? 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Pending Approvals</span>
                      <span className={`font-bold ${context?.billing?.pendingPayments ? 'text-amber-450' : 'text-slate-200'}`}>
                        {context?.billing?.pendingPayments ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-slate-850/60 text-slate-500">
                      <span>Leader Price</span>
                      <span>${context?.billing?.currentLeaderPlan?.priceUsd ?? 20} ({context?.billing?.currentLeaderPlan?.priceDaar ?? 2} DAAR)</span>
                    </div>
                  </div>
                </div>

                {/* Access Requests */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                    <HelpCircle className="h-3 w-3 text-indigo-400" />
                    {t.adminAgent.accessRequestsContext}
                  </h4>
                  <div className="bg-slate-900/55 rounded-lg p-2.5 border border-slate-850 space-y-1.5 shadow-inner">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Pending Requests</span>
                      <span className={`font-bold ${context?.access?.pendingRequests ? 'text-indigo-400' : 'text-slate-200'}`}>
                        {context?.access?.pendingRequests ?? 0}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] pt-1.5 border-t border-slate-850/60 text-slate-500">
                      <div className="flex justify-between">
                        <span>Founder:</span>
                        <span className="text-slate-350">{context?.access?.founderRequests ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Partner:</span>
                        <span className="text-slate-350">{context?.access?.partnerRequests ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sovereign:</span>
                        <span className="text-slate-350">{context?.access?.sovereignRequests ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Worker:</span>
                        <span className="text-slate-350">{context?.access?.workerNodeRequests ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MicroDAOs & Agents */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                    <Terminal className="h-3 w-3 text-emerald-400" />
                    {t.adminAgent.microdaoOpsContext}
                  </h4>
                  <div className="bg-slate-900/55 rounded-lg p-2.5 border border-slate-850 space-y-1.5 shadow-inner">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Total MicroDAOs</span>
                      <span className="font-semibold text-slate-200">{context?.microdaos?.total ?? 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Active Agents</span>
                      <span className="font-semibold text-slate-200">{context?.agentOps?.activeAgents ?? 0}</span>
                    </div>
                    {context?.agentOps?.failedActions > 0 && (
                      <div className="flex justify-between items-center text-[11px] text-rose-400 font-bold bg-rose-500/5 p-1 rounded border border-rose-500/10">
                        <span>Failed Actions</span>
                        <span>{context?.agentOps?.failedActions}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Platform Team */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                    <Users className="h-3 w-3 text-teal-400" />
                    {t.adminAgent.platformTeamContext}
                  </h4>
                  <div className="bg-slate-900/55 rounded-lg p-2.5 border border-slate-850 space-y-1.5 shadow-inner">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Active Guardians</span>
                      <span className="font-semibold text-slate-200">{context?.team?.guardiansCount ?? 1}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Pending Invites</span>
                      <span className="font-semibold text-slate-200">{context?.team?.pendingInvites ?? 0}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
