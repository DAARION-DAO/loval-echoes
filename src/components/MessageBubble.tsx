import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Trash2,
  Check,
  CheckCheck,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { difyClient, type DifyMessage } from '@/utils/difyClient';
import { supabase } from '@/integrations/supabase/client';
import { ReactionsBar } from '@/components/ReactionsBar';
import { useTranslation } from '@/lib/i18n';

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

interface MessageBubbleProps {
  message: DifyMessage;
  isAgent?: boolean;
  isSystem?: boolean;
  senderName?: string;
  onFork?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  currentUserId?: string | null;
  participantsReadTimes?: Record<string, string>;
  onReplyInThread?: (message: DifyMessage) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isAgent = false,
  isSystem = false,
  senderName,
  onFork,
  onReport,
  onDelete,
  currentUserId,
  participantsReadTimes,
  onReplyInThread,
}) => {
  const { t, language } = useTranslation();
  const localeStr = language === 'ru' ? 'ru-RU' : (language === 'uk' ? 'uk-UA' : (language === 'es' ? 'es-ES' : 'en-US'));

  const getReplyText = (count: number) => {
    if (language === 'en' || language === 'es') {
      return count === 1 ? t.messages.reply1 : t.messages.reply24;
    }
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) {
      return t.messages.reply1;
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return t.messages.reply24;
    } else {
      return t.messages.reply5;
    }
  };

  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [replyCount, setReplyCount] = useState(0);

  // States for voice playback
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [voiceProgress, setVoiceProgress] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggleVoicePlay = () => {
    if (!message.file_url) return;
    
    if (!voiceAudioRef.current) {
      voiceAudioRef.current = new Audio(message.file_url);
      voiceAudioRef.current.ontimeupdate = () => {
        if (voiceAudioRef.current) {
          const curTime = voiceAudioRef.current.currentTime;
          const dur = voiceAudioRef.current.duration || message.voice_duration || 1;
          setVoiceProgress((curTime / dur) * 100);
        }
      };
      voiceAudioRef.current.onended = () => {
        setVoicePlaying(false);
        setVoiceProgress(0);
      };
    }

    if (voicePlaying) {
      voiceAudioRef.current.pause();
      setVoicePlaying(false);
    } else {
      voiceAudioRef.current.play();
      setVoicePlaying(true);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
        voiceAudioRef.current = null;
      }
    };
  }, []);

  const isOwn = !isAgent && !isSystem;

  const isMessageRead = () => {
    const activeUserId = currentUserId || localUserId;
    if (!isOwn || !activeUserId || !participantsReadTimes) return false;
    const otherParticipants = Object.keys(participantsReadTimes).filter(uid => uid !== activeUserId);
    if (otherParticipants.length === 0) return false;
    return otherParticipants.every(uid => {
      const readTime = participantsReadTimes[uid];
      return readTime && new Date(readTime) >= new Date(message.created_at);
    });
  };

  useEffect(() => {
    if (!message.id) return;
    const loadReplyCount = async () => {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', message.id);
      
      if (!error && count !== null) {
        setReplyCount(count);
      }
    };
    loadReplyCount();
    
    // Subscribe to new replies to update count
    const channel = supabase
      .channel(`replies-count-${message.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `parent_id=eq.${message.id}`,
        },
        () => {
          setReplyCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [message.id]);
  const [localUserId, setLocalUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
    checkIfDeleted();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setLocalUserId(user?.id || null);
    
    // Проверяем права на удаление
    const activeUserId = currentUserId || user?.id;
    if (activeUserId) {
      // Пользователь может удалять свои сообщения или если он модератор/админ
      const isOwn = !isAgent && !isSystem; // Предполагаем что пользовательские сообщения - не от агента/системы
      const { data: profile } = await supabase
        .from('profiles')
        .select('approval_status')
        .eq('user_id', activeUserId)
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
      title: t.messages.copySuccessTitle,
      description: t.messages.copySuccessDesc,
    });
  }, [toast, t]);

  const handleFeedback = useCallback(async (rating: 'like' | 'dislike') => {
    try {
      // Используем dify_message_id для feedback
      if (!message.dify_message_id) {
        toast({
          title: t.messages.feedbackDisabledTitle,
          description: t.messages.feedbackDisabledDesc,
          variant: 'destructive',
        });
        return;
      }
      
      await difyClient.sendFeedback(message.dify_message_id, rating);
      toast({
        title: t.messages.feedbackSuccessTitle,
        description: t.messages.feedbackSuccessDesc,
      });
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        title: t.messages.feedbackErrorTitle,
        description: error instanceof Error ? error.message : t.messages.feedbackErrorDesc,
        variant: 'destructive',
      });
    }
  }, [message.dify_message_id, toast, t]);

  // TTS now handled automatically through Dify stream - Play button disabled
  const handlePlayAudio = async () => {
    toast({
      title: t.messages.voiceDisabledTitle,
      description: t.messages.voiceDisabledDesc,
    });
  };

  const handleDeleteMessage = async () => {
    if (!onDelete || !canDelete) return;

    try {
      await onDelete(message.id);
      setIsDeleted(true);
      toast({
        title: t.messages.deleteSuccessTitle,
        description: t.messages.deleteSuccessDesc,
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: t.messages.deleteErrorTitle,
        description: t.messages.deleteErrorDesc,
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
              {t.messages.copyBtn}
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
      <div className={cn('flex w-full items-end gap-2 leading-tight', isAgent || isSystem ? 'justify-start' : 'justify-end')}>
        
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
        <div className={cn(
          'min-w-0 max-w-[86%] rounded-2xl border px-3 py-2 shadow-sm sm:max-w-[78%]',
          isSystem
            ? 'order-2 rounded-bl-md border-amber-400/30 bg-amber-500/10'
            : isAgent
              ? 'order-2 rounded-bl-md bg-muted/45'
              : 'order-1 rounded-br-md border-primary bg-primary text-primary-foreground'
        )}>
          {/* Компактный заголовок */}
          <div className={cn('flex items-center gap-2 mb-0.5', isAgent ? 'justify-start' : 'justify-end')}>
            <span className={cn('font-medium text-[11px]', isAgent || isSystem ? 'text-muted-foreground' : 'text-primary-foreground/75')}>
              {senderName || (isSystem ? t.messages.systemSender : (isAgent ? t.messages.spiritSender : t.messages.userSender))}
            </span>
            <span className={cn('text-[10px] flex items-center gap-1', isAgent || isSystem ? 'text-muted-foreground/60' : 'text-primary-foreground/65')}>
              {new Date(message.created_at).toLocaleTimeString(localeStr, { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
              {isOwn && (
                <span className="ml-0.5">
                  {isMessageRead() ? (
                    <CheckCheck className="h-3 w-3 text-sky-400 inline" />
                  ) : (
                    <Check className="h-3 w-3 text-muted-foreground/40 inline" />
                  )}
                </span>
              )}
            </span>
            
            {/* Компактная кнопка удаления */}
            {showActions && canDelete && !isDeleted && !isAgent && !isSystem && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDeleteMessage}
                className="h-3 w-3 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                title={t.messages.deleteTooltip}
              >
                <Trash2 className="h-2 w-2" />
              </Button>
            )}
          </div>

          {/* Компактный текст сообщения */}
          <div className={cn('prose prose-sm max-w-none', isAgent || isSystem ? 'text-left' : 'text-right')}>
            {isDeleted ? (
              <em className="text-muted-foreground text-sm">{t.messages.deletedText}</em>
            ) : (
              <div className={cn('leading-snug text-sm', isAgent || isSystem ? 'text-foreground' : 'text-primary-foreground')}>
                {message.message_type === 'voice' ? (
                  <div className={cn("flex flex-col gap-2 p-2 rounded-lg border bg-card/50 max-w-sm", isAgent ? "mr-auto" : "ml-auto")}>
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleToggleVoicePlay}
                        disabled={!message.file_url}
                        className="h-8 w-8 rounded-full p-0 flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50"
                      >
                        {voicePlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <div className="flex-1">
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-100" 
                            style={{ width: `${voiceProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                          <span>
                            {!message.file_url
                              ? t.messages.fileUnavailable
                              : voicePlaying && voiceAudioRef.current
                                ? formatDuration(voiceAudioRef.current.currentTime)
                                : '0:00'}
                          </span>
                          <span>
                            {formatDuration(message.voice_duration || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {message.transcription && (
                      <div className="mt-1 border-t pt-2">
                        <Button
                          variant="link"
                          onClick={() => setShowTranscript(!showTranscript)}
                          className="p-0 h-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          <MessageSquare className="h-3 w-3" />
                          {showTranscript ? t.messages.hideTranscript : t.messages.showTranscript}
                        </Button>
                        {showTranscript && (
                          <p className="mt-1 text-xs italic text-foreground text-left whitespace-pre-wrap">
                            "{message.transcription}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  renderMessage(message.query || message.answer || '')
                )}
              </div>
            )}
          </div>

          {/* Источники */}
          {!isDeleted && message.retriever_resources && message.retriever_resources.length > 0 && (
            <div className="space-y-2 mt-3">
              <h4 className="text-xs font-medium text-muted-foreground">{t.messages.sourcesTitle}</h4>
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
                  <span>{t.messages.tokensCount.replace('{count}', String(message.metadata.usage.total_tokens))}</span>
                )}
                {message.metadata.usage.latency && (
                  <span>{t.messages.latency.replace('{count}', String(message.metadata.usage.latency))}</span>
                )}
                {message.metadata.usage.total_price && (
                  <span>{t.messages.cost.replace('{count}', String(message.metadata.usage.total_price))}</span>
                )}
              </div>
            </div>
          )}

          {/* Ультра-компактная панель действий */}
          {!isDeleted && (message.answer || message.query) && (
            <div className={cn('flex items-center gap-1 pt-1', isAgent ? 'justify-start' : 'justify-end')}>
              {/* Thread reply button */}
              {onReplyInThread && !isSystem && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onReplyInThread(message)}
                  className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded"
                  title={t.messages.replyTooltip}
                >
                  <MessageSquare className="h-3 w-3" />
                </Button>
              )}

              {/* Действия для агентских сообщений */}
              {isAgent && message.answer && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePlayAudio}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    title={isPlaying ? t.messages.stopTtsTooltip : t.messages.startTtsTooltip}
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </Button>

                  {onFork && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onFork(message.id)}
                      className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                      title={t.messages.createThreadTooltip}
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

          {/* Reply counter */}
          {!isDeleted && replyCount > 0 && onReplyInThread && (
            <div className={cn('flex mt-1', isAgent ? 'justify-start' : 'justify-end')}>
              <Button
                variant="link"
                size="sm"
                onClick={() => onReplyInThread(message)}
                className="h-auto p-0 text-xs text-primary flex items-center gap-1 hover:no-underline"
              >
                <MessageSquare className="h-3 w-3" />
                {replyCount} {getReplyText(replyCount)}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
