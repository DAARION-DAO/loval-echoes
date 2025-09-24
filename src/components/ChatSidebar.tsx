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
  Files,
  Users
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
import { Badge } from '@/components/ui/badge';
import { usePendingApprovals } from '@/hooks/usePendingApprovals';
import { OnlineUsersBar } from '@/components/OnlineUsersBar';

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
  const { pendingCount } = usePendingApprovals();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    loadChats();
    loadOnlineUsers();
  }, []);

  const loadOnlineUsers = async () => {
    try {
      // Get recent messages from last 5 minutes to determine active users
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data: recentMessages, error } = await supabase
        .from('messages')
        .select('sender_name')
        .gte('created_at', fiveMinutesAgo)
        .not('sender_name', 'is', null);
        
      if (error) {
        console.error('Error loading online users:', error);
        return;
      }
      
      // Count unique active users (excluding agent)
      const uniqueUsers = new Set(
        recentMessages?.filter(m => m.sender_name && m.sender_name !== 'ЖОС')
          .map(m => m.sender_name) || []
      );
      
      // Always include current user as online (minimum 1)
      setOnlineUsers(Math.max(1, uniqueUsers.size));
    } catch (error) {
      console.error('Error loading online users:', error);
      setOnlineUsers(1); // Fallback to at least current user
    }
  };

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
      console.log('Creating chat...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        throw new Error('You must be logged in to create a chat');
      }

      console.log('Authenticated user for chat creation:', user.id);

      // Create conversation
      console.log('Inserting conversation into database...');
      const { data: newChat, error } = await supabase
        .from('conversations')
        .insert({
          name: 'Новый чат',
          user_id: user.id,
        })
        .select('id, name, updated_at')
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        throw new Error(`Failed to create chat: ${error.message}`);
      }

      console.log('Conversation created successfully:', newChat);

      // Add user as conversation participant (required for RLS policies)
      console.log('Adding user as participant...');
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: newChat.id,
          user_id: user.id,
          role: 'member'
        });

      if (participantError) {
        console.error('Error adding user as participant:', participantError);
        // Try to clean up the conversation if participant insertion failed
        await supabase.from('conversations').delete().eq('id', newChat.id);
        throw new Error(`Failed to create chat: ${participantError.message}`);
      }

      console.log('Participant added successfully');

      const chatData = {
        id: newChat.id,
        name: newChat.name,
        updated_at: newChat.updated_at,
      };

      setChats(prev => [chatData, ...prev]);
      console.log('Chat added to local state, navigating to chat:', newChat.id);
      navigate(`/chats/${newChat.id}`);
      toast({
        description: "Чат создан",
      });
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось создать чат",
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
      const { archiveChat } = await import('@/services/chats');
      await archiveChat(chatId);

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
      const { deleteChat } = await import('@/services/chats');
      await deleteChat(chatId);

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
        <OnlineUsersBar className="mb-3" maxVisible={4} />
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
                
                {/* Кнопка удаления - всегда видимая */}
                <Button
                  size="sm" 
                  variant="ghost"
                  className="absolute right-2 top-2 h-8 w-8 p-0 z-20 bg-background/90 backdrop-blur-sm border border-border/60 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    if (window.confirm(`Точно удалить данный диалог "${chat.name}"? Это действие нельзя отменить.`)) {
                      handleDeleteChat(chat.id);
                    }
                  }}
                  title="Удалить чат"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Navigation sections */}
      <div className="border-t mt-auto">
        <div className="p-2 space-y-1">
          <NavLink
            to="/participants"
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors relative",
              isActive ? "bg-muted" : "hover:bg-muted/50"
            )}
          >
            <Users className="h-4 w-4" />
            Участники
            {pendingCount > 0 && (
              <Badge 
                variant="destructive" 
                className="ml-auto h-5 px-2 text-xs"
              >
                {pendingCount}
              </Badge>
            )}
          </NavLink>
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
            to="/chats/manage"
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              isActive ? "bg-muted" : "hover:bg-muted/50"
            )}
          >
            <Archive className="h-4 w-4" />
            Управление чатами
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
