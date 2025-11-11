import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import { getCorsHeaders, handleCors } from '../_shared/cors.ts';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const MAX_FILE_SIZE_MB = 25;

// Валідація типів файлів
const ALLOWED_FILE_TYPES = [
  'text/plain',
  'text/markdown',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

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

    const url = new URL(req.url);
    const method = req.method;
    const pathParts = url.pathname.split('/').filter(Boolean);

    // POST /upload - загрузка файла
    if (method === 'POST' && pathParts[0] === 'upload') {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return new Response(
          JSON.stringify({ error: 'Файл не надано' }),
          { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
        );
      }

      // Валідація розміру файла
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        return new Response(
          JSON.stringify({ 
            error: `Файл занадто великий. Максимальний розмір: ${MAX_FILE_SIZE_MB}MB` 
          }),
          {
            status: 400,
            headers: { ...headers, 'Content-Type': 'application/json' },
          }
        );
      }

      // Валідація типу файла
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return new Response(
          JSON.stringify({ error: 'Тип файлу не дозволений' }),
          {
            status: 400,
            headers: { ...headers, 'Content-Type': 'application/json' },
          }
        );
      }

      // Передаем файл в Dify (використовуємо service role тільки для виклику іншої функції)
      const serviceSupabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const difyFormData = new FormData();
      difyFormData.append('file', file);

      const response = await serviceSupabase.functions.invoke('dify-client', {
        body: {
          action: 'upload_file',
          formData: difyFormData,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Логирование (з RLS захистом через user context)
      await supabase
        .from('audit_log')
        .insert({
          actor: user.id,
          action: 'file_uploaded',
          details: {
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            file_id: response.data?.id,
          },
        });

      return new Response(JSON.stringify(response.data), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // GET /:fileId/preview - превью файла
    if (method === 'GET' && pathParts.length === 2 && pathParts[1] === 'preview') {
      const fileId = pathParts[0];
      
      // Валідація UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(fileId)) {
        return new Response(
          JSON.stringify({ error: 'Невірний формат ID файлу' }),
          { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
        );
      }

      try {
        // Получаем файл из Dify
        const difyResponse = await fetch(`https://api.dify.ai/v1/files/${fileId}/preview`, {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('DIFY_API_KEY')}`,
          },
        });

        if (!difyResponse.ok) {
          throw new Error(`Dify API error: ${difyResponse.status}`);
        }

        const contentType = difyResponse.headers.get('content-type') || 'application/octet-stream';
        const data = await difyResponse.arrayBuffer();

        return new Response(data, {
          headers: {
            ...headers,
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',
          },
        });

      } catch (error) {
        console.error('Error getting file preview:', error);
        return new Response(
          JSON.stringify({ error: 'Файл не знайдено' }),
          { status: 404, headers: { ...headers, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Маршрут не знайдено' }),
      { status: 404, headers: { ...headers, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in file-api:', error);
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
