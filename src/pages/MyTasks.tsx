import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { KanbanCard as KanbanCardType } from '@/types/kanban';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { List, LayoutGrid, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { KanbanCard } from '@/components/KanbanCard';

export default function MyTasks() {
  const { user } = useAuth();
  const [cards, setCards] = useState<KanbanCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [view, setView] = useState<'list' | 'board' | 'calendar'>('board');

  useEffect(() => {
    if (user) {
      loadMyTasks();
    }
  }, [user]);

  const loadMyTasks = async () => {
    if (!user) return;

    try {
      // Получаем все проекты пользователя
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (participantError) throw participantError;

      const projectIds = participantData?.map(p => p.conversation_id) || [];

      if (projectIds.length === 0) {
        setCards([]);
        setLoading(false);
        return;
      }

      // Получаем задачи где пользователь - исполнитель или создатель
      const { data: tasksData, error: tasksError } = await supabase
        .from('kanban_cards')
        .select('*')
        .in('project_id', projectIds)
        .or(`assignee_id.eq.${user.id},created_by.eq.${user.id}`);

      if (tasksError) throw tasksError;

      setCards((tasksData || []) as KanbanCardType[]);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить задачи',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

      // Обновляем локальный стейт
      setCards(prev => prev.map(card => 
        card.id === cardId ? { ...card, ...updates } : card
      ));

      toast({
        title: 'Успех',
        description: 'Задача обновлена',
      });
    } catch (error) {
      console.error('Error updating card:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить задачу',
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

      setCards(prev => prev.filter(card => card.id !== cardId));

      toast({
        title: 'Успех',
        description: 'Задача удалена',
      });
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить задачу',
        variant: 'destructive',
      });
    }
  };

  // Фильтрация задач
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         card.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || card.column_type === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Группировка по датам
  const now = new Date();
  const groupedByDate = {
    overdue: filteredCards.filter(card => {
      if (!card.due_date || card.column_type === 'done') return false;
      return new Date(card.due_date) < now;
    }),
    today: filteredCards.filter(card => {
      if (!card.due_date) return false;
      const dueDate = new Date(card.due_date);
      return dueDate.toDateString() === now.toDateString();
    }),
    next7days: filteredCards.filter(card => {
      if (!card.due_date) return false;
      const dueDate = new Date(card.due_date);
      const in7days = new Date(now);
      in7days.setDate(in7days.getDate() + 7);
      return dueDate > now && dueDate <= in7days && dueDate.toDateString() !== now.toDateString();
    }),
    noDueDate: filteredCards.filter(card => !card.due_date),
  };

  // Группировка по статусам для доски
  const groupedByStatus = {
    backlog: filteredCards.filter(card => card.column_type === 'backlog'),
    todo: filteredCards.filter(card => card.column_type === 'todo'),
    progress: filteredCards.filter(card => card.column_type === 'progress'),
    review: filteredCards.filter(card => card.column_type === 'review'),
    done: filteredCards.filter(card => card.column_type === 'done'),
  };

  // Счетчики
  const counts = {
    total: filteredCards.length,
    overdue: groupedByDate.overdue.length,
    today: groupedByDate.today.length,
    review: groupedByStatus.review.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Ваши задачи</h1>
            <p className="text-muted-foreground">
              Управляйте своими задачами и отслеживайте прогресс
            </p>
          </div>

          {/* Счетчики */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Всего</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{counts.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Просрочено</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{counts.overdue}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Сегодня</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{counts.today}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">На проверке</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{counts.review}</div>
              </CardContent>
            </Card>
          </div>

          {/* Фильтры и поиск */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск задач..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="backlog">Бэклог</SelectItem>
                <SelectItem value="todo">К выполнению</SelectItem>
                <SelectItem value="progress">В процессе</SelectItem>
                <SelectItem value="review">На проверке</SelectItem>
                <SelectItem value="done">Готово</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setView('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={view === 'board' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setView('board')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Представления */}
          {view === 'list' && (
            <div className="space-y-6">
              {counts.overdue > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    Просрочено
                    <Badge variant="destructive">{counts.overdue}</Badge>
                  </h2>
                  <div className="space-y-2">
                    {groupedByDate.overdue.map(card => (
                      <div key={card.id} className="border-l-4 border-destructive">
                        <KanbanCard
                          card={card}
                          onUpdate={updateCard}
                          onDelete={deleteCard}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {counts.today > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    Сегодня
                    <Badge>{counts.today}</Badge>
                  </h2>
                  <div className="space-y-2">
                    {groupedByDate.today.map(card => (
                      <KanbanCard
                        key={card.id}
                        card={card}
                        onUpdate={updateCard}
                        onDelete={deleteCard}
                      />
                    ))}
                  </div>
                </div>
              )}

              {groupedByDate.next7days.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    Следующие 7 дней
                    <Badge variant="secondary">{groupedByDate.next7days.length}</Badge>
                  </h2>
                  <div className="space-y-2">
                    {groupedByDate.next7days.map(card => (
                      <KanbanCard
                        key={card.id}
                        card={card}
                        onUpdate={updateCard}
                        onDelete={deleteCard}
                      />
                    ))}
                  </div>
                </div>
              )}

              {groupedByDate.noDueDate.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    Без срока
                    <Badge variant="outline">{groupedByDate.noDueDate.length}</Badge>
                  </h2>
                  <div className="space-y-2">
                    {groupedByDate.noDueDate.map(card => (
                      <KanbanCard
                        key={card.id}
                        card={card}
                        onUpdate={updateCard}
                        onDelete={deleteCard}
                      />
                    ))}
                  </div>
                </div>
              )}

              {filteredCards.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' ? 'Задачи не найдены' : 'У вас пока нет задач'}
                  </p>
                </div>
              )}
            </div>
          )}

          {view === 'board' && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(groupedByStatus).map(([status, cards]) => {
                const statusLabels = {
                  backlog: 'Бэклог',
                  todo: 'К выполнению',
                  progress: 'В процессе',
                  review: 'На проверке',
                  done: 'Готово',
                };

                return (
                  <div key={status} className="space-y-2">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      {statusLabels[status as keyof typeof statusLabels]}
                      <Badge variant="secondary" className="text-xs">{cards.length}</Badge>
                    </h3>
                    <div className="space-y-2">
                      {cards.map(card => (
                        <KanbanCard
                          key={card.id}
                          card={card}
                          onUpdate={updateCard}
                          onDelete={deleteCard}
                        />
                      ))}
                      {cards.length === 0 && (
                        <div className="border-2 border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground">
                          Нет задач
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
