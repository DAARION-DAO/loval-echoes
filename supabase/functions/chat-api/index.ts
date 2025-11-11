import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import { getCorsHeaders, handleCors } from '../_shared/cors.ts';
import { SafeTextSchema, validateInput } from '../_shared/validation.ts';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Validation schemas
const CreateChatSchema = z.object({
  name: SafeTextSchema(200, 0).optional(), // name is optional
});

serve(async (req) => {
  console.log(`[chat-api] Request: ${req.method} ${req.url}`);
  
  // Handle CORS
  const corsResult = handleCors(req);
  if (corsResult instanceof Response) {
    return corsResult;
  }
  const { headers, origin } = corsResult;

  try {
    // JWT верифікація - отримуємо користувача з токену
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Відсутній токен авторизації' }), { 
        status: 401, 
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    // Створюємо клієнт з ANON_KEY та JWT токеном
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Верифікуємо користувача
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('[chat-api] Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Невірний або прострочений токен' }), { 
        status: 401, 
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(req.url);
    const method = req.method;
    
    // Parse path - remove functions/v1/chat-api prefix
    const pathSegments = url.pathname.split('/').filter(Boolean);
    console.log('[chat-api] Path segments:', pathSegments);
    
    // GET /chats - List all chats
    if (method === 'GET' && pathSegments.length === 3) { // functions/v1/chat-api
      console.log('[chat-api] Handling GET /chats');

      try {
        // Fetch conversations from database (з RLS захистом)
        const { data: conversations, error } = await supabase
          .from('conversations')
          .select('id, name, updated_at, created_at, dify_conversation_id')
          .eq('user_id', user.id) // RLS забезпечить що користувач бачить тільки свої чати
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('[chat-api] Database error:', error);
          throw error;
        }

        // Transform to expected format
        const chats = conversations?.map(conv => ({
          id: conv.id,
          name: conv.name,
          updatedAt: conv.updated_at,
          lastMessagePreview: '',
          dify_conversation_id: conv.dify_conversation_id
        })) || [];

        console.log(`[chat-api] Found ${chats.length} chats for user ${user.id}`);
        
        return new Response(JSON.stringify(chats), {
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
        
      } catch (error) {
        console.error('[chat-api] Error fetching chats:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch chats' }), {
          status: 500,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }
    }

    // POST /chats - Create new chat
    if (method === 'POST' && pathSegments.length === 3) { // functions/v1/chat-api
      console.log('[chat-api] Handling POST /chats');
      
      try {
        const body = await req.json();
        
        // Валідація вводу
        const validationResult = validateInput(CreateChatSchema, body);
        if (!validationResult.success) {
          return new Response(JSON.stringify({ 
            error: 'Помилка валідації',
            details: validationResult.error.errors 
          }), {
            status: 400,
            headers: { ...headers, 'Content-Type': 'application/json' }
          });
        }

        const { name } = validationResult.data;

        // Create new conversation (з RLS захистом)
        const { data: newChat, error } = await supabase
          .from('conversations')
          .insert({
            name: name || 'Новый чат',
            user_id: user.id, // RLS забезпечить що користувач може створювати тільки свої чати
          })
          .select('id, name, created_at, updated_at')
          .single();

        if (error) {
          console.error('[chat-api] Error creating chat:', error);
          throw error;
        }

        console.log('[chat-api] Created new chat:', newChat);

        return new Response(JSON.stringify(newChat), {
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
        
      } catch (error) {
        console.error('[chat-api] Error in POST /chats:', error);
        return new Response(JSON.stringify({ 
          error: 'Failed to create chat', 
          details: error instanceof Error ? error.message : 'Unknown error'
        }), {
          status: 500,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }
    }

    // If no route matches
    console.log('[chat-api] Route not found for:', method, pathSegments);
    return new Response(JSON.stringify({ 
      error: 'Route not found',
      method,
      path: pathSegments 
    }), { 
      status: 404, 
      headers: { ...headers, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[chat-api] Unhandled error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
});
