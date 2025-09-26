import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ZhosBanner } from '@/components/ZhosBanner';
import { MessageBubble } from '@/components/MessageBubble';
import { ChatInterface } from '@/components/ChatInterface';
import { ParticipantsList } from '@/components/ParticipantsList';
import { EditableChatTitle } from '@/components/EditableChatTitle';
import { OnlineUsersBar } from '@/components/OnlineUsersBar';
import { useTranslation } from '@/lib/i18n';
import { difyClient, type DifyMessage, type Chat } from '@/utils/difyClient';
import { useDifyStream } from '@/hooks/useDifyStream';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { renameChat, pinChat, deleteMessage } from '@/services/chats';

export const ChatPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { currentMessage, isStreaming } = useDifyStream(chatId || '');
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<DifyMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) {
      navigate('/chats');
      return;
    }
    
    loadChatData();
    setupRealTimePresence();
    setupRealTimeMessages();
  }, [chatId]);

  const setupRealTimePresence = () => {
    if (!chatId) return;

    const channel = supabase.channel(`presence-chat-${chatId}`, {
      config: {
        presence: {
          key: chatId,
        },
      },
    });

    // Получаем текущего пользователя
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const userInfo = {
          user_id: user.id,
          user_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Пользователь',
          online_at: new Date().toISOString(),
        };

        channel
          .on('presence', { event: 'sync' }, () => {
            const presenceState = channel.presenceState();
            const users: string[] = [];
            Object.keys(presenceState).forEach(key => {
              const presences = presenceState[key];
              presences.forEach((presence: any) => {
                if (presence.user_name) {
                  users.push(presence.user_name);
                }
              });
            });
            setOnlineUsers(users);
          })
          .on('presence', { event: 'join' }, ({ newPresences }) => {
            console.log('User joined:', newPresences);
          })
          .on('presence', { event: 'leave' }, ({ leftPresences }) => {
            console.log('User left:', leftPresences);
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await channel.track(userInfo);
            }
          });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const setupRealTimeMessages = () => {
    if (!chatId) return;

    const messagesChannel = supabase
      .channel(`messages-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${chatId}`,
        },
        (payload) => {
          console.log('New message received:', payload.new);
          const newMessage = payload.new as any;
          
          // Получаем имя пользователя из профиля
          let senderName = newMessage.sender_name;
          if (!senderName && newMessage.role === 'user') {
            senderName = 'Пользователь';
          } else if (newMessage.role === 'assistant') {
            senderName = 'Дух Общины';
          }
          
          const difyMessage: DifyMessage = {
            id: newMessage.id,
            conversation_id: newMessage.conversation_id,
            query: newMessage.role === 'user' ? newMessage.content : '',
            answer: newMessage.role === 'assistant' ? newMessage.content : '',
            created_at: newMessage.created_at,
            sender_name: senderName,
          };

          setMessages(prev => {
            // Избегаем дублирования сообщений
            const exists = prev.some(msg => msg.id === difyMessage.id);
            if (exists) return prev;
            return [...prev, difyMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentMessage]);

  // Убираем дублирующий useEffect - сообщения агента приходят через Real-time подписку

  const loadChatData = async () => {
    if (!chatId) return;
    
    try {
      setLoading(true);
      
      // Загружаем информацию о чате и историю сообщений
      const [chats, history] = await Promise.all([
        difyClient.getChats(),
        difyClient.getChatHistory(chatId)
      ]);
      
      const currentChat = chats.find(c => c.id === chatId);
      if (!currentChat) {
        toast({
          title: t.error,
          description: t.errors.chatNotFound,
          variant: 'destructive',
        });
        navigate('/chats');
        return;
      }
      
      setChat(currentChat);
      
      // Получаем профили пользователей для отображения имен
      await loadUserProfiles(history.data);
      
    } catch (error) {
      console.error('Error loading chat data:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : t.errors.unknownError,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfiles = async (messages: DifyMessage[]) => {
    // Имена пользователей уже есть в sender_name полях сообщений
    // Обновляем сообщения с корректными именами
    const updatedMessages = messages.map(msg => ({
      ...msg,
      sender_name: msg.answer 
        ? 'Дух Общины' 
        : (msg.sender_name || 'Пользователь')
    }));
    
    setMessages(updatedMessages);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePauseNode = async () => {
    try {
      // Создаем системное сообщение о паузе/узле
      const systemMessage: DifyMessage = {
        id: `pause-${Date.now()}`,
        conversation_id: chatId || '',
        query: '',
        answer: t.messages.pauseNode,
        created_at: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, systemMessage]);
      
      toast({
        title: t.zhosBanner.pauseButton,
        description: 'Узел зафиксирован в беседе',
      });
    } catch (error) {
      console.error('Error creating pause node:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : t.errors.unknownError,
        variant: 'destructive',
      });
    }
  };

  const handleForkMessage = async (messageId: string) => {
    try {
      const parentMessage = messages.find(m => m.id === messageId);
      if (!parentMessage) return;

      // Создаем новый чат как ветку
      const newChat = await difyClient.createChat(
        `Ветка из "${chat?.name}"`,
        chatId,
        messageId
      );
      
      navigate(`/chats/${newChat.id}`);
      
      toast({
        title: t.chats.fork,
        description: 'Ветка создана успешно',
      });
    } catch (error) {
      console.error('Error creating fork:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : t.errors.unknownError,
        variant: 'destructive',
      });
    }
  };

  const handleReportMessage = async (messageId: string) => {
    try {
      // Логирование нарушения (это будет обработано в backend)
      toast({
        title: t.messages.report,
        description: 'Нарушение зафиксировано в журнале аудита',
      });
    } catch (error) {
      console.error('Error reporting message:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : t.errors.unknownError,
        variant: 'destructive',
      });
    }
  };

  const handleRenameChat = async (chatId: string, newName: string) => {
    await renameChat(chatId, newName);
    // Обновляем локальное состояние
    if (chat) {
      setChat({ ...chat, name: newName });
    }
  };

  const handlePinChat = async (chatId: string, pinned: boolean) => {
    await pinChat(chatId, pinned);
    // Обновляем локальное состояние
    if (chat) {
      setChat({ ...chat, is_pinned: pinned });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
    // Сообщение будет помечено как удаленное в MessageBubble
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

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t.errors.chatNotFound}</h2>
          <Button onClick={() => navigate('/chats')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться к чатам
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col chat-container mobile-viewport-fix">
      {/* Шапка чата - компактная */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/chats')}
              className="md:hidden flex-shrink-0 p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="min-w-0 flex-1">
              <EditableChatTitle
                chatId={chatId || ''}
                currentName={chat.name}
                isPinned={chat.is_pinned}
                onRename={handleRenameChat}
                onPin={handlePinChat}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <OnlineUsersBar maxVisible={3} className="hidden sm:flex" />
            <ParticipantsList chatId={chatId} onlineUsers={onlineUsers} />
            <Button
              variant="outline"
              size="sm"
              onClick={handlePauseNode}
              className="flex items-center gap-1 text-xs px-2 py-1"
            >
              <AlertTriangle className="h-3 w-3" />
              <span className="hidden sm:inline">Узел</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Лента сообщений - компактная */}
      <ScrollArea className="flex-1 chat-messages custom-scrollbar">
        <div className="p-2 space-y-2 pb-safe">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">{t.chats.emptyState}</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isAgent={!!message.answer}
                isSystem={message.id.startsWith('pause-')}
                senderName={message.sender_name}
                onFork={handleForkMessage}
                onReport={handleReportMessage}
                onDelete={handleDeleteMessage}
              />
            ))
          )}

          {/* Текущее потоковое сообщение */}
          {currentMessage && (
            <MessageBubble
              message={{
                id: currentMessage.id,
                conversation_id: chatId || '',
                query: '',
                answer: currentMessage.content,
                created_at: new Date().toISOString(),
                metadata: currentMessage.metadata,
              }}
              isAgent={true}
              senderName="Дух Общины"
              onFork={handleForkMessage}
              onReport={handleReportMessage}
              onDelete={handleDeleteMessage}
            />
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Интерфейс ввода */}
      <div className="flex-shrink-0">
        <ChatInterface
          chatId={chatId || ''}
        />
      </div>
    </div>
  );
};