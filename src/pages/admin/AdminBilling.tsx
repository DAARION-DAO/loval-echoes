import { 
  CreditCard, 
  CheckSquare, 
  HelpCircle, 
  ArrowRight,
  TrendingUp,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';

export const AdminBilling = () => {
  const { language } = useTranslation();
  const isUk = language === 'uk';

  const todoItems = [
    {
      title: isUk ? 'Синхронізація Stripe продуктів/цін' : 'Stripe Products & Prices sync',
      desc: isUk ? 'Автоматичне завантаження тарифних планів Stripe у локальну базу даних.' : 'Pre-loading pricing tables from Stripe dashboard into db schema.'
    },
    {
      title: isUk ? 'Створення сесії оформлення підписки (Checkout)' : 'Checkout Portal integration',
      desc: isUk ? 'Формування посилання для оплати $20/міс за активну MicroDAO.' : 'Creating Stripe checkout session redirects for the Leader Plan ($20/mo).'
    },
    {
      title: isUk ? 'Портал керування клієнта (Customer Portal)' : 'Stripe Customer Portal redirect',
      desc: isUk ? 'Дозвіл власникам MicroDAO змінювати картки та скасовувати підписки.' : 'Allowing DAO owners to update billing methods or cancel subscriptions.'
    },
    {
      title: isUk ? 'Слухач Webhooks (subscription status sync)' : 'Stripe Webhook Listener',
      desc: isUk ? 'Обробка подій оплати та автоматична активація/блокування ресурсів.' : 'Listening to invoice.paid/subscription.deleted webhook events.'
    },
    {
      title: isUk ? 'Контроль лімітів (Leader Plan Enforcement)' : 'Subscription Enforcement Gates',
      desc: isUk ? 'Перевірка статусу оплати перед викликом LLM або активацією агента.' : 'Blocking paid AI operations if the community subscription is past due.'
    },
    {
      title: isUk ? 'Обіхід для засновників (Guardian Bypass)' : 'Guardian & Founder Bypass',
      desc: isUk ? 'Дозвіл на безкоштовне використання платформи для розробників/партнерів.' : 'Bypassing subscription requirement for early-access programs.'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
          {isUk ? 'Білінг та готовність інфраструктури' : 'Billing Readiness Dashboard'}
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          {isUk 
            ? 'Аналіз готовності білінгової інтеграції зі Stripe. Поточний спринт виконує лише збір метаданих без списання коштів.' 
            : 'Operational overview of Leader Plan monetization models and future Stripe requirements.'}
        </p>
      </div>

      {/* Pricing Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm md:col-span-2">
          <CardHeader className="pb-2">
            <Badge className="w-fit bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[9px] uppercase font-bold tracking-wider">
              {isUk ? 'Планована модель монетизації' : 'Planned Pricing Model'}
            </Badge>
            <CardTitle className="text-lg font-bold text-slate-100 mt-2">Leader Plan — $20/міс</CardTitle>
            <CardDescription className="text-slate-400 text-xs leading-relaxed">
              {isUk 
                ? 'Плата за кожну активну MicroDAO з одним підключеним Духом Спільноти (Community Spirit Agent). Включає ліміти на виклики API, генерацію документів, керування завданнями спільноти.' 
                : 'Charge per active MicroDAO featuring one Community Spirit Agent. Includes API budgets, RAG context search, task automation, and team summaries.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-1.5 text-xs text-indigo-300/80 font-medium">
            <DollarSign className="h-4 w-4 text-indigo-400" />
            <span>{isUk ? 'У Sprint F2 немає фейкового обмеження чи примусової оплати' : 'No fake billing enforcement in Sprint F2'}</span>
          </CardContent>
        </Card>

        <Card className="border-slate-850 bg-slate-900/15 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-slate-400 tracking-wider font-bold">{isUk ? 'Метрики білінгу' : 'Billing Placeholders'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2 text-xs">
            <div className="flex justify-between items-center border-b border-slate-850/60 pb-2">
              <span className="text-slate-450">{isUk ? 'Без підписки' : 'No subscription'}</span>
              <span className="font-semibold text-slate-200">100% (MicroDAO)</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-850/60 pb-2">
              <span className="text-slate-450">{isUk ? 'Активні підписки' : 'Active billing'}</span>
              <span className="font-mono text-slate-500">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-450">{isUk ? 'Всього дохід' : 'Total Revenue'}</span>
              <span className="font-mono text-slate-500">$0.00</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stripe TODO Alert Card */}
      <Card className="border-amber-500/20 bg-amber-500/5 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-start gap-3 pb-3">
          <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <CardTitle className="text-sm font-bold text-amber-300">Sprint F3: Stripe Integration Checklist</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              {isUk 
                ? 'Наступний етап розробки. Ці завдання мають бути виконані для повноцінного запуску комерційної експлуатації.' 
                : 'Next development sprint. The following checklist lists requirements to enable monetization.'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {todoItems.map((item, idx) => (
            <div key={idx} className="flex gap-3 rounded-lg border border-slate-850/80 bg-slate-950/30 p-3">
              <CheckSquare className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-200">{item.title}</div>
                <p className="text-[10px] text-slate-500 leading-normal">{item.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
export default AdminBilling;
