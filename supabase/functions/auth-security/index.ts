import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCors } from '../_shared/cors.ts'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"

// Валідація вводу
const AuthRequestSchema = z.object({
  action: z.enum(['login', 'signup', 'password_reset']),
  email: z.string().email('Невірний формат email'),
  password: z.string().optional(),
  displayName: z.string().max(100).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
}).refine(
  (data) => {
    // Password required for login and signup
    if ((data.action === 'login' || data.action === 'signup') && !data.password) {
      return false;
    }
    return true;
  },
  {
    message: 'Пароль обов\'язковий для входу та реєстрації',
    path: ['password'],
  }
);

serve(async (req) => {
  // Handle CORS
  const corsResult = handleCors(req);
  if (corsResult instanceof Response) {
    return corsResult;
  }
  const { headers } = corsResult;

  try {
    // Для auth-security service role key потрібен для створення користувачів
    // Але додаємо валідацію та CORS захист
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Валідація вводу
    const body = await req.json();
    const validationResult = AuthRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Помилка валідації',
          details: validationResult.error.errors 
        }),
        { 
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' }
        }
      );
    }

    const { action, email, password, displayName, ipAddress, userAgent } = validationResult.data;

    // Get client IP if not provided
    const clientIP = ipAddress || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const clientUserAgent = userAgent || req.headers.get('user-agent') || 'unknown'

    console.log(`Auth security check for ${action} from ${clientIP}`)

    // Check rate limiting using security definer function
    const { data: rateLimitResult, error: rateLimitError } = await supabaseClient
      .rpc('check_rate_limit_secure', {
        p_identifier: clientIP,
        p_action: action,
        p_max_attempts: 5,
        p_window_minutes: 15,
        p_block_duration_minutes: 60
      })

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError)
    } else if (rateLimitResult && !rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for ${clientIP}`)
      return new Response(
        JSON.stringify({ 
          error: rateLimitResult.message || 'Слишком много попыток. Попробуйте позже',
          rateLimited: true 
        }),
        { 
          status: 429,
          headers: { ...headers, 'Content-Type': 'application/json' }
        }
      )
    }

    // Enhanced password strength validation for signup
    if (action === 'signup' && password) {
      // Minimum length check - increased to 12 characters
      if (password.length < 12) {
        return new Response(
          JSON.stringify({ error: 'Пароль должен содержать минимум 12 символов' }),
          { 
            status: 400,
            headers: { ...headers, 'Content-Type': 'application/json' }
          }
        )
      }

      // Check for comprehensive password complexity
      const hasUpper = /[A-Z]/.test(password)
      const hasLower = /[a-z]/.test(password)
      const hasNumber = /\d/.test(password)
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
      
      if (!hasUpper || !hasLower || !hasNumber) {
        return new Response(
          JSON.stringify({ 
            error: 'Пароль должен содержать заглавные и строчные буквы, а также цифры' 
          }),
          { 
            status: 400,
            headers: { ...headers, 'Content-Type': 'application/json' }
          }
        )
      }

      if (!hasSpecial) {
        return new Response(
          JSON.stringify({ 
            error: 'Пароль должен содержать специальные символы (!@#$%^&* и т.д.)' 
          }),
          { 
            status: 400,
            headers: { ...headers, 'Content-Type': 'application/json' }
          }
        )
      }

      // Block common password patterns
      const commonPatterns = [
        'password', 'пароль', 'welcome', 'добро пожаловать',
        '123456', 'qwerty', 'admin', 'user', 'company', 
        'компания', 'zhos', 'moderator'
      ]
      
      const lowerPassword = password.toLowerCase()
      const hasCommonPattern = commonPatterns.some(pattern => 
        lowerPassword.includes(pattern.toLowerCase())
      )
      
      if (hasCommonPattern) {
        return new Response(
          JSON.stringify({ 
            error: 'Пароль содержит распространенные шаблоны. Используйте более уникальный пароль' 
          }),
          { 
            status: 400,
            headers: { ...headers, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    console.log(`Processing ${action} for ${email} from ${clientIP}`)

    // Perform the actual authentication action
    let result
    let redirectUrl = 'https://pbsdsdexayzfoexjdlgb.supabase.co/'
    
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
          headers: { ...headers, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Auth ${action} successful for ${email}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        data: result.data
      }),
      { 
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' }
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
        headers: { ...headers, 'Content-Type': 'application/json' }
      }
    )
  }
})
