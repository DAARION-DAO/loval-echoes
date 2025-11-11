import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Settings2,
  ExternalLink,
  Bot,
  Calendar,
  Zap,
  HardDrive,
  FileText,
  Sparkles,
  Brain,
  Users,
  User
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Integration {
  id: string;
  type: 'telegram' | 'whatsapp' | 'email' | 'calendar' | 'slack' | 'discord' | 'google_drive' | 'google_docs' | 'chatgpt' | 'deepseek';
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  connected: boolean;
  scope: 'team' | 'personal';
  config?: Record<string, unknown>;
  lastSync?: string;
}

const INTEGRATIONS: Omit<Integration, 'id' | 'enabled' | 'connected' | 'config' | 'lastSync' | 'scope'>[] = [
  {
    type: 'telegram',
    name: 'Telegram',
    description: 'Інтегруйте Telegram для отримання та відправки повідомлень',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    type: 'whatsapp',
    name: 'WhatsApp',
    description: 'Підключіть WhatsApp для двосторонньої синхронізації повідомлень',
    icon: <Phone className="h-5 w-5" />,
  },
  {
    type: 'email',
    name: 'Email',
    description: 'Налаштуйте email для отримання повідомлень та сповіщень',
    icon: <Mail className="h-5 w-5" />,
  },
  {
    type: 'calendar',
    name: 'Календар',
    description: 'Синхронізуйте події та зустрічі з Google Calendar або Outlook',
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    type: 'slack',
    name: 'Slack',
    description: 'Інтеграція зі Slack для синхронізації каналів',
    icon: <Zap className="h-5 w-5" />,
  },
  {
    type: 'discord',
    name: 'Discord',
    description: 'Підключіть Discord сервер для обміну повідомленнями',
    icon: <Bot className="h-5 w-5" />,
  },
  {
    type: 'google_drive',
    name: 'Google Drive',
    description: 'Синхронізуйте файли з Google Drive для доступу в базі знань',
    icon: <HardDrive className="h-5 w-5" />,
  },
  {
    type: 'google_docs',
    name: 'Google Docs',
    description: 'Інтегруйте Google Docs для автоматичного імпорту документів',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    type: 'chatgpt',
    name: 'ChatGPT API',
    description: 'Підключіть OpenAI ChatGPT API для розширених можливостей AI',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    type: 'deepseek',
    name: 'DeepSeek',
    description: 'Інтеграція з DeepSeek AI для альтернативних AI можливостей',
    icon: <Brain className="h-5 w-5" />,
  },
];

export default function Integrations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [selectedScope, setSelectedScope] = useState<'team' | 'personal'>('personal');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'team' | 'personal'>('all');

  useEffect(() => {
    if (user) {
      loadIntegrations();
    }
  }, [user]);

  const loadIntegrations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Завантажуємо інтеграції користувача з бази даних
      const { data, error } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        // Якщо таблиця не існує, створюємо базові інтеграції
        console.log('Integrations table might not exist, creating default integrations');
        const defaultIntegrations = INTEGRATIONS.map(int => ({
          ...int,
          id: crypto.randomUUID(),
          enabled: false,
          connected: false,
        }));
        setIntegrations(defaultIntegrations);
        return;
      }

      // Об'єднуємо з базовими інтеграціями
      const integrationsMap = new Map<string, Integration>();
      
      INTEGRATIONS.forEach(int => {
        integrationsMap.set(int.type, {
          ...int,
          id: crypto.randomUUID(),
          enabled: false,
          connected: false,
        });
      });

      data?.forEach(dbInt => {
        const baseInt = INTEGRATIONS.find(i => i.type === dbInt.type);
        if (baseInt) {
          integrationsMap.set(`${dbInt.type}-${dbInt.scope || 'personal'}`, {
            ...baseInt,
            id: dbInt.id,
            enabled: dbInt.enabled || false,
            connected: dbInt.connected || false,
            scope: (dbInt.scope as 'team' | 'personal') || 'personal',
            config: dbInt.config as Record<string, unknown> | undefined,
            lastSync: dbInt.last_sync,
          });
        }
      });

      // Додаємо базові інтеграції для кожного scope, якщо вони не існують
      INTEGRATIONS.forEach(int => {
        ['team', 'personal'].forEach(scope => {
          const key = `${int.type}-${scope}`;
          if (!integrationsMap.has(key)) {
            integrationsMap.set(key, {
              ...int,
              id: crypto.randomUUID(),
              enabled: false,
              connected: false,
              scope: scope as 'team' | 'personal',
            });
          }
        });
      });

      setIntegrations(Array.from(integrationsMap.values()));
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити інтеграції',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = async (integration: Integration) => {
    if (!user) return;

    try {
      setConfiguring(integration.id);

      if (!integration.connected && integration.enabled) {
        // Потрібно спочатку підключити
        setConfigDialogOpen(integration.id);
        setConfiguring(null);
        return;
      }

      const newEnabled = !integration.enabled;

      // Оновлюємо в базі даних
      const { error } = await supabase
        .from('user_integrations')
        .upsert({
          user_id: user.id,
          type: integration.type,
          scope: integration.scope,
          enabled: newEnabled,
          connected: integration.connected,
          config: integration.config,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,type,scope',
        });

      if (error) {
        throw error;
      }

      // Оновлюємо локальний стан
      setIntegrations(prev =>
        prev.map(int =>
          int.id === integration.id
            ? { ...int, enabled: newEnabled }
            : int
        )
      );

      toast({
        title: newEnabled ? 'Інтеграцію увімкнено' : 'Інтеграцію вимкнено',
        description: `${integration.name} ${newEnabled ? 'активна' : 'неактивна'}`,
      });
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося оновити інтеграцію',
        variant: 'destructive',
      });
    } finally {
      setConfiguring(null);
    }
  };

  const connectIntegration = async (integration: Integration) => {
    if (!user) return;

    try {
      setConfiguring(integration.id);

      // Викликаємо Edge Function для підключення інтеграції
      const { data, error } = await supabase.functions.invoke('integration-connect', {
        body: {
          type: integration.type,
          scope: selectedScope,
          config: configValues,
        },
      });

      if (error) {
        throw error;
      }

      // Оновлюємо в базі даних
      const { error: dbError } = await supabase
        .from('user_integrations')
        .upsert({
          user_id: user.id,
          type: integration.type,
          scope: selectedScope,
          enabled: true,
          connected: true,
          config: { ...integration.config, ...configValues },
          last_sync: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,type,scope',
        });

      if (dbError) {
        throw dbError;
      }

      // Оновлюємо локальний стан
      setIntegrations(prev =>
        prev.map(int =>
          int.id === integration.id
            ? { ...int, enabled: true, connected: true, config: { ...int.config, ...configValues } }
            : int
        )
      );

      setConfigDialogOpen(null);
      setConfigValues({});

      toast({
        title: 'Підключено',
        description: `${integration.name} успішно підключено`,
      });
    } catch (error) {
      console.error('Error connecting integration:', error);
      toast({
        title: 'Помилка підключення',
        description: error instanceof Error ? error.message : 'Не вдалося підключити інтеграцію',
        variant: 'destructive',
      });
    } finally {
      setConfiguring(null);
    }
  };

  const disconnectIntegration = async (integration: Integration) => {
    if (!user) return;

    try {
      setConfiguring(integration.id);

      // Викликаємо Edge Function для відключення
      const { error } = await supabase.functions.invoke('integration-disconnect', {
        body: {
          type: integration.type,
        },
      });

      if (error) {
        throw error;
      }

      // Оновлюємо в базі даних
      const { error: dbError } = await supabase
        .from('user_integrations')
        .update({
          enabled: false,
          connected: false,
          config: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('type', integration.type)
        .eq('scope', integration.scope);

      if (dbError) {
        throw dbError;
      }

      // Оновлюємо локальний стан
      setIntegrations(prev =>
        prev.map(int =>
          int.id === integration.id
            ? { ...int, enabled: false, connected: false, config: undefined }
            : int
        )
      );

      toast({
        title: 'Відключено',
        description: `${integration.name} успішно відключено`,
      });
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося відключити інтеграцію',
        variant: 'destructive',
      });
    } finally {
      setConfiguring(null);
    }
  };

  const getConfigFields = (type: string) => {
    switch (type) {
      case 'telegram':
        return [
          { key: 'bot_token', label: 'Bot Token', type: 'password', placeholder: 'Введіть токен бота' },
          { key: 'chat_id', label: 'Chat ID', type: 'text', placeholder: 'ID чату (опціонально)' },
        ];
      case 'whatsapp':
        return [
          { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'API ключ WhatsApp Business' },
          { key: 'phone_number', label: 'Номер телефону', type: 'text', placeholder: '+380XXXXXXXXX' },
        ];
      case 'email':
        return [
          { key: 'smtp_host', label: 'SMTP сервер', type: 'text', placeholder: 'smtp.gmail.com' },
          { key: 'smtp_port', label: 'Порт', type: 'text', placeholder: '587' },
          { key: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
          { key: 'password', label: 'Пароль', type: 'password', placeholder: 'Пароль або App Password' },
        ];
      case 'calendar':
        return [
          { key: 'calendar_type', label: 'Тип календаря', type: 'select', options: ['google', 'outlook'] },
          { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'OAuth токен' },
        ];
      case 'slack':
        return [
          { key: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.slack.com/...' },
          { key: 'channel', label: 'Канал', type: 'text', placeholder: '#general' },
        ];
      case 'discord':
        return [
          { key: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://discord.com/api/webhooks/...' },
          { key: 'server_id', label: 'Server ID', type: 'text', placeholder: 'ID сервера (опціонально)' },
        ];
      case 'google_drive':
        return [
          { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Google OAuth Client ID' },
          { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'Google OAuth Client Secret' },
          { key: 'refresh_token', label: 'Refresh Token', type: 'password', placeholder: 'OAuth Refresh Token' },
        ];
      case 'google_docs':
        return [
          { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Google OAuth Client ID' },
          { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'Google OAuth Client Secret' },
          { key: 'refresh_token', label: 'Refresh Token', type: 'password', placeholder: 'OAuth Refresh Token' },
        ];
      case 'chatgpt':
        return [
          { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'OpenAI API Key' },
          { key: 'model', label: 'Model', type: 'select', options: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'], placeholder: 'gpt-4' },
        ];
      case 'deepseek':
        return [
          { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'DeepSeek API Key' },
          { key: 'model', label: 'Model', type: 'select', options: ['deepseek-chat', 'deepseek-coder'], placeholder: 'deepseek-chat' },
        ];
      default:
        return [];
    }
  };

  const renderConfigDialog = (integration: Integration) => {
    const fields = getConfigFields(integration.type);

    return (
      <Dialog open={configDialogOpen === integration.id} onOpenChange={(open) => {
        if (!open) {
          setConfigDialogOpen(null);
          setConfigValues({});
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Налаштування {integration.name}</DialogTitle>
            <DialogDescription>
              Введіть необхідні дані для підключення {integration.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Вибір scope */}
            <div className="space-y-2">
              <Label>Область застосування</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={selectedScope === 'personal' ? 'default' : 'outline'}
                  onClick={() => setSelectedScope('personal')}
                  className="flex-1"
                  size="sm"
                >
                  <User className="h-4 w-4 mr-2" />
                  Приватна
                </Button>
                <Button
                  type="button"
                  variant={selectedScope === 'team' ? 'default' : 'outline'}
                  onClick={() => setSelectedScope('team')}
                  className="flex-1"
                  size="sm"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Командна
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedScope === 'personal' 
                  ? 'Інтеграція буде доступна тільки вам'
                  : 'Інтеграція буде доступна всій команді'}
              </p>
            </div>
            
            {fields.map(field => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.type === 'select' ? (
                  <select
                    id={field.key}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={configValues[field.key] || ''}
                    onChange={(e) => setConfigValues({ ...configValues, [field.key]: e.target.value })}
                  >
                    <option value="">Оберіть...</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={field.key}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={configValues[field.key] || ''}
                    onChange={(e) => setConfigValues({ ...configValues, [field.key]: e.target.value })}
                  />
                )}
              </div>
            ))}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => connectIntegration(integration)}
                disabled={configuring === integration.id}
                className="flex-1"
              >
                {configuring === integration.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Підключення...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Підключити
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setConfigDialogOpen(null);
                  setConfigValues({});
                }}
              >
                Скасувати
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Інтеграції</h1>
        <p className="text-muted-foreground">
          Підключіть зовнішні сервіси для розширення функціональності месенджера
        </p>
      </div>

      <Alert className="mb-6">
        <Settings2 className="h-4 w-4" />
        <AlertDescription>
          Інтеграції дозволяють синхронізувати повідомлення з іншими платформами та автоматизувати роботу.
          Ви можете створити інтеграції для команди (доступні всім) або приватні (тільки для вас).
        </AlertDescription>
      </Alert>

      {/* Фільтр за scope */}
      <div className="mb-6 flex items-center gap-4">
        <Tabs value={scopeFilter} onValueChange={(v) => setScopeFilter(v as 'all' | 'team' | 'personal')}>
          <TabsList>
            <TabsTrigger value="all">Всі</TabsTrigger>
            <TabsTrigger value="team">
              <Users className="h-4 w-4 mr-2" />
              Командні
            </TabsTrigger>
            <TabsTrigger value="personal">
              <User className="h-4 w-4 mr-2" />
              Приватні
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations
          .filter(int => scopeFilter === 'all' || int.scope === scopeFilter)
          .map((integration) => (
          <Card key={integration.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    integration.connected 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {integration.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {integration.connected ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Підключено
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Не підключено
                        </Badge>
                      )}
                      <Badge variant={integration.scope === 'team' ? 'default' : 'outline'}>
                        {integration.scope === 'team' ? (
                          <>
                            <Users className="h-3 w-3 mr-1" />
                            Командна
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 mr-1" />
                            Приватна
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <CardDescription className="mt-2">
                {integration.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integration.lastSync && (
                  <div className="text-xs text-muted-foreground">
                    Остання синхронізація: {new Date(integration.lastSync).toLocaleString('uk-UA')}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`enable-${integration.id}`}
                      checked={integration.enabled}
                      onCheckedChange={() => toggleIntegration(integration)}
                      disabled={configuring === integration.id || !integration.connected}
                    />
                    <Label htmlFor={`enable-${integration.id}`} className="text-sm">
                      {integration.enabled ? 'Увімкнено' : 'Вимкнено'}
                    </Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!integration.connected ? (
                    <Button
                      onClick={() => {
                        setSelectedScope(integration.scope);
                        setConfigDialogOpen(integration.id);
                      }}
                      disabled={configuring === integration.id}
                      className="flex-1"
                      size="sm"
                    >
                      {configuring === integration.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Підключення...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Підключити
                        </>
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => setConfigDialogOpen(integration.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Settings2 className="mr-2 h-4 w-4" />
                        Налаштування
                      </Button>
                      <Button
                        onClick={() => disconnectIntegration(integration)}
                        variant="destructive"
                        size="sm"
                        disabled={configuring === integration.id}
                      >
                        {configuring === integration.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Відключити'
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
            {renderConfigDialog(integration)}
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">Як це працює?</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Підключіть інтеграцію, ввівши необхідні дані</li>
          <li>Увімкніть інтеграцію для початку синхронізації</li>
          <li>Повідомлення будуть автоматично синхронізуватись між платформами</li>
          <li>Ви завжди можете відключити або змінити налаштування</li>
        </ul>
      </div>
    </div>
  );
}

