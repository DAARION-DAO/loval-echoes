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

    // SIMPLIFIED: Skip rate limiting for now to fix immediate issue
    // TODO: Re-implement rate limiting with proper permissions later

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

    // SIMPLIFIED: Skip logging for now to fix immediate issue
    console.log(`Processing ${action} for ${email} from ${clientIP}`)

    // Perform the actual authentication action
    let result
    let redirectUrl = 'https://4411fba9-f975-4193-bebf-d5df27e57cfc.lovableproject.com/'
    
    // Try to get origin from headers, fallback to known URL
    const origin = req.headers.get('origin') || req.headers.get('referer')
    if (origin) {
      try {
        const url = new URL(origin)
        redirectUrl = `${url.protocol}//${url.host}/`
      } catch (e) {
        console.log('Failed to parse origin, using default:', origin)
      }
    }

    console.log(`Using redirect URL: ${redirectUrl}`)

    switch (action) {
      case 'login':
        console.log('Attempting Supabase signInWithPassword...')
        result = await supabaseClient.auth.signInWithPassword({
          email,
          password: password!
        })
        console.log('Supabase signIn result:', result.error ? `Error: ${result.error.message}` : 'Success')
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
      
      // Map error messages to user-friendly versions
      let friendlyError = result.error.message
      if (result.error.message.includes('Invalid login credentials')) {
        friendlyError = 'Неверный email или пароль'
      } else if (result.error.message.includes('Email not confirmed')) {
        friendlyError = 'Подтвердите email для входа в систему'
      } else if (result.error.message.includes('Too many requests')) {
        friendlyError = 'Слишком много попыток входа. Попробуйте позже'
      }

      return new Response(
        JSON.stringify({ 
          error: friendlyError,
          authError: true 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // SIMPLIFIED: Skip logging for now to fix immediate issue
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