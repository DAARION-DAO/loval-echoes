import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard as KanbanCardType } from '@/types/kanban';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';

interface ProjectKanbanProps {
  projectId: string;
}

export function ProjectKanban({ projectId }: ProjectKanbanProps) {
  const { t } = useTranslation();
  const [cards, setCards] = useState<KanbanCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const columns = [
    { id: 'backlog', title: t.kanban.backlog, color: 'bg-gray-100' },
    { id: 'todo', title: t.kanban.todo, color: 'bg-blue-100' },
    { id: 'progress', title: t.kanban.inProgress, color: 'bg-yellow-100' },
    { id: 'review', title: t.kanban.inReview, color: 'bg-purple-100' },
    { id: 'done', title: t.kanban.done, color: 'bg-green-100' },
  ] as const;

  // Load cards
  useEffect(() => {
    loadCards();
  }, [projectId]);

  // Setup realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`kanban:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kanban_cards',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Kanban realtime update:', payload);
          // Reload cards on any change for simplicity
          loadCards();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const loadCards = async () => {
    try {
      const response = await fetch(`/functions/v1/kanban-api?project_id=${projectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load cards');
      }

      const data = await response.json();
      setCards(data.data || []);
    } catch (error) {
      console.error('Error loading kanban cards:', error);
      toast({
        title: t.error,
        description: t.kanban.loadError,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createCard = async (columnId: string, title: string) => {
    if (!user) return;

    try {
      const response = await fetch('/functions/v1/kanban-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          project_id: projectId,
          title,
          column_type: columnId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create card');
      }

      // Card will be added via realtime subscription
      toast({
        title: t.kanban.success,
        description: t.kanban.taskCreated,
      });
    } catch (error) {
      console.error('Error creating card:', error);
      toast({
        title: t.error,
        description: t.kanban.createError,
        variant: 'destructive',
      });
    }
  };

  const updateCard = async (cardId: string, updates: Partial<KanbanCardType>) => {
    try {
      const response = await fetch(`/functions/v1/kanban-api/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update card');
      }
    } catch (error) {
      console.error('Error updating card:', error);
      toast({
        title: t.error,
        description: t.kanban.updateError,
        variant: 'destructive',
      });
    }
  };

  const deleteCard = async (cardId: string) => {
    try {
      const response = await fetch(`/functions/v1/kanban-api/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete card');
      }

      toast({
        title: t.kanban.success,
        description: t.kanban.taskDeleted,
      });
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: t.error,
        description: t.kanban.deleteError,
        variant: 'destructive',
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const cardId = active.id as string;
    const newColumnId = over.id as string;
    
    // Check if we're dropping on a column or another card
    const targetColumn = columns.find(col => col.id === newColumnId);
    
    if (targetColumn) {
      // Dropping on a column
      const cardsInColumn = cards.filter(card => card.column_type === newColumnId);
      const newPosition = cardsInColumn.length;
      
      await updateCard(cardId, {
        column_type: newColumnId as "backlog" | "todo" | "progress" | "review" | "done",
        position: newPosition,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden bg-background">
      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="h-full overflow-x-auto overflow-y-auto md:overflow-y-hidden">
          <div className="flex flex-col md:flex-row gap-4 p-4 h-full md:min-w-max">
            {columns.map((column) => {
              const columnCards = cards.filter(card => card.column_type === column.id);
              
              return (
                <div key={column.id} className="w-full md:w-[320px] md:shrink-0">
                  <SortableContext
                    items={columnCards.map(card => card.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <KanbanColumn
                      id={column.id}
                      title={column.title}
                      color={column.color}
                      cards={columnCards}
                      onCreateCard={(title) => createCard(column.id, title)}
                      onUpdateCard={updateCard}
                      onDeleteCard={deleteCard}
                    />
                  </SortableContext>
                </div>
              );
            })}
          </div>
        </div>
      </DndContext>
    </div>
  );
}