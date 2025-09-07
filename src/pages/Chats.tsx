import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MessageSquare, GitBranch, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTranslation } from '@/lib/i18n';
import { difyClient, type Chat } from '@/utils/difyClient';
import { useToast } from '@/hooks/use-toast';

export const ChatsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [onlineCount] = useState(3); // Мок данные

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    const filtered = chats.filter(chat =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredChats(filtered);
  }, [chats, searchQuery]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const chatList = await difyClient.getChats();
      setChats(chatList);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : t.errors.unknownError,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    try {
      const newChat = await difyClient.createChat(t.chats.newChat);
      setChats(prev => [newChat, ...prev]);
      navigate(`/chats/${newChat.id}`);
      
      toast({
        title: t.chats.newChat,
        description: 'Чат создан успешно',
      });
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : t.errors.unknownError,
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
    if (diffDays <= 7) return `${diffDays} дней назад`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-6xl mx-auto">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t.chats.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{filteredChats.length} чатов</span>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {onlineCount}{t.presence.limit}
            </Badge>
          </div>
        </div>
        
        <Button onClick={handleCreateChat} className="hover-lift">
          <Plus className="h-4 w-4 mr-2" />
          {t.chats.newChat}
        </Button>
      </div>

      {/* Поиск */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t.chats.search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 max-w-md"
        />
      </div>

      {/* Список чатов */}
      {filteredChats.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {searchQuery ? 'Чаты не найдены' : 'Пока нет чатов'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery 
              ? 'Попробуйте изменить поисковый запрос'
              : 'Создайте первый чат сообщества'
            }
          </p>
          {!searchQuery && (
            <Button onClick={handleCreateChat}>
              <Plus className="h-4 w-4 mr-2" />
              {t.chats.newChat}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredChats.map((chat) => (
            <Card 
              key={chat.id}
              className="hover-lift cursor-pointer transition-all animate-fade-in"
              onClick={() => navigate(`/chats/${chat.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback>
                      <MessageSquare className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-sm truncate">{chat.name}</h3>
                      {chat.forked_from_chat && (
                        <GitBranch className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {chat.forked_from_chat && (
                        <p className="text-xs text-muted-foreground">
                          {t.chats.forkFrom} {chat.forked_from_chat.slice(0, 8)}...
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDate(chat.updated_at)}</span>
                        {chat.dify_conversation_id && (
                          <Badge variant="outline" className="text-xs">
                            Активный
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};