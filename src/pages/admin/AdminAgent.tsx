import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, ShieldAlert, Sparkles, HelpCircle, Terminal, CheckSquare, Coins } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
  chips?: string[];
}

export default function AdminAgent() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: "Вітаю, Guardian. Я твій асистент з управління платформою MicroDAO. Я можу допомогти тобі підготувати SQL-запити, переглянути чек-лісти для перевірки платежів або відповісти на питання щодо адміністрування платформи.\n\nБудь ласка, оберіть тему або введіть запит.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedContext, setSelectedContext] = useState<'billing' | 'access' | 'ops' | 'team' | null>(null);

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
    setInput('');

    // Generate smart response based on text and selected context
    setTimeout(() => {
      const responseText = getAgentResponse(input, selectedContext);
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentMsg]);
    }, 800);
  };

  const selectContextChip = (ctx: 'billing' | 'access' | 'ops' | 'team') => {
    setSelectedContext(ctx);
    let introText = '';
    if (ctx === 'billing') {
      introText = "Контекст: **Billing & Subscriptions**\n\nДля ручної перевірки крипто-платежів:\n1. Перейдіть до `/admin/billing`.\n2. Перевірте tx hash у блокчейн-експлорері Polygon.\n3. Переконайтеся, що отримувач — наш treasury multisig `0x39c8...b7e8`.\n\nПотрібно згенерувати SQL для перевірки платежів у базі?";
    } else if (ctx === 'access') {
      introText = "Контекст: **Access Requests**\n\nУсі запити на вступ до MicroDAO зберігаються в таблиці `access_requests`.\nВи можете переглянути їх на сторінці `/admin/access-requests`.\n\nПотрібно підготувати чек-ліст для ручного схвалення?";
    } else if (ctx === 'ops') {
      introText = "Контекст: **MicroDAO Ops**\n\nАдміністратор платформи може переглядати загальну кількість створених MicroDAO через RPC `get_platform_admin_overview`.\n\nНагадування: приватний RAG-контекст та повідомлення окремих MicroDAO зашифровані або недоступні для читання адміністраторам за замовчуванням задля збереження приватності.";
    } else if (ctx === 'team') {
      introText = "Контекст: **Platform Team**\n\nВи можете запросити інших Guardians через `/admin/team`.\n\nЗапрошення створюють унікальний одноразовий токен, дійсний протягом 7 днів. Після прийняття користувач отримує роль `guardian`.";
    }

    const agentMsg: Message = {
      id: Date.now().toString(),
      sender: 'agent',
      text: introText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, agentMsg]);
  };

  const getAgentResponse = (text: string, context: 'billing' | 'access' | 'ops' | 'team' | null): string => {
    const query = text.toLowerCase();

    if (query.includes('sql') || query.includes('запит') || query.includes('db')) {
      return "Ось корисний SQL запит для перевірки статусів підписок:\n\n```sql\nSELECT u.email, s.status, s.expires_at \nFROM public.microdao_subscriptions s\nJOIN public.profiles u ON s.user_id = u.id\nORDER BY s.created_at DESC LIMIT 10;\n```\n\nВи можете виконати його в Supabase SQL Editor.";
    }

    if (query.includes('billing') || query.includes('оплат') || query.includes('платіж')) {
      return "Для перевірки платежів перейдіть до `/admin/billing`. Якщо вам потрібен експлорер для Polygon, скористайтеся:\n`https://polygonscan.com/tx/<tx_hash>`\n\nАдреса нашої скарбниці: `0x39c8e3807B864A633bd83C34995d7A3a18d0b7e8`.";
    }

    if (query.includes('invite') || query.includes('запрос') || query.includes('дода')) {
      return "Щоб запросити нового адміністратора платформи, перейдіть до розділу «Команда платформи» (`/admin/team`) та вкажіть email отримувача.";
    }

    return "Дякую за запит. Як адмін-помічник (Draft Mode), я допомагаю підготувати чек-лісти та SQL запити. Я не маю прямого автономного доступу до запису в базу даних або до приватних повідомлень MicroDAO.";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent flex items-center gap-2.5">
          <Bot className="h-6 w-6 text-indigo-400" />
          {t.nav.adminAgent}
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          {t.pricingExtra.askAdminAgent}
        </p>
      </div>

      {/* Safety Notice Banner */}
      <Card className="border-indigo-500/20 bg-indigo-500/5 flex-shrink-0">
        <CardContent className="p-3.5 flex items-start gap-3 text-xs leading-relaxed text-indigo-300">
          <ShieldAlert className="h-5 w-5 text-indigo-450 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-400">{t.pricingExtra.draftMode}</span>
              <Badge variant="outline" className="text-[9px] border-indigo-500/30 text-indigo-400 bg-indigo-500/5 px-1.5 py-0">
                Safe Mode
              </Badge>
            </div>
            <p className="text-[11px] text-slate-350">
              {t.pricingExtra.noAutonomousActions} • {t.pricingExtra.privateDataProtected}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Chat Space */}
      <Card className="border-slate-800 bg-slate-900/10 flex-grow flex flex-col overflow-hidden min-h-0">
        {/* Messages list */}
        <CardContent className="p-4 flex-grow overflow-y-auto space-y-4 min-h-0">
          {messages.map((msg) => {
            const isAgent = msg.sender === 'agent';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${isAgent ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isAgent ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-200'
                }`}>
                  {isAgent ? <Bot className="h-4 w-4" /> : <span className="text-xs font-bold">U</span>}
                </div>
                <div className={`rounded-xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
                  isAgent ? 'bg-slate-900/60 text-slate-100 border border-slate-800/40' : 'bg-indigo-600 text-indigo-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
        </CardContent>

        {/* Action Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-850 flex items-center gap-2 overflow-x-auto flex-shrink-0 bg-slate-950/20">
          <span className="text-[10px] uppercase font-bold text-slate-500 flex-shrink-0">Topics:</span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => selectContextChip('billing')}
            className={`text-[10px] gap-1 px-2.5 h-7 border-slate-800 ${selectedContext === 'billing' ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30' : ''}`}
          >
            <Coins className="h-3 w-3" />
            Billing
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => selectContextChip('access')}
            className={`text-[10px] gap-1 px-2.5 h-7 border-slate-800 ${selectedContext === 'access' ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30' : ''}`}
          >
            <HelpCircle className="h-3 w-3" />
            Access
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => selectContextChip('ops')}
            className={`text-[10px] gap-1 px-2.5 h-7 border-slate-800 ${selectedContext === 'ops' ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30' : ''}`}
          >
            <Terminal className="h-3 w-3" />
            MicroDAO Ops
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => selectContextChip('team')}
            className={`text-[10px] gap-1 px-2.5 h-7 border-slate-800 ${selectedContext === 'team' ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30' : ''}`}
          >
            <CheckSquare className="h-3 w-3" />
            Platform Team
          </Button>
        </div>

        {/* Input box */}
        <CardFooter className="p-3 border-t border-slate-850 bg-slate-950/40 flex-shrink-0">
          <form onSubmit={handleSend} className="w-full flex items-center gap-2">
            <Input
              type="text"
              placeholder="Введіть запит до адмін-агента..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-slate-950 border-slate-800 h-10 text-xs flex-grow"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-10 w-10 bg-indigo-600 hover:bg-indigo-550 text-indigo-100 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
