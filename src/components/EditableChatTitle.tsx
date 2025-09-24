import { useState } from 'react';
import { Edit3, Check, X, Pin, PinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EditableChatTitleProps {
  chatId: string;
  currentName: string;
  isPinned?: boolean;
  onRename: (chatId: string, newName: string) => Promise<void>;
  onPin?: (chatId: string, pinned: boolean) => Promise<void>;
  className?: string;
}

export const EditableChatTitle = ({ 
  chatId, 
  currentName, 
  isPinned = false,
  onRename, 
  onPin,
  className 
}: EditableChatTitleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!newName.trim() || newName === currentName) {
      setIsEditing(false);
      setNewName(currentName);
      return;
    }

    try {
      setIsLoading(true);
      await onRename(chatId, newName.trim());
      setIsEditing(false);
      toast({
        title: 'Название изменено',
        description: 'Название чата успешно обновлено',
      });
    } catch (error) {
      console.error('Error renaming chat:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить название чата',
        variant: 'destructive',
      });
      setNewName(currentName);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewName(currentName);
  };

  const handlePin = async () => {
    if (!onPin) return;
    
    try {
      setIsLoading(true);
      await onPin(chatId, !isPinned);
      toast({
        title: isPinned ? 'Чат откреплен' : 'Чат закреплен',
        description: isPinned 
          ? 'Чат перемещен в общий список' 
          : 'Чат закреплен в верхней части списка',
      });
    } catch (error) {
      console.error('Error pinning chat:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить статус закрепления',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-2 min-w-0 flex-1", className)}>
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 h-8 text-sm"
          autoFocus
          disabled={isLoading}
          maxLength={100}
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isLoading || !newName.trim()}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={isLoading}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 min-w-0 flex-1 group", className)}>
      <h1 className="font-semibold text-sm sm:text-base truncate flex-1 min-w-0">
        {currentName}
      </h1>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onPin && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePin}
            disabled={isLoading}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            title={isPinned ? 'Открепить чат' : 'Закрепить чат'}
          >
            {isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
          </Button>
        )}
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          disabled={isLoading}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          title="Редактировать название"
        >
          <Edit3 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};