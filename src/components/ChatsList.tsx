import { useEffect, useState } from "react";
import { fetchChats, ChatLite } from "@/services/chats";
import { ChatEmptyState } from "@/components/ChatEmptyState";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getErrorMessage } from "@/utils/errorMapping";

export function ChatsList() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ChatLite[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadChats = async () => {
    try {
      setLoading(true);
      console.log('Loading chats...');
      const chats = await fetchChats();
      console.log('Loaded chats:', chats);
      setItems(chats);
    } catch (e: any) {
      console.error('Error loading chats:', e);
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
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
    navigate(`/chat/${id}`);
  };

  if (loading) {
    return (
      <div className="p-4 text-sm text-muted-foreground flex items-center justify-center">
        Загружаем чаты...
      </div>
    );
  }

  if (items.length === 0) {
    return <ChatEmptyState onCreateChat={loadChats} />;
  }

  return (
    <ul className="px-2 pb-4 space-y-1">
      {items.map(chat => (
        <li key={chat.id}>
          <button
            onClick={() => handleOpenChat(chat.id)}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 group"
          >
            <div className="font-medium truncate group-hover:text-primary">{chat.name}</div>
            {chat.lastMessagePreview && (
              <div className="text-xs text-muted-foreground truncate mt-1">
                {chat.lastMessagePreview}
              </div>
            )}
            {chat.updatedAt && (
              <div className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(chat.updatedAt), { 
                  addSuffix: true, 
                  locale: ru 
                })}
              </div>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}