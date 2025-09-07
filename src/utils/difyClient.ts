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
  private getAuthHeaders() {
    const session = supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session}`,
    };
  }

  async getChats(): Promise<Chat[]> {
    const { data, error } = await supabase.functions.invoke('chat-api');
    
    if (error) {
      throw new DifyClientError(error.message);
    }
    
    return data;
  }

  async createChat(name: string, forkedFromChat?: string, forkedFromMessageId?: string): Promise<Chat> {
    const { data, error } = await supabase.functions.invoke('chat-api', {
      body: {
        name,
        forked_from_chat: forkedFromChat,
        forked_from_message_id: forkedFromMessageId,
      },
    });
    
    if (error) {
      throw new DifyClientError(error.message);
    }
    
    return data;
  }

  async renameChat(chatId: string, name: string): Promise<void> {
    const { error } = await supabase.functions.invoke('chat-api', {
      body: { name },
    });
    
    if (error) {
      throw new DifyClientError(error.message);
    }
  }

  async deleteChat(chatId: string): Promise<void> {
    const { error } = await supabase.functions.invoke('chat-api', {
      body: {},
    });
    
    if (error) {
      throw new DifyClientError(error.message);
    }
  }

  async getChatHistory(chatId: string, cursor?: string): Promise<{
    data: DifyMessage[];
    has_more: boolean;
    limit: number;
  }> {
    const params = new URLSearchParams();
    if (cursor) {
      params.append('cursor', cursor);
    }

    const { data, error } = await supabase.functions.invoke('chat-api', {
      body: { cursor },
    });
    
    if (error) {
      throw new DifyClientError(error.message);
    }
    
    return data;
  }

  async sendMessage(chatId: string, query: string, files?: string[]): Promise<void> {
    const { error } = await supabase.functions.invoke('chat-api', {
      body: {
        query,
        files,
      },
    });
    
    if (error) {
      throw new DifyClientError(error.message);
    }
  }

  async stopGeneration(taskId: string): Promise<void> {
    const { error } = await supabase.functions.invoke('chat-api', {
      body: { taskId },
    });
    
    if (error) {
      throw new DifyClientError(error.message);
    }
  }

  async sendFeedback(messageId: string, rating: 'like' | 'dislike', content?: string): Promise<void> {
    const { error } = await supabase.functions.invoke('feedback-api', {
      body: {
        messageId,
        rating,
        content,
      },
    });
    
    if (error) {
      throw new DifyClientError(error.message);
    }
  }

  async uploadFile(file: File): Promise<{ id: string; name: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const { data, error } = await supabase.functions.invoke('file-api', {
      body: formData,
    });
    
    if (error) {
      throw new DifyClientError(error.message);
    }
    
    return data;
  }

  async getFilePreview(fileId: string): Promise<Blob> {
    const { data, error } = await supabase.functions.invoke('file-api');
    
    if (error) {
      throw new DifyClientError(error.message);
    }
    
    return data;
  }

  async speechToText(audioBlob: Blob): Promise<{ text: string }> {
    // Конвертируем blob в base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    const { data, error } = await supabase.functions.invoke('stt-api', {
      body: { audio: base64Audio },
    });
    
    if (error) {
      throw new DifyClientError(error.message);
    }
    
    return data;
  }

  async textToSpeech(text: string, voice = 'alloy'): Promise<{ audioContent: string; contentType: string }> {
    const { data, error } = await supabase.functions.invoke('tts-api', {
      body: { text, voice },
    });
    
    if (error) {
      throw new DifyClientError(error.message);
    }
    
    return data;
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