import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log(`[chat-api] ${req.method} ${req.url}`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const method = req.method;
    const pathParts = url.pathname.split('/').filter(Boolean);
    console.log('[chat-api] Full pathname:', url.pathname);
    console.log('[chat-api] Path parts before filtering:', pathParts);
    
    // Remove the standard edge function prefix
    const apiPathParts = pathParts.slice(pathParts.indexOf('chat-api') + 1);
    console.log('[chat-api] API path parts:', apiPathParts);
    
    // GET /chats - список чатов
    if (method === 'GET' && apiPathParts.length === 0) {
      console.log('Returning empty chats array for development');
      // Return empty array for now until we have proper database tables
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /chats - создание нового чата
    if (method === 'POST' && apiPathParts.length === 0) {
      const { name } = await req.json();
      
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Return mock chat for development
      const mockChat = {
        id: crypto.randomUUID(),
        name: name || 'Новый чат',
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Created mock chat:', mockChat);

      return new Response(JSON.stringify(mockChat), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /chats/:chatId/name - переименование чата
    if (method === 'POST' && apiPathParts.length === 2 && apiPathParts[1] === 'name') {
      const chatId = apiPathParts[0];
      const { name } = await req.json();
      
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (!user) {
        return new Response('Unauthorized', { status: 401, headers: corsHeaders });
      }

      const { data: chat, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', chatId)
        .single();

      if (fetchError) throw fetchError;

      // Обновляем в нашей БД
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', chatId);

      if (updateError) throw updateError;

      // Если есть dify_conversation_id, переименовываем в Dify
      if (chat.dify_conversation_id) {
        try {
          await supabase.functions.invoke('dify-client', {
            body: {
              action: 'rename_conversation',
              conversationId: chat.dify_conversation_id,
              name,
            },
          });
        } catch (e) {
          console.error('Error renaming in Dify:', e);
        }
      }

      // Логирование
      await supabase
        .from('audit_log')
        .insert({
          actor: user.id,
          action: 'chat_renamed',
          chat_id: chatId,
          details: { old_name: chat.name, new_name: name },
        });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /chats/:chatId - удаление чата
    if (method === 'DELETE' && apiPathParts.length === 1) {
      const chatId = apiPathParts[0];
      
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (!user) {
        return new Response('Unauthorized', { status: 401, headers: corsHeaders });
      }

      const { data: chat, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', chatId)
        .single();

      if (fetchError) throw fetchError;

      // Удаляем из Dify если есть conversation_id
      if (chat.dify_conversation_id) {
        try {
          await supabase.functions.invoke('dify-client', {
            body: {
              action: 'delete_conversation',
              conversationId: chat.dify_conversation_id,
            },
          });
        } catch (e) {
          console.error('Error deleting from Dify:', e);
        }
      }

      // Удаляем из нашей БД
      const { error: deleteError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', chatId);

      if (deleteError) throw deleteError;

      // Логирование
      await supabase
        .from('audit_log')
        .insert({
          actor: user.id,
          action: 'chat_deleted',
          chat_id: chatId,
          details: { name: chat.name },
        });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /chats/:chatId/history - история сообщений
    if (method === 'GET' && apiPathParts.length === 2 && apiPathParts[1] === 'history') {
      const chatId = apiPathParts[0];
      const cursor = url.searchParams.get('cursor');
      
      const { data: chat } = await supabase
        .from('conversations')
        .select('dify_conversation_id')
        .eq('id', chatId)
        .single();

      if (!chat?.dify_conversation_id) {
        return new Response(JSON.stringify({ data: [], has_more: false }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const response = await supabase.functions.invoke('dify-client', {
        body: {
          action: 'get_messages',
          conversationId: chat.dify_conversation_id,
          cursor,
        },
      });

      return new Response(JSON.stringify(response.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /chats/:chatId/send - отправка сообщения
    if (method === 'POST' && apiPathParts.length === 2 && apiPathParts[1] === 'send') {
      const chatId = apiPathParts[0];
      const { query, files } = await req.json();
      
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (!user) {
        return new Response('Unauthorized', { status: 401, headers: corsHeaders });
      }

      const { data: chat } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', chatId)
        .single();

      if (!chat) {
        return new Response('Chat not found', { status: 404, headers: corsHeaders });
      }

      // Отправляем сообщение через Dify client (это запустит стрим)
      await supabase.functions.invoke('dify-client', {
        body: {
          action: 'send_message',
          conversationId: chat.dify_conversation_id,
          query,
          files,
          chatId,
        },
      });

      // Логирование
      await supabase
        .from('audit_log')
        .insert({
          actor: user.id,
          action: 'message_sent',
          chat_id: chatId,
          details: { query: query.substring(0, 100) },
        });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /chats/:chatId/stop - остановка генерации
    if (method === 'POST' && apiPathParts.length === 2 && apiPathParts[1] === 'stop') {
      const { taskId } = await req.json();
      
      const response = await supabase.functions.invoke('dify-client', {
        body: {
          action: 'stop_generation',
          taskId,
        },
      });

      return new Response(JSON.stringify(response.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Route not found' }), { 
      status: 404, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in chat-api:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});