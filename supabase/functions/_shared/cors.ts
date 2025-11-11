// Shared CORS utility for all edge functions
// Замініть на ваші production домени
export const ALLOWED_ORIGINS = [
  'https://pbsdsdexayzfoexjdlgb.supabase.co',
  // Додайте ваш production домен тут:
  // 'https://your-app.com',
  // 'https://www.your-app.com',
];

export const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) 
    ? origin 
    : ALLOWED_ORIGINS[0]; // Fallback to first allowed origin
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };
};

export const handleCors = (req: Request) => {
  const origin = req.headers.get('origin');
  const headers = getCorsHeaders(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
  return { headers, origin };
};

