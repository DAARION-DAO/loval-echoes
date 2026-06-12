import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquarePlus, Users, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { createChat } from '@/services/chats';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { getErrorMessage } from "@/utils/errorHelper";

interface ChatEmptyStateProps {
  onCreateChat: () => void;
  className?: string;
}

export const ChatEmptyState = ({ onCreateChat, className = '' }: ChatEmptyStateProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const handleCreateFirstChat = async () => {
    try {
      setCreating(true);
      console.log('Creating first chat...');
      const chat = await createChat('Мой первый чат');
      console.log('Created chat:', chat);
      
      toast({
        title: "Чат создан",
        description: "Первый чат успешно создан!",
      });
      
      onCreateChat(); // Refresh the chat list
      navigate(`/chat/${chat.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        variant: "destructive",
        title: "Ошибка создания",
        description: getErrorMessage(error),
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-[400px] p-8 ${className}`}>
      <Card className="w-full max-w-md">
        <CardContent className="text-center space-y-6 p-8">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <MessageSquarePlus className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Пока нет чатов</h3>
            <p className="text-sm text-muted-foreground">
              Создайте свой первый чат, чтобы начать общение
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleCreateFirstChat} 
              className="w-full"
              disabled={creating}
            >
              <MessageSquarePlus className="h-4 w-4 mr-2" />
              {creating ? 'Создаем...' : 'Создать первый чат'}
            </Button>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>Все ответы видны участникам</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span>Пригласить участников</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};