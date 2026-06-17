import { useEffect, useState } from "react";
import { fetchChats, ChatLite, pinChat } from "@/services/chats";
import { ChatEmptyState } from "@/components/ChatEmptyState";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';
import { uk, ru, es, enUS } from 'date-fns/locale';
import { getErrorMessage } from "@/utils/errorHelper";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Pin, PinOff } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function ChatsList() {
  const { t, language } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ChatLite[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const getDateFnsLocale = (lang: string) => {
    if (lang === 'uk') return uk;
    if (lang === 'es') return es;
    if (lang === 'ru') return ru;
    return enUS;
  };

  const loadChats = async () => {
    try {
      setLoading(true);
      console.log('Loading chats...');
      const chats = await fetchChats();
      console.log('Loaded chats:', chats);
      setItems(chats);
    } catch (e: unknown) {
      console.error('Error loading chats:', e);
      toast({
        variant: "destructive",
        title: t.chatsExtra.loadErrorTitle,
        description: getErrorMessage(e),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  const handleOpenChat = (id: string) => {
    navigate(`/chats/${id}`);
  };

  const handlePinChat = async (chatId: string, currentPinned: boolean) => {
    try {
      await pinChat(chatId, !currentPinned);
      await loadChats(); // Перезагружаем список чатов
      toast({
        title: currentPinned ? t.chatsExtra.unpinSuccess : t.chatsExtra.pinSuccess,
        description: currentPinned 
          ? t.chatsExtra.unpinDesc 
          : t.chatsExtra.pinDesc,
      });
    } catch (error) {
      console.error('Error pinning chat:', error);
      toast({
        title: t.chatsExtra.error,
        description: t.chatsExtra.pinError,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-sm text-muted-foreground flex items-center justify-center">
        {t.chatsExtra.loading}
      </div>
    );
  }

  if (items.length === 0) {
    return <ChatEmptyState onCreateChat={loadChats} />;
  }

  // Сортируем чаты: сначала закрепленные, потом по дате
  const sortedChats = [...items].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    
    const dateA = new Date(a.updatedAt || 0).getTime();
    const dateB = new Date(b.updatedAt || 0).getTime();
    return dateB - dateA;
  });

  return (
    <ul className="px-2 pb-4 space-y-1">
      {sortedChats.map(chat => (
        <li key={chat.id} className="group">
          <div className="relative rounded-lg hover:bg-muted/60 transition-colors">
            <button
              onClick={() => handleOpenChat(chat.id)}
              className="w-full text-left px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium truncate group-hover:text-primary flex-1 min-w-0 pr-2">
                  {chat.is_pinned && <Pin className="inline h-3 w-3 mr-1 text-primary" />}
                  {chat.name}
                </div>
                
                {/* Кнопка закрепления */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePinChat(chat.id, chat.is_pinned || false);
                  }}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  title={chat.is_pinned ? t.chatsExtra.unpinTooltip : t.chatsExtra.pinTooltip}
                >
                  {chat.is_pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                </Button>
              </div>

              {chat.lastMessagePreview && (
                <div className="text-xs text-muted-foreground truncate mb-2">
                  {chat.lastMessagePreview}
                </div>
              )}

              <div className="flex items-center justify-between">
                {/* Аватарки онлайн-участников */}
                <div className="flex items-center gap-1">
                  {chat.participants?.slice(0, 3).map((participant) => (
                    <Avatar
                      key={participant.user_id}
                      user={{
                        id: participant.user_id,
                        display_name: participant.display_name,
                        avatar_url: participant.avatar_url
                      }}
                      size="sm"
                      className="border border-background"
                    />
                  ))}
                  {(chat.onlineCount || 0) > 3 && (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      +{(chat.onlineCount || 0) - 3}
                    </div>
                  )}
                  {(chat.onlineCount || 0) > 0 && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {t.chatsExtra.onlineCount.replace('{count}', String(chat.onlineCount))}
                    </span>
                  )}
                </div>
                
                {/* Время последней активности */}
                {chat.updatedAt && (
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(chat.updatedAt), { 
                      addSuffix: true, 
                      locale: getDateFnsLocale(language) 
                    })}
                  </div>
                )}
              </div>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
