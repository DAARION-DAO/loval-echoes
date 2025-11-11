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
    const refreshToken = req.headers.get('x-refresh-token');
    
    if (!refreshToken) {
      return new Response(JSON.stringify({ 
        code: 'MISSING_REFRESH_TOKEN',
        message: 'Refresh token not provided'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    console.log('Attempting to refresh session...');

    const { data, error } = await supabase.auth.refreshSession({ 
      refresh_token: refreshToken 
    });

    if (error) {
      console.log(`Refresh error: ${error.message}`);
      
      return new Response(JSON.stringify({ 
        code: 'SESSION_EXPIRED',
        message: 'Сессия истекла, необходимо войти заново'
      }), { 
        status: 401,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    console.log('Session refreshed successfully');
    
    return new Response(JSON.stringify({ 
      session: data.session,
      success: true
    }), { 
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Refresh function error:', error);
    
    return new Response(JSON.stringify({ 
      code: 'SERVER_ERROR',
      message: 'Внутренняя ошибка сервера'
    }), { 
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }
})