import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import { getCorsHeaders, handleCors } from '../_shared/cors.ts';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Валідація вводу
const STTRequestSchema = z.object({
  audio: z.string().min(1, 'Аудіо дані обов\'язкові'),
  mimeType: z.string().optional(),
});

const MAX_AUDIO_SIZE_BASE64 = 25 * 1024 * 1024; // 25MB в base64

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
    const validationResult = STTRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Помилка валідації',
          details: validationResult.error.errors 
        }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const { audio, mimeType } = validationResult.data;

    // Перевірка розміру аудіо
    if (audio.length > MAX_AUDIO_SIZE_BASE64) {
      return new Response(
        JSON.stringify({ error: 'Аудіо файл занадто великий. Максимум 25MB' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    console.log('STT requested, but Dify STT service is disabled.');
    return new Response(JSON.stringify({ text: '' }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in stt-api:', error);
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
