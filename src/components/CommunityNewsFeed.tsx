import { useState, useEffect } from 'react';
import { Send, Mic, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

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

export const CommunityNewsFeed = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<NewsMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, []);

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('community-news-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'news_feed'
        },
        (payload) => {
          console.log('New community message received:', payload);
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMessages = async () => {
    try {
      const { data: rawMessages, error } = await supabase
        .from('news_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const userIds = rawMessages?.filter(m => !m.is_agent && m.author_id).map(m => m.author_id) || [];
      let profilesData: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);
        
        profilesData = profiles || [];
      }

      const messagesWithProfiles = rawMessages?.map(message => ({
        ...message,
        profiles: message.is_agent 
          ? null 
          : profilesData.find(p => p.user_id === message.author_id)
      })) || [];

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendUrgentNews = async () => {
    if (!message.trim() || !user) return;

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('news-reply', {
        body: {
          text: message.trim(),
          author_id: user.id
        }
      });

      if (response.error) throw response.error;

      toast({
        title: 'Срочная новость отправлена',
        description: 'Push-уведомления отправлены всем участникам',
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending news:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить новость',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendUrgentNews();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>Новостная лента</span>
          <Badge variant="secondary" className="text-xs">
            {messages.length} сообщений
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recent Messages */}
        {messages.length > 0 && (
          <ScrollArea className="h-[200px] w-full rounded-md border p-3">
            <div className="space-y-2">
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-2 py-1">
                  <Avatar className="w-6 h-6 flex-shrink-0">
                    <AvatarImage src={getAvatarUrl(msg) || undefined} />
                    <AvatarFallback className="text-xs">
                      {msg.is_agent ? '🤖' : getAuthorName(msg).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-medium ${
                        msg.is_agent ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {getAuthorName(msg)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                    <div className="text-xs break-words">
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="space-y-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите срочную новость для всех участников сообщества..."
            className="min-h-[120px] resize-none"
            maxLength={500}
            disabled={loading || !user}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button variant="ghost" size="sm" className="h-8 px-2" disabled>
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" disabled>
                <Mic className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" disabled>
                <Smile className="h-4 w-4" />
              </Button>
              <span className="ml-2">{message.length}/500</span>
            </div>
            
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+Enter</kbd>
              <Button 
                onClick={handleSendUrgentNews}
                disabled={!message.trim() || loading || !user}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Отправить всем
              </Button>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
          💡 <strong>Подсказка:</strong> Новости будут показаны всем участникам. Для вызова агента используйте @ЖОС
        </div>
      </CardContent>
    </Card>
  );
};