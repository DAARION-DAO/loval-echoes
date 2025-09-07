import { useState } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  GitBranch, 
  Flag, 
  Play, 
  Pause,
  ExternalLink,
  User,
  Bot,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/lib/i18n';
import { difyClient, type DifyMessage } from '@/utils/difyClient';
import { useToast } from '@/hooks/use-toast';

interface MessageBubbleProps {
  message: DifyMessage;
  isAgent?: boolean;
  isSystem?: boolean;
  onFork?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
}

export const MessageBubble = ({ 
  message, 
  isAgent = false, 
  isSystem = false,
  onFork,
  onReport 
}: MessageBubbleProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: t.messages.copyCode,
      description: 'Код скопирован в буфер обмена',
    });
  };

  const handleFeedback = async (rating: 'like' | 'dislike') => {
    try {
      await difyClient.sendFeedback(message.id, rating, feedbackText);
      setFeedbackOpen(false);
      setFeedbackText('');
      toast({
        title: t.messages.feedback,
        description: 'Обратная связь отправлена',
      });
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : t.errors.unknownError,
        variant: 'destructive',
      });
    }
  };

  const handlePlayAudio = async () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    try {
      setIsPlaying(true);
      const { audioContent } = await difyClient.textToSpeech(message.answer);
      
      // Создаем аудио элемент и воспроизводим
      const audio = new Audio(`data:audio/mpeg;base64,${audioContent}`);
      audio.onended = () => setIsPlaying(false);
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : t.errors.unknownError,
        variant: 'destructive',
      });
    }
  };

  // Функция для рендера markdown с подсветкой кода
  const renderMessage = (content: string) => {
    // Простой парсер для выделения блоков кода
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Добавляем текст до блока кода
      if (match.index > lastIndex) {
        parts.push(
          <span key={lastIndex}>
            {content.slice(lastIndex, match.index)}
          </span>
        );
      }

      // Добавляем блок кода
      const language = match[1] || 'text';
      const code = match[2];
      parts.push(
        <div key={match.index} className="my-3 rounded-lg border bg-muted/30 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
            <span className="text-xs text-muted-foreground font-mono">{language}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyCode(code)}
              className="h-6 px-2 text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              {t.messages.copyCode}
            </Button>
          </div>
          <pre className="p-3 text-sm font-mono overflow-x-auto">
            <code>{code}</code>
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Добавляем оставшийся текст
    if (lastIndex < content.length) {
      parts.push(
        <span key={lastIndex}>
          {content.slice(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : content;
  };

  const getBubbleClasses = () => {
    if (isSystem) return 'system-message';
    if (isAgent) return 'agent-message';
    return 'user-message';
  };

  const getIcon = () => {
    if (isSystem) return <AlertCircle className="h-4 w-4" />;
    if (isAgent) return <Bot className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  return (
    <div className={`message-bubble ${getBubbleClasses()} animate-fade-in`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback>
            {getIcon()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm">
              {isSystem ? 'Система' : isAgent ? 'ЖОС Агент' : 'Участник'}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(message.created_at).toLocaleTimeString()}
            </span>
          </div>

          <div className="prose prose-sm max-w-none">
            {renderMessage(isAgent ? message.answer : message.query)}
          </div>

          {/* Источники (RAG) */}
          {message.retriever_resources && message.retriever_resources.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">{t.messages.sources}</h4>
              <div className="grid gap-2">
                {message.retriever_resources.map((source, index) => (
                  <div key={index} className="p-2 rounded border bg-muted/30 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{source.document_name}</span>
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
          {message.metadata?.usage && isAgent && (
            <div className="mt-3 p-2 rounded bg-muted/20 text-xs text-muted-foreground">
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

          {/* Действия с сообщением */}
          <div className="flex items-center gap-1 mt-3">
            {isAgent && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayAudio}
                  className="h-7 px-2 text-xs"
                >
                  {isPlaying ? (
                    <Pause className="h-3 w-3 mr-1" />
                  ) : (
                    <Play className="h-3 w-3 mr-1" />
                  )}
                  {isPlaying ? t.voice.pauseAudio : t.voice.playAudio}
                </Button>

                <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {t.messages.like}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t.messages.feedback}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Опциональный комментарий..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleFeedback('like')} className="flex-1">
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          {t.messages.like}
                        </Button>
                        <Button 
                          onClick={() => handleFeedback('dislike')} 
                          variant="outline" 
                          className="flex-1"
                        >
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          {t.messages.dislike}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFork?.(message.id)}
              className="h-7 px-2 text-xs"
            >
              <GitBranch className="h-3 w-3 mr-1" />
              {t.messages.fork}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReport?.(message.id)}
              className="h-7 px-2 text-xs text-destructive hover:text-destructive"
            >
              <Flag className="h-3 w-3 mr-1" />
              {t.messages.report}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};