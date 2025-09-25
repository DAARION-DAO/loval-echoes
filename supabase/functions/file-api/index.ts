import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_FILE_SIZE_MB = 25;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const method = req.method;
    const pathParts = url.pathname.split('/').filter(Boolean);

    // POST /upload - загрузка файла
    if (method === 'POST' && pathParts[0] === 'upload') {
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (!user) {
        return new Response('Unauthorized', { status: 401, headers: corsHeaders });
      }

      const formData = await req.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return new Response('No file provided', { status: 400, headers: corsHeaders });
      }

      // Проверка размера файла
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        return new Response(`File too large. Maximum size: ${MAX_FILE_SIZE_MB}MB`, {
          status: 400,
          headers: corsHeaders,
        });
      }

      // Проверка типа файла
      const allowedTypes = [
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

      if (!allowedTypes.includes(file.type)) {
        return new Response('File type not allowed', {
          status: 400,
          headers: corsHeaders,
        });
      }

      // Передаем файл в Dify
      const difyFormData = new FormData();
      difyFormData.append('file', file);

      const response = await supabase.functions.invoke('dify-client', {
        body: {
          action: 'upload_file',
          formData: difyFormData,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Логирование
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /:fileId/preview - превью файла
    if (method === 'GET' && pathParts.length === 2 && pathParts[1] === 'preview') {
      const fileId = pathParts[0];
      
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (!user) {
        return new Response('Unauthorized', { status: 401, headers: corsHeaders });
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
            ...corsHeaders,
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',
          },
        });

      } catch (error) {
        console.error('Error getting file preview:', error);
        return new Response('File not found', { status: 404, headers: corsHeaders });
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });

  } catch (error) {
    console.error('Error in file-api:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});