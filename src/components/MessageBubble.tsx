import React, { useState, useCallback, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  Play, 
  Pause,
  GitBranch,
  Flag,
  Bot,
  User,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { difyClient, type DifyMessage } from '@/utils/difyClient';
import { supabase } from '@/integrations/supabase/client';
import { Avatar as CustomAvatar } from '@/components/Avatar';
import { ReactionsBar } from '@/components/ReactionsBar';

interface MessageBubbleProps {
  message: DifyMessage;
  isAgent?: boolean;
  isSystem?: boolean;
  senderName?: string;
  onFork?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isAgent = false,
  isSystem = false,
  senderName,
  onFork,
  onReport,
  onDelete,
}) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [canDelete, setCanDelete] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    getCurrentUser();
    checkIfDeleted();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
    
    // Проверяем права на удаление
    if (user?.id) {
      // Пользователь может удалять свои сообщения или если он модератор/админ
      const isOwn = !isAgent && !isSystem; // Предполагаем что пользовательские сообщения - не от агента/системы
      const { data: profile } = await supabase
        .from('profiles')
        .select('approval_status')
        .eq('user_id', user.id)
        .single();
      
      const isModerator = profile?.approval_status === 'approved';
      setCanDelete(isOwn || isModerator);
    }
  };

  const checkIfDeleted = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('deleted_at')
        .eq('id', message.id)
        .single();
      
      if (!error && data?.deleted_at) {
        setIsDeleted(true);
      }
    } catch (error) {
      // Игнорируем ошибки проверки удаления
    }
  };

  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Код скопирован',
      description: 'Текст скопирован в буфер обмена',
    });
  }, [toast]);

  const handleFeedback = useCallback(async (rating: 'like' | 'dislike') => {
    try {
      // Используем dify_message_id для feedback
      if (!message.dify_message_id) {
        toast({
          title: 'Невозможно отправить отзыв',
          description: 'Это сообщение не поддерживает обратную связь',
          variant: 'destructive',
        });
        return;
      }
      
      await difyClient.sendFeedback(message.dify_message_id, rating);
      toast({
        title: 'Обратная связь отправлена',
        description: 'Спасибо за оценку!',
      });
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось отправить обратную связь',
        variant: 'destructive',
      });
    }
  }, [message.dify_message_id, toast]);

  const handlePlayAudio = async () => {
    if (!message.answer) return;
    
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    try {
      setIsPlaying(true);
      
      // Вызываем TTS API для преобразования текста в речь
      const result = await difyClient.textToSpeech(message.answer);
      
      // Создаем Blob из base64 данных
      const audioBlob = new Blob([Uint8Array.from(atob(result.audioContent), c => c.charCodeAt(0))], {
        type: result.contentType || 'audio/mpeg'
      });
      
      // Создаем URL для аудио
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        toast({
          title: 'Ошибка воспроизведения',
          description: 'Не удалось воспроизвести аудио',
          variant: 'destructive',
        });
      };
      
      await audio.play();
    } catch (error) {
      setIsPlaying(false);
      console.error('Error playing audio:', error);
      
      let errorMessage = 'Не удалось преобразовать текст в речь';
      if (error instanceof Error) {
        if (error.message.includes('Text to speech is not enabled')) {
          errorMessage = 'Функция озвучивания текста отключена в настройках';
        } else if (error.message.includes('network')) {
          errorMessage = 'Проблема с сетевым соединением';
        }
      }
      
      toast({
        title: 'Ошибка озвучивания', 
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMessage = async () => {
    if (!onDelete || !canDelete) return;

    try {
      await onDelete(message.id);
      setIsDeleted(true);
      toast({
        title: 'Сообщение удалено',
        description: 'Сообщение было успешно удалено',
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить сообщение',
        variant: 'destructive',
      });
    }
  };

  const renderMessage = useCallback((content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={lastIndex}>
            {content.slice(lastIndex, match.index)}
          </span>
        );
      }

      const language = match[1] || 'text';
      const code = match[2];
      parts.push(
        <div key={match.index} className="my-3 rounded-lg bg-muted/10 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-muted/20">
            <span className="text-xs text-muted-foreground font-mono">{language}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyCode(code)}
              className="h-6 px-2 text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              Копировать
            </Button>
          </div>
          <pre className="p-3 text-sm font-mono overflow-x-auto">
            <code>{code}</code>
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(
        <span key={lastIndex}>
          {content.slice(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : content;
  }, [handleCopyCode]);

  const getBubbleClasses = () => {
    // Убираем цветные фоны - все сообщения на одном фоне
    return 'border-border bg-background';
  };

  const getIcon = () => {
    if (isSystem) return <AlertTriangle className="h-4 w-4" />;
    if (isAgent) return <Bot className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  return (
    <div
      className={cn(
        'group relative w-full animate-fade-in transition-all duration-300 py-1',
        // Компактное позиционирование
        'flex'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={cn('flex gap-2 w-full leading-tight', isAgent ? 'justify-start' : 'justify-end')}>
        
        {/* Компактный аватар */}
        <div className={cn('flex-shrink-0 order-1', isAgent ? 'order-1' : 'order-2')}>
          {isSystem ? (
            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
              <AlertTriangle className="h-3 w-3 text-white" />
            </div>
          ) : isAgent ? (
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <Bot className="h-3 w-3 text-primary" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center border">
              <User className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Компактный контент сообщения */}
        <div className={cn('flex-1 min-w-0 max-w-md', isAgent ? 'order-2' : 'order-1')}>
          {/* Компактный заголовок */}
          <div className={cn('flex items-center gap-2 mb-0.5', isAgent ? 'justify-start' : 'justify-end')}>
            <span className="font-medium text-[11px] text-muted-foreground">
              {senderName || (isSystem ? 'Система' : (isAgent ? 'Дух Общины' : 'Пользователь'))}
            </span>
            <span className="text-[10px] text-muted-foreground/60">
              {new Date(message.created_at).toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            
            {/* Компактная кнопка удаления */}
            {showActions && canDelete && !isDeleted && !isAgent && !isSystem && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDeleteMessage}
                className="h-3 w-3 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                title="Удалить сообщение"
              >
                <Trash2 className="h-2 w-2" />
              </Button>
            )}
          </div>

          {/* Компактный текст сообщения */}
          <div className={cn('prose prose-sm max-w-none', isAgent ? 'text-left' : 'text-right')}>
            {isDeleted ? (
              <em className="text-muted-foreground text-sm">Сообщение удалено</em>
            ) : (
              <div className="text-foreground leading-tight text-sm">
                {renderMessage(message.query || message.answer || '')}
              </div>
            )}
          </div>

          {/* Источники */}
          {!isDeleted && message.retriever_resources && message.retriever_resources.length > 0 && (
            <div className="space-y-2 mt-3">
              <h4 className="text-xs font-medium text-muted-foreground">Источники</h4>
              <div className="space-y-2">
                {message.retriever_resources.map((source, index) => (
                  <div key={index} className="p-3 rounded-lg bg-muted/20 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground">{source.document_name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(source.score * 100)}%
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs line-clamp-2">
                      {source.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Метаданные использования */}
          {!isDeleted && message.metadata?.usage && isAgent && (
            <div className="p-2 rounded-lg bg-muted/10 text-xs text-muted-foreground mt-3">
              <div className="flex items-center gap-4">
                {message.metadata.usage.total_tokens && (
                  <span>Токены: {message.metadata.usage.total_tokens}</span>
                )}
                {message.metadata.usage.latency && (
                  <span>Задержка: {message.metadata.usage.latency}</span>
                )}
                {message.metadata.usage.total_price && (
                  <span>Стоимость: ${message.metadata.usage.total_price}</span>
                )}
              </div>
            </div>
          )}

          {/* Ультра-компактная панель действий */}
          {!isDeleted && (message.answer || message.query) && (
            <div className={cn('flex items-center gap-1 pt-1', isAgent ? 'justify-start' : 'justify-end')}>
              {/* Действия для агентских сообщений */}
              {isAgent && message.answer && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePlayAudio}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    title={isPlaying ? 'Остановить' : 'Озвучить текст'}
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </Button>
                  {/* Показываем кнопки feedback только если есть dify_message_id */}
                  {message.dify_message_id && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleFeedback('like')}
                        className="h-5 w-5 p-0 text-muted-foreground hover:text-green-600"
                        title="Нравится"
                      >
                        <ThumbsUp className="h-2.5 w-2.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleFeedback('dislike')}
                        className="h-5 w-5 p-0 text-muted-foreground hover:text-red-600"
                        title="Не нравится"
                      >
                        <ThumbsDown className="h-2.5 w-2.5" />
                      </Button>
                    </>
                  )}
                  {onFork && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onFork(message.id)}
                      className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                      title="Создать ветку"
                    >
                      <GitBranch className="h-2.5 w-2.5" />
                    </Button>
                  )}
                </>
              )}
              
              {/* Реакции - ультра-компактно */}
              <ReactionsBar messageId={message.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};