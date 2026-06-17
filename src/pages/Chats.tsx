import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MessageSquare, GitBranch, Users, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '@/lib/i18n';
import { fetchChats, createChat, ChatLite } from '@/services/chats';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/utils/errorHelper';

export const ChatsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [chats, setChats] = useState<ChatLite[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatLite[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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
    } catch (error: unknown) {
      console.error('Error loading chats:', error);
      const friendlyMessage = getErrorMessage(error);
      toast({
        title: t.error,
        description: friendlyMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    try {
      const newChat = await createChat(t.chats.newChat);
      setChats(prev => [newChat, ...prev]);
      navigate(`/chats/${newChat.id}`);
      
      toast({
        title: t.chats.successCreate,
        description: t.chats.successCreate,
      });
    } catch (error: unknown) {
      console.error('Error creating chat:', error);
      const friendlyMessage = getErrorMessage(error);
      toast({
        title: t.error,
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

    if (diffDays === 1) return t.chatsExtra.today;
    if (diffDays === 2) return t.chatsExtra.yesterday;
    if (diffDays <= 7) return t.chatsExtra.daysAgo.replace('{days}', String(diffDays));
    
    return date.toLocaleDateString();
  };

  const getInitials = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return 'C';
    return trimmed
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const totalParticipants = new Set(chats.flatMap(chat => chat.participants?.map(participant => participant.user_id) || [])).size;

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
    <div className="flex-1 w-full max-w-4xl mx-auto p-3 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-normal sm:text-3xl">{t.chats.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">
              {t.chatsExtra.totalChats.replace('{count}', String(filteredChats.length))}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1.5">
              <Users className="h-3 w-3" />
              {t.chatsExtra.participantsCount.replace('{count}', String(totalParticipants))}
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={handleCreateChat} 
            className="h-11 px-5 flex-1 sm:flex-initial"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.chats.newChat}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4 sm:mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t.chatsExtra.searchChatsPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-11 text-base w-full"
        />
      </div>

      {/* Chat List */}
      {filteredChats.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {searchQuery ? t.chatsExtra.noChatsFound : t.chatsExtra.noChatsYet}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery 
              ? t.chatsExtra.filterNoChatsFoundDesc
              : t.chatsExtra.filterNoChatsYetDesc
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
        <div className="overflow-hidden rounded-xl border bg-card/40">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => navigate(`/chats/${chat.id}`)}
              className="flex w-full items-center gap-3 border-b p-3 text-left transition-colors last:border-b-0 hover:bg-muted/40 active:bg-muted/60 sm:p-4"
            >
              <Avatar className="h-11 w-11 flex-shrink-0 sm:h-12 sm:w-12">
                {chat.participants?.[0]?.avatar_url && <AvatarImage src={chat.participants[0].avatar_url} />}
                <AvatarFallback className="bg-primary/10 text-primary">
                  {chat.participants?.[0]?.display_name
                    ? getInitials(chat.participants[0].display_name)
                    : <MessageSquare className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {chat.is_pinned && <Pin className="h-3.5 w-3.5 flex-shrink-0 text-primary" />}
                  <h3 className="truncate text-base font-semibold">{chat.name}</h3>
                  {chat.forked_from_chat && (
                    <GitBranch className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                  )}
                </div>

                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {chat.lastMessagePreview || t.chatsExtra.noPreview}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {chat.updatedAt && <span>{formatDate(chat.updatedAt)}</span>}
                  <span>{t.chatsManagement.messagesCount.replace('{count}', String(chat.messageCount || 0))}</span>
                  <span>{t.chatsExtra.participantsCount.replace('{count}', String(chat.participants?.length || 0))}</span>
                </div>
              </div>

              <div className="hidden flex-shrink-0 items-center -space-x-2 sm:flex">
                {chat.participants?.slice(0, 3).map((participant) => (
                  <Avatar key={participant.user_id} className="h-7 w-7 border-2 border-background">
                    {participant.avatar_url && <AvatarImage src={participant.avatar_url} />}
                    <AvatarFallback className="text-[10px]">
                      {getInitials(participant.display_name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
