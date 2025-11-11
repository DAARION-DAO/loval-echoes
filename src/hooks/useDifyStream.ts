import { useState, useCallback, useRef, useEffect } from 'react';
import { difyClient } from '@/utils/difyClient';

export interface StreamMessage {
  id: string;
  content: string;
  isComplete: boolean;
  metadata?: {
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
      total_price?: string;
      latency?: string;
    };
    retriever_resources?: Array<{
      dataset_name: string;
      document_name: string;
      score: number;
      content: string;
    }>;
  };
}

export interface TTSMessage {
  audio: string; // base64 encoded audio
  message_id: string;
}

export const useDifyStream = (chatId: string | null, onTTSMessage?: (tts: TTSMessage) => void) => {
  const [currentMessage, setCurrentMessage] = useState<StreamMessage | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  interface StreamData {
    event: string;
    message_id?: string;
    answer?: string;
    id?: string;
    thought?: string;
    audio?: string;
    metadata?: StreamMessage['metadata'];
    message?: string;
  }

  const handleStreamData = useCallback((data: StreamData) => {
    console.log('Stream data received:', data);

    switch (data.event) {
      case 'message':
        // Частичный ответ агента
        setCurrentMessage(prev => ({
          id: data.message_id || prev?.id || 'temp',
          content: (prev?.content || '') + (data.answer || ''),
          isComplete: false,
          metadata: prev?.metadata,
        }));
        break;
        
      case 'agent_message':
        // Дополнительная обработка ответов агента
        setCurrentMessage(prev => ({
          id: data.id || prev?.id || 'temp',
          content: (prev?.content || '') + (data.answer || ''),
          isComplete: false,
          metadata: prev?.metadata,
        }));
        break;
        
      case 'agent_thought':
        // Обработка мыслей агента (обычно игнорируем, но логируем)
        console.log('Agent thought:', data.thought);
        break;

      case 'tts_message':
        // Обработка TTS аудио из Dify
        console.log('TTS message received:', data);
        if (data.audio && onTTSMessage) {
          onTTSMessage({
            audio: data.audio,
            message_id: data.message_id,
          });
        }
        break;

      case 'message_end':
        // Окончание ответа с метаданными
        setCurrentMessage(prev => prev ? {
          ...prev,
          isComplete: true,
          metadata: data.metadata,
        } : null);
        setIsStreaming(false);
        break;

      case 'error':
        console.error('Stream error:', data);
        setError(data.message || 'Unknown stream error');
        setIsStreaming(false);
        break;

      case 'ping':
        // Событие для поддержания активности соединения
        break;

      default:
        console.log('Unknown stream event:', data.event, data);
    }
  }, [onTTSMessage]);

  const startStream = useCallback(async (query: string, files?: string[]) => {
    if (!chatId) {
      console.error('Cannot start stream: chatId is null');
      setError('Chat ID is required');
      return;
    }

    try {
      setError(null);
      setIsStreaming(true);
      setCurrentMessage(null);

      // Подписываемся на стрим
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      unsubscribeRef.current = difyClient.subscribeToChat(chatId, handleStreamData);

      // Отправляем сообщение
      await difyClient.sendMessage(chatId, query, files);

    } catch (err) {
      console.error('Error starting stream:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsStreaming(false);
    }
  }, [chatId, handleStreamData]);

  const stopStream = useCallback(async (taskId: string) => {
    try {
      await difyClient.stopGeneration(taskId);
      setIsStreaming(false);
    } catch (err) {
      console.error('Error stopping stream:', err);
      setError(err instanceof Error ? err.message : 'Error stopping generation');
    }
  }, []);

  const clearMessage = useCallback(() => {
    setCurrentMessage(null);
    setError(null);
  }, []);

  // Очистка при unmount или смене chatId
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [chatId]);

  // Переподписка при смене chatId
  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    if (isStreaming && chatId) {
      unsubscribeRef.current = difyClient.subscribeToChat(chatId, handleStreamData);
    }
  }, [chatId, isStreaming, handleStreamData]);

  return {
    currentMessage,
    isStreaming,
    error,
    startStream,
    stopStream,
    clearMessage,
  };
};