import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, author_id } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Processing news feed message:', { text, author_id });

    // 1. Save human message to news feed
    const { error: insertError } = await supabase
      .from('news_feed')
      .insert({ author_id, text });

    if (insertError) {
      console.error('Error inserting message:', insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Check if agent should respond (only on @ЖОС mentions)
    const isAddressedToAgent = text.includes('@ЖОС') || text.includes('@Agent') || text.includes('@agent');
    
    if (!isAddressedToAgent) {
      console.log('Message not addressed to agent, skipping response');
      return new Response('ok', { 
        status: 200,
        headers: corsHeaders 
      });
    }

    console.log('Message addressed to agent, generating response');

    // 3. Get Dify API key
    const difyApiKey = Deno.env.get('DIFY_API_KEY');
    if (!difyApiKey) {
      console.error('DIFY_API_KEY not configured');
      return new Response('Agent configuration error', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    // 4. Generate agent response via Dify
    const difyResponse = await fetch('https://api.dify.ai/v1/chat-messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${difyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query: text,
        response_mode: 'blocking',
        conversation_id: 'news_feed_agent',
        user: author_id
      })
    });

    if (!difyResponse.ok) {
      console.error('Dify API error:', await difyResponse.text());
      return new Response('Agent response error', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    const difyData = await difyResponse.json();
    const agentAnswer = difyData.answer || 'Извините, не могу ответить на этот вопрос.';

    console.log('Generated agent response:', agentAnswer);

    // 5. Insert agent response
    const { data: agentMessage, error: agentError } = await supabase
      .from('news_feed')
      .insert({
        author_id: null, // Agent messages don't have a human author
        text: agentAnswer,
        is_agent: true
      })
      .select()
      .single();

    if (agentError) {
      console.error('Error inserting agent message:', agentError);
      return new Response(JSON.stringify({ error: agentError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Agent response saved successfully');

    return new Response(JSON.stringify({ success: true, agent_message: agentMessage }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('News reply function error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});