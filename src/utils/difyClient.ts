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
      const headers = await this.getAuthHeaders();
      const response = await fetch(`https://pbsdsdexayzfoexjdlgb.supabase.co/functions/v1/chat-api`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting chats:', error);
      throw new DifyClientError(error instanceof Error ? error.message : 'Failed to get chats');
    }
  }

  async createChat(name: string, forkedFromChat?: string, forkedFromMessageId?: string): Promise<Chat> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`https://pbsdsdexayzfoexjdlgb.supabase.co/functions/v1/chat-api`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name,
          forked_from_chat: forkedFromChat,
          forked_from_message_id: forkedFromMessageId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      return await response.json();
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
      const headers = await this.getAuthHeaders();
      let url = `https://pbsdsdexayzfoexjdlgb.supabase.co/functions/v1/chat-api/${chatId}/history`;
      if (cursor) {
        url += `?cursor=${encodeURIComponent(cursor)}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw new DifyClientError(error instanceof Error ? error.message : 'Failed to get chat history');
    }
  }

  async sendMessage(chatId: string, query: string, files?: string[]): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`https://pbsdsdexayzfoexjdlgb.supabase.co/functions/v1/chat-api/${chatId}/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          files,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw new DifyClientError(error instanceof Error ? error.message : 'Failed to send message');
    }
  }

  async stopGeneration(taskId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`https://pbsdsdexayzfoexjdlgb.supabase.co/functions/v1/chat-api/stop`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ taskId }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
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