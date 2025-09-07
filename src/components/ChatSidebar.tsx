import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  MessageSquare, 
  MoreVertical, 
  Edit2, 
  Trash2,
  Users,
  GitBranch
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTranslation } from '@/lib/i18n';
import { difyClient, type Chat } from '@/utils/difyClient';
import { useToast } from '@/hooks/use-toast';

export const ChatSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(3); // Мок данные

  const collapsed = state === 'collapsed';

  useEffect(() => {
    loadChats();
  }, []);

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

  const handleRenameChat = async (chatId: string, newName: string) => {
    try {
      await difyClient.renameChat(chatId, newName);
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, name: newName } : chat
      ));
      toast({
        title: t.chats.rename,
        description: 'Чат переименован',
      });
    } catch (error) {
      console.error('Error renaming chat:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : t.errors.unknownError,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!confirm(t.chats.deleteConfirm)) return;
    
    try {
      await difyClient.deleteChat(chatId);
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      toast({
        title: t.chats.delete,
        description: 'Чат удален',
      });
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : t.errors.unknownError,
        variant: 'destructive',
      });
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isActive = (chatId: string) => location.pathname === `/chats/${chatId}`;

  const getNavClass = (chatId: string) =>
    isActive(chatId) 
      ? 'bg-primary/10 text-primary border-primary/20' 
      : 'hover:bg-muted/50 border-transparent';

  return (
    <Sidebar className={collapsed ? 'w-16' : 'w-80'} collapsible="icon">
      {!collapsed && (
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t.chats.title}</h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {onlineCount}{t.presence.limit}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.chats.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={handleCreateChat} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'hidden' : 'px-4'}>
            {loading ? t.loading : `${filteredChats.length} чатов`}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredChats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton asChild>
                    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover-lift ${getNavClass(chat.id)}`}>
                      <NavLink 
                        to={`/chats/${chat.id}`} 
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        <div className="flex-shrink-0">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              <MessageSquare className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        {!collapsed && (
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-sm truncate">
                                {chat.name}
                              </h3>
                              {chat.forked_from_chat && (
                                <GitBranch className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="truncate">
                                {chat.forked_from_chat 
                                  ? `${t.chats.forkFrom} ${chat.forked_from_chat.slice(0, 8)}...`
                                  : new Date(chat.updated_at).toLocaleDateString()
                                }
                              </span>
                            </div>
                          </div>
                        )}
                      </NavLink>
                      
                      {!collapsed && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => {
                                const newName = prompt('Новое имя чата:', chat.name);
                                if (newName && newName !== chat.name) {
                                  handleRenameChat(chat.id, newName);
                                }
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              {t.chats.rename}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteChat(chat.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t.chats.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};