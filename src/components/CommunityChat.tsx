import { useState, useEffect, useRef } from 'react';
import { Send, Users, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { difyClient, type DifyMessage } from '@/utils/difyClient';
import { useDifyStream } from '@/hooks/useDifyStream';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CommunityMessage {
  id: string;
  content: string;
  sender_name: string;
  created_at: string;
  is_agent?: boolean;
  is_system?: boolean;
}

export const CommunityChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [communityChat, setCommunityChat] = useState<{ id: string } | null>(null);
  const { isStreaming, startStream, currentMessage } = useDifyStream(communityChat?.id || null);
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Создаем или получаем сообщественный чат
  const loadGlobalOnlineUsers = async () => {
    try {
      // Получаем пользователей, которые были активны в последние 5 минут
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data: recentMessages, error } = await supabase
        .from('messages')
        .select('sender_name')
        .gte('created_at', fiveMinutesAgo)
        .not('sender_name', 'is', null);
        
      if (error) {
        console.error('Error loading global online users:', error);
        return;
      }
      
      // Подсчитываем уникальных активных пользователей (исключая агента)
      const uniqueUsers = new Set(
        recentMessages?.filter(m => m.sender_name && !m.sender_name.includes('ЖОС'))
          .map(m => m.sender_name) || []
      );
      
      setOnlineUsers(uniqueUsers.size);
    } catch (error) {
      console.error('Error loading global online users:', error);
    }
  };

  useEffect(() => {
    const setupCommunityChat = async () => {
      try {
        setIsLoading(true);
        console.log('[CommunityChat] Setting up community chat...');
        
        // Проверяем существующий сообщественный чат
        const { data: existingChats, error } = await supabase
          .from('conversations')
          .select('id, name')
          .eq('name', 'Общий чат ЖОС')
          .eq('is_group_chat', true)
          .single();

        if (existingChats && !error) {
          console.log('[CommunityChat] Found existing chat:', existingChats);
          setCommunityChat({ id: existingChats.id });
          await loadChatHistory(existingChats.id);
        } else {
          console.log('[CommunityChat] Creating new community chat...');
          // Создаем новый сообщественный чат
          const { data: newChat, error: createError } = await supabase
            .from('conversations')
            .insert({
              name: 'Общий чат ЖОС',
              description: 'Общий чат сообщества с агентом ЖОС',
              is_group_chat: true,
              user_id: user?.id
            })
            .select('id')
            .single();

          if (createError) throw createError;
          
          console.log('[CommunityChat] Created new chat:', newChat);
          setCommunityChat({ id: newChat.id });
          
          // Добавляем приветственные сообщения
          await addWelcomeMessages(newChat.id);
          await loadChatHistory(newChat.id);
        }
      } catch (error) {
        console.error('Error setting up community chat:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить общий чат',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      setupCommunityChat();
      loadGlobalOnlineUsers();
      
      // Обновляем активность каждую минуту
      const interval = setInterval(loadGlobalOnlineUsers, 60000);
      return () => clearInterval(interval);
    }
  }, [user, toast]);

  const addWelcomeMessages = async (chatId: string) => {
    const welcomeMessages = [
      {
        conversation_id: chatId,
        content: 'Добро пожаловать в общий чат ЖОС! Здесь публикуются важные новости и объявления общины.',
        role: 'system',
        sender_name: 'ЖОС Система',
        message_type: 'text'
      },
      {
        conversation_id: chatId,
        content: 'Обновление системы: Улучшена работа с диалогами и добавлена возможность архивирования чатов.',
        role: 'assistant',
        sender_name: 'ЖОС Агент',
        message_type: 'text'
      }
    ];

    await supabase.from('messages').insert(welcomeMessages);
  };

  const loadChatHistory = async (chatId: string) => {
    try {
      const { data: dbMessages, error } = await supabase
        .from('messages')
        .select('id, content, sender_name, created_at, role')
        .eq('conversation_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: CommunityMessage[] = dbMessages.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_name: msg.sender_name || 'Пользователь',
        created_at: msg.created_at,
        is_agent: msg.role === 'assistant',
        is_system: msg.role === 'system'
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isStreaming || !communityChat) return;

    console.log('[CommunityChat] Sending message:', message);

    const userMessage: CommunityMessage = {
      id: `user-${Date.now()}`,
      content: message,
      sender_name: user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Пользователь',
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Сохраняем сообщение пользователя в базу данных
      await supabase.from('messages').insert({
        conversation_id: communityChat.id,
        content: message,
        role: 'user',
        sender_name: userMessage.sender_name,
        message_type: 'text'
      });

      console.log('[CommunityChat] Saved user message to DB');

      // Отправляем сообщение агенту
      console.log('[CommunityChat] Starting stream to agent...');
      await startStream(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось отправить сообщение',
        variant: 'destructive',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageAvatar = (message: CommunityMessage) => {
    if (message.is_system) {
      return '🏛️';
    }
    if (message.is_agent) {
      return '🤖';
    }
    return message.sender_name.charAt(0).toUpperCase();
  };

  const getMessageStyle = (message: CommunityMessage) => {
    if (message.is_system) {
      return 'bg-muted border-l-4 border-l-primary';
    }
    if (message.is_agent) {
      return 'bg-primary/5 border-l-4 border-l-primary';
    }
    return 'bg-background';
  };

  // Обработчик завершения потока для сохранения ответа агента
  useEffect(() => {
    if (currentMessage?.isComplete && communityChat) {
      console.log('[CommunityChat] Agent message complete, saving to DB:', currentMessage.content);
      
      const saveAgentMessage = async () => {
        try {
          await supabase.from('messages').insert({
            conversation_id: communityChat.id,
            content: currentMessage.content,
            role: 'assistant',
            sender_name: 'ЖОС Агент',
            message_type: 'text'
          });

          console.log('[CommunityChat] Saved agent message to DB');

          // Добавляем сообщение агента в локальное состояние
          const agentMessage: CommunityMessage = {
            id: `agent-${Date.now()}`,
            content: currentMessage.content,
            sender_name: 'ЖОС Агент',
            created_at: new Date().toISOString(),
            is_agent: true
          };
          
          setMessages(prev => [...prev, agentMessage]);
        } catch (error) {
          console.error('Error saving agent message:', error);
        }
      };

      saveAgentMessage();
    }
  }, [currentMessage?.isComplete, communityChat]);

  if (isLoading) {
    return (
      <Card className="h-[600px] flex flex-col">
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Загружаем общий чат...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Общий чат ЖОС
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {onlineUsers} онлайн
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Лента сообщений */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`p-3 rounded-lg ${getMessageStyle(msg)}`}>
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="text-xs">
                      {getMessageAvatar(msg)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{msg.sender_name}</span>
                      {msg.is_agent && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          <Bot className="h-3 w-3 mr-1" />
                          Агент
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleTimeString('ru-RU')}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Текущее потоковое сообщение */}
            {currentMessage && (
              <div className="p-3 rounded-lg bg-primary/5 border-l-4 border-l-primary">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="text-xs">🤖</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">ЖОС Агент</span>
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        <Bot className="h-3 w-3 mr-1" />
                        Агент
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date().toLocaleTimeString('ru-RU')}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">{currentMessage.content}</p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Интерфейс ввода */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Написать в общий чат..."
              className="min-h-[44px] max-h-32 resize-none"
              disabled={isStreaming}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isStreaming}
              size="sm"
              className="h-11 px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Индикатор печати */}
          {isStreaming && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              ЖОС Агент печатает...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};