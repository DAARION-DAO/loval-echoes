import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import { getCorsHeaders, handleCors } from '../_shared/cors.ts';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Валідація вводу
const FeedbackSchema = z.object({
  messageId: z.string().min(1, 'ID повідомлення обов\'язковий'),
  rating: z.enum(['like', 'dislike'], {
    errorMap: () => ({ message: 'Рейтинг має бути "like" або "dislike"' }),
  }),
  content: z.string().max(500, 'Коментар не може перевищувати 500 символів').optional(),
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

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Метод не дозволений' }),
        { status: 405, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Валідація вводу
    const body = await req.json();
    const validationResult = FeedbackSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Помилка валідації',
          details: validationResult.error.errors 
        }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const { messageId, rating, content } = validationResult.data;

    // Відправляємо feedback в Dify через user JWT (без service role)
    const difyResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/dify-client`,
      {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        },
        body: JSON.stringify({
          action: 'send_feedback',
          messageId,
          rating,
          content,
        }),
      }
    );

    if (!difyResponse.ok) {
      const errorData = await difyResponse.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to send feedback');
    }

    const responseData = await difyResponse.json();

    // Логирування (з RLS захистом)
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

    return new Response(JSON.stringify(responseData), {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in feedback-api:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Внутрішня помилка сервера',
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      }
    );
  }
});
