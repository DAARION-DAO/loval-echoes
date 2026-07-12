import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
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

export default function Integrations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language } = useTranslation();

  const INTEGRATIONS = useMemo<Omit<Integration, 'id' | 'enabled' | 'connected' | 'config' | 'lastSync' | 'scope'>[]>(() => [
    {
      type: 'telegram',
      name: 'Telegram',
      description: t.integrationsExtra.descriptionTelegram,
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      type: 'whatsapp',
      name: 'WhatsApp',
      description: t.integrationsExtra.descriptionWhatsapp,
      icon: <Phone className="h-5 w-5" />,
    },
    {
      type: 'email',
      name: 'Email',
      description: t.integrationsExtra.descriptionEmail,
      icon: <Mail className="h-5 w-5" />,
    },
    {
      type: 'calendar',
      name: t.integrationsExtra.nameCalendar,
      description: t.integrationsExtra.descriptionCalendar,
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      type: 'slack',
      name: 'Slack',
      description: t.integrationsExtra.descriptionSlack,
      icon: <Zap className="h-5 w-5" />,
    },
    {
      type: 'discord',
      name: 'Discord',
      description: t.integrationsExtra.descriptionDiscord,
      icon: <Bot className="h-5 w-5" />,
    },
    {
      type: 'google_drive',
      name: 'Google Drive',
      description: t.integrationsExtra.descriptionGoogleDrive,
      icon: <HardDrive className="h-5 w-5" />,
    },
    {
      type: 'google_docs',
      name: 'Google Docs',
      description: t.integrationsExtra.descriptionGoogleDocs,
      icon: <FileText className="h-5 w-5" />,
    },
    {
      type: 'chatgpt',
      name: 'ChatGPT API',
      description: t.integrationsExtra.descriptionOpenAI,
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      type: 'deepseek',
      name: 'DeepSeek',
      description: t.integrationsExtra.descriptionDeepSeek,
      icon: <Brain className="h-5 w-5" />,
    },
  ], [t]);

  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [selectedScope, setSelectedScope] = useState<'team' | 'personal'>('personal');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'team' | 'personal'>('all');

  const loadIntegrations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load saved integration status from localStorage.
      // SECURITY: Only non-secret status fields (enabled/connected/scope/lastSync)
      // are cached here. Credentials (bot tokens, API keys, client secrets) are
      // never mirrored to localStorage — they live only in the RLS-protected
      // user_integrations table on the server and are set via edge functions.
      const saved = localStorage.getItem(`user_integrations_${user.id}`);
      const savedData: Record<string, { enabled: boolean; connected: boolean; scope: string; lastSync?: string }> = saved ? JSON.parse(saved) : {};

      const allIntegrations: Integration[] = [];
      INTEGRATIONS.forEach(int => {
        ['team', 'personal'].forEach(scopeVal => {
          const key = `${int.type}-${scopeVal}`;
          const savedInt = savedData[key];
          allIntegrations.push({
            ...int,
            id: key,
            enabled: savedInt?.enabled || false,
            connected: savedInt?.connected || false,
            scope: scopeVal as 'team' | 'personal',
            config: undefined,
            lastSync: savedInt?.lastSync,
          });
        });
      });

      setIntegrations(allIntegrations);
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast({
        title: t.integrationsExtra.loadErrorTitle,
        description: t.integrationsExtra.loadErrorDesc,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, INTEGRATIONS, toast, t]);

  useEffect(() => {
    if (user) {
      loadIntegrations();
    }
  }, [user, loadIntegrations]);

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

      // Save non-secret status to localStorage (never credentials).
      const savedKey = `user_integrations_${user.id}`;
      const saved = localStorage.getItem(savedKey);
      const savedData = saved ? JSON.parse(saved) : {};
      const intKey = `${integration.type}-${integration.scope}`;
      savedData[intKey] = {
        enabled: newEnabled,
        connected: integration.connected,
        scope: integration.scope,
      };
      localStorage.setItem(savedKey, JSON.stringify(savedData));

      // Оновлюємо локальний стан
      setIntegrations(prev =>
        prev.map(int =>
          int.id === integration.id
            ? { ...int, enabled: newEnabled }
            : int
        )
      );

      toast({
        title: t.integrationsExtra.updateSuccessTitle,
        description: t.integrationsExtra.updateSuccessDesc
          .replace('{name}', integration.name)
          .replace('{status}', newEnabled ? t.integrationsExtra.btnEnabled.toLowerCase() : t.integrationsExtra.btnDisabled.toLowerCase()),
      });
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast({
        title: t.integrationsExtra.updateErrorTitle,
        description: t.integrationsExtra.updateErrorDesc,
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

      // Save non-secret status to localStorage. Credentials are already
      // stored server-side by the integration-connect edge function and
      // must never be mirrored into browser storage.
      const savedKey = `user_integrations_${user.id}`;
      const saved = localStorage.getItem(savedKey);
      const savedData = saved ? JSON.parse(saved) : {};
      const intKey = `${integration.type}-${selectedScope}`;
      savedData[intKey] = {
        enabled: true,
        connected: true,
        scope: selectedScope,
        lastSync: new Date().toISOString(),
      };
      localStorage.setItem(savedKey, JSON.stringify(savedData));

      // Update local state — do not retain plain-text credentials in memory
      // beyond the connect call.
      setIntegrations(prev =>
        prev.map(int =>
          int.id === integration.id
            ? { ...int, enabled: true, connected: true, config: undefined }
            : int
        )
      );

      setConfigDialogOpen(null);
      setConfigValues({});

      toast({
        title: t.integrationsExtra.connectSuccessTitle,
        description: t.integrationsExtra.connectSuccessDesc.replace('{name}', integration.name),
      });
    } catch (error) {
      console.error('Error connecting integration:', error);
      toast({
        title: t.integrationsExtra.connectErrorTitle,
        description: error instanceof Error ? error.message : t.integrationsExtra.connectErrorDesc,
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

      // Save to localStorage
      const savedKey = `user_integrations_${user.id}`;
      const saved = localStorage.getItem(savedKey);
      const savedData = saved ? JSON.parse(saved) : {};
      const intKey = `${integration.type}-${integration.scope}`;
      savedData[intKey] = {
        enabled: false,
        connected: false,
        scope: integration.scope,
      };
      localStorage.setItem(savedKey, JSON.stringify(savedData));

      // Оновлюємо локальний стан
      setIntegrations(prev =>
        prev.map(int =>
          int.id === integration.id
            ? { ...int, enabled: false, connected: false, config: undefined }
            : int
        )
      );

      toast({
        title: t.integrationsExtra.disconnectSuccessTitle,
        description: t.integrationsExtra.disconnectSuccessDesc.replace('{name}', integration.name),
      });
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      toast({
        title: t.integrationsExtra.disconnectErrorTitle,
        description: t.integrationsExtra.disconnectErrorDesc,
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
          { key: 'bot_token', label: t.integrationsExtra.labelBotToken, type: 'password', placeholder: t.integrationsExtra.placeholderBotToken },
          { key: 'chat_id', label: t.integrationsExtra.labelChatId, type: 'text', placeholder: t.integrationsExtra.placeholderChatId },
        ];
      case 'whatsapp':
        return [
          { key: 'api_key', label: t.integrationsExtra.labelApiKey, type: 'password', placeholder: t.integrationsExtra.placeholderApiKey },
          { key: 'phone_number', label: t.integrationsExtra.labelPhoneNumber, type: 'text', placeholder: t.integrationsExtra.placeholderPhoneNumber },
        ];
      case 'email':
        return [
          { key: 'smtp_host', label: t.integrationsExtra.labelSmtpHost, type: 'text', placeholder: t.integrationsExtra.placeholderSmtpHost },
          { key: 'smtp_port', label: t.integrationsExtra.labelSmtpPort, type: 'text', placeholder: t.integrationsExtra.placeholderSmtpPort },
          { key: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
          { key: 'password', label: t.integrationsExtra.labelSmtpPassword, type: 'password', placeholder: t.integrationsExtra.placeholderSmtpPassword },
        ];
      case 'calendar':
        return [
          { key: 'calendar_type', label: t.integrationsExtra.labelCalendarType, type: 'select', options: ['google', 'outlook'] },
          { key: 'access_token', label: t.integrationsExtra.labelCalendarToken, type: 'password', placeholder: t.integrationsExtra.placeholderCalendarToken },
        ];
      case 'slack':
        return [
          { key: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.slack.com/...' },
          { key: 'channel', label: t.integrationsExtra.labelSlackChannel, type: 'text', placeholder: t.integrationsExtra.placeholderSlackChannel },
        ];
      case 'discord':
        return [
          { key: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://discord.com/api/webhooks/...' },
          { key: 'server_id', label: t.integrationsExtra.labelDiscordServer, type: 'text', placeholder: t.integrationsExtra.placeholderDiscordServer },
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
            <DialogTitle>{t.integrationsExtra.setupTitle.replace('{name}', integration.name)}</DialogTitle>
            <DialogDescription>
              {t.integrationsExtra.setupDesc.replace('{name}', integration.name)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Вибір scope */}
            <div className="space-y-2">
              <Label>{t.integrationsExtra.scopeLabel}</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={selectedScope === 'personal' ? 'default' : 'outline'}
                  onClick={() => setSelectedScope('personal')}
                  className="flex-1"
                  size="sm"
                >
                  <User className="h-4 w-4 mr-2" />
                  {t.integrationsExtra.scopePrivate}
                </Button>
                <Button
                  type="button"
                  variant={selectedScope === 'team' ? 'default' : 'outline'}
                  onClick={() => setSelectedScope('team')}
                  className="flex-1"
                  size="sm"
                >
                  <Users className="h-4 w-4 mr-2" />
                  {t.integrationsExtra.scopeTeam}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedScope === 'personal' 
                  ? t.integrationsExtra.scopePrivateDesc
                  : t.integrationsExtra.scopeTeamDesc}
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
                    <option value="">{t.integrationsExtra.selectPlaceholder}</option>
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
                    {t.integrationsExtra.btnConnecting}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {t.integrationsExtra.btnConnect}
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
                {t.integrationsExtra.btnCancel}
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
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t.integrationsExtra.pageTitle}</h1>
        <p className="text-muted-foreground">
          {t.integrationsExtra.pageSubtitle}
        </p>
      </div>

      <Alert className="mb-6">
        <Settings2 className="h-4 w-4" />
        <AlertDescription>
          {t.integrationsExtra.pageDesc1}
          {" "}
          {t.integrationsExtra.pageDesc2}
        </AlertDescription>
      </Alert>

      {/* Фільтр за scope */}
      <div className="mb-6 flex items-center gap-4">
        <Tabs value={scopeFilter} onValueChange={(v) => setScopeFilter(v as 'all' | 'team' | 'personal')}>
          <TabsList>
            <TabsTrigger value="all">{t.integrationsExtra.tabsAll}</TabsTrigger>
            <TabsTrigger value="team">
              <Users className="h-4 w-4 mr-2" />
              {t.integrationsExtra.tabsTeam}
            </TabsTrigger>
            <TabsTrigger value="personal">
              <User className="h-4 w-4 mr-2" />
              {t.integrationsExtra.tabsPrivate}
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
                          {t.integrationsExtra.statusConnected}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          {t.integrationsExtra.statusNotConnected}
                        </Badge>
                      )}
                      <Badge variant={integration.scope === 'team' ? 'default' : 'outline'}>
                        {integration.scope === 'team' ? (
                          <>
                            <Users className="h-3 w-3 mr-1" />
                            {t.integrationsExtra.scopeTeam}
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 mr-1" />
                            {t.integrationsExtra.scopePrivate}
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
                    {t.integrationsExtra.lastSyncText.replace('{date}', new Date(integration.lastSync).toLocaleString(language === 'uk' ? 'uk-UA' : language === 'ru' ? 'ru-RU' : language === 'es' ? 'es-ES' : 'en-US'))}
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
                      {integration.enabled ? t.integrationsExtra.btnEnabled : t.integrationsExtra.btnDisabled}
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
                          {t.integrationsExtra.btnConnecting}
                        </>
                      ) : (
                        <>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          {t.integrationsExtra.btnConnect}
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
                        {t.integrationsExtra.btnSetup}
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
                          t.integrationsExtra.btnDisconnect
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
        <h3 className="font-semibold mb-2">{t.integrationsExtra.howItWorksTitle}</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>{t.integrationsExtra.howItWorksStep1}</li>
          <li>{t.integrationsExtra.howItWorksStep2}</li>
          <li>{t.integrationsExtra.howItWorksStep3}</li>
          <li>{t.integrationsExtra.howItWorksStep4}</li>
        </ul>
      </div>
    </div>
  );
}

