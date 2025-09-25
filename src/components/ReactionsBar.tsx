import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Reaction {
  id: string;
  emoji: string;
  user_id: string;
  count?: number;
  users?: string[];
}

interface ReactionsBarProps {
  messageId: string;
  className?: string;
}

const STANDARD_REACTIONS = ['👍', '👎', '❤️', '🔥', '👀', '🎉'];

export const ReactionsBar = ({ messageId, className }: ReactionsBarProps) => {
  const [reactions, setReactions] = useState<Record<string, Reaction>>({});
  const [showPicker, setShowPicker] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadReactions();
    getCurrentUser();
    setupRealtimeSubscription();
  }, [messageId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('message_reactions')
        .select('id, emoji, user_id')
        .eq('message_id', messageId);

      if (error) throw error;

      // Группируем реакции по эмодзи
      const grouped = data.reduce((acc, reaction) => {
        const emoji = reaction.emoji;
        if (!acc[emoji]) {
          acc[emoji] = {
            id: reaction.id,
            emoji,
            user_id: reaction.user_id,
            count: 0,
            users: []
          };
        }
        acc[emoji].count = (acc[emoji].count || 0) + 1;
        acc[emoji].users?.push(reaction.user_id);
        return acc;
      }, {} as Record<string, Reaction>);

      setReactions(grouped);
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`reactions-${messageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter: `message_id=eq.${messageId}`,
        },
        () => {
          loadReactions(); // Перезагружаем реакции при изменениях
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleReactionToggle = async (emoji: string) => {
    if (!currentUserId) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в систему для добавления реакций',
        variant: 'destructive',
      });
      return;
    }

    try {
      const hasReacted = reactions[emoji]?.users?.includes(currentUserId);

      if (hasReacted) {
        // Удаляем реакцию
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', currentUserId)
          .eq('emoji', emoji);

        if (error) throw error;
      } else {
        // Добавляем реакцию
        const { error } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: currentUserId,
            emoji,
          });

        if (error) throw error;
      }

      setShowPicker(false);
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить реакцию',
        variant: 'destructive',
      });
    }
  };

  const reactionEntries = Object.entries(reactions);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Отображаем существующие реакции */}
      {reactionEntries.map(([emoji, reaction]) => {
        const hasReacted = reaction.users?.includes(currentUserId || '');
        
        return (
          <Button
            key={emoji}
            size="sm"
            variant={hasReacted ? "default" : "ghost"}
            onClick={() => handleReactionToggle(emoji)}
            className={cn(
              "h-5 px-1 py-0 text-xs gap-0.5 border",
              hasReacted 
                ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20" 
                : "hover:bg-muted/50 border-border"
            )}
          >
            <span className="text-xs">{emoji}</span>
            <span className="text-xs font-medium">{reaction.count}</span>
          </Button>
        );
      })}

      {/* Кнопка добавления реакции */}
      <div className="relative">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowPicker(!showPicker)}
          className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
          title="Добавить реакцию"
        >
          <span className="text-xs">+</span>
        </Button>

        {/* Панель выбора реакций */}
        {showPicker && (
          <div className="absolute bottom-full left-0 mb-1 p-1 bg-background border rounded-md shadow-lg z-10 flex gap-0.5">
            {STANDARD_REACTIONS.map(emoji => {
              const hasReacted = reactions[emoji]?.users?.includes(currentUserId || '');
              
              return (
                <Button
                  key={emoji}
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReactionToggle(emoji)}
                  className={cn(
                    "h-6 w-6 p-0 text-sm hover:bg-muted/50",
                    hasReacted && "bg-primary/10 border border-primary/20"
                  )}
                >
                  {emoji}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Закрытие панели при клике вне */}
      {showPicker && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowPicker(false)}
        />
      )}
    </div>
  );
};