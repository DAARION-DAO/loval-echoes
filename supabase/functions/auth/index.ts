import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-refresh-token',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;

    if (pathname.endsWith('/login')) {
      return await handleLogin(req, supabase);
    } else if (pathname.endsWith('/refresh')) {
      return await handleRefresh(req, supabase);
    } else if (pathname.endsWith('/logout')) {
      return await handleLogout(req, supabase);
    } else if (pathname.endsWith('/me')) {
      return await handleMe(req, supabase);
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), { 
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Auth function error:', error);
    return new Response(JSON.stringify({ 
      code: 'SERVER_ERROR',
      message: 'Внутренняя ошибка сервера'
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleLogin(req: Request, supabase: any) {
  const { email, password, remember = false } = await req.json();
  
  if (!email || !password) {
    return new Response(JSON.stringify({ 
      code: 'MISSING_FIELDS',
      message: 'Email и пароль обязательны'
    }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Authenticate user
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.log(`Login error: ${error.message}`);
    
    if (error.message.includes('Email not confirmed')) {
      return new Response(JSON.stringify({ 
        code: 'EMAIL_NOT_CONFIRMED',
        message: 'Email не подтвержден'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      code: 'INVALID_CREDENTIALS',
      message: 'Неверные данные для входа'
    }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (!data.session) {
    return new Response(JSON.stringify({ 
      code: 'NO_SESSION',
      message: 'Не удалось создать сессию'
    }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Generate custom refresh token
  const refreshToken = crypto.randomUUID();
  const tokenHash = await hashToken(refreshToken);
  
  // Set expiry based on remember preference
  const expiryDays = remember ? 30 : 1;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  // Get client info
  const userAgent = req.headers.get('user-agent') || 'Unknown';
  const xForwardedFor = req.headers.get('x-forwarded-for');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  const ipAddress = cfConnectingIp || xForwardedFor?.split(',')[0] || 'Unknown';

  // Store refresh token
  const { error: insertError } = await supabase
    .from('refresh_tokens')
    .insert({
      user_id: data.user.id,
      token_hash: tokenHash,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt.toISOString(),
      last_used_at: new Date().toISOString()
    });

  if (insertError) {
    console.error('Failed to store refresh token:', insertError);
    // Continue anyway, user can still use the session
  }

  // Set refresh token cookie
  const cookieOptions = [
    `refresh_token=${refreshToken}`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Path=/`,
    `Max-Age=${expiryDays * 24 * 60 * 60}`,
    ...(Deno.env.get('ENVIRONMENT') === 'production' ? ['Secure'] : [])
  ].join('; ');

  return new Response(JSON.stringify({ 
    success: true,
    user: data.user,
    session: {
      access_token: data.session.access_token,
      expires_at: data.session.expires_at,
    }
  }), { 
    status: 200,
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json',
      'Set-Cookie': cookieOptions
    }
  });
}

async function handleRefresh(req: Request, supabase: any) {
  // Get refresh token from cookie or header
  const cookieHeader = req.headers.get('cookie');
  const refreshTokenFromCookie = cookieHeader
    ?.split(';')
    ?.find(c => c.trim().startsWith('refresh_token='))
    ?.split('=')[1];
  
  const refreshTokenFromHeader = req.headers.get('x-refresh-token');
  const refreshToken = refreshTokenFromCookie || refreshTokenFromHeader;

  if (!refreshToken) {
    return new Response(JSON.stringify({ 
      code: 'MISSING_REFRESH_TOKEN',
      message: 'Refresh token не предоставлен'
    }), { 
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const tokenHash = await hashToken(refreshToken);

  // Validate refresh token
  const { data: tokenData, error: tokenError } = await supabase
    .from('refresh_tokens')
    .select('*')
    .eq('token_hash', tokenHash)
    .is('revoked_at', null)
    .single();

  if (tokenError || !tokenData) {
    console.log('Invalid refresh token');
    return new Response(JSON.stringify({ 
      code: 'INVALID_REFRESH_TOKEN',
      message: 'Недействительный refresh token'
    }), { 
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Check if token expired
  if (new Date(tokenData.expires_at) < new Date()) {
    console.log('Refresh token expired');
    return new Response(JSON.stringify({ 
      code: 'TOKEN_EXPIRED',
      message: 'Refresh token истёк'
    }), { 
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Generate new session for user
  const { data: adminAuthResult, error: adminAuthError } = await supabase.auth.admin.generateAccessToken(tokenData.user_id);
  
  if (adminAuthError || !adminAuthResult) {
    console.error('Failed to generate new access token:', adminAuthError);
    return new Response(JSON.stringify({ 
      code: 'TOKEN_GENERATION_FAILED',
      message: 'Не удалось обновить токен'
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Generate new refresh token for rotation
  const newRefreshToken = crypto.randomUUID();
  const newTokenHash = await hashToken(newRefreshToken);
  
  // Update refresh token (rotation)
  const { error: updateError } = await supabase
    .from('refresh_tokens')
    .update({
      token_hash: newTokenHash,
      last_used_at: new Date().toISOString()
    })
    .eq('id', tokenData.id);

  if (updateError) {
    console.error('Failed to update refresh token:', updateError);
    // Continue anyway
  }

  // Calculate remaining expiry time
  const expiresAt = new Date(tokenData.expires_at);
  const now = new Date();
  const remainingSeconds = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);

  // Set new refresh token cookie
  const cookieOptions = [
    `refresh_token=${newRefreshToken}`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Path=/`,
    `Max-Age=${remainingSeconds}`,
    ...(Deno.env.get('ENVIRONMENT') === 'production' ? ['Secure'] : [])
  ].join('; ');

  return new Response(JSON.stringify({ 
    success: true,
    access_token: adminAuthResult.access_token,
    expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
  }), { 
    status: 200,
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json',
      'Set-Cookie': cookieOptions
    }
  });
}

async function handleLogout(req: Request, supabase: any) {
  // Get refresh token from cookie or header
  const cookieHeader = req.headers.get('cookie');
  const refreshTokenFromCookie = cookieHeader
    ?.split(';')
    ?.find(c => c.trim().startsWith('refresh_token='))
    ?.split('=')[1];
  
  const refreshTokenFromHeader = req.headers.get('x-refresh-token');
  const refreshToken = refreshTokenFromCookie || refreshTokenFromHeader;

  if (refreshToken) {
    const tokenHash = await hashToken(refreshToken);
    
    // Revoke refresh token
    await supabase
      .from('refresh_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('token_hash', tokenHash);
  }

  // Clear refresh token cookie
  const cookieOptions = [
    `refresh_token=`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Path=/`,
    `Max-Age=0`
  ].join('; ');

  return new Response(JSON.stringify({ 
    success: true,
    message: 'Вы вышли из системы'
  }), { 
    status: 200,
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json',
      'Set-Cookie': cookieOptions
    }
  });
}

async function handleMe(req: Request, supabase: any) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ 
      code: 'MISSING_AUTH',
      message: 'Отсутствует токен авторизации'
    }), { 
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const token = authHeader.replace('Bearer ', '');
  
  // Verify the token
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data.user) {
    return new Response(JSON.stringify({ 
      code: 'INVALID_TOKEN',
      message: 'Недействительный токен'
    }), { 
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', data.user.id)
    .single();

  return new Response(JSON.stringify({ 
    success: true,
    user: data.user,
    profile: profile
  }), { 
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}