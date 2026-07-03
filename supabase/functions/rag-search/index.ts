import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors } from '../_shared/cors.ts';
import {
  createServiceClient,
  jsonResponse,
  requireAuthenticatedUser,
  resolveAccessibleKnowledgeFileIds,
} from '../_shared/auth.ts';

type MatchedChunk = {
  id: string;
  file_id: string;
  content: string;
  metadata?: unknown;
  similarity: number;
};

type SourceFile = {
  id: string;
  name: string;
  storage_path: string;
};

// Lovable AI Gateway embedding helper (OpenAI-compatible).
async function generateEmbedding(queryText: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'openai/text-embedding-3-small',
      input: queryText,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Lovable AI embeddings error (${response.status}): ${JSON.stringify(errorData)}`);
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

  const auth = await requireAuthenticatedUser(req, corsHeaders);
  if (auth instanceof Response) {
    return auth;
  }

  try {
    const { query, fileIds, matchCount = 5, matchThreshold = 0.3 } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing query in request' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY') ?? '';

    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: 'Missing LOVABLE_API_KEY on server' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestedFileIds = Array.isArray(fileIds)
      ? fileIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
      : null;

    const accessibleFileIds = await resolveAccessibleKnowledgeFileIds(
      auth.userClient,
      requestedFileIds,
      corsHeaders,
    );
    if (accessibleFileIds instanceof Response) {
      return accessibleFileIds;
    }

    if (accessibleFileIds.length === 0) {
      return jsonResponse({ success: true, results: [] }, 200, corsHeaders);
    }

    const supabase = createServiceClient(corsHeaders);
    if (supabase instanceof Response) {
      return supabase;
    }

    // 1. Generate embedding for query
    console.log(`[rag-search] Generating embedding for query: "${query.substring(0, 50)}..."`);
    const queryEmbedding = await generateEmbedding(query, lovableApiKey);

    // 2. Query database for similar chunks
    console.log(`[rag-search] Searching similar chunks (threshold: ${matchThreshold}, count: ${matchCount}, authorized_file_count: ${accessibleFileIds.length})`);
    const { data: chunks, error: matchError } = await supabase.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      filter_file_ids: accessibleFileIds
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
      const matchedChunks = chunks as MatchedChunk[];
      // Get unique file IDs from matches
      const matchedFileIds = [...new Set(matchedChunks.map((chunk) => chunk.file_id))];
      
      const { data: files } = await supabase
        .from('files')
        .select('id, name, storage_path')
        .in('id', matchedFileIds);

      const sourceFiles = (files ?? []) as SourceFile[];
      const filesMap = new Map(sourceFiles.map((file) => [file.id, file]));

      for (const chunk of matchedChunks) {
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
