import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  console.log(`[dify-client] ${req.method} ${req.url}`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
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
        console.log('No JSON body to parse');
      }
    }
    
    const action = url.searchParams.get('action') || (requestBody as any)?.action;
    
    console.log(`[dify-client] Action:`, action);

    switch (action) {
      case 'send_message': {
        const { conversationId, query, files, chatId, action } = requestBody as any;
        
        console.log('Processing send_message:', { chatId, conversationId, query: query.substring(0, 50) });
        
        // First, save user message to database
        try {
          // Get user info from Authorization header
          const authHeader = req.headers.get('authorization');
          let currentUserId = null;
          let userDisplayName = 'Участник';

          if (authHeader) {
            try {
              // Create a user-context Supabase client to get proper user session
              const userSupabase = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_ANON_KEY') ?? '',
                {
                  global: {
                    headers: {
                      Authorization: authHeader
                    }
                  }
                }
              );

              const { data: { user }, error: userError } = await userSupabase.auth.getUser();
              
              if (!userError && user) {
                currentUserId = user.id;
                console.log('Found user:', user.id, user.email);
                
                // Get user display name from profiles table
                const { data: profile, error: profileError } = await supabase
                  .from('profiles')
                  .select('display_name')
                  .eq('user_id', user.id)
                  .single();
                
                if (!profileError && profile?.display_name) {
                  userDisplayName = profile.display_name;
                  console.log('Found display name:', userDisplayName);
                } else {
                  // Fallback to user metadata or email
                  userDisplayName = user.user_metadata?.display_name || 
                                   user.email?.split('@')[0] || 
                                   'Участник';
                  console.log('Using fallback display name:', userDisplayName);
                }
              } else {
                console.error('Error getting user from auth:', userError);
              }
            } catch (authError) {
              console.error('Error processing auth:', authError);
            }
          }
          
          await supabase
            .from('messages')
            .insert({
              conversation_id: chatId,
              content: query,
              role: 'user',
              sender_name: userDisplayName,
            });
          console.log('User message saved to database with sender:', userDisplayName);
        } catch (dbError) {
          console.error('Error saving user message:', dbError);
        }
        
        // Start streaming response from Dify
        const response = await difyClient.sendMessageStream(conversationId, query, files);
        
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
                if (!actualConversationId && data.conversation_id) {
                  actualConversationId = data.conversation_id;
                  
                  // Update chat with dify_conversation_id
                  await supabase
                    .from('conversations')
                    .update({ dify_conversation_id: actualConversationId })
                    .eq('id', chatId);
                }

                // Accumulate agent response
                if (data.event === 'message' || data.event === 'agent_message') {
                  completeMessage += data.answer || '';
                  messageId = data.message_id || data.id;
                }

                // Save complete response to database when finished
                if (data.event === 'message_end' && completeMessage) {
                  console.log('Saving agent response to database:', completeMessage, 'with messageId:', messageId);
                  
                  await supabase
                    .from('messages')
                    .insert({
                      conversation_id: chatId,
                      content: completeMessage,
                      role: 'assistant',
                      sender_name: 'Дух Общины',
                      dify_message_id: messageId, // Save Dify message ID for feedback
                    });
                }

                // Broadcast to all clients via Supabase Realtime
                try {
                  const channel = supabase.channel(`chat:${chatId}`);
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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_messages': {
        const { conversationId, cursor } = requestBody as any;
        const response = await difyClient.getMessages(conversationId, cursor);
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'stop_generation': {
        const { taskId } = requestBody as any;
        const response = await difyClient.stopGeneration(taskId);
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'send_feedback': {
        const { messageId, rating, content } = requestBody as any;
        const response = await difyClient.sendFeedback(messageId, rating, content);
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'upload_file': {
        const formData = await req.formData();
        const response = await difyClient.uploadFile(formData);
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'list_conversations': {
        const { limit, cursor } = requestBody as any;
        const response = await difyClient.listConversations(limit, cursor);
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'rename_conversation': {
        const { conversationId, name } = requestBody as any;
        const response = await difyClient.renameConversation(conversationId, name);
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete_conversation': {
        const { conversationId } = requestBody as any;
        const response = await difyClient.deleteConversation(conversationId);
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response('Invalid action', { status: 400, headers: corsHeaders });
    }

  } catch (error) {
    console.error('Error in dify-client:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});