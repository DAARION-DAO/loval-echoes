import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from '../_shared/cors.ts';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Валідація вводу
const IntegrationConnectSchema = z.object({
  type: z.enum(['telegram', 'whatsapp', 'email', 'calendar', 'slack', 'discord']),
  config: z.record(z.string(), z.unknown()),
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
    const validationResult = IntegrationConnectSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Помилка валідації',
          details: validationResult.error.errors 
        }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const { type, config } = validationResult.data;

    // Валідація конфігурації залежно від типу
    let isValid = false;
    let errorMessage = '';

    switch (type) {
      case 'telegram':
        isValid = !!config.bot_token && typeof config.bot_token === 'string';
        errorMessage = 'Bot token обов\'язковий для Telegram';
        break;
      case 'whatsapp':
        isValid = !!config.api_key && typeof config.api_key === 'string';
        errorMessage = 'API key обов\'язковий для WhatsApp';
        break;
      case 'email':
        isValid = !!config.email && !!config.smtp_host && typeof config.email === 'string';
        errorMessage = 'Email та SMTP сервер обов\'язкові';
        break;
      case 'calendar':
        isValid = !!config.access_token && typeof config.access_token === 'string';
        errorMessage = 'Access token обов\'язковий для календаря';
        break;
      case 'slack':
      case 'discord':
        isValid = !!config.webhook_url && typeof config.webhook_url === 'string';
        errorMessage = 'Webhook URL обов\'язковий';
        break;
    }

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Тестуємо підключення (залежно від типу)
    let testResult = { success: true, message: 'Підключення успішне' };

    switch (type) {
      case 'telegram':
        // Тестуємо Telegram Bot API
        try {
          const tgResponse = await fetch(`https://api.telegram.org/bot${config.bot_token}/getMe`);
          if (!tgResponse.ok) {
            throw new Error('Невірний bot token');
          }
        } catch (error) {
          return new Response(
            JSON.stringify({ error: 'Не вдалося підключитися до Telegram. Перевірте bot token.' }),
            { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
          );
        }
        break;
      
      case 'slack':
      case 'discord':
        // Тестуємо webhook
        try {
          const webhookResponse = await fetch(config.webhook_url as string, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: 'Тестове повідомлення' }),
          });
          if (!webhookResponse.ok) {
            throw new Error('Невірний webhook URL');
          }
        } catch (error) {
          return new Response(
            JSON.stringify({ error: 'Не вдалося підключитися. Перевірте webhook URL.' }),
            { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
          );
        }
        break;
    }

    // Зберігаємо інтеграцію в базі даних
    const { data, error } = await supabase
      .from('user_integrations')
      .upsert({
        user_id: user.id,
        type: type,
        enabled: true,
        connected: true,
        config: config,
        last_sync: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,type',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving integration:', error);
      return new Response(
        JSON.stringify({ error: 'Не вдалося зберегти інтеграцію' }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        integration: data,
        message: testResult.message
      }),
      { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in integration-connect:', error);
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

