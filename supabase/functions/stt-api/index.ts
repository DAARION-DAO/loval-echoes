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

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const { audio, mimeType } = await req.json();

    if (!audio) {
      return new Response('No audio data provided', { status: 400, headers: corsHeaders });
    }

    const DIFY_API_KEY = Deno.env.get('DIFY_API_KEY');
    if (!DIFY_API_KEY) {
      console.error('DIFY_API_KEY not configured');
      return new Response('Server configuration error', { status: 500, headers: corsHeaders });
    }

    // Конвертируем base64 в blob
    const binaryString = atob(audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Normalize mimeType and determine file extension
    // Dify поддерживает: mp3, mp4, mpeg, mpga, m4a, wav, webm
    // IMPORTANT: For MP4 containers from Safari/iOS, use audio/m4a MIME type
    let normalizedType = mimeType || 'audio/wav';
    let fileName = 'audio.wav';
    
    if (normalizedType.includes('wav')) {
      normalizedType = 'audio/wav';
      fileName = 'audio.wav';
    } else if (normalizedType.includes('webm')) {
      normalizedType = 'audio/webm';
      fileName = 'audio.webm';
    } else if (normalizedType.includes('mp4')) {
      // Safari/iOS records as MP4, but Dify expects M4A MIME type
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
    // Use File instead of Blob to ensure proper Content-Type
    const audioFile = new File([bytes], fileName, { type: normalizedType });
    formData.append('file', audioFile, fileName);

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
      console.error(`Dify STT API error: ${response.status} ${errorText}`);
      
      if (response.status === 415) {
        return new Response(
          JSON.stringify({ 
            error: `Unsupported audio format: ${normalizedType}. Please try a different browser.` 
          }), 
          { status: 415, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`STT API error: ${response.status}`);
    }

    const result = await response.json();

    // Логирование
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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in stt-api:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});