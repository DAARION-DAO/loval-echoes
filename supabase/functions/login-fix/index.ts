import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCors } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  const corsResult = handleCors(req);
  if (corsResult instanceof Response) {
    return corsResult;
  }
  const { headers } = corsResult;

  try {
    const { email, password } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    console.log(`Login attempt for: ${email}`)

    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    })

    if (error) {
      console.log(`Login error: ${error.message}`)
      
      if (error.message.includes('Email not confirmed')) {
        return new Response(JSON.stringify({ 
          code: 'EMAIL_NOT_CONFIRMED',
          message: 'Email не подтвержден'
        }), { 
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' }
        })
      }
      
      if (error.message.includes('Invalid login credentials')) {
        return new Response(JSON.stringify({ 
          code: 'INVALID_CREDENTIALS',
          message: 'Неверный email или пароль'
        }), { 
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        code: 'AUTH_ERROR',
        message: error.message
      }), { 
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' }
      })
    }

    console.log('Login successful')
    
    return new Response(JSON.stringify({ 
      user: data.user, 
      session: data.session,
      success: true
    }), { 
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Login function error:', error)
    
    return new Response(JSON.stringify({ 
      code: 'SERVER_ERROR',
      message: 'Внутренняя ошибка сервера'
    }), { 
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' }
    })
  })