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
import { useTranslation } from '@/lib/i18n';

interface NewsMessage {
  id: string;
  author_id: string | null;
  text: string;
  is_agent: boolean;
  created_at: string;
  profiles?: {
    user_id: string;
    display_name: string;
    avatar_url?: string | null;
  } | null;
}

export const CommunityNewsFeed = () => {
  const { t, language } = useTranslation();
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
      let profilesData: Array<{ user_id: string; display_name: string; avatar_url?: string }> = [];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .rpc('get_public_profiles', {
            p_user_ids: userIds
          });
        
        profilesData = (profiles || []) as any;
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
        title: t.communityNewsFeed.urgentSentTitle,
        description: t.communityNewsFeed.urgentSentDesc,
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending news:', error);
      toast({
        title: t.communityNewsFeed.sendErrorTitle,
        description: t.communityNewsFeed.sendErrorDesc,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const localeMap: Record<string, string> = { ru: 'ru-RU', uk: 'uk-UA', es: 'es-ES', en: 'en-US' };
    const localeStr = localeMap[language] || 'en-US';
    return new Date(timestamp).toLocaleTimeString(localeStr, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAuthorName = (message: NewsMessage) => {
    if (message.is_agent) return t.communityNewsFeed.agentBadge;
    return message.profiles?.display_name || t.communityNewsFeed.userBadge;
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
          <span>{t.communityNewsFeed.title}</span>
          <Badge variant="secondary" className="text-xs">
            {t.communityNewsFeed.messagesCount.replace('{count}', String(messages.length))}
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
            placeholder={t.communityNewsFeed.placeholder}
            className="min-h-[120px] resize-none"
            maxLength={500}
            disabled={loading || !user}
          />
          
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground justify-between sm:justify-start">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 px-2" disabled>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2" disabled>
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2" disabled>
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-xs">{message.length}/500</span>
              </div>
              
              <div className="flex items-center justify-end gap-2">
                <kbd className="px-2 py-1 text-xs bg-muted rounded hidden sm:inline">Ctrl+Enter</kbd>
                <Button 
                  onClick={handleSendUrgentNews}
                  disabled={!message.trim() || loading || !user}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Send className="h-4 w-4" />
                  {t.communityNewsFeed.sendAllBtn}
                </Button>
              </div>
            </div>
        </div>
        
        <div 
          className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg"
          dangerouslySetInnerHTML={{ __html: t.communityNewsFeed.hint }}
        />
      </CardContent>
    </Card>
  );
};