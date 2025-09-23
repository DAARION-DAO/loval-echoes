import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MessageSquare, GitBranch, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTranslation } from '@/lib/i18n';
import { fetchChats, createChat, ChatLite } from '@/services/chats';
import { useToast } from '@/hooks/use-toast';
import { mapDifyError } from '@/utils/errorMapping';

export const ChatsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [chats, setChats] = useState<ChatLite[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatLite[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [onlineCount] = useState(3); // Mock data

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
      const chatList = await fetchChats();
      setChats(chatList);
    } catch (error: any) {
      console.error('Error loading chats:', error);
      const friendlyMessage = mapDifyError(error.message || 'Unknown error');
      toast({
        title: "Ошибка",
        description: friendlyMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    try {
      const newChat = await createChat("Новый чат");
      setChats(prev => [newChat, ...prev]);
      navigate(`/chats/${newChat.id}`);
      
      toast({
        title: "Чат создан",
        description: 'Чат создан успешно',
      });
    } catch (error: any) {
      console.error('Error creating chat:', error);
      const friendlyMessage = mapDifyError(error.message || 'Unknown error');
      toast({
        title: "Ошибка",
        description: friendlyMessage,
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
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Чаты</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{filteredChats.length} чатов</span>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {onlineCount}/12
            </Badge>
          </div>
        </div>
        
        <Button 
          onClick={handleCreateChat} 
          className="hover-lift h-11 px-6 w-full sm:w-auto"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Новый чат
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск чатов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-11 text-base w-full sm:max-w-md"
        />
      </div>

      {/* Chat List */}
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
              Новый чат
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredChats.map((chat) => (
            <Card 
              key={chat.id}
              className="hover-lift cursor-pointer transition-all animate-fade-in active:scale-95"
              onClick={() => navigate(`/chats/${chat.id}`)}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="h-11 w-11 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-base truncate">{chat.name}</h3>
                      {chat.forked_from_chat && (
                        <GitBranch className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {chat.forked_from_chat && (
                        <p className="text-sm text-muted-foreground">
                          Ветка из {chat.forked_from_chat.slice(0, 8)}...
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{chat.updatedAt && formatDate(chat.updatedAt)}</span>
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