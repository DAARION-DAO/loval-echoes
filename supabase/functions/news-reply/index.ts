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

    // 1.5. Create news_notifications for all users and send push notifications
    try {
      // Get the inserted message ID
      const { data: insertedMessage } = await supabase
        .from('news_feed')
        .select('id')
        .eq('author_id', author_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (insertedMessage) {
        // Get all users who have push enabled
        const { data: users } = await supabase
          .from('profiles')
          .select('user_id, news_push_enabled')
          .eq('news_push_enabled', true);

        if (users && users.length > 0) {
          // Create notification records for all users
          const notifications = users.map(user => ({
            user_id: user.user_id,
            news_id: insertedMessage.id,
            message: text.slice(0, 200) + (text.length > 200 ? '...' : ''),
            read: false,
          }));

          const { error: notifError } = await supabase
            .from('news_notifications')
            .insert(notifications);

          if (notifError) {
            console.warn('Error creating notifications:', notifError);
          } else {
            console.log(`Created ${notifications.length} notification records`);
          }
        }

        // Send push notifications
        const pushResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/push-send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
          },
          body: JSON.stringify({
            title: '📢 Срочная новость',
            body: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
            url: '/news',
            tag: 'news-notification',
          }),
        });
        
        if (!pushResponse.ok) {
          console.warn('Failed to send push notifications:', await pushResponse.text());
        } else {
          console.log('Push notifications sent successfully');
        }
      }
    } catch (pushError) {
      console.warn('Error sending push notifications:', pushError);
      // Don't fail the whole request if push fails
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