import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageSquarePlus, 
  FolderPlus, 
  Video, 
  Upload, 
  Search,
  User,
  Settings,
  Bot,
  Zap,
  UserPlus,
  Layers,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { PrinciplesBanner } from '@/components/PrinciplesBanner';
import { CreateModal, CreateFormData } from '@/components/CreateModal';
import { GlobalSearchDialog } from '@/components/GlobalSearchDialog';
import { VideoIntro } from '@/components/VideoIntro';
import { UserApprovalPanel } from '@/components/UserApprovalPanel';
import { CommunityNewsFeed } from '@/components/CommunityNewsFeed';
import { NewsNotificationsPopover } from '@/components/NewsNotificationsPopover';
import { Badge } from '@/components/ui/badge';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useCommunityStats } from '@/hooks/useCommunityStats';
import { toast } from '@/hooks/use-toast';
import { createChat } from '@/services/chats';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/integrations/supabase/client';

export const NewIndex = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats } = useCommunityStats();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showVideoIntro, setShowVideoIntro] = useState(true);
  
  const { activeCommunity, activeCommunityId, refresh: refreshCommunity } = useActiveCommunity();
  const [spiritAgent, setSpiritAgent] = useState<any>(null);
  const [agentPerms, setAgentPerms] = useState<any>(null);
  const [loadingAgent, setLoadingAgent] = useState(false);

  useEffect(() => {
    const fetchSpiritAgent = async () => {
      if (!activeCommunityId) return;
      setLoadingAgent(true);
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('community_id', activeCommunityId)
          .eq('agent_type', 'community_spirit')
          .maybeSingle();

        if (!error && data) {
          setSpiritAgent(data);
          
          const { data: pData } = await supabase
            .from('agent_permissions')
            .select('*')
            .eq('agent_id', data.id)
            .maybeSingle();
          if (pData) setAgentPerms(pData);
        } else {
          setSpiritAgent(null);
          setAgentPerms(null);
        }
      } catch (err) {
        console.error('Error fetching spirit agent:', err);
      } finally {
        setLoadingAgent(false);
      }
    };
    fetchSpiritAgent();
  }, [activeCommunityId]);
  
  // Initialize push notifications (will auto-request permission)
  usePushNotifications();

  const handleCreateSubmit = async (data: CreateFormData) => {
    if (isCreating) return;
    
    try {
      setIsCreating(true);
      if (data.type === 'chat') {
        const newChat = await createChat(data.name || "Новий чат");
        navigate(`/chats/${newChat.id}`);
        toast({
          title: "Чат створено",
          description: `Чат "${data.name}" успішно створено`,
        });
        setCreateModalOpen(false);
      } else if (data.type === 'project') {
        const response = await supabase.functions.invoke('projects-api', {
          body: {
            name: data.name.trim(),
            description: data.description?.trim() || '',
            participants: []
          }
        });
        
        if (response.error) {
          throw response.error;
        }

        const { project } = response.data;
        
        toast({
          title: "Проєкт створено",
          description: `Проєкт "${data.name}" успішно створено`,
        });
        setCreateModalOpen(false);
        navigate(`/projects/${project.id}`);
      } else {
        toast({
          title: "В розробці",
          description: `Створення ${data.type} буде додано пізніше`,
        });
        setCreateModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка створення',
        description: error instanceof Error ? error.message : 'Не вдалося виконати створення',
      });
    } finally {
      setIsCreating(false);
    }
  };
 
  const quickActions = [
    {
      title: t.dashboard.createChat,
      description: t.dashboard.createChatDesc,
      icon: MessageSquarePlus,
      action: () => setCreateModalOpen(true),
    },
    {
      title: t.dashboard.createProject,
      description: t.dashboard.createProjectDesc,
      icon: FolderPlus,
      action: () => setCreateModalOpen(true),
    },
    {
      title: t.dashboard.importHistory,
      description: t.dashboard.importHistoryDesc,
      icon: Upload,
      action: () => navigate('/import'),
    },
  ];

  return (
    <div className="bg-background pb-20 lg:pb-4">
      {/* Video Intro */}
      <VideoIntro onComplete={() => setShowVideoIntro(false)} />
      
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">{t.zhosBanner.line1.split(' ')[0]} Мессенджер</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchDialogOpen(true)}
                className="hidden sm:flex items-center gap-2 min-w-[200px] justify-start text-muted-foreground"
              >
                <Search className="h-4 w-4" />
                <span className="hidden md:inline">Глобальный поиск...</span>
                <span className="md:hidden">Поиск...</span>
                <kbd className="ml-auto text-xs hidden md:inline">⌘K</kbd>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="default"
                size="sm"
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center gap-2"
              >
                <MessageSquarePlus className="h-4 w-4" />
                <span className="hidden sm:inline">Создать</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSearchDialogOpen(true)}
                className="sm:hidden"
              >
                <Search className="h-4 w-4" />
              </Button>
              
              <NewsNotificationsPopover />
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* User Approval Panel */}
        <UserApprovalPanel />

        {/* Principles Banner */}
        {localStorage.getItem('zhos-principles-banner-dismissed') !== 'true' && (
          <PrinciplesBanner />
        )}

        {/* Welcome Section */}
        <div className="text-center space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{t.dashboard.welcome}</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            {t.dashboard.welcomeDesc}
          </p>
        </div>

        {/* Community Spirit Agent Card */}
        {activeCommunityId && (
          <Card className="border-indigo-500/30 bg-indigo-950/5 backdrop-blur-md shadow-elegant relative overflow-hidden group text-left">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="h-32 w-32 text-indigo-400 rotate-12" />
            </div>
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center relative">
                  <Bot className="h-6 w-6 text-indigo-400 animate-pulse" />
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span>{spiritAgent ? spiritAgent.name : "Дух Спільноти"}</span>
                    <span className="px-2 py-0.5 text-[9px] font-semibold rounded bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-wider">активний</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-indigo-300 font-medium tracking-wide">
                    Головний AI Організатор • {spiritAgent?.personality?.autonomy_level === 'supervised_admin' ? 'Супервізований Адмін' : spiritAgent?.personality?.autonomy_level === 'coordinator' ? 'Координатор' : 'Асистент'}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-indigo-500/5 text-indigo-300 border-indigo-500/20 text-[10px] py-1 px-2.5">
                Дух MicroDAO
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {spiritAgent ? (
                <div className="space-y-3">
                  <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-900">
                    <span className="font-semibold text-slate-200">Місія памʼяті:</span> {spiritAgent.personality?.mission || "Збереження колективного розуму та координація цілей спільноти."}
                  </div>
                  {spiritAgent.personality?.goal_30_days && (
                    <div className="text-xs text-slate-400">
                      <span className="font-medium text-slate-300">Ціль на 30 днів:</span> {spiritAgent.personality.goal_30_days}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-400">
                  Дух Спільноти готовий до налаштування. Спільнота працює в автономному режимі.
                </div>
              )}

              <div className="pt-2 border-t border-slate-800/60">
                <div className="text-xs font-semibold text-slate-400 mb-2">Швидкі дії Агента:</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      navigate('/chats');
                      toast({ title: "Діалог з Агентом", description: "Дух Спільноти підключається до вашого чату..." });
                    }}
                    className="text-xs border-slate-800 bg-slate-950/20 hover:bg-slate-900 text-slate-300 gap-1.5 h-9"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Поговорити</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => toast({ title: "Підсумок роботи", description: "Дух Спільноти аналізує базу знань та повідомлення для підсумку." })}
                    className="text-xs border-slate-800 bg-slate-950/20 hover:bg-slate-900 text-slate-300 gap-1.5 h-9"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Підсумувати</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      navigate('/settings');
                      toast({ title: "Коди доступу", description: "Створення та керування запрошеннями до MicroDAO." });
                    }}
                    className="text-xs border-slate-800 bg-slate-950/20 hover:bg-slate-900 text-slate-300 gap-1.5 h-9"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Запрошення</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setCreateModalOpen(true);
                    }}
                    className="text-xs border-slate-800 bg-slate-950/20 hover:bg-slate-900 text-slate-300 gap-1.5 h-9"
                  >
                    <FolderPlus className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Створити задачу</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => toast({ title: "Аналіз правил", description: "Агент готує оновлений регламент на основі культури спілкування." })}
                    className="text-xs border-slate-800 bg-slate-950/20 hover:bg-slate-900 text-slate-300 gap-1.5 h-9"
                  >
                    <Layers className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Правила</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => toast({ title: "Планування", description: "Аналіз завдань та формування тижневого спринту." })}
                    className="text-xs border-slate-800 bg-slate-950/20 hover:bg-slate-900 text-slate-300 gap-1.5 h-9"
                  >
                    <Zap className="h-3.5 w-3.5 text-indigo-400 animate-bounce" style={{ animationDuration: '3s' }} />
                    <span>Запланувати тиждень</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-semibold">{t.dashboard.quickActions}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {quickActions.map((action, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={action.action}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                      <action.icon className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-sm">{action.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-xs leading-tight">
                    {action.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats or Recent Activity */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg">{t.dashboard.communityActivity}</CardTitle>
            <CardDescription>
              {t.dashboard.activityDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex overflow-x-auto gap-4 pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-5 sm:overflow-visible">
              <div className="text-center flex-shrink-0 min-w-[80px]">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {stats.isLoading ? '...' : stats.onlineUsers}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{t.dashboard.onlineUsers}</div>
              </div>
              <div className="text-center flex-shrink-0 min-w-[80px]">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {stats.isLoading ? '...' : stats.onlineAgents}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{t.dashboard.onlineAgents}</div>
              </div>
              <div className="text-center flex-shrink-0 min-w-[80px]">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {stats.isLoading ? '...' : stats.totalUsers}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{t.dashboard.totalUsers}</div>
              </div>
              <div className="text-center flex-shrink-0 min-w-[80px]">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {stats.isLoading ? '...' : stats.totalChats}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{t.dashboard.activeChats}</div>
              </div>
              <div className="text-center flex-shrink-0 min-w-[80px]">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {stats.isLoading ? '...' : stats.todayMessages}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{t.dashboard.todayMessages}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Community News Feed */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-semibold">{t.dashboard.newsFeed}</h3>
          <CommunityNewsFeed />
        </div>
      </main>

      {/* Modals */}
      <CreateModal
        open={createModalOpen}
        onClose={() => !isCreating && setCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        loading={isCreating}
      />
      
      <GlobalSearchDialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        onNavigate={(type, id) => {
          if (type === 'chat' || type === 'message') {
            navigate(`/chats/${id}`);
          } else if (type === 'project') {
            navigate(`/projects/${id}`);
          } else if (type === 'file') {
            navigate(`/knowledge-base`);
          } else {
            navigate(`/participants`);
          }
        }}
      />
    </div>
  );
};