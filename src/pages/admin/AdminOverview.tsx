import { useState, useEffect } from 'react';
import { getAdminOverview, AdminOverviewData, isRlsOrSchemaError } from '@/lib/adminQueries';
import { 
  Users, 
  Building2, 
  Key, 
  Bot, 
  CreditCard, 
  ShieldAlert, 
  ArrowRight,
  Database,
  UserX
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { cn } from '@/lib/utils';

export const AdminOverview = () => {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isRpc, setIsRpc] = useState(true);

  const isUk = language === 'uk';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const res = await getAdminOverview();
      setData(res.data);
      setError(res.error);
      setIsRpc(res.isRpc);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <LoadingSpinner size="lg" text={isUk ? 'Завантаження метрик платформи...' : 'Loading platform metrics...'} />
      </div>
    );
  }

  const rlsBlocked = error && isRlsOrSchemaError(error);

  const cards = [
    {
      title: isUk ? 'Всього користувачів' : 'Total Users',
      value: rlsBlocked ? '—' : data?.total_users,
      description: isUk ? 'Користувачі зареєстровані на платформі' : 'Users registered on the platform',
      icon: Users,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
      title: isUk ? 'Активні користувачі' : 'Active Users',
      value: rlsBlocked ? '—' : data?.active_users,
      description: isUk ? 'Акаунти зі статусом approved' : 'Approved user accounts',
      icon: Users,
      color: 'text-green-400 bg-green-500/10 border-green-500/20'
    },
    {
      title: isUk ? 'Очікують розширеного доступу' : 'Pending Access Requests',
      value: rlsBlocked ? '—' : data?.pending_access_requests,
      description: isUk ? 'Заявки на програми Founder/Partner/Sovereign' : 'Requests for Founder/Partner/Sovereign tiers',
      icon: Key,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      highlight: (data?.pending_access_requests || 0) > 0
    },
    {
      title: isUk ? 'Всього MicroDAO' : 'Total MicroDAOs',
      value: rlsBlocked ? '—' : data?.total_microdaos,
      description: isUk ? 'Створені спільноти на платформі' : 'Communities initialized on platform',
      icon: Building2,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    },
    {
      title: isUk ? 'Активні Духи Спільноти' : 'Active Community Spirits',
      value: rlsBlocked ? '—' : data?.active_spirit_agents,
      description: isUk ? 'Запущені агенти класу spirit' : 'Active spirit class agents',
      icon: Bot,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    },
    {
      title: isUk ? 'Заблоковані / Відхилені' : 'Blocked / Rejected Users',
      value: rlsBlocked ? '—' : data?.blocked_users,
      description: isUk ? 'Користувачі з обмеженим доступом' : 'Users with restricted access',
      icon: UserX,
      color: 'text-red-400 bg-red-500/10 border-red-500/20'
    }
  ];

  const navigations = [
    {
      title: isUk ? 'Керування користувачами' : 'User Operations',
      desc: isUk ? 'Перегляд профілів, зміна статусів реєстрації (approve, block).' : 'View profiles, change approval states (approve, block).',
      to: '/admin/users'
    },
    {
      title: isUk ? 'Реєстр MicroDAO' : 'MicroDAO Registry',
      desc: isUk ? 'Перегляд метаданих спільнот, статусів підключення агентів.' : 'View community metadata, owner profiles, agent connectivity.',
      to: '/admin/microdaos'
    },
    {
      title: isUk ? 'Заявки на розширений доступ' : 'Access Applications',
      desc: isUk ? 'Аналіз запитів на програми розширеного доступу.' : 'Evaluate applications for advanced program access.',
      to: '/admin/access-requests'
    },
    {
      title: isUk ? 'Білінг і ліміти' : 'Billing & Operations',
      desc: isUk ? 'Готовність білінгової моделі Leader Plan, підключення Stripe.' : 'Leader Plan pricing models, Stripe checkout placeholders.',
      to: '/admin/billing'
    },
    {
      title: isUk ? 'Логи та аудит агентів' : 'Agent Telemetry',
      desc: isUk ? 'Діагностика агентів, аналіз помилок та логів дій.' : 'Audit agent execution states, permission settings, error logs.',
      to: '/admin/agent-ops'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header and RPC badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            {isUk ? 'Огляд платформи' : 'Platform Overview'}
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            {isUk 
              ? 'Операційні метрики, загальний стан користувачів та інтегрованих агентів.' 
              : 'Operational status, user accounts, and active agent instances.'}
          </p>
        </div>

        {/* RPC Status Notice */}
        <div className="flex items-center gap-2">
          {rlsBlocked ? (
            <Badge variant="outline" className="border-red-500/30 bg-red-500/5 text-red-400 text-[10px] py-1 px-2.5 flex items-center gap-1.5 font-semibold">
              <ShieldAlert className="h-3.5 w-3.5" />
              {isUk ? 'Обмежено RLS (Потрібні RPC)' : 'RLS Restricted (Needs RPC)'}
            </Badge>
          ) : isRpc ? (
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-[10px] py-1 px-2.5 flex items-center gap-1.5 font-semibold">
              <Database className="h-3.5 w-3.5 animate-pulse" />
              {isUk ? 'Підключено через RPC' : 'Connected via Secure RPC'}
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/5 text-amber-400 text-[10px] py-1 px-2.5 flex items-center gap-1.5 font-semibold">
              <Database className="h-3.5 w-3.5" />
              {isUk ? 'Клієнтський режим (Обмежені дані)' : 'Client Fallback Mode (Limited Data)'}
            </Badge>
          )}
        </div>
      </div>

      {/* RLS Blocker Warning Banner */}
      {rlsBlocked && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-4 space-y-2 text-xs">
          <div className="font-bold text-red-400 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4" />
            {isUk ? 'Доступ до даних заблоковано політиками безпеки (RLS)' : 'Data Access Blocked by Security Policies (RLS)'}
          </div>
          <div className="text-slate-400 leading-relaxed">
            {isUk 
              ? 'Рядки таблиць communities та agents приховані політиками безпеки Supabase для звичайних запитів. Будь ласка, запустіть локальний SQL скрипт міграції, щоб створити адміністративні RPC-функції. Консоль автоматично переключиться на використання безпечних RPC.'
              : 'Supabase RLS policies restrict direct reading of communities and agents metadata. To enable this view, please apply the prepared local migration file to register admin RPCs. The dashboard will automatically detect and leverage the secure RPCs.'}
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            Path: supabase/migrations/20260613000000_platform_admin_rpcs.sql
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className={cn(
              "border-slate-800 bg-slate-900/25 backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:border-slate-700/60",
              card.highlight ? "border-amber-500/30 shadow-[0_0_15px_-4px_rgba(245,158,11,0.15)]" : ""
            )}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</CardTitle>
                <div className={cn("p-1.5 rounded-lg border", card.color)}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-slate-100 tracking-tight">{card.value}</div>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigation Quick Links Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 px-1">{isUk ? 'Швидкий перехід' : 'Console Modules'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {navigations.map((nav, idx) => (
            <div 
              key={idx} 
              onClick={() => navigate(nav.to)}
              className="group cursor-pointer rounded-xl border border-slate-850 bg-slate-900/10 p-5 hover:bg-slate-900/35 hover:border-indigo-500/30 transition-all duration-200 flex flex-col justify-between h-32"
            >
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                  {nav.title}
                </div>
                <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">{nav.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors self-start mt-2">
                {isUk ? 'Перейти' : 'Navigate'}
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default AdminOverview;
