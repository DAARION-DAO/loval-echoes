import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCors } from '../_shared/cors.ts'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"

// Валідація вводу
const FileValidationSchema = z.object({
  fileName: z.string().min(1).max(500),
  fileSize: z.number().int().positive().max(100_000_000), // 100MB максимум
  fileType: z.string().max(100),
  contentHash: z.string().max(200).optional(),
  userAgent: z.string().max(500).optional(),
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

    // Створюємо клієнт з ANON_KEY та JWT токеном для користувацьких операцій
    const userSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Верифікуємо користувача
    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Невірний або прострочений токен' }),
        { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Валідація вводу
    const body = await req.json();
    const validationResult = FileValidationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Помилка валідації',
          details: validationResult.error.errors 
        }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const { fileName, fileSize, fileType, contentHash, userAgent } = validationResult.data;

    // Service role для виклику RPC функцій (rate limiting та validation)
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Get client IP
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    console.log(`File validation request from ${clientIP} for file: ${fileName}`);

    // Check rate limit with enhanced function
    const { data: rateLimitOk } = await serviceSupabase.rpc('check_enhanced_rate_limit', {
      p_identifier: user.id, 
      p_action: 'file_upload',
      p_max_attempts: 10, 
      p_window_minutes: 5,
      p_block_duration_minutes: 30
    });

    if (!rateLimitOk) {
      console.log(`File upload rate limit exceeded for user ${user.id}`);
      
      // Log security event
      await serviceSupabase.rpc('enhanced_log_security_event', {
        p_user_id: user.id,
        p_event_type: 'file_upload_rate_limit',
        p_event_data: { fileName, fileSize, fileType },
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_severity: 'warning'
      });

      return new Response(
        JSON.stringify({ 
          error: 'Слишком много попыток загрузки файлов. Попробуйте позже.',
          rateLimited: true 
        }),
        { status: 429, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Use enhanced validation function with comprehensive security checks
    const { data: validationResultData, error: validationError } = await serviceSupabase.rpc('validate_file_upload_security', {
      p_file_name: fileName,
      p_file_size: fileSize,
      p_file_type: fileType,
      p_user_id: user.id
    });

    if (validationError) {
      console.error('File validation error:', validationError);
      return new Response(
        JSON.stringify({ 
          error: 'Ошибка валидации файла' 
        }),
        { 
          status: 500,
          headers: { ...headers, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!validationResultData.valid) {
      const errors = validationResultData.errors || ['Файл не прошел проверку безопасности'];
      
      return new Response(
        JSON.stringify({ 
          error: errors[0] || 'Файл не прошел проверку безопасности' 
        }),
        { 
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get sanitized filename from validation result
    const sanitizedFileName = validationResultData.sanitized_filename || fileName;

    // Log security event with enhanced logging
    await serviceSupabase.rpc('enhanced_log_security_event', {
      p_user_id: user.id,
      p_event_type: 'file_upload_validation_success',
      p_event_data: {
        original_filename: fileName,
        sanitized_filename: sanitizedFileName,
        file_size: fileSize,
        file_type: fileType,
        content_hash: contentHash,
        ip_address: clientIP
      },
      p_ip_address: clientIP,
      p_user_agent: userAgent || 'unknown',
      p_severity: 'info'
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        sanitizedFileName,
        message: 'File validation passed' 
      }),
      { 
        status: 200, 
        headers: { ...headers, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('File validation error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Внутрішня помилка сервера',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    )
  }
})
