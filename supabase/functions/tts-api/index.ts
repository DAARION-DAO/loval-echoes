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

    const { text, voice = 'alloy' } = await req.json();

    if (!text) {
      return new Response('No text provided', { status: 400, headers: corsHeaders });
    }

    // Отправляем в Dify TTS API
    const response = await fetch('https://api.dify.ai/v1/text-to-audio', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('DIFY_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice,
        streaming: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Dify TTS API error: ${response.status} ${errorText}`);
      throw new Error(`TTS API error: ${response.status}`);
    }

    // Получаем аудио как ArrayBuffer
    const audioBuffer = await response.arrayBuffer();
    
    // Конвертируем в base64
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    );

    // Логирование
    await supabase
      .from('audit_log')
      .insert({
        actor: user.id,
        action: 'tts_used',
        details: {
          text_length: text.length,
          voice,
          audio_size: audioBuffer.byteLength,
        },
      });

    return new Response(JSON.stringify({ 
      audioContent: base64Audio,
      contentType: 'audio/mpeg',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in tts-api:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});