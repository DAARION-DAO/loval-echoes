import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  MessageCircle, 
  MoreHorizontal, 
  Edit2, 
  Trash2,
  Archive,
  Settings,
  Folder,
  Video,
  Files
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Chat {
  id: string;
  name: string;
  updated_at: string;
  forked_from_chat?: string;
}

export const ChatSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id, name, updated_at, created_at')
        .eq('is_archived', false)
        .order('updated_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch chats: ${error.message}`);
      }

      const chats = (conversations || []).map(conv => ({
        id: conv.id,
        name: conv.name,
        updated_at: conv.updated_at,
      }));
      
      setChats(chats);
    } catch (error: any) {
      console.error("Error loading chats:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить чаты",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('You must be logged in to create a chat');
      }

      const { data: newChat, error } = await supabase
        .from('conversations')
        .insert({
          name: 'Новый чат',
          user_id: user.id,
        })
        .select('id, name, updated_at')
        .single();

      if (error) {
        throw new Error(`Failed to create chat: ${error.message}`);
      }

      const chatData = {
        id: newChat.id,
        name: newChat.name,
        updated_at: newChat.updated_at,
      };

      setChats(prev => [chatData, ...prev]);
      navigate(`/chats/${newChat.id}`);
      toast({
        description: "Чат создан",
      });
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать чат",
        variant: "destructive",
      });
    }
  };

  const handleRenameChat = async (chatId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ name: newName })
        .eq('id', chatId);

      if (error) {
        throw new Error(`Failed to rename chat: ${error.message}`);
      }

      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, name: newName } : chat
      ));
      toast({
        description: "Чат переименован",
      });
    } catch (error) {
      console.error("Error renaming chat:", error);
      toast({
        title: "Ошибка", 
        description: "Не удалось переименовать чат",
        variant: "destructive",
      });
    }
  };

  const handleArchiveChat = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ is_archived: true } as any)
        .eq('id', chatId);

      if (error) {
        throw new Error(`Failed to archive chat: ${error.message}`);
      }

      setChats(prev => prev.filter(chat => chat.id !== chatId));
      toast({
        description: "Чат добавлен в архив",
      });
    } catch (error) {
      console.error("Error archiving chat:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось архивировать чат",
        variant: "destructive",
      });
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот чат?")) {
      return;
    }
    
    try {
      // Удаляем сообщения чата
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', chatId);

      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
      }

      // Удаляем сам чат
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', chatId);

      if (error) {
        throw new Error(`Failed to delete chat: ${error.message}`);
      }

      setChats(prev => prev.filter(chat => chat.id !== chatId));
      toast({
        description: "Чат удален",
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить чат",
        variant: "destructive",
      });
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 24 * 60 * 60 * 1000) {
      return "Сегодня";
    } else if (diff < 2 * 24 * 60 * 60 * 1000) {
      return "Вчера";
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-3 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Input 
            placeholder="Поиск чатов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" onClick={handleCreateChat} className="shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span>👥 3/12 онлайн</span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        {loading ? (
          <div className="space-y-2 p-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Чаты не найдены" : "Пока нет чатов"}
            </p>
            <Button size="sm" onClick={handleCreateChat}>
              Создать первый чат
            </Button>
          </div>
        ) : (
          <div className="space-y-1 py-2">
            {filteredChats.map((chat) => (
              <div key={chat.id} className="group relative hover:bg-muted/20 rounded-lg transition-colors">
                <NavLink
                  to={`/chats/${chat.id}`}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors block",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  )}
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{chat.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {formatDate(chat.updated_at)}
                    </p>
                  </div>
                </NavLink>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm" 
                      variant="ghost"
                      className="absolute right-2 top-2 h-8 w-8 p-0 opacity-70 group-hover:opacity-100 transition-opacity duration-200 hover:bg-muted z-10"
                      onClick={(e) => e.preventDefault()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => {
                        const newName = prompt("Новое название:", chat.name);
                        if (newName && newName !== chat.name) {
                          handleRenameChat(chat.id, newName);
                        }
                      }}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Переименовать
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleArchiveChat(chat.id)}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      В архив
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteChat(chat.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Navigation sections */}
      <div className="border-t mt-auto">
        <div className="p-2 space-y-1">
          <NavLink
            to="/chats"
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              isActive ? "bg-muted" : "hover:bg-muted/50"
            )}
          >
            <MessageCircle className="h-4 w-4" />
            Чаты
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors opacity-50",
              isActive ? "bg-muted" : "hover:bg-muted/50"
            )}
          >
            <Folder className="h-4 w-4" />
            Проекты
          </NavLink>
          <NavLink
            to="/meetings"
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors opacity-50",
              isActive ? "bg-muted" : "hover:bg-muted/50"
            )}
          >
            <Video className="h-4 w-4" />
            Встречи
          </NavLink>
          <NavLink
            to="/files"
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors opacity-50",
              isActive ? "bg-muted" : "hover:bg-muted/50"
            )}
          >
            <Files className="h-4 w-4" />
            Файлы
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              isActive ? "bg-muted" : "hover:bg-muted/50"
            )}
          >
            <Settings className="h-4 w-4" />
            Настройки
          </NavLink>
        </div>
      </div>

    </div>
  );
};
