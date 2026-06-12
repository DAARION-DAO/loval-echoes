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
  Settings
} from 'lucide-react';
import { PrinciplesBanner } from '@/components/PrinciplesBanner';
import { CreateModal, CreateFormData } from '@/components/CreateModal';
import { GlobalSearchDialog } from '@/components/GlobalSearchDialog';
import { VideoIntro } from '@/components/VideoIntro';
import { UserApprovalPanel } from '@/components/UserApprovalPanel';
import { CommunityNewsFeed } from '@/components/CommunityNewsFeed';
import { NewsNotificationsPopover } from '@/components/NewsNotificationsPopover';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useCommunityStats } from '@/hooks/useCommunityStats';
import { toast } from '@/hooks/use-toast';
import { createChat } from '@/services/chats';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const NewIndex = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats } = useCommunityStats();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showVideoIntro, setShowVideoIntro] = useState(true);
  
  // Initialize push notifications (will auto-request permission)
  usePushNotifications();

  const handleCreateSubmit = async (data: CreateFormData) => {
    if (isCreating) return;
    
    try {
      if (data.type === 'chat') {
        setIsCreating(true);
        const newChat = await createChat(data.name || "Новый чат");
        navigate(`/chats/${newChat.id}`);
        toast({
          title: "Чат создан",
          description: `Чат "${data.name}" успешно создан`,
        });
        setCreateModalOpen(false);
      } else {
        // TODO: Implement other types
        toast({
          title: "В разработке",
          description: `Создание ${data.type} будет добавлено позже`,
        });
        setCreateModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating:', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка создания',
        description: error instanceof Error ? error.message : 'Не удалось создать чат',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const quickActions = [
    {
      title: 'Создать чат',
      description: 'Начать новое обсуждение с сообществом',
      icon: MessageSquarePlus,
      action: () => setCreateModalOpen(true),
    },
    {
      title: 'Создать проект',
      description: 'Запустить новый проект для совместной работы',
      icon: FolderPlus,
      action: () => setCreateModalOpen(true),
    },
    {
      title: 'Начать встречу',
      description: 'Организовать видеоконференцию',
      icon: Video,
      action: () => toast({ title: 'TODO', description: 'Функция встреч в разработке' }),
    },
    {
      title: 'Импорт истории',
      description: 'Загрузить историю из других платформ',
      icon: Upload,
      action: () => toast({ title: 'TODO', description: 'Импорт в разработке' }),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
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
      <main className="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* User Approval Panel */}
        <UserApprovalPanel />

        {/* Principles Banner */}
        {localStorage.getItem('zhos-principles-banner-dismissed') !== 'true' && (
          <PrinciplesBanner />
        )}

        {/* Welcome Section */}
        <div className="text-center space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold">Добро пожаловать в ЖОС Мессенджер</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Платформа для открытого общения и совместной работы сообщества. 
            Все взаимодействия прозрачны и видны всем участникам.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Быстрые действия</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
            <CardTitle className="text-lg">Активность сообщества</CardTitle>
            <CardDescription>
              Статистика участников и активности
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {stats.isLoading ? '...' : stats.onlineUsers}
                </div>
                <div className="text-xs text-muted-foreground">Участников онлайн</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {stats.isLoading ? '...' : stats.onlineAgents}
                </div>
                <div className="text-xs text-muted-foreground">Агентов онлайн</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {stats.isLoading ? '...' : stats.totalUsers}
                </div>
                <div className="text-xs text-muted-foreground">Всего участников</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {stats.isLoading ? '...' : stats.totalChats}
                </div>
                <div className="text-xs text-muted-foreground">Активных чатов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {stats.isLoading ? '...' : stats.todayMessages}
                </div>
                <div className="text-xs text-muted-foreground">Сообщений сегодня</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Community News Feed */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Новостная лента сообщества</h3>
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
          console.log('Navigate to:', type, id);
          // TODO: Implement navigation
        }}
      />
    </div>
  );
};