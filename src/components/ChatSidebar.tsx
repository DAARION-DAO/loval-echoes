import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  MessageCircle, 
  MoreHorizontal, 
  Edit2, 
  Trash2,
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
import { routes } from '@/lib/routes';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  const [onlineCount, setOnlineCount] = useState(3);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const chats = await apiGet<Chat[]>(routes.chats);
      setChats(chats);
    } catch (error) {
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
      const newChat = await apiPost<Chat>(routes.chats, { name: "Новый чат" });
      setChats(prev => [newChat, ...prev]);
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
      await apiPost<any>(routes.chatName(chatId), { name: newName });
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

  const handleDeleteChat = async (chatId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот чат?")) {
      return;
    }
    
    try {
      await apiDelete<any>(routes.chat(chatId));
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
          <span>👥 {onlineCount}/12 онлайн</span>
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
              <div key={chat.id} className="group relative">
                <NavLink
                  to={`/chats/${chat.id}`}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
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
                      className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
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