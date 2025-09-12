import { supabase } from '@/integrations/supabase/client';

export interface DifyMessage {
  id: string;
  conversation_id: string;
  query: string;
  answer: string;
  feedback?: {
    rating: 'like' | 'dislike';
    content?: string;
  };
  retriever_resources?: Array<{
    dataset_name: string;
    document_name: string;
    score: number;
    content: string;
  }>;
  metadata?: {
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
      total_price?: string;
      latency?: string;
    };
  };
  created_at: string;
}

export interface Chat {
  id: string;
  name: string;
  dify_conversation_id?: string;
  forked_from_chat?: string;
  forked_from_message_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export class DifyClientError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DifyClientError';
  }
}

export class DifyClient {
  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || ''}`,
    };
  }

  async getChats(): Promise<Chat[]> {
    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id, name, updated_at, created_at, dify_conversation_id')
        .order('updated_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch chats: ${error.message}`);
      }

      return (conversations || []).map(conv => ({
        id: conv.id,
        name: conv.name,
        dify_conversation_id: conv.dify_conversation_id,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
      }));
    } catch (error) {
      console.error('Error getting chats:', error);
      throw new DifyClientError(error instanceof Error ? error.message : 'Failed to get chats');
    }
  }

  async createChat(name: string, forkedFromChat?: string, forkedFromMessageId?: string): Promise<Chat> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('You must be logged in to create a chat');
      }

      const { data: newChat, error } = await supabase
        .from('conversations')
        .insert({
          name: name || 'Новый чат',
          user_id: user.id,
        })
        .select('id, name, created_at, updated_at')
        .single();

      if (error) {
        throw new Error(`Failed to create chat: ${error.message}`);
      }

      return {
        id: newChat.id,
        name: newChat.name,
        created_at: newChat.created_at,
        updated_at: newChat.updated_at,
      };
    } catch (error) {
      console.error('Error creating chat:', error);
      throw new DifyClientError(error instanceof Error ? error.message : 'Failed to create chat');
    }
  }

  async renameChat(chatId: string, name: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`https://pbsdsdexayzfoexjdlgb.supabase.co/functions/v1/chat-api/${chatId}/name`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      console.error('Error renaming chat:', error);
      throw new DifyClientError(error instanceof Error ? error.message : 'Failed to rename chat');
    }
  }

  async deleteChat(chatId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`https://pbsdsdexayzfoexjdlgb.supabase.co/functions/v1/chat-api/${chatId}`, {
        method: 'DELETE',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw new DifyClientError(error instanceof Error ? error.message : 'Failed to delete chat');
    }
  }

  async getChatHistory(chatId: string, cursor?: string): Promise<{
    data: DifyMessage[];
    has_more: boolean;
    limit: number;
  }> {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to get chat history: ${error.message}`);
      }

      // Convert database messages to DifyMessage format
      const difyMessages: DifyMessage[] = (messages || []).map(msg => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        query: msg.role === 'user' ? msg.content : '',
        answer: msg.role === 'assistant' ? msg.content : '',
        created_at: msg.created_at,
      }));

      return {
        data: difyMessages,
        has_more: false,
        limit: 50,
      };
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw new DifyClientError(error instanceof Error ? error.message : 'Failed to get chat history');
    }
  }

  async sendMessage(chatId: string, query: string, files?: string[]): Promise<void> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('You must be logged in to send a message');
      }

      // Сохраняем пользовательское сообщение в базу данных
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: chatId,
          content: query,
          role: 'user',
          message_type: 'text',
          sender_name: 'Пользователь',
        });

      if (messageError) {
        throw new Error(`Failed to save user message: ${messageError.message}`);
      }

      // Имитируем ответ агента (можно заменить на реальный API Dify)
      setTimeout(async () => {
        try {
          const responses = [
            'Понял ваш вопрос. Дайте мне подумать...',
            'Интересная тема! Вот что я думаю по этому поводу...',
            'Спасибо за сообщение. Рассмотрю этот вопрос подробнее.',
            'Хороший вопрос! Попробую дать развернутый ответ.',
            'Понятно. Позвольте мне объяснить это с разных сторон.',
          ];
          
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          
          // Сохраняем ответ агента
          const { error: agentError } = await supabase
            .from('messages')
            .insert({
              conversation_id: chatId,
              content: randomResponse,
              role: 'assistant',
              message_type: 'text',
              sender_name: 'Дух Общины',
            });

          if (agentError) {
            console.error('Failed to save agent message:', agentError);
          }

          // Отправляем через realtime канал
          const channel = supabase.channel(`chat:${chatId}`);
          
          // Симулируем стриминг
          const words = randomResponse.split(' ');
          let content = '';
          
          for (let i = 0; i < words.length; i++) {
            content += (i > 0 ? ' ' : '') + words[i];
            
            await channel.send({
              type: 'broadcast',
              event: 'dify_stream',
              payload: {
                event: 'message',
                message_id: 'temp_' + Date.now(),
                answer: content,
              }
            });
            
            // Пауза между словами
            await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
          }
          
          // Отправляем окончание сообщения
          await channel.send({
            type: 'broadcast',
            event: 'dify_stream',
            payload: {
              event: 'message_end',
              message_id: 'temp_' + Date.now(),
              metadata: {
                usage: {
                  total_tokens: words.length * 2,
                  prompt_tokens: query.split(' ').length,
                  completion_tokens: words.length,
                }
              }
            }
          });
          
        } catch (error) {
          console.error('Error sending agent response:', error);
          
          // Отправляем ошибку через realtime
          const channel = supabase.channel(`chat:${chatId}`);
          await channel.send({
            type: 'broadcast',
            event: 'dify_stream',
            payload: {
              event: 'error',
              message: 'Произошла ошибка при генерации ответа',
            }
          });
        }
      }, 500);
      
    } catch (error) {
      console.error('Error sending message:', error);
      throw new DifyClientError(error instanceof Error ? error.message : 'Failed to send message');
    }
  }

  async stopGeneration(taskId: string): Promise<void> {
    try {
      // Пока просто логируем - в реальном приложении здесь был бы запрос к Dify API
      console.log('Stopping generation for task:', taskId);
      
      // Можно добавить логику остановки через Supabase realtime если нужно
      // Например, отправить событие остановки в канал чата
      
    } catch (error) {
      console.error('Error stopping generation:', error);
      throw new DifyClientError(error instanceof Error ? error.message : 'Failed to stop generation');
    }
  }

  async sendFeedback(messageId: string, rating: 'like' | 'dislike', content?: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`https://pbsdsdexayzfoexjdlgb.supabase.co/functions/v1/feedback-api`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messageId,
          rating,
          content,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
      throw new DifyClientError(error instanceof Error ? error.message : 'Failed to send feedback');
    }
  }

  async uploadFile(file: File): Promise<{ id: string; name: string; size: number }> {
    try {
      const headers = await this.getAuthHeaders();
      delete headers['Content-Type']; // Let browser set boundary for FormData
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`https://pbsdsdexayzfoexjdlgb.supabase.co/functions/v1/file-api`, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new DifyClientError(error instanceof Error ? error.message : 'Failed to upload file');
    }
  }

  async getFilePreview(fileId: string): Promise<Blob> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`https://pbsdsdexayzfoexjdlgb.supabase.co/functions/v1/file-api/${fileId}`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error getting file preview:', error);
      throw new DifyClientError(error instanceof Error ? error.message : 'Failed to get file preview');
    }
  }

  async speechToText(audioBlob: Blob): Promise<{ text: string }> {
    try {
      // Конвертируем blob в base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const headers = await this.getAuthHeaders();
      const response = await fetch(`https://pbsdsdexayzfoexjdlgb.supabase.co/functions/v1/stt-api`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ audio: base64Audio }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error converting speech to text:', error);
      throw new DifyClientError(error instanceof Error ? error.message : 'Failed to convert speech to text');
    }
  }

  async textToSpeech(text: string, voice = 'alloy'): Promise<{ audioContent: string; contentType: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`https://pbsdsdexayzfoexjdlgb.supabase.co/functions/v1/tts-api`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text, voice }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error converting text to speech:', error);
      throw new DifyClientError(error instanceof Error ? error.message : 'Failed to convert text to speech');
    }
  }

  // Подписка на стрим сообщений для чата
  subscribeToChat(chatId: string, onMessage: (data: any) => void) {
    const channel = supabase.channel(`chat:${chatId}`)
      .on('broadcast', { event: 'dify_stream' }, ({ payload }) => {
        onMessage(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const difyClient = new DifyClient();