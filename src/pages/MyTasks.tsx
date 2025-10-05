import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { KanbanCard as KanbanCardType } from '@/types/kanban';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { List, LayoutGrid, Calendar as CalendarIcon, Search, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { KanbanCard } from '@/components/KanbanCard';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useResponsive } from '@/hooks/useResponsive';
import { DndContext, DragEndEvent, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useTaskTelemetry } from '@/hooks/useTaskTelemetry';
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

export default function MyTasks() {
  const { user } = useAuth();
  const { isMobile } = useResponsive();
  const { logEvent } = useTaskTelemetry();
  const [cards, setCards] = useState<KanbanCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [view, setView] = useState<'list' | 'board' | 'calendar'>('board');
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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
      const card = cards.find(c => c.id === cardId);
      
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

      // Логируем событие
      logEvent('task_updated', cardId, card?.project_id, { updates });

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

  const createTask = async () => {
    if (!newTaskTitle.trim() || !user) return;

    try {
      // Get first project for now
      const { data: participantData } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!participantData) {
        toast({
          title: 'Ошибка',
          description: 'Нет доступных проектов',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(`/functions/v1/kanban-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          project_id: participantData.conversation_id,
          title: newTaskTitle,
          description: newTaskDescription || undefined,
          column_type: 'todo',
          assignee_id: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newCard = await response.json();
      setCards(prev => [...prev, newCard]);
      
      // Логируем событие
      logEvent('task_created', newCard.id, participantData.conversation_id, {
        title: newTaskTitle,
        has_description: !!newTaskDescription,
      });
      
      setNewTaskTitle('');
      setNewTaskDescription('');
      setIsCreateDrawerOpen(false);

      toast({
        title: 'Успех',
        description: 'Задача создана',
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать задачу',
        variant: 'destructive',
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const activeCard = cards.find(c => c.id === active.id);
    const overColumn = over.id as KanbanCardType['column_type'];
    
    if (activeCard && ['backlog', 'todo', 'progress', 'review', 'done'].includes(overColumn)) {
      // Логируем перемещение
      logEvent('task_moved', activeCard.id, activeCard.project_id, {
        from_column: activeCard.column_type,
        to_column: overColumn,
      });
      
      await updateCard(activeCard.id, { column_type: overColumn });
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
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 pb-24">
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
              {!isMobile && (
                <Button onClick={() => setIsCreateDrawerOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать задачу
                </Button>
              )}
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
              <Button
                variant={view === 'calendar' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setView('calendar')}
              >
                <CalendarIcon className="h-4 w-4" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto">
              {Object.entries(groupedByStatus).map(([status, statusCards]) => {
                const statusLabels = {
                  backlog: 'Бэклог',
                  todo: 'К выполнению',
                  progress: 'В процессе',
                  review: 'На проверке',
                  done: 'Готово',
                };

                return (
                  <DroppableColumn 
                    key={status} 
                    id={status as KanbanCardType['column_type']}
                    title={statusLabels[status as keyof typeof statusLabels]}
                    count={statusCards.length}
                  >
                    <SortableContext items={statusCards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                      {statusCards.map(card => (
                        <KanbanCard
                          key={card.id}
                          card={card}
                          onUpdate={updateCard}
                          onDelete={deleteCard}
                        />
                      ))}
                    </SortableContext>
                    {statusCards.length === 0 && (
                      <div className="border-2 border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground">
                        Нет задач
                      </div>
                    )}
                  </DroppableColumn>
                );
              })}
            </div>
          )}

          {view === 'calendar' && (
            <CalendarView 
              cards={filteredCards} 
              onUpdate={updateCard}
              onDelete={deleteCard}
            />
          )}
        </div>
      </div>

      {/* FAB для мобильных */}
      {isMobile && (
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
          onClick={() => setIsCreateDrawerOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Drawer для создания задачи */}
      <Drawer open={isCreateDrawerOpen} onOpenChange={setIsCreateDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Новая задача</DrawerTitle>
            <DrawerDescription>
              Создайте новую задачу для отслеживания
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="px-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Название</Label>
              <Input
                id="task-title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Введите название задачи..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task-description">Описание</Label>
              <Textarea
                id="task-description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Добавьте описание (опционально)..."
                rows={4}
              />
            </div>
          </div>

          <DrawerFooter>
            <Button onClick={createTask} disabled={!newTaskTitle.trim()}>
              Создать задачу
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Отмена</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
    </DndContext>
  );
}

// Droppable Column Component
function DroppableColumn({ 
  id, 
  title, 
  count, 
  children 
}: { 
  id: string; 
  title: string; 
  count: number; 
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`space-y-2 min-h-[200px] p-3 rounded-lg transition-colors ${
        isOver ? 'bg-accent/50' : 'bg-background'
      }`}
    >
      <h3 className="font-semibold text-sm flex items-center gap-2 sticky top-0 bg-background z-10 pb-2">
        {title}
        <Badge variant="secondary" className="text-xs">{count}</Badge>
      </h3>
      {children}
    </div>
  );
}

// Календарный компонент
function CalendarView({ 
  cards, 
  onUpdate, 
  onDelete 
}: { 
  cards: KanbanCardType[]; 
  onUpdate: (id: string, updates: Partial<KanbanCardType>) => void;
  onDelete: (id: string) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { locale: ru });
  const calendarEnd = endOfWeek(monthEnd, { locale: ru });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  const getTasksForDay = (day: Date) => {
    return cards.filter(card => {
      if (!card.due_date) return false;
      return isSameDay(new Date(card.due_date), day);
    });
  };
  
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  const isToday = (day: Date) => isSameDay(day, new Date());
  const isCurrentMonth = (day: Date) => day.getMonth() === currentMonth.getMonth();
  
  return (
    <div className="space-y-4">
      {/* Заголовок календаря */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {format(currentMonth, 'LLLL yyyy', { locale: ru })}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            Назад
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
            Сегодня
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            Вперед
          </Button>
        </div>
      </div>
      
      {/* Календарная сетка */}
      <div className="grid grid-cols-7 gap-2">
        {/* Заголовки дней недели */}
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="text-center font-semibold text-sm p-2">
            {day}
          </div>
        ))}
        
        {/* Дни месяца */}
        {days.map(day => {
          const dayTasks = getTasksForDay(day);
          const isOverdue = dayTasks.some(task => 
            task.column_type !== 'done' && new Date(task.due_date!) < new Date()
          );
          
          return (
            <Card 
              key={day.toISOString()} 
              className={`min-h-[120px] p-2 ${
                !isCurrentMonth(day) ? 'opacity-40' : ''
              } ${isToday(day) ? 'ring-2 ring-primary' : ''}`}
            >
              <div className="flex flex-col h-full">
                <div className={`text-sm font-medium mb-2 ${
                  isToday(day) ? 'text-primary font-bold' : ''
                }`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1 flex-1 overflow-y-auto">
                  {dayTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      className={`text-xs p-1 rounded truncate cursor-pointer ${
                        isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-primary/10'
                      }`}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayTasks.length - 3} ещё
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Легенда */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded ring-2 ring-primary"></div>
          <span>Сегодня</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive/10"></div>
          <span>Просрочено</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/10"></div>
          <span>Задача</span>
        </div>
      </div>
    </div>
  );
}
