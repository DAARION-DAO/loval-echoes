import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// VAPID ключи (генерируются один раз)
// Для production используйте переменные окружения
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || '';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@zhos.app';

// Web Push helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string
): Promise<Response> {
  const { endpoint, p256dh, auth } = subscription;

  // Создаем JWT для VAPID
  const vapidHeaders = await generateVAPIDHeaders(endpoint);

  // Шифруем payload
  const encryptedPayload = await encryptPayload(
    payload,
    urlBase64ToUint8Array(p256dh),
    urlBase64ToUint8Array(auth)
  );

  // Отправляем push-уведомление
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'TTL': '86400',
      ...vapidHeaders,
    },
    body: encryptedPayload,
  });
}

async function generateVAPIDHeaders(endpoint: string): Promise<Record<string, string>> {
  // Упрощенная версия - в production используйте библиотеку web-push
  // Здесь мы используем базовую аутентификацию
  
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  
  // Генерация JWT токена (упрощенная версия)
  const header = {
    typ: 'JWT',
    alg: 'ES256',
  };
  
  const jwtPayload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
    sub: VAPID_SUBJECT,
  };
  
  // В production используйте правильную подпись JWT
  // Для демо используем упрощенный подход
  
  return {
    'Authorization': `vapid t=${VAPID_PUBLIC_KEY}, k=${VAPID_PUBLIC_KEY}`,
    'Crypto-Key': `p256ecdsa=${VAPID_PUBLIC_KEY}`,
  };
}

async function encryptPayload(
  payload: string,
  userPublicKey: Uint8Array,
  userAuth: Uint8Array
): Promise<Uint8Array> {
  // Упрощенная версия - в production используйте библиотеку web-push
  // или правильное шифрование aes128gcm
  
  const encoder = new TextEncoder();
  return encoder.encode(payload);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Эта функция может быть вызвана внутренне или с авторизацией
    const apiKey = req.headers.get('x-api-key');
    const isInternalCall = apiKey === Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Если это не внутренний вызов, требуется авторизация
    if (!isInternalCall) {
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return new Response('Unauthorized', { status: 401, headers: corsHeaders });
      }
    }

    const requestBody = await req.json();
    const { userId, title, body: messageBody, url, tag } = requestBody;
    
    // Если userId не указан, отправляем всем (только для внутренних вызовов)
    const sendToAll = !userId && isInternalCall;

    // Получаем подписки
    let query = supabase.from('push_subscriptions').select('*');
    
    if (!sendToAll) {
      if (!userId) {
        return new Response('userId required', { status: 400, headers: corsHeaders });
      }
      query = query.eq('user_id', userId);
    }
    
    const { data: subscriptions, error } = await query;

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No subscriptions found for user:', userId);
      return new Response(JSON.stringify({ 
        success: true, 
        sent: 0,
        message: 'No subscriptions found' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Отправляем push-уведомления на все устройства
    const payload = JSON.stringify({
      title: title || '📢 Новое сообщение',
      body: messageBody || 'У вас новое уведомление',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      url: url || '/news',
      tag: tag || 'news-notification',
      data: {
        timestamp: Date.now(),
      },
    });

    let successCount = 0;
    let failedEndpoints: string[] = [];

    for (const subscription of subscriptions) {
      try {
        const response = await sendWebPush(
          {
            endpoint: subscription.endpoint,
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
          payload
        );

        if (response.ok || response.status === 201) {
          successCount++;
          console.log('Push sent successfully to:', subscription.endpoint.substring(0, 50));
        } else {
          console.error('Push failed:', response.status, await response.text());
          
          // Если подписка невалидна (410 Gone), удаляем её
          if (response.status === 410) {
            failedEndpoints.push(subscription.endpoint);
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', subscription.endpoint);
            console.log('Removed invalid subscription:', subscription.endpoint.substring(0, 50));
          }
        }
      } catch (error) {
        console.error('Error sending push to subscription:', error);
        failedEndpoints.push(subscription.endpoint);
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      sent: successCount,
      failed: failedEndpoints.length,
      totalSubscriptions: subscriptions.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in push-send:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});