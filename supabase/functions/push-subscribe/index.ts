import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import { getCorsHeaders, handleCors } from '../_shared/cors.ts';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Валідація вводу
const PushSubscriptionSchema = z.object({
  endpoint: z.string().url('Невірний формат endpoint'),
  keys: z.object({
    p256dh: z.string().min(1, 'p256dh ключ обов\'язковий'),
    auth: z.string().min(1, 'auth ключ обов\'язковий'),
  }),
  expirationTime: z.number().nullable().optional(),
});

const PushSubscribeSchema = z.object({
  action: z.enum(['subscribe', 'unsubscribe']),
  subscription: PushSubscriptionSchema.optional(),
  deviceId: z.string().uuid().optional(),
});

serve(async (req) => {
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
      return new Response(
        JSON.stringify({ error: 'Невірний або прострочений токен' }),
        { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Валідація вводу
    const body = await req.json();
    const validationResult = PushSubscribeSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Помилка валідації',
          details: validationResult.error.errors 
        }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const { action, subscription, deviceId } = validationResult.data;

    if (action === 'subscribe') {
      if (!subscription) {
        return new Response(
          JSON.stringify({ error: 'Subscription дані обов\'язкові для підписки' }),
          { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
        );
      }

      // Сохраняем подписку в базе данных (з RLS захистом)
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
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      console.log('Subscription saved:', data.id);

      return new Response(JSON.stringify({ 
        success: true,
        subscriptionId: data.id,
      }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });

    } else if (action === 'unsubscribe') {
      if (!subscription?.endpoint) {
        return new Response(
          JSON.stringify({ error: 'Endpoint обов\'язковий для відписки' }),
          { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id) // RLS забезпечить що користувач може видаляти тільки свої підписки
        .eq('endpoint', subscription.endpoint);

      if (error) {
        console.error('Error removing subscription:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });

    } else {
      return new Response(
        JSON.stringify({ error: 'Невірна дія' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in push-subscribe:', error);
    return new Response(JSON.stringify({ 
      error: 'Внутрішня помилка сервера',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
});
