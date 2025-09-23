import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { fileName, fileSize, fileType, contentHash, userAgent } = await req.json();
    
    // Get client IP
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    console.log(`File validation request from ${clientIP} for file: ${fileName}`);

    // Check rate limit with enhanced function
    const { data: rateLimitOk } = await supabaseClient.rpc('check_enhanced_rate_limit', {
      p_identifier: user.id, 
      p_action: 'file_upload',
      p_max_attempts: 10, 
      p_window_minutes: 5,
      p_block_duration_minutes: 30  // Block for 30 minutes if exceeded
    });

    if (!rateLimitOk) {
      console.log(`File upload rate limit exceeded for user ${user.id}`);
      
      // Log security event
      await supabaseClient.rpc('enhanced_log_security_event', {
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
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use enhanced validation function with comprehensive security checks
    const { data: validationResult, error: validationError } = await supabaseClient.rpc('validate_file_upload_security', {
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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!validationResult.valid) {
      const errors = validationResult.errors || ['Файл не прошел проверку безопасности'];
      
      return new Response(
        JSON.stringify({ 
          error: errors[0] || 'Файл не прошел проверку безопасности' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get sanitized filename from validation result
    const sanitizedFileName = validationResult.sanitized_filename || fileName;

    // Log security event with enhanced logging
    await supabaseClient.rpc('enhanced_log_security_event', {
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('File validation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})