import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquarePlus, Users, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface ChatEmptyStateProps {
  onCreateChat: () => void;
  className?: string;
}

export const ChatEmptyState = ({ onCreateChat, className = '' }: ChatEmptyStateProps) => {
  const { t } = useTranslation();

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
              {t.chats.emptyState}
            </p>
          </div>
          
          <div className="space-y-3">
            <Button onClick={onCreateChat} className="w-full">
              <MessageSquarePlus className="h-4 w-4 mr-2" />
              {t.chats.newChat}
            </Button>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{t.allRepliesVisible}</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span>{t.inviteParticipants}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};