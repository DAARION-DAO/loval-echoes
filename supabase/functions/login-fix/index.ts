import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';

serve(async (req) => {
  const corsResult = handleCors(req);
  if (corsResult instanceof Response) {
    return corsResult;
  }

  return new Response(
    JSON.stringify({
      error: 'Legacy login-fix endpoint is disabled. Use Supabase Auth client flows.',
      code: 'LEGACY_FUNCTION_DISABLED',
    }),
    {
      status: 410,
      headers: { ...corsResult.headers, 'Content-Type': 'application/json' },
    },
  );
});
