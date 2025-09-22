import { useState } from 'react';
import { Send, Mic, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export const CommunityNewsFeed = () => {
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSendUrgentNews = async () => {
    if (!message.trim()) return;

    try {
      // TODO: Implement urgent news broadcasting
      toast({
        title: 'Срочная новость отправлена',
        description: 'Уведомления будут показаны всем участникам',
      });
      setMessage('');
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить новость',
        variant: 'destructive',
      });
    }
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
            Срочные объявления
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите срочную новость для всех участников сообщества..."
            className="min-h-[120px] resize-none"
            maxLength={500}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Mic className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Smile className="h-4 w-4" />
              </Button>
              <span className="ml-2">{message.length}/500</span>
            </div>
            
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+Enter</kbd>
              <Button 
                onClick={handleSendUrgentNews}
                disabled={!message.trim()}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Отправить всем
              </Button>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
          💡 <strong>Подсказка:</strong> Новости будут показаны всем участникам в виде всплывающих уведомлений
        </div>
      </CardContent>
    </Card>
  );
};