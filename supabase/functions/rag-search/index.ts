import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import { handleCors } from '../_shared/cors.ts';

// OpenAI embedding generator helper
async function generateEmbedding(queryText: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: queryText,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
  }

  const result = await response.json();
  return result.data[0].embedding;
}

serve(async (req) => {
  const corsResult = handleCors(req);
  if (corsResult instanceof Response) {
    return corsResult;
  }
  const corsHeaders = corsResult.headers;

  // Verify method is POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Auth header verification
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { query, fileIds, matchCount = 5, matchThreshold = 0.3 } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing query in request' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') ?? '';

    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'Missing OPENAI_API_KEY on server' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create client
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Generate embedding for query
    console.log(`[rag-search] Generating embedding for query: "${query.substring(0, 50)}..."`);
    const queryEmbedding = await generateEmbedding(query, openaiApiKey);

    // 2. Query database for similar chunks
    console.log(`[rag-search] Searching similar chunks (threshold: ${matchThreshold}, count: ${matchCount}, filter_file_ids: ${fileIds || 'all'})`);
    const { data: chunks, error: matchError } = await supabase.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      filter_file_ids: fileIds || null
    });

    if (matchError) {
      console.error('[rag-search] Database RPC match_document_chunks failed:', matchError);
      return new Response(JSON.stringify({ error: `Database search failed: ${matchError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[rag-search] Found ${chunks?.length || 0} matching chunks`);

    // 3. Fetch file names for the matching chunks to return rich sources metadata
    const responseData = [];
    if (chunks && chunks.length > 0) {
      // Get unique file IDs from matches
      const matchedFileIds = [...new Set(chunks.map((c: any) => c.file_id))];
      
      const { data: files } = await supabase
        .from('files')
        .select('id, name, storage_path')
        .in('id', matchedFileIds);

      const filesMap = new Map((files || []).map(f => [f.id, f]));

      for (const chunk of chunks) {
        const fileInfo = filesMap.get(chunk.file_id);
        responseData.push({
          id: chunk.id,
          content: chunk.content,
          similarity: chunk.similarity,
          file: fileInfo ? {
            id: fileInfo.id,
            name: fileInfo.name,
            storage_path: fileInfo.storage_path
          } : null,
          metadata: chunk.metadata
        });
      }
    }

    return new Response(JSON.stringify({ success: true, results: responseData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[rag-search] Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
