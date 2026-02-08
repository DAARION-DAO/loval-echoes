import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Bot, Plus, MessageSquare, Settings, Pause, Play, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Users } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  owner_user_id: string | null;
  connection_type: 'webhook' | 'websocket' | 'msp';
  status: 'active' | 'paused' | 'disconnected';
  is_preset: boolean | null;
  created_at: string;
}

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [catalogDialogOpen, setCatalogDialogOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    connection_type: 'msp' as 'webhook' | 'websocket' | 'msp',
    endpoint_url: '',
  });
  const [scopeFilter, setScopeFilter] = useState<'all' | 'community' | 'personal'>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  const CATALOG_AGENTS = [
    {
      name: 'Яромир',
      description: 'Агент співдії — контекстні підказки, синхронізація задач',
      scopes: ['read.messages', 'write.messages', 'read.tasks', 'create.tasks']
    },
    {
      name: 'Еонарх Синергетон',
      description: 'Агент синергії — аналітика взаємодій, оптимізація процесів',
      scopes: ['read.messages', 'read.tasks', 'create.tasks']
    }
  ];

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents((data || []) as Agent[]);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити агентів',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async () => {
    if (!newAgent.name.trim()) {
      toast({
        title: 'Помилка',
        description: 'Вкажіть ім\'я агента',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('agents')
        .insert({
          name: newAgent.name,
          description: newAgent.description || null,
          connection_type: newAgent.connection_type,
          endpoint_url: newAgent.endpoint_url || null,
          owner_user_id: userData.user.id,
          status: 'active',
          is_preset: false,
        });

      if (error) throw error;

      toast({
        title: 'Успішно',
        description: 'Агента створено',
      });

      setCreateDialogOpen(false);
      setNewAgent({ name: '', description: '', connection_type: 'msp' as 'webhook' | 'websocket' | 'msp', endpoint_url: '' });
      fetchAgents();
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося створити агента',
        variant: 'destructive',
      });
    }
  };

  const handleInstallCatalogAgent = async (catalogAgent: typeof CATALOG_AGENTS[0]) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      // Check if user already has this agent
      const { data: existing } = await supabase
        .from('agents')
        .select('id')
        .eq('owner_user_id', userData.user.id)
        .eq('name', `${catalogAgent.name} (особистий)`)
        .maybeSingle();

      if (existing) {
        toast({
          title: 'Вже встановлено',
          description: 'Цей агент вже є у вашому списку',
        });
        return;
      }

      // Create agent
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .insert({
          name: `${catalogAgent.name} (особистий)`,
          description: catalogAgent.description,
          owner_user_id: userData.user.id,
          connection_type: 'msp',
          status: 'active',
        })
        .select()
        .single();

      if (agentError) throw agentError;

      // Create personal conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          name: `Особистий чат з ${catalogAgent.name}`,
          user_id: userData.user.id,
          type: 'chat',
          is_group_chat: false,
          status: 'active'
        })
        .select()
        .single();

      if (convError) throw convError;

      // Add user as participant
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversation.id,
          user_id: userData.user.id,
          role: 'member'
        });

      if (participantError) throw participantError;

      // Create agent membership
      const { error: membershipError } = await supabase
        .from('agent_memberships')
        .insert({
          agent_id: agent.id,
          conversation_id: conversation.id,
          role: 'assistant',
          scopes: catalogAgent.scopes,
          active: true
        });

      if (membershipError) throw membershipError;

      // Create personal chat record
      const { error: personalChatError } = await supabase
        .from('personal_agent_chats')
        .insert({
          user_id: userData.user.id,
          agent_id: agent.id,
          conversation_id: conversation.id
        });

      if (personalChatError) throw personalChatError;

      toast({
        title: 'Успішно',
        description: `${catalogAgent.name} встановлено та готовий до роботи!`,
      });

      setCatalogDialogOpen(false);
      fetchAgents();
    } catch (error) {
      console.error('Error installing catalog agent:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося встановити агента',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (agentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    try {
      const { error } = await supabase
        .from('agents')
        .update({ status: newStatus })
        .eq('id', agentId);

      if (error) throw error;

      toast({
        title: 'Успішно',
        description: newStatus === 'active' ? 'Агента активовано' : 'Агента призупинено',
      });

      fetchAgents();
    } catch (error) {
      console.error('Error toggling agent status:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося змінити статус',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цього агента?')) return;

    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId);

      if (error) throw error;

      toast({
        title: 'Успішно',
        description: 'Агента видалено',
      });

      fetchAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося видалити агента',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Активний', variant: 'default' as const },
      paused: { label: 'Пауза', variant: 'secondary' as const },
      disconnected: { label: 'Відключений', variant: 'destructive' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Агенти</h1>
          <p className="text-muted-foreground">
            Управління особистими агентами та їх інтеграція в проєкти
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={catalogDialogOpen} onOpenChange={setCatalogDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Bot className="mr-2 h-4 w-4" />
                Каталог агентів
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Каталог агентів</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 mt-4">
                {CATALOG_AGENTS.map((agent) => (
                  <Card key={agent.name} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Bot className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{agent.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{agent.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {agent.scopes.map((scope) => (
                              <Badge key={scope} variant="outline" className="text-xs">
                                {scope}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleInstallCatalogAgent(agent)}
                      >
                        Встановити
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Підключити свій агент
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Підключити власного агента</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Ім'я агента</Label>
                  <Input
                    id="name"
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                    placeholder="Введіть ім'я агента"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Опис</Label>
                  <Textarea
                    id="description"
                    value={newAgent.description}
                    onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                    placeholder="Опишіть функції агента"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="connection">Тип підключення</Label>
                  <Select
                    value={newAgent.connection_type}
                    onValueChange={(value: 'webhook' | 'websocket' | 'msp') =>
                      setNewAgent({ ...newAgent, connection_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="msp">MSP (Рекомендовано)</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                      <SelectItem value="websocket">WebSocket</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(newAgent.connection_type === 'webhook' || newAgent.connection_type === 'websocket') && (
                  <div>
                    <Label htmlFor="endpoint">Endpoint URL</Label>
                    <Input
                      id="endpoint"
                      value={newAgent.endpoint_url}
                      onChange={(e) => setNewAgent({ ...newAgent, endpoint_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                )}
                <Button onClick={handleCreateAgent} className="w-full">
                  Створити агента
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {agents.length === 0 ? (
        <Card className="p-12 text-center">
          <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Немає агентів</h3>
          <p className="text-muted-foreground mb-4">
            Почніть з підключення свого першого агента
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Підключити агента
          </Button>
        </Card>
      ) : (
        <>
          {/* Фільтр за scope */}
          <div className="mb-6">
        <Tabs value={scopeFilter} onValueChange={(v) => setScopeFilter(v as 'all' | 'community' | 'personal')}>
              <TabsList>
                <TabsTrigger value="all">Всі</TabsTrigger>
                <TabsTrigger value="community">
                  <Users className="h-4 w-4 mr-2" />
                  Спільні
                </TabsTrigger>
                <TabsTrigger value="personal">
                  <User className="h-4 w-4 mr-2" />
                  Приватні
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents
          .filter(agent => {
            if (scopeFilter === 'all') return true;
            const agentScope = agent.owner_user_id ? 'personal' : 'community';
            return agentScope === scopeFilter;
          })
          .map((agent) => (
            <Card key={agent.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    {agent.is_preset && (
                      <Badge variant="outline" className="mt-1">
                        Пресет
                      </Badge>
                    )}
                  </div>
                </div>
                {getStatusBadge(agent.status)}
              </div>

              {agent.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {agent.description}
                </p>
              )}

              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge variant={!agent.owner_user_id ? 'default' : 'outline'}>
                  {!agent.owner_user_id ? (
                    <>
                      <Users className="h-3 w-3 mr-1" />
                      Спільний
                    </>
                  ) : (
                    <>
                      <User className="h-3 w-3 mr-1" />
                      Приватний
                    </>
                  )}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Тип: {agent.connection_type.toUpperCase()}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate('/news')}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  В чат
                </Button>
                {!agent.is_preset && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(agent.id, agent.status)}
                    >
                      {agent.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAgent(agent.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
        </>
      )}
    </div>
  );
}
