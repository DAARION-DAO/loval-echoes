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

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const { action, subscription, deviceId } = await req.json();

    if (action === 'subscribe') {
      if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
        return new Response('Invalid subscription data', { status: 400, headers: corsHeaders });
      }

      // Сохраняем подписку в базе данных
      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          device_id: deviceId || crypto.randomUUID(),
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          user_agent: req.headers.get('user-agent'),
          expires_at: subscription.expirationTime 
            ? new Date(subscription.expirationTime).toISOString() 
            : null,
        }, {
          onConflict: 'endpoint',
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving subscription:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Subscription saved:', data.id);

      return new Response(JSON.stringify({ 
        success: true,
        subscriptionId: data.id,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'unsubscribe') {
      if (!subscription?.endpoint) {
        return new Response('Endpoint required', { status: 400, headers: corsHeaders });
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('endpoint', subscription.endpoint);

      if (error) {
        console.error('Error removing subscription:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      return new Response('Invalid action', { status: 400, headers: corsHeaders });
    }

  } catch (error) {
    console.error('Error in push-subscribe:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});