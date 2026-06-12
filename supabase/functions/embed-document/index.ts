import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import { handleCors } from '../_shared/cors.ts';

// Text splitter helper
function splitText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    if (end === text.length) break;
    start += (chunkSize - overlap);
  }
  return chunks;
}

// Basic PDF text extraction helper (handles ASCII strings in streams)
function extractTextFromPdf(pdfBytes: Uint8Array): string {
  const decoder = new TextDecoder('utf-8');
  const pdfText = decoder.decode(pdfBytes);
  const chunks: string[] = [];
  
  const tjRegex = /\(([^)]+)\)\s*Tj/g;
  const tj2Regex = /\[([^\]]+)\]\s*TJ/g;
  
  let match;
  while ((match = tjRegex.exec(pdfText)) !== null) {
    chunks.push(match[1]);
  }
  
  while ((match = tj2Regex.exec(pdfText)) !== null) {
    const content = match[1];
    const innerRegex = /\(([^)]+)\)/g;
    let innerMatch;
    while ((innerMatch = innerRegex.exec(content)) !== null) {
      chunks.push(innerMatch[1]);
    }
  }
  
  if (chunks.length === 0) {
    // Fallback: extract sequences of ASCII chars
    const cleanText = pdfText.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    const blocks = cleanText.split(/\s{4,}/);
    return blocks.filter(b => b.trim().length > 10).join('\n');
  }
  
  return chunks.join(' ');
}

// Lovable AI Gateway embedding helper (OpenAI-compatible).
// Uses text-embedding-3-small => 1536 dims to match vector(1536) column.
async function generateEmbedding(textChunk: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'openai/text-embedding-3-small',
      input: textChunk,
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

  // Auth header verification
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { fileId, chunkSize = 1000, chunkOverlap = 200 } = await req.json();
    if (!fileId) {
      return new Response(JSON.stringify({ error: 'Missing fileId in request' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY') ?? '';

    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: 'Missing LOVABLE_API_KEY on server' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Get file details
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError || !file) {
      console.error('[embed-document] File fetch error:', fileError);
      return new Response(JSON.stringify({ error: 'File not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[embed-document] Indexing file: ${file.name} (type: ${file.file_type}, chunkSize: ${chunkSize}, overlap: ${chunkOverlap})`);

    // Update status to indexing
    await supabase
      .from('files')
      .update({ indexing_status: 'indexing' })
      .eq('id', fileId);

    // 2. Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('files')
      .download(file.storage_path);

    if (downloadError || !fileData) {
      console.error('[embed-document] Storage download error:', downloadError);
      await supabase
        .from('files')
        .update({ indexing_status: 'failed' })
        .eq('id', fileId);
      return new Response(JSON.stringify({ error: `Storage download failed: ${downloadError?.message || 'Empty file'}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Extract text content
    let text = "";
    const nameLower = file.name.toLowerCase();
    if (nameLower.endsWith('.txt') || nameLower.endsWith('.md') || file.mime_type?.startsWith('text/')) {
      text = await fileData.text();
    } else if (nameLower.endsWith('.json') || file.mime_type?.includes('json')) {
      const jsonText = await fileData.text();
      try {
        text = JSON.stringify(JSON.parse(jsonText), null, 2);
      } catch {
        text = jsonText;
      }
    } else if (nameLower.endsWith('.csv') || file.mime_type?.includes('csv')) {
      text = await fileData.text();
    } else if (nameLower.endsWith('.pdf') || file.mime_type?.includes('pdf')) {
      const arrayBuffer = await fileData.arrayBuffer();
      text = extractTextFromPdf(new Uint8Array(arrayBuffer));
    } else {
      text = await fileData.text();
    }

    if (!text || text.trim().length === 0) {
      console.warn('[embed-document] No text extracted from file');
      await supabase
        .from('files')
        .update({ indexing_status: 'failed' })
        .eq('id', fileId);
      return new Response(JSON.stringify({ error: 'No readable text content found in file' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Split into chunks
    const chunks = splitText(text, chunkSize, chunkOverlap);
    console.log(`[embed-document] Generated ${chunks.length} chunks for ${file.name}`);

    // Clean up existing chunks for this file if any (re-indexing support)
    await supabase
      .from('document_chunks')
      .delete()
      .eq('file_id', fileId);

    // 5. Generate embeddings and insert chunks
    const chunkInserts = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunkContent = chunks[i];
      try {
        const embedding = await generateEmbedding(chunkContent, lovableApiKey);
        chunkInserts.push({
          file_id: file.id,
          folder_id: file.folder_id,
          user_id: file.uploaded_by,
          content: chunkContent,
          embedding: embedding,
          metadata: {
            file_name: file.name,
            chunk_index: i,
            total_chunks: chunks.length,
            file_size: file.size_bytes
          },
        });
      } catch (embError) {
        console.error(`[embed-document] Embedding generation failed for chunk ${i}:`, embError);
        await supabase
          .from('files')
          .update({ indexing_status: 'failed' })
          .eq('id', fileId);
        return new Response(JSON.stringify({ error: `Embedding error: ${embError instanceof Error ? embError.message : 'Unknown'}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Insert chunks
    if (chunkInserts.length > 0) {
      const { error: insertError } = await supabase
        .from('document_chunks')
        .insert(chunkInserts);
      
      if (insertError) {
        console.error('[embed-document] Chunks insert error:', insertError);
        await supabase
          .from('files')
          .update({ indexing_status: 'failed' })
          .eq('id', fileId);
        return new Response(JSON.stringify({ error: `Database insert failed: ${insertError.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Update status to indexed
    await supabase
      .from('files')
      .update({ indexing_status: 'indexed' })
      .eq('id', fileId);

    console.log(`[embed-document] Successfully indexed file ${file.name}`);

    return new Response(JSON.stringify({ success: true, chunksCount: chunks.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[embed-document] Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
