import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

interface NewsMessage {
  id: string;
  author_id: string | null;
  text: string;
  is_agent: boolean;
  created_at: string;
  profiles?: {
    user_id: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
}

export default function NewsPage() {
  const [messages, setMessages] = useState<NewsMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load initial messages
  useEffect(() => {
    loadMessages();
    loadPushSettings();
  }, []);

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('news-feed-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'news_feed'
        },
        (payload) => {
          console.log('New message received:', payload);
          loadMessages(); // Refresh messages to get profile data
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMessages = async () => {
    try {
      // First, get all messages
      const { data: rawMessages, error } = await supabase
        .from('news_feed')
        .select('*') 
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Then, get profile data for non-agent messages
      const userIds = rawMessages?.filter(m => !m.is_agent && m.author_id).map(m => m.author_id) || [];
      let profilesData: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);
        
        profilesData = profiles || [];
      }

      // Combine the data
      const messagesWithProfiles = rawMessages?.map(message => ({
        ...message,
        profiles: message.is_agent 
          ? null 
          : profilesData.find(p => p.user_id === message.author_id)
      })) || [];

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить сообщения',
        variant: 'destructive'
      });
    }
  };

  const loadPushSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('news_push_enabled')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setPushEnabled(data?.news_push_enabled ?? true);
    } catch (error) {
      console.error('Error loading push settings:', error);
    }
  };

  const togglePush = async () => {
    if (!user) return;

    const newValue = !pushEnabled;
    setPushEnabled(newValue);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ news_push_enabled: newValue })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Настройки обновлены',
        description: `Уведомления ${newValue ? 'включены' : 'отключены'}`
      });
    } catch (error) {
      console.error('Error updating push settings:', error);
      setPushEnabled(!newValue); // Revert on error
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить настройки',
        variant: 'destructive'
      });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    setLoading(true);
    try {
      // Call the news-reply edge function instead of direct insert
      const response = await supabase.functions.invoke('news-reply', {
        body: {
          text: input.trim(),
          author_id: user.id
        }
      });

      if (response.error) throw response.error;

      setInput('');
      toast({
        title: 'Сообщение отправлено',
        description: input.includes('@ЖОС') ? 'Агент ответит в ближайшее время' : undefined
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAuthorName = (message: NewsMessage) => {
    if (message.is_agent) return 'ЖОС';
    return message.profiles?.display_name || 'Пользователь';
  };

  const getAvatarUrl = (message: NewsMessage) => {
    if (message.is_agent) return '/assets/spirit-logo.png';
    return message.profiles?.avatar_url || null;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur border-b p-3 flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Новостная лента</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Уведомления</span>
          <Switch 
            checked={pushEnabled} 
            onCheckedChange={togglePush}
            disabled={!user}
          />
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-1 mb-4">
        {messages.map((message) => (
          <div key={message.id} className="flex gap-2 py-1 px-2 leading-tight hover:bg-muted/50 rounded">
            <Avatar className="w-6 h-6 flex-shrink-0">
              <AvatarImage src={getAvatarUrl(message) || undefined} />
              <AvatarFallback className="text-xs">
                {message.is_agent ? '🤖' : getAuthorName(message).charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-medium ${
                  message.is_agent ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {getAuthorName(message)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatTime(message.created_at)}
                </span>
              </div>
              <div className="text-sm break-words">
                {message.text.split('@ЖОС').map((part, index) => (
                  <span key={index}>
                    {index > 0 && <span className="text-primary font-medium">@ЖОС</span>}
                    {part}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur border-t p-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Срочное сообщение... (Ctrl+Enter — отправить, @ЖОС — вызвать агента)"
          className="flex-1"
          disabled={loading || !user}
          maxLength={1000}
        />
        <Button 
          onClick={sendMessage} 
          disabled={!input.trim() || loading || !user}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Help text */}
      <div className="text-xs text-muted-foreground text-center mt-2 p-2">
        💡 <strong>Подсказка:</strong> Агент ЖОС отвечает только при упоминании @ЖОС в сообщении
      </div>
    </div>
  );
}