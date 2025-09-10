import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log(`[chat-api] Request: ${req.method} ${req.url}`);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const method = req.method;
    
    // Parse path - remove functions/v1/chat-api prefix
    const pathSegments = url.pathname.split('/').filter(Boolean);
    console.log('[chat-api] Path segments:', pathSegments);
    
    // GET /chats - List all chats
    if (method === 'GET' && pathSegments.length === 3) { // functions/v1/chat-api
      console.log('[chat-api] Handling GET /chats');
      
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      if (!token) {
        console.log('[chat-api] No auth token provided');
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Get user from token
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        console.log('[chat-api] Auth error:', authError);
        return new Response(JSON.stringify({ error: 'Invalid token' }), { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        // Fetch conversations from database
        const { data: conversations, error } = await supabase
          .from('conversations')
          .select('id, name, updated_at, created_at, dify_conversation_id')
          .eq('user_id', user.id)
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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
        
      } catch (error) {
        console.error('[chat-api] Error fetching chats:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch chats' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // POST /chats - Create new chat
    if (method === 'POST' && pathSegments.length === 3) { // functions/v1/chat-api
      console.log('[chat-api] Handling POST /chats');
      
      try {
        const body = await req.json();
        const { name } = body;
        
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');
        
        if (!token) {
          console.log('[chat-api] No auth token for POST');
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
          console.log('[chat-api] Auth error creating chat:', authError);
          return new Response(JSON.stringify({ error: 'Invalid token' }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Create new conversation
        const { data: newChat, error } = await supabase
          .from('conversations')
          .insert({
            name: name || 'Новый чат',
            user_id: user.id,
          })
          .select('id, name, created_at, updated_at')
          .single();

        if (error) {
          console.error('[chat-api] Error creating chat:', error);
          throw error;
        }

        console.log('[chat-api] Created new chat:', newChat);

        return new Response(JSON.stringify(newChat), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
        
      } catch (error) {
        console.error('[chat-api] Error in POST /chats:', error);
        return new Response(JSON.stringify({ 
          error: 'Failed to create chat', 
          details: error.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[chat-api] Unhandled error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});