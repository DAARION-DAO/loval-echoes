import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Archive, Trash2, Search, RotateCcw, Settings, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Chat {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  is_group_chat: boolean;
  user_id: string;
  messageCount?: number;
  lastMessage?: string;
}

export const ChatsManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      
      // Загружаем все чаты с количеством сообщений
      const { data: chatsData, error: chatsError } = await supabase
        .from('conversations')
        .select(`
          id,
          name,
          created_at,
          updated_at,
          is_archived,
          is_group_chat,
          user_id
        `)
        .order('updated_at', { ascending: false });

      if (chatsError) {
        throw chatsError;
      }

      // Получаем количество сообщений для каждого чата
      const chatsWithStats = await Promise.all(
        (chatsData || []).map(async (chat) => {
          const { count: messageCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', chat.id);

          // Получаем последнее сообщение
          const { data: lastMessageData } = await supabase
            .from('messages')
            .select('content')
            .eq('conversation_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...chat,
            messageCount: messageCount || 0,
            lastMessage: lastMessageData?.content?.substring(0, 50) + '...' || 'Нет сообщений',
          };
        })
      );

      setChats(chatsWithStats);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список чатов',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'active' ? !chat.is_archived : chat.is_archived;
    return matchesSearch && matchesTab;
  });

  const handleSelectChat = (chatId: string, checked: boolean) => {
    if (checked) {
      setSelectedChats(prev => [...prev, chatId]);
    } else {
      setSelectedChats(prev => prev.filter(id => id !== chatId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedChats(filteredChats.map(chat => chat.id));
    } else {
      setSelectedChats([]);
    }
  };

  const archiveChats = async (chatIds: string[], archive = true) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ is_archived: archive })
        .in('id', chatIds);

      if (error) throw error;

      toast({
        title: archive ? 'Чаты архивированы' : 'Чаты восстановлены',
        description: `${chatIds.length} чат(ов) ${archive ? 'перемещены в архив' : 'восстановлены из архива'}`,
      });

      setSelectedChats([]);
      loadChats();
    } catch (error) {
      console.error('Error archiving chats:', error);
      toast({
        title: 'Ошибка',
        description: `Не удалось ${archive ? 'архивировать' : 'восстановить'} чаты`,
        variant: 'destructive',
      });
    }
  };

  const deleteChats = async (chatIds: string[]) => {
    try {
      // Сначала удаляем все сообщения из чатов
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .in('conversation_id', chatIds);

      if (messagesError) throw messagesError;

      // Затем удаляем сами чаты
      const { error: chatsError } = await supabase
        .from('conversations')
        .delete()
        .in('id', chatIds);

      if (chatsError) throw chatsError;

      toast({
        title: 'Чаты удалены',
        description: `${chatIds.length} чат(ов) удалены навсегда`,
      });

      setSelectedChats([]);
      loadChats();
    } catch (error) {
      console.error('Error deleting chats:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить выбранные чаты',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Сегодня';
    if (diffDays === 2) return 'Вчера';
    if (diffDays <= 7) return `${diffDays} дн. назад`;
    return date.toLocaleDateString('ru-RU');
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка чатов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Заголовок */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/chats')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к чатам
            </Button>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Управление чатами
              </h1>
              <p className="text-sm text-muted-foreground">
                Архивирование и удаление чатов
              </p>
            </div>
          </div>
          <Badge variant="outline">
            {chats.length} всего чатов
          </Badge>
        </div>
      </div>

      <div className="flex-1 p-4">
        {/* Поиск и фильтры */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию чата..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="active">
                <MessageSquare className="h-4 w-4 mr-2" />
                Активные ({chats.filter(c => !c.is_archived).length})
              </TabsTrigger>
              <TabsTrigger value="archived">
                <Archive className="h-4 w-4 mr-2" />
                Архивные ({chats.filter(c => c.is_archived).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {/* Панель массовых действий */}
              {filteredChats.length > 0 && (
                <Card className="mb-4">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={selectedChats.length === filteredChats.length}
                          onCheckedChange={handleSelectAll}
                        />
                        <span className="text-sm">
                          {selectedChats.length > 0
                            ? `Выбрано ${selectedChats.length} из ${filteredChats.length}`
                            : `Выбрать все (${filteredChats.length})`}
                        </span>
                      </div>

                      {selectedChats.length > 0 && (
                        <div className="flex items-center gap-2">
                          {activeTab === 'active' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => archiveChats(selectedChats, true)}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              В архив
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => archiveChats(selectedChats, false)}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Восстановить
                            </Button>
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Удалить
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить выбранные чаты?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Это действие необратимо. Будут удалены {selectedChats.length} чат(ов) и все их сообщения.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteChats(selectedChats)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Удалить навсегда
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Список чатов */}
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="space-y-2">
                  {filteredChats.length === 0 ? (
                    <Card>
                      <CardContent className="pt-8 pb-8 text-center">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          {searchQuery ? 'Чаты не найдены' : activeTab === 'active' ? 'Нет активных чатов' : 'Нет архивных чатов'}
                        </h3>
                        <p className="text-muted-foreground">
                          {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Создайте новый чат для начала общения'}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredChats.map((chat) => (
                      <Card key={chat.id} className="hover:bg-accent/50 transition-colors">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-4">
                            <Checkbox
                              checked={selectedChats.includes(chat.id)}
                              onCheckedChange={(checked) => handleSelectChat(chat.id, checked as boolean)}
                            />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium truncate">{chat.name}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {chat.messageCount} сообщений
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground truncate mb-2">
                                {chat.lastMessage}
                              </p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Создан: {formatDate(chat.created_at)}</span>
                                <span>Обновлен: {formatDate(chat.updated_at)}</span>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/chats/${chat.id}`)}
                            >
                              Открыть
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};