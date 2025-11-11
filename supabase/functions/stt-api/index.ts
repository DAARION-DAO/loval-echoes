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

    const DIFY_API_KEY = Deno.env.get('DIFY_API_KEY');
    if (!DIFY_API_KEY) {
      console.error('DIFY_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Помилка конфігурації сервера' }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Конвертируем base64 в blob
    const binaryString = atob(audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Normalize mimeType and determine file extension
    let normalizedType = mimeType || 'audio/wav';
    let fileName = 'audio.wav';
    
    if (normalizedType.includes('wav')) {
      normalizedType = 'audio/wav';
      fileName = 'audio.wav';
    } else if (normalizedType.includes('webm')) {
      normalizedType = 'audio/webm';
      fileName = 'audio.webm';
    } else if (normalizedType.includes('mp4')) {
      normalizedType = 'audio/m4a';
      fileName = 'audio.m4a';
    } else if (normalizedType.includes('m4a')) {
      normalizedType = 'audio/m4a';
      fileName = 'audio.m4a';
    } else if (normalizedType.includes('mpeg') || normalizedType.includes('mp3')) {
      normalizedType = 'audio/mpeg';
      fileName = 'audio.mp3';
    }

    // Создаем FormData для отправки в Dify
    const formData = new FormData();
    const audioFile = new File([bytes], fileName, { type: normalizedType });
    formData.append('file', audioFile, fileName);
    formData.append('user', 'daarion-community-system');

    console.log(`Processing audio: type=${normalizedType}, size=${bytes.length}, fileName=${fileName}`);

    // Отправляем в Dify STT API
    const response = await fetch('https://api.dify.ai/v1/audio-to-text', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Dify STT API error: ${response.status}`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        fileName,
        mimeType: normalizedType,
        fileSize: bytes.length
      });
      
      if (response.status === 415) {
        return new Response(
          JSON.stringify({ 
            error: `Непідтримуваний формат аудіо: ${normalizedType}. Спробуйте інший браузер.` 
          }), 
          { status: 415, headers: { ...headers, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`STT API error: ${response.status}`);
    }

    const result = await response.json();

    // Логирование (з RLS захистом)
    await supabase
      .from('security_audit_log')
      .insert({
        user_id: user.id,
        event_type: 'stt_used',
        event_data: {
          text_length: result.text?.length || 0,
        },
      });

    return new Response(JSON.stringify(result), {
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
