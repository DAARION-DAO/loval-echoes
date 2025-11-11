import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from '../_shared/cors.ts';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Валідація вводу
const IntegrationDisconnectSchema = z.object({
  type: z.enum(['telegram', 'whatsapp', 'email', 'calendar', 'slack', 'discord', 'google_drive', 'google_docs', 'chatgpt', 'deepseek']),
  scope: z.enum(['team', 'personal']).optional(),
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
    const validationResult = IntegrationDisconnectSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Помилка валідації',
          details: validationResult.error.errors 
        }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const { type, scope } = validationResult.data;

    // Оновлюємо інтеграцію в базі даних
    let query = supabase
      .from('user_integrations')
      .update({
        enabled: false,
        connected: false,
        config: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('type', type);
    
    if (scope) {
      query = query.eq('scope', scope);
    }

    const { error } = await query;

    if (error) {
      console.error('Error disconnecting integration:', error);
      return new Response(
        JSON.stringify({ error: 'Не вдалося відключити інтеграцію' }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Інтеграцію успішно відключено'
      }),
      { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in integration-disconnect:', error);
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

