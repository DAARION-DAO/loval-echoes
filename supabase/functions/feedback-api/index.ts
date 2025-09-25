import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const { messageId, rating, content } = await req.json();

    if (!messageId || !rating) {
      return new Response('Missing required fields', { status: 400, headers: corsHeaders });
    }

    if (!['like', 'dislike'].includes(rating)) {
      return new Response('Invalid rating value', { status: 400, headers: corsHeaders });
    }

    // Отправляем feedback в Dify
    const response = await supabase.functions.invoke('dify-client', {
      body: {
        action: 'send_feedback',
        messageId,
        rating,
        content,
      },
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    // Логирование
    await supabase
      .from('audit_log')
      .insert({
        actor: user.id,
        action: 'feedback_sent',
        details: {
          message_id: messageId,
          rating,
          content: content?.substring(0, 100),
        },
      });

    return new Response(JSON.stringify(response.data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in feedback-api:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});