import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { KanbanCard as KanbanCardComponent } from './KanbanCard';
import { KanbanCard as KanbanCardType } from '@/types/kanban';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  cards: KanbanCardType[];
  onCreateCard: (title: string) => void;
  onUpdateCard: (cardId: string, updates: Partial<KanbanCardType>) => void;
  onDeleteCard: (cardId: string) => void;
}

export function KanbanColumn({
  id,
  title,
  color,
  cards,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
}: KanbanColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onCreateCard(newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCard();
    } else if (e.key === 'Escape') {
      setIsAddingCard(false);
      setNewCardTitle('');
    }
  };

  return (
    <Card 
      ref={setNodeRef}
      className={cn(
        "h-fit min-h-[200px] transition-colors w-full md:min-w-[280px]",
        isOver && "ring-2 ring-primary",
        color
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium truncate">
            {title} <span className="text-muted-foreground">({cards.length})</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingCard(true)}
            className="h-7 w-7 p-0 shrink-0"
            title="Добавить задачу"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {cards.map((card) => (
          <KanbanCardComponent
            key={card.id}
            card={card}
            onUpdate={onUpdateCard}
            onDelete={onDeleteCard}
          />
        ))}
        
        {isAddingCard && (
          <div className="space-y-2">
            <Input
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Введите название задачи..."
              className="text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddCard}
                disabled={!newCardTitle.trim()}
              >
                Добавить
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {!isAddingCard && cards.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Перетащите карточки сюда или нажмите + для создания
          </div>
        )}
      </CardContent>
    </Card>
  );
}