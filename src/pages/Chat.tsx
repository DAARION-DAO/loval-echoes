import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageBubble } from '@/components/MessageBubble';
import { ChatInterface } from '@/components/ChatInterface';
import { ParticipantsList } from '@/components/ParticipantsList';
import { EditableChatTitle } from '@/components/EditableChatTitle';
import { useTranslation } from '@/lib/i18n';
import { difyClient, type DifyMessage, type Chat } from '@/utils/difyClient';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ensureCurrentUserParticipant, renameChat, pinChat, deleteMessage } from '@/services/chats';
import { ChatTabs } from '@/components/ChatTabs';
import { ThreadPanel } from '@/components/ThreadPanel';

const dedupeMessages = (items: DifyMessage[]) => {
  const byId = new Map<string, DifyMessage>();
  items.forEach(item => byId.set(item.id, item));
  return Array.from(byId.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
};

export const ChatPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const currentMessage = null;
  const isStreaming = false;
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<DifyMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [participantsReadTimes, setParticipantsReadTimes] = useState<Record<string, string>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedParentMessage, setSelectedParentMessage] = useState<DifyMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) {
      navigate('/chats');
      return;
    }
    
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id);
        await ensureCurrentUserParticipant(chatId);
      }
    });

    loadChatData();
    const unsubscribePresence = setupRealTimePresence();
    const unsubscribeMessages = setupRealTimeMessages();
    updateLastRead();
    loadReadReceipts();
    
    const unsubscribeReadReceipts = setupRealTimeReadReceipts();
    return () => {
      if (unsubscribePresence) unsubscribePresence();
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeReadReceipts) unsubscribeReadReceipts();
    };
  }, [chatId]);

  const updateLastRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !chatId) return;

    await ensureCurrentUserParticipant(chatId);

    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', chatId)
      .eq('user_id', user.id);
  };

  const loadReadReceipts = async () => {
    if (!chatId) return;
    const { data, error } = await supabase
      .from('conversation_participants')
      .select('user_id, last_read_at')
      .eq('conversation_id', chatId);

    if (!error && data) {
      const readTimes: Record<string, string> = {};
      data.forEach(p => {
        if (p.last_read_at) {
          readTimes[p.user_id] = p.last_read_at;
        }
      });
      setParticipantsReadTimes(readTimes);
    }
  };

  const setupRealTimeReadReceipts = () => {
    if (!chatId) return () => {};
    const channel = supabase
      .channel(`participants-read-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_participants',
          filter: `conversation_id=eq.${chatId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          if (updated.last_read_at) {
            setParticipantsReadTimes(prev => ({
              ...prev,
              [updated.user_id]: updated.last_read_at
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const setupRealTimePresence = () => {
    if (!chatId) return;
    let isActive = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    // Получаем текущего пользователя
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && isActive) {
        channel = supabase.channel(`presence-chat-${chatId}`, {
          config: {
            presence: {
              key: user.id,
            },
          },
        });

        const userInfo = {
          user_id: user.id,
          user_name: user.user_metadata?.display_name || user.email?.split('@')[0] || t.chatPage.userFallbackName,
          online_at: new Date().toISOString(),
        };

        channel
          .on('presence', { event: 'sync' }, () => {
            const presenceState = channel.presenceState();
            const userIds: string[] = [];
            Object.keys(presenceState).forEach(key => {
              const presences = presenceState[key];
              presences.forEach((presence: any) => {
                if (presence.user_id) {
                  userIds.push(presence.user_id);
                }
              });
            });
            setOnlineUserIds([...new Set(userIds)]);
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
      isActive = false;
      if (channel) supabase.removeChannel(channel);
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
          
          if (newMessage.parent_id) {
            console.log('Skipping thread reply in main chat list:', newMessage.id);
            return;
          }
          
          // Получаем имя пользователя из профиля
          let senderName = newMessage.sender_name;
          if (!senderName && newMessage.role === 'user') {
            senderName = t.chatPage.userFallbackName;
          } else if (newMessage.role === 'assistant') {
            senderName = t.chatPage.agentFallbackName;
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
            return dedupeMessages([...prev, difyMessage]);
          });

          // Update last read timestamp on receiving new message
          updateLastRead();
        }
      )
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const { user_id, user_name, is_typing } = payload;
        if (user_id === currentUserId) return;

        setTypingUsers(prev => {
          if (is_typing) {
            if (prev.includes(user_name)) return prev;
            return [...prev, user_name];
          } else {
            return prev.filter(name => name !== user_name);
          }
        });
      })
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
    // Filter out messages that are thread replies
    const nonReplyMessages = messages.filter(msg => !msg.parent_id);

    // Имена пользователей уже есть в sender_name полях сообщений
    // Обновляем сообщения с корректными именами
    const updatedMessages = nonReplyMessages.map(msg => ({
      ...msg,
      sender_name: msg.answer 
        ? t.chatPage.agentFallbackName 
        : (msg.sender_name || t.chatPage.userFallbackName)
    }));
    
    setMessages(dedupeMessages(updatedMessages));
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
        description: t.chatPage.knotFixedDesc,
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
        t.chatPage.forkedFromTitle.replace('{name}', chat?.name || ''),
        chatId,
        messageId
      );
      
      navigate(`/chats/${newChat.id}`);
      
      toast({
        title: t.chats.fork,
        description: t.chatPage.branchSuccessDesc,
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
        description: t.chatPage.auditViolationDesc,
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
            {t.chatPage.returnToChats}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-row overflow-hidden h-[calc(100dvh-3.5rem-4rem)] lg:h-[calc(100dvh-3.5rem)] mobile-viewport-fix">
      <div className="flex-1 flex flex-col min-w-0">
        <ChatTabs 
          chatId={chatId || ''} 
          chatContent={
            <>
              {/* Шапка чата - компактная */}
              <div className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b px-4 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/chats')}
                      className="md:hidden flex-shrink-0 p-2 min-h-[44px] min-w-[44px]"
                    >
                      <ArrowLeft className="h-5 w-5" />
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
                    <ParticipantsList chatId={chatId || ''} onlineUserIds={onlineUserIds} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePauseNode}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 min-h-[36px] sm:min-h-[auto]"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      <span className="hidden sm:inline">{t.chatPage.btnKnot}</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Лента сообщений - компактная */}
              <ScrollArea className="flex-1 chat-messages custom-scrollbar">
                <div className="p-3 sm:p-4 space-y-3 pb-safe">
                  {messages.length === 0 ? (
                    <div className="mx-auto max-w-xl py-10 text-center">
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm sm:text-base text-muted-foreground">{t.chats.emptyState}</p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <Badge variant="secondary">{t.chatPage.emptyPromptKnowledge}</Badge>
                        <Badge variant="secondary">{t.chatPage.emptyPromptSummary}</Badge>
                        <Badge variant="secondary">{t.chatPage.emptyPromptDecision}</Badge>
                      </div>
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
                        currentUserId={currentUserId}
                        participantsReadTimes={participantsReadTimes}
                        onReplyInThread={setSelectedParentMessage}
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
                      senderName={t.chatPage.agentFallbackName}
                      onFork={handleForkMessage}
                      onReport={handleReportMessage}
                      onDelete={handleDeleteMessage}
                    />
                  )}

                  {/* Индикатор печати других пользователей */}
                  {typingUsers.length > 0 && (
                    <div className="text-xs text-muted-foreground italic px-3 py-1 animate-pulse">
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? t.chatPage.indicatorTypingSingle : t.chatPage.indicatorTypingMultiple}
                    </div>
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
            </>
          }
        />
      </div>
      {selectedParentMessage && (
        <ThreadPanel
          parentMessage={selectedParentMessage}
          currentUserId={currentUserId}
          onClose={() => setSelectedParentMessage(null)}
        />
      )}
    </div>
  );
};
