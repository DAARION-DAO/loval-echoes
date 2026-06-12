import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { MessageBubble } from '@/components/MessageBubble';
import { supabase } from '@/integrations/supabase/client';
import { type DifyMessage } from '@/utils/difyClient';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';

interface ThreadPanelProps {
  parentMessage: DifyMessage;
  currentUserId: string | null;
  onClose: () => void;
}

export const ThreadPanel = ({ parentMessage, currentUserId, onClose }: ThreadPanelProps) => {
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const [replies, setReplies] = useState<DifyMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReplies();
    const subscription = setupRealTimeReplies();
    return () => {
      subscription();
    };
  }, [parentMessage.id]);

  useEffect(() => {
    scrollToBottom();
  }, [replies]);

  const loadReplies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('parent_id', parentMessage.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formatted: DifyMessage[] = (data || []).map(msg => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        query: msg.role === 'user' ? msg.content : '',
        answer: msg.role === 'assistant' ? msg.content : '',
        sender_name: msg.sender_name || 'Пользователь',
        created_at: msg.created_at,
      }));

      setReplies(formatted);
    } catch (error) {
      console.error('Error loading replies:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeReplies = () => {
    const channel = supabase
      .channel(`thread-replies-${parentMessage.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `parent_id=eq.${parentMessage.id}`,
        },
        (payload) => {
          const msg = payload.new as any;
          const formatted: DifyMessage = {
            id: msg.id,
            conversation_id: msg.conversation_id,
            query: msg.role === 'user' ? msg.content : '',
            answer: msg.role === 'assistant' ? msg.content : '',
            sender_name: msg.sender_name || 'Пользователь',
            created_at: msg.created_at,
          };

          setReplies(prev => {
            if (prev.some(r => r.id === formatted.id)) return prev;
            return [...prev, formatted];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendReply = async () => {
    if (!messageText.trim()) return;

    const senderName = profile?.display_name || 'Пользователь';

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: parentMessage.conversation_id,
          parent_id: parentMessage.id,
          content: messageText.trim(),
          role: 'user',
          sender_name: senderName,
          message_type: 'text'
        });

      if (error) throw error;
      setMessageText('');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить ответ',
        variant: 'destructive',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  return (
    <div className="w-80 sm:w-96 border-l bg-background flex flex-col h-full z-50 shadow-elegant">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div>
          <h3 className="font-semibold text-sm">Обсуждение сообщения</h3>
          <p className="text-xs text-muted-foreground">Ветка обсуждения</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Parent Message Preview */}
      <div className="p-3 bg-muted/20 border-b">
        <div className="text-xs text-muted-foreground mb-1 font-medium">Исходное сообщение:</div>
        <div className="text-xs text-foreground bg-background p-2 rounded border line-clamp-3">
          <strong>{parentMessage.sender_name || 'Отправитель'}: </strong>
          {parentMessage.query || parentMessage.answer || ''}
        </div>
      </div>

      {/* Replies List */}
      <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : replies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-xs">
            Нет ответов в этой ветке. Начните обсуждение!
          </div>
        ) : (
          <div className="space-y-3">
            {replies.map(reply => (
              <MessageBubble
                key={reply.id}
                message={reply}
                isAgent={!!reply.answer}
                senderName={reply.sender_name}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input Form */}
      <div className="p-3 border-t bg-background">
        <div className="flex gap-2">
          <Textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ответить в ветку..."
            className="min-h-[40px] max-h-20 resize-none text-xs"
          />
          <Button
            onClick={handleSendReply}
            disabled={!messageText.trim()}
            size="sm"
            className="h-10 w-10 p-0 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
