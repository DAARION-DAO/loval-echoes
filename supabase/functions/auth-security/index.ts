import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuthRequest {
  action: 'login' | 'signup' | 'password_reset'
  email: string
  password?: string
  displayName?: string
  ipAddress?: string
  userAgent?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, email, password, displayName, ipAddress, userAgent }: AuthRequest = await req.json()

    // Get client IP if not provided
    const clientIP = ipAddress || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const clientUserAgent = userAgent || req.headers.get('user-agent') || 'unknown'

    console.log(`Auth security check for ${action} from ${clientIP}`)

    // Check rate limit
    const { data: rateLimitOk } = await supabaseClient.rpc('check_rate_limit', {
      p_identifier: clientIP,
      p_action: action,
      p_max_attempts: action === 'login' ? 5 : 3, // Stricter limits for signup/reset
      p_window_minutes: 15
    })

    if (!rateLimitOk) {
      console.log(`Rate limit exceeded for ${clientIP} on ${action}`)
      
      // Log security event
      await supabaseClient.rpc('enhanced_log_security_event', {
        p_user_id: null,
        p_event_type: 'rate_limit_exceeded',
        p_event_data: { action, email, ip: clientIP },
        p_ip_address: clientIP,
        p_user_agent: clientUserAgent,
        p_severity: 'warning'
      })

      return new Response(
        JSON.stringify({ 
          error: 'Слишком много попыток. Попробуйте снова через 15 минут.',
          rateLimited: true 
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Неверный формат email адреса' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Password strength validation for signup
    if (action === 'signup' && password) {
      if (password.length < 8) {
        return new Response(
          JSON.stringify({ error: 'Пароль должен содержать минимум 8 символов' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Check for basic password complexity
      const hasUpper = /[A-Z]/.test(password)
      const hasLower = /[a-z]/.test(password)
      const hasNumber = /\d/.test(password)
      
      if (!hasUpper || !hasLower || !hasNumber) {
        return new Response(
          JSON.stringify({ 
            error: 'Пароль должен содержать заглавные и строчные буквы, а также цифры' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Log security event for valid attempts
    await supabaseClient.rpc('enhanced_log_security_event', {
      p_user_id: null,
      p_event_type: `auth_${action}_attempt`,
      p_event_data: { email, ip: clientIP },
      p_ip_address: clientIP,
      p_user_agent: clientUserAgent,
      p_severity: 'info'
    })

    // Perform the actual authentication action
    let result
    const redirectUrl = `${req.headers.get('origin') || 'https://pbsdsdexayzfoexjdlgb.supabase.co'}/`

    switch (action) {
      case 'login':
        result = await supabaseClient.auth.signInWithPassword({
          email,
          password: password!
        })
        break
        
      case 'signup':
        result = await supabaseClient.auth.signUp({
          email,
          password: password!,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              display_name: displayName || email.split('@')[0]
            }
          }
        })
        break
        
      case 'password_reset':
        result = await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl
        })
        break
    }

    if (result.error) {
      console.log(`Auth ${action} failed:`, result.error.message)
      
      // Log failed attempt
      await supabaseClient.rpc('enhanced_log_security_event', {
        p_user_id: null,
        p_event_type: `auth_${action}_failed`,
        p_event_data: { 
          email, 
          ip: clientIP, 
          error: result.error.message 
        },
        p_ip_address: clientIP,
        p_user_agent: clientUserAgent,
        p_severity: 'warning'
      })

      return new Response(
        JSON.stringify({ 
          error: result.error.message,
          authError: true 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Log successful attempt
    await supabaseClient.rpc('enhanced_log_security_event', {
      p_user_id: result.data.user?.id || null,
      p_event_type: `auth_${action}_success`,
      p_event_data: { email, ip: clientIP },
      p_ip_address: clientIP,
      p_user_agent: clientUserAgent,
      p_severity: 'info'
    })

    console.log(`Auth ${action} successful for ${email}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        data: result.data
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Auth security error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Внутренняя ошибка сервера' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})