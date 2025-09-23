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

    // Check rate limit for file uploads
    const { data: rateLimitOk } = await supabaseClient.rpc('check_rate_limit', {
      p_identifier: user.id, // Use user ID for authenticated requests
      p_action: 'file_upload',
      p_max_attempts: 10, // Allow 10 file uploads per window
      p_window_minutes: 5   // 5 minute window
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

    // Input validation
    if (!fileName || !fileSize || !fileType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // File size validation (50MB limit)
    const MAX_FILE_SIZE = 50 * 1024 * 1024
    if (fileSize > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'File size exceeds 50MB limit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // File type validation
    const ALLOWED_TYPES = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm',
      'video/mp4', 'video/webm', 'video/ogg',
      'application/pdf', 'text/plain',
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!ALLOWED_TYPES.includes(fileType)) {
      return new Response(
        JSON.stringify({ error: 'File type not allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Filename validation
    const DANGEROUS_EXTENSIONS = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.js', '.jar']
    const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
    
    if (DANGEROUS_EXTENSIONS.includes(fileExtension)) {
      return new Response(
        JSON.stringify({ error: 'File extension not allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sanitize filename
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')

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