import { supabase } from '@/integrations/supabase/client';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { translations, Language } from '@/lib/i18n';
import { ensureCurrentUserParticipant } from '@/services/chats';

const getCurrentLang = (): Language => {
  const saved = localStorage.getItem('language');
  if (saved && ['uk', 'en', 'ru', 'es'].includes(saved)) {
    return saved as Language;
  }
  return 'en';
};

export interface DifyMessage {
  id: string;
  conversation_id: string;
  query: string;
  answer: string;
  sender_name?: string;
  dify_message_id?: string;
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
  message_type?: string | null;
  file_url?: string | null;
  transcription?: string | null;
  voice_duration?: number | null;
  file_name?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  parent_id?: string | null;
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
  is_pinned?: boolean;
  pinned_at?: string;
  auto_generated_name?: boolean;
}

export class DifyClientError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DifyClientError';
  }
}

export interface SendMessageResult {
  agentOk: boolean;
  agentError?: string;
}

const getFunctionErrorMessage = async (error: unknown): Promise<string> => {
  const t = translations[getCurrentLang()];

  if (error instanceof FunctionsHttpError) {
    const payload = await error.context.json().catch(() => null);
    if (payload?.error_code === 'MODEL_PROVIDER_ERROR' || payload?.error_code === 'AI_PROVIDER_ERROR') {
      return t.chatInterface.agentUnavailableDesc;
    }
    if (typeof payload?.details === 'string') {
      return payload.details;
    }
    if (typeof payload?.error === 'string') {
      return payload.error;
    }
  }

  return error instanceof Error ? error.message : t.chatInterface.agentUnavailableDesc;
};

export class DifyClient {
  async getChats(): Promise<Chat[]> {
    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id, name, updated_at, created_at, dify_conversation_id, is_pinned, pinned_at, auto_generated_name')
        .eq('status', 'active')
        .order('updated_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch chats: ${error.message}`);
      }

      return (conversations || []).map(conv => ({
        id: conv.id,
        name: conv.auto_generated_name && [
          translations.uk.chatSidebar.defaultChatName,
          translations.en.chatSidebar.defaultChatName,
          translations.ru.chatSidebar.defaultChatName,
          translations.es.chatSidebar.defaultChatName,
        ].includes(conv.name)
          ? translations[getCurrentLang()].chatSidebar.defaultChatName
          : conv.name,
        dify_conversation_id: conv.dify_conversation_id || undefined,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        is_pinned: conv.is_pinned,
        pinned_at: conv.pinned_at,
        auto_generated_name: conv.auto_generated_name,
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
          name: name || translations[getCurrentLang()].chats.newChat,
          user_id: user.id,
          created_by: user.id,
          status: 'active',
        })
        .select('id, name, created_at, updated_at')
        .single();

      if (error) {
        throw new Error(`Failed to create chat: ${error.message}`);
      }

      // Add user as participant
      await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: newChat.id,
          user_id: user.id,
          role: 'member'
        });

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
      const { error } = await supabase
        .from('conversations')
        .update({ name })
        .eq('id', chatId);
      
      if (error) {
        throw new Error(`Failed to rename chat: ${error.message}`);
      }
    } catch (error) {
      console.error('Error renaming chat:', error);
      throw new DifyClientError(error instanceof Error ? error.message : 'Failed to rename chat');
    }
  }

  async deleteChat(chatId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', chatId);
      
      if (error) {
        throw new Error(`Failed to delete chat: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw new DifyClientError(error instanceof Error ? error.message : 'Failed to delete chat');
    }
  }

  async archiveChat(chatId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ is_archived: true })
        .eq('id', chatId);
      
      if (error) {
        throw new Error(`Failed to archive chat: ${error.message}`);
      }
    } catch (error) {
      console.error('Error archiving chat:', error);
      throw new DifyClientError(error instanceof Error ? error.message : 'Failed to archive chat');
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

      const difyMessages: DifyMessage[] = (messages || []).map(msg => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        query: msg.role === 'user' ? msg.content : '',
        answer: msg.role === 'assistant' ? msg.content : '',
        sender_name: msg.sender_name || undefined,
        dify_message_id: msg.dify_message_id || undefined,
        created_at: msg.created_at,
        message_type: msg.message_type,
        file_url: msg.file_url,
        transcription: msg.transcription,
        voice_duration: msg.voice_duration,
        file_name: msg.file_name,
        file_size: msg.file_size,
        file_type: msg.file_type,
        parent_id: msg.parent_id,
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

  async sendMessage(
    chatId: string, 
    query: string, 
    files?: string[],
    voiceMeta?: {
      messageType?: string;
      fileUrl?: string;
      transcription?: string;
      voiceDuration?: number;
      fileName?: string;
      fileSize?: number;
      fileType?: string;
    }
  ): Promise<SendMessageResult> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('You must be logged in to send a message');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();
      
      const userDisplayName = profile?.display_name || 
                             user.user_metadata?.display_name || 
                             user.email?.split('@')[0] || 
                             translations[getCurrentLang()].participantsExtra.roleMember;

      const messageType = voiceMeta?.messageType || (voiceMeta?.fileUrl ? 'file' : 'text');
      await ensureCurrentUserParticipant(chatId);

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: chatId,
          content: query,
          role: 'user',
          sender_name: userDisplayName,
          message_type: messageType,
          file_url: voiceMeta?.fileUrl || null,
          transcription: voiceMeta?.transcription || null,
          voice_duration: voiceMeta?.voiceDuration || null,
          file_name: voiceMeta?.fileName || null,
          file_size: voiceMeta?.fileSize || null,
          file_type: voiceMeta?.fileType || null,
        });

      if (error) {
        throw new Error(`Failed to save message: ${error.message}`);
      }

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);

      // Trigger AI Agent response
      const { error: invokeError } = await supabase.functions.invoke('ai-agent-chat', {
        body: { chatId, useRag: true }
      });

      if (invokeError) {
        const agentError = await getFunctionErrorMessage(invokeError);
        console.warn('AI agent response unavailable after message save:', agentError);
        return { agentOk: false, agentError };
      }

      return { agentOk: true };
      
    } catch (error) {
      console.error('Error sending message:', error);
      throw new DifyClientError(error instanceof Error ? error.message : 'Failed to send message');
    }
  }

  async stopGeneration(taskId: string): Promise<void> {
    // No-op since we do not have an LLM generation process to cancel
    console.log('Stop generation requested (no-op):', taskId);
  }

  async sendFeedback(messageId: string, rating: 'like' | 'dislike', content?: string): Promise<void> {
    // No-op since we do not store feedback in Dify anymore
    console.log('Feedback sent (no-op):', { messageId, rating, content });
  }

  async uploadFile(file: File, chatId?: string): Promise<{ id: string; name: string; size: number; url: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Unauthorized');
      }

      const fileExt = file.name.split('.').pop();
      const randomId = Math.random().toString(36).substring(2, 9);
      const cleanFileName = `${Date.now()}_${randomId}.${fileExt}`;
      
      // Prefix with chatId (or fallback to 'general') to satisfy voice-messages bucket policy
      const prefix = chatId || 'general';
      const filePath = `${prefix}/${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('voice-messages')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('voice-messages')
        .getPublicUrl(filePath);

      return {
        id: filePath,
        name: file.name,
        size: file.size,
        url: publicUrl,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new DifyClientError(error instanceof Error ? error.message : 'Failed to upload file');
    }
  }

  async getFilePreview(fileId: string): Promise<Blob> {
    try {
      const { data, error } = await supabase.storage
        .from('voice-messages')
        .download(fileId);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting file preview:', error);
      throw new DifyClientError(error instanceof Error ? error.message : 'Failed to get file preview');
    }
  }

  async speechToText(audioBlob: Blob, mimeType?: string): Promise<{ text: string }> {
    // Speech to text is disabled since Dify is removed
    console.warn('Speech to text called but Dify is removed.');
    return { text: '' };
  }

  subscribeToChat(chatId: string, onMessage: (data: { event: string; [key: string]: unknown }) => void) {
    // Returns dummy unsubscribe function since real-time message changes are handled directly via postgres_changes
    return () => {};
  }
}

export const difyClient = new DifyClient();
