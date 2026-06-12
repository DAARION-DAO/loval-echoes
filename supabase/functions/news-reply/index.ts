import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { handleCors } from '../_shared/cors.ts';

// Валідація вводу
const NewsReplySchema = z.object({
  text: z.string()
    .min(1, 'Текст не може бути порожнім')
    .max(1000, 'Текст не може перевищувати 1000 символів')
    .refine(
      (text) => !/<script|javascript:|onerror=|onload=/i.test(text),
      'Текст містить небезпечний контент'
    ),
  author_id: z.string().uuid('Невірний формат UUID'),
});

serve(async (req) => {
  const corsResult = handleCors(req);
  if (corsResult instanceof Response) {
    return corsResult;
  }
  const headers = corsResult.headers;

  try {
    // JWT верифікація - отримуємо користувача з токену
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
    const validationResult = NewsReplySchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Помилка валідації',
          details: validationResult.error.errors 
        }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const { text, author_id } = validationResult.data;

    // Перевірка що author_id відповідає авторизованому користувачу
    if (author_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Недостатньо прав доступу' }),
        { status: 403, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing news feed message:', { text, author_id: user.id });

    // 1. Збереження повідомлення користувача (з RLS захистом)
    const { data: insertedMessage, error: insertError } = await supabase
      .from('news_feed')
      .insert({ author_id: user.id, text })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting message:', insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    // 1.5. Створення news_notifications та відправка push-повідомлень
    // Для цього потрібен service role key, але використовуємо окремий виклик
    try {
      // Використовуємо service role тільки для push-повідомлень (обмежений доступ)
      const serviceSupabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      if (insertedMessage) {
        // Отримуємо користувачів з увімкненими push-повідомленнями
        const { data: users } = await serviceSupabase
          .from('profiles')
          .select('user_id, news_push_enabled')
          .eq('news_push_enabled', true);

        if (users && users.length > 0) {
          // Створюємо записи сповіщень для всіх користувачів
          const notifications = users.map(u => ({
            user_id: u.user_id,
            news_id: insertedMessage.id,
            message: text.slice(0, 200) + (text.length > 200 ? '...' : ''),
            read: false,
          }));

          const { error: notifError } = await serviceSupabase
            .from('news_notifications')
            .insert(notifications);

          if (notifError) {
            console.warn('Error creating notifications:', notifError);
          } else {
            console.log(`Created ${notifications.length} notification records`);
          }
        }

        // Відправка push-повідомлень
        const pushResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/push-send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader, // Використовуємо JWT користувача
            'x-api-key': Deno.env.get('SUPABASE_ANON_KEY') ?? '',
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
      // Не перериваємо запит якщо push не вдався
    }

    // 2. Перевірка чи потрібна відповідь агента (тільки при згадці @ЖОС)
    const isAddressedToAgent = text.includes('@ЖОС') || text.includes('@Agent') || text.includes('@agent');
    
    if (isAddressedToAgent) {
      console.log('Message addressed to agent, but AI agent replies are disabled because Dify is removed.');
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('News reply function error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }
});
