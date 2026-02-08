import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import { getCorsHeaders, handleCors } from '../_shared/cors.ts';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

interface DifyResponse {
  answer?: string;
  conversation_id?: string;
  message_id?: string;
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

class DifyClient {
  private apiKey: string;
  private baseUrl: string;
  private techUserId: string;

  constructor() {
    this.apiKey = Deno.env.get('DIFY_API_KEY') || '';
    this.baseUrl = 'https://api.dify.ai/v1';
    this.techUserId = 'daarion-community-system';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    console.log(`Making Dify request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Dify API error: ${response.status} ${errorText}`);
      throw new Error(`Dify API error: ${response.status} ${errorText}`);
    }

    return response;
  }

  async sendMessageStream(conversationId: string | null, query: string, files?: string[]) {
    const body = {
      inputs: {},
      query,
      response_mode: "streaming",
      conversation_id: conversationId || undefined,
      user: this.techUserId,
      files: files || [],
    };

    console.log('Sending message to Dify:', { conversationId, query: query.substring(0, 100) });

    return await this.makeRequest('/chat-messages', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getMessages(conversationId: string, cursor?: string) {
    const params = new URLSearchParams({
      user: this.techUserId,
      conversation_id: conversationId,
    });
    
    if (cursor) {
      params.append('first_id', cursor);
    }

    return await this.makeRequest(`/messages?${params.toString()}`);
  }

  async stopGeneration(taskId: string) {
    return await this.makeRequest(`/chat-messages/${taskId}/stop`, {
      method: 'POST',
      body: JSON.stringify({ user: this.techUserId }),
    });
  }

  async sendFeedback(messageId: string, rating: 'like' | 'dislike', content?: string) {
    return await this.makeRequest(`/messages/${messageId}/feedbacks`, {
      method: 'POST',
      body: JSON.stringify({
        rating,
        content,
        user: this.techUserId,
      }),
    });
  }

  async uploadFile(formData: FormData) {
    formData.append('user', this.techUserId);
    
    return await this.makeRequest('/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });
  }

  async listConversations(limit = 20, cursor?: string) {
    const params = new URLSearchParams({
      user: this.techUserId,
      limit: limit.toString(),
    });
    
    if (cursor) {
      params.append('first_id', cursor);
    }

    return await this.makeRequest(`/conversations?${params.toString()}`);
  }

  async renameConversation(conversationId: string, name: string) {
    return await this.makeRequest(`/conversations/${conversationId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name,
        user: this.techUserId,
      }),
    });
  }

  async deleteConversation(conversationId: string) {
    return await this.makeRequest(`/conversations/${conversationId}`, {
      method: 'DELETE',
      body: JSON.stringify({ user: this.techUserId }),
    });
  }
}

// Валідаційні схеми
const SendMessageSchema = z.object({
  conversationId: z.string().nullable().optional(),
  query: z.string().min(1).max(10000),
  files: z.array(z.string()).optional(),
  chatId: z.string().uuid().optional(),
});

const FeedbackSchema = z.object({
  messageId: z.string().min(1),
  rating: z.enum(['like', 'dislike']),
  content: z.string().max(500).optional(),
});

const GetMessagesSchema = z.object({
  action: z.literal('get_messages').optional(),
  conversationId: z.string().min(1).max(255),
  cursor: z.string().max(255).optional(),
});

const StopGenerationSchema = z.object({
  action: z.literal('stop_generation').optional(),
  taskId: z.string().min(1).max(255),
});

const ListConversationsSchema = z.object({
  action: z.literal('list_conversations').optional(),
  limit: z.number().int().min(1).max(100).optional(),
  cursor: z.string().max(255).optional(),
});

const RenameConversationSchema = z.object({
  action: z.literal('rename_conversation').optional(),
  conversationId: z.string().min(1).max(255),
  name: z.string().min(1).max(200),
});

const DeleteConversationSchema = z.object({
  action: z.literal('delete_conversation').optional(),
  conversationId: z.string().min(1).max(255),
});

serve(async (req) => {
  console.log(`[dify-client] ${req.method} ${req.url}`);
  
  // Handle CORS
  const corsResult = handleCors(req);
  if (corsResult instanceof Response) {
    return corsResult;
  }
  const { headers } = corsResult;

  try {
    // JWT верифікація
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Відсутній токен авторизації' }),
        { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Створюємо клієнт з ANON_KEY та JWT токеном для користувацьких операцій
    const userSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Верифікуємо користувача
    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Невірний або прострочений токен' }),
        { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Service role клієнт тільки для специфічних операцій (broadcast, тощо)
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const difyClient = new DifyClient();
    const url = new URL(req.url);
    
    let requestBody = {};
    if (req.method === 'POST') {
      try {
        requestBody = await req.json();
      } catch (e) {
        // Може бути FormData для upload_file
        console.log('No JSON body to parse, might be FormData');
      }
    }
    
    const action = url.searchParams.get('action') || (requestBody as any)?.action;
    
    console.log(`[dify-client] Action:`, action);

    switch (action) {
      case 'send_message': {
        // Валідація вводу
        const validationResult = SendMessageSchema.safeParse(requestBody);
        if (!validationResult.success) {
          return new Response(
            JSON.stringify({ 
              error: 'Помилка валідації',
              details: validationResult.error.errors 
            }),
            { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
          );
        }

        const { conversationId, query, files, chatId } = validationResult.data;
        
        console.log('Processing send_message:', { chatId, conversationId, query: query.substring(0, 50) });
        
        // Збереження повідомлення користувача (з RLS захистом)
        try {
          // Отримуємо display_name користувача
          const { data: profile } = await userSupabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', user.id)
            .single();
          
          const userDisplayName = profile?.display_name || 
                                 user.user_metadata?.display_name || 
                                 user.email?.split('@')[0] || 
                                 'Участник';
          
          if (chatId) {
            await userSupabase
              .from('messages')
              .insert({
                conversation_id: chatId,
                content: query,
                role: 'user',
                sender_name: userDisplayName,
              });
            console.log('User message saved to database with sender:', userDisplayName);
          }
        } catch (dbError) {
          console.error('Error saving user message:', dbError);
        }
        
        // Start streaming response from Dify
        const response = await difyClient.sendMessageStream(conversationId || null, query, files);
        
        if (!response.body) {
          throw new Error('No response body from Dify');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let actualConversationId = conversationId;

        let completeMessage = '';
        let messageId = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                console.log('Dify stream event:', data.event, data);

                // Extract conversation_id from first message
                if (!actualConversationId && data.conversation_id && chatId) {
                  actualConversationId = data.conversation_id;
                  
                  // Update chat with dify_conversation_id (з RLS захистом)
                  await userSupabase
                    .from('conversations')
                    .update({ dify_conversation_id: actualConversationId })
                    .eq('id', chatId)
                    .eq('user_id', user.id); // Додаткова перевірка через RLS
                }

                // Accumulate agent response
                if (data.event === 'message' || data.event === 'agent_message') {
                  completeMessage += data.answer || '';
                  messageId = data.message_id || data.id;
                }

                // Save complete response to database when finished (з RLS захистом)
                if (data.event === 'message_end' && completeMessage && chatId) {
                  console.log('Saving agent response to database:', completeMessage, 'with messageId:', messageId);
                  
                  await userSupabase
                    .from('messages')
                    .insert({
                      conversation_id: chatId,
                      content: completeMessage,
                      role: 'assistant',
                      sender_name: 'Дух Общины',
                      dify_message_id: messageId,
                    });
                }

                // Broadcast to all clients via Supabase Realtime (використовуємо service role для broadcast)
                try {
                  const channel = serviceSupabase.channel(`chat:${chatId}`);
                  await channel.subscribe();
                  await channel.send({
                    type: 'broadcast',
                    event: 'dify_stream',
                    payload: data,
                  });
                  await channel.unsubscribe();
                } catch (broadcastError) {
                  console.error('Broadcast error:', broadcastError);
                }

              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      case 'get_messages': {
        const gmResult = GetMessagesSchema.safeParse(requestBody);
        if (!gmResult.success) {
          return new Response(
            JSON.stringify({ error: 'Помилка валідації', details: gmResult.error.errors }),
            { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
          );
        }
        const { conversationId: gmConvId, cursor: gmCursor } = gmResult.data;
        const response = await difyClient.getMessages(gmConvId, gmCursor);
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      case 'stop_generation': {
        const sgResult = StopGenerationSchema.safeParse(requestBody);
        if (!sgResult.success) {
          return new Response(
            JSON.stringify({ error: 'Помилка валідації', details: sgResult.error.errors }),
            { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
          );
        }
        const response = await difyClient.stopGeneration(sgResult.data.taskId);
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      case 'send_feedback': {
        // Валідація вводу
        const validationResult = FeedbackSchema.safeParse(requestBody);
        if (!validationResult.success) {
          return new Response(
            JSON.stringify({ 
              error: 'Помилка валідації',
              details: validationResult.error.errors 
            }),
            { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
          );
        }

        const { messageId, rating, content } = validationResult.data;
        const response = await difyClient.sendFeedback(messageId, rating, content);
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      case 'upload_file': {
        const formData = await req.formData();
        const response = await difyClient.uploadFile(formData);
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      case 'list_conversations': {
        const lcResult = ListConversationsSchema.safeParse(requestBody);
        if (!lcResult.success) {
          return new Response(
            JSON.stringify({ error: 'Помилка валідації', details: lcResult.error.errors }),
            { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
          );
        }
        const response = await difyClient.listConversations(lcResult.data.limit, lcResult.data.cursor);
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      case 'rename_conversation': {
        const rcResult = RenameConversationSchema.safeParse(requestBody);
        if (!rcResult.success) {
          return new Response(
            JSON.stringify({ error: 'Помилка валідації', details: rcResult.error.errors }),
            { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
          );
        }
        const response = await difyClient.renameConversation(rcResult.data.conversationId, rcResult.data.name);
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      case 'delete_conversation': {
        const dcResult = DeleteConversationSchema.safeParse(requestBody);
        if (!dcResult.success) {
          return new Response(
            JSON.stringify({ error: 'Помилка валідації', details: dcResult.error.errors }),
            { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
          );
        }
        const response = await difyClient.deleteConversation(dcResult.data.conversationId);
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Невірна дія' }),
          { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Error in dify-client:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Внутрішня помилка сервера',
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      }
    );
  }
});
