import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  MessageSquare, 
  FolderOpen, 
  Users, 
  FileText, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  id: string;
  type: 'chat' | 'message' | 'project' | 'user' | 'file';
  title: string;
  content?: string;
  timestamp?: string;
  chatName?: string;
  matches?: string[];
}

interface GlobalSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: (type: string, id: string) => void;
}

export const GlobalSearchDialog = ({ 
  open, 
  onClose, 
  onNavigate 
}: GlobalSearchDialogProps) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [conversations, setConversations] = useState<any[]>([]);
  const [filterChatId, setFilterChatId] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    const fetchConversations = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: participantData } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      const myConversationIds = participantData?.map(p => p.conversation_id) || [];
      if (myConversationIds.length === 0) {
        setConversations([]);
        return;
      }

      const { data, error } = await supabase
        .from('conversations')
        .select('id, name')
        .eq('is_archived', false)
        .in('id', myConversationIds)
        .order('updated_at', { ascending: false });
      if (!error && data) {
        setConversations(data);
      }
    };
    fetchConversations();
  }, [open]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setResults([]);
        return;
      }

      const { data: participantData } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      const myConversationIds = participantData?.map(p => p.conversation_id) || [];
      if (myConversationIds.length === 0) {
        setResults([]);
        return;
      }

      let queryBuilder = supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          role,
          conversation_id,
          conversations!inner (
            id,
            name
          )
        `)
        .in('conversation_id', myConversationIds);

      queryBuilder = queryBuilder.textSearch('content', searchQuery, {
        config: 'simple',
        type: 'websearch'
      });

      if (filterChatId && filterChatId !== 'all') {
        queryBuilder = queryBuilder.eq('conversation_id', filterChatId);
      }

      if (filterStartDate) {
        queryBuilder = queryBuilder.gte('created_at', new Date(filterStartDate).toISOString());
      }
      if (filterEndDate) {
        const nextDay = new Date(filterEndDate);
        nextDay.setDate(nextDay.getDate() + 1);
        queryBuilder = queryBuilder.lt('created_at', nextDay.toISOString());
      }

      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) {
        console.warn('FTS failed, falling back to ILIKE search:', error);
        let fallbackQuery = supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            role,
            conversation_id,
            conversations!inner (
              id,
              name
            )
          `)
          .in('conversation_id', myConversationIds)
          .ilike('content', `%${searchQuery}%`);

        if (filterChatId && filterChatId !== 'all') {
          fallbackQuery = fallbackQuery.eq('conversation_id', filterChatId);
        }
        if (filterStartDate) {
          fallbackQuery = fallbackQuery.gte('created_at', new Date(filterStartDate).toISOString());
        }
        if (filterEndDate) {
          const nextDay = new Date(filterEndDate);
          nextDay.setDate(nextDay.getDate() + 1);
          fallbackQuery = fallbackQuery.lt('created_at', nextDay.toISOString());
        }

        const { data: fallbackData, error: fallbackError } = await fallbackQuery
          .order('created_at', { ascending: false })
          .limit(30);

        if (!fallbackError && fallbackData) {
          const mappedResults: SearchResult[] = fallbackData.map((msg: any) => ({
            id: msg.id,
            type: 'message',
            title: msg.role === 'user' ? 'Сообщение' : 'Ответ Духа Общины',
            content: msg.content,
            timestamp: new Date(msg.created_at).toLocaleString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            chatName: msg.conversations?.name,
          }));
          setResults(mappedResults);
        } else {
          setResults([]);
        }
      } else if (data) {
        const mappedResults: SearchResult[] = data.map((msg: any) => ({
          id: msg.id,
          type: 'message',
          title: msg.role === 'user' ? 'Сообщение' : 'Ответ Духа Общины',
          content: msg.content,
          timestamp: new Date(msg.created_at).toLocaleString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          chatName: msg.conversations?.name,
        }));
        setResults(mappedResults);
      }
    } catch (err) {
      console.error('Error during global search:', err);
    } finally {
      setLoading(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query, filterChatId, filterStartDate, filterEndDate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > -1 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            const result = results[selectedIndex];
            onNavigate?.(result.type, result.id);
            onClose();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, results, selectedIndex, onNavigate, onClose]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="h-4 w-4" />;
      case 'project':
        return <FolderOpen className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'file':
        return <FileText className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'chat':
        return 'Чат';
      case 'message':
        return 'Сообщение';
      case 'project':
        return 'Проект';
      case 'user':
        return 'Пользователь';
      case 'file':
        return 'Файл';
      default:
        return '';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onNavigate?.(result.type, result.id);
    onClose();
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-0 max-w-2xl">
        <div className="flex items-center gap-3 p-4 border-b">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.chats.search}
            className="border-0 focus-visible:ring-0 text-lg"
            autoFocus
          />
          <Badge variant="secondary" className="text-xs">
            Ctrl+K
          </Badge>
        </div>

        {/* Filters Section */}
        <div className="flex flex-wrap items-center gap-2 p-3 border-b bg-muted/10 text-xs">
          <span className="text-muted-foreground">Фильтры:</span>
          
          <select 
            value={filterChatId} 
            onChange={(e) => setFilterChatId(e.target.value)}
            className="bg-background border rounded px-2 py-1 text-xs text-foreground focus:outline-none max-w-[150px] truncate"
          >
            <option value="all">Все чаты</option>
            {conversations.map(conv => (
              <option key={conv.id} value={conv.id}>{conv.name}</option>
            ))}
          </select>

          <input 
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="bg-background border rounded px-2 py-1 text-xs text-foreground focus:outline-none"
            placeholder="С"
          />
          
          <span className="text-muted-foreground">—</span>

          <input 
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="bg-background border rounded px-2 py-1 text-xs text-foreground focus:outline-none"
            placeholder="По"
          />

          {(filterChatId !== 'all' || filterStartDate || filterEndDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterChatId('all');
                setFilterStartDate('');
                setFilterEndDate('');
              }}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Сбросить
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((result, index) => (
                <Button
                  key={result.id}
                  variant="ghost"
                  className={`w-full justify-start p-3 h-auto ${
                    index === selectedIndex ? 'bg-muted' : ''
                  }`}
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {getResultIcon(result.type)}
                      <Badge variant="outline" className="text-xs">
                        {getResultTypeLabel(result.type)}
                      </Badge>
                    </div>
                    
                    <div className="flex-1 text-left space-y-1">
                      <div className="font-medium text-sm">{result.title}</div>
                      {result.content && (
                        <div className="text-xs text-muted-foreground">
                          {result.content}
                        </div>
                      )}
                      {result.chatName && (
                        <div className="text-xs text-muted-foreground">
                          в чате: {result.chatName}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {result.timestamp && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {result.timestamp}
                        </div>
                      )}
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="text-center p-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Ничего не найдено</p>
              <p className="text-sm">Попробуйте изменить запрос</p>
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Начните вводить для поиска</p>
              <div className="mt-4 space-y-1 text-xs">
                <p>🔍 Поиск по чатам, сообщениям и проектам</p>
                <p>⌨️ Используйте ↑↓ для навигации, Enter для выбора</p>
              </div>
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="p-2 border-t bg-muted/30 text-xs text-muted-foreground text-center">
            ↑↓ навигация • Enter выбрать • Esc закрыть
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};