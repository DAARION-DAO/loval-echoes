import { useState, useEffect } from 'react';
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

  // Mock search function - replace with real API call
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock results
    const mockResults: SearchResult[] = [
      {
        id: '1',
        type: 'chat' as const,
        title: 'Обсуждение проекта ЖОС',
        content: 'Последнее сообщение о принципах работы...',
        timestamp: '2 часа назад',
      },
      {
        id: '2',
        type: 'message' as const,
        title: 'Сообщение от Алексей',
        content: 'Нужно обсудить архитектуру системы...',
        timestamp: '1 день назад',
        chatName: 'Техническое обсуждение',
      },
      {
        id: '3',
        type: 'project' as const,
        title: 'Проект ЖОС Мессенджер',
        content: 'Разработка мессенджера для сообщества',
        timestamp: '3 дня назад',
      },
    ].filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setResults(mockResults);
    setLoading(false);
    setSelectedIndex(-1);
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query]);

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
            placeholder={t.globalSearch + '...'}
            className="border-0 focus-visible:ring-0 text-lg"
            autoFocus
          />
          <Badge variant="secondary" className="text-xs">
            Ctrl+K
          </Badge>
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