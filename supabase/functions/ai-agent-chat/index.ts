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

// OpenAI Chat Completion helper
async function generateChatCompletion(
  messages: Array<{ role: string; content: string }>,
  apiKey: string
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI Chat Completion API error: ${JSON.stringify(errorData)}`);
  }

  const result = await response.json();
  return result.choices[0].message.content;
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
    const { chatId, useRag = true } = await req.json();
    if (!chatId) {
      return new Response(JSON.stringify({ error: 'Missing chatId in request' }), {
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

    // 1. Fetch chat history (last 10 messages)
    const { data: history, error: historyError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', chatId)
      .order('created_at', { ascending: true })
      .limit(10);

    if (historyError) {
      console.error('[ai-agent-chat] Fetch history error:', historyError);
      return new Response(JSON.stringify({ error: 'Failed to fetch chat history' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!history || history.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages in this chat yet' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Identify last message (must be from user)
    const lastUserMessage = history[history.length - 1];
    if (lastUserMessage.role !== 'user') {
      return new Response(JSON.stringify({ error: 'Last message in chat is not from user. Awaiting user input.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let contextText = '';
    const sourcesList: Array<{ name: string; similarity: number }> = [];

    // 2. Perform RAG Search if requested
    if (useRag) {
      console.log(`[ai-agent-chat] Initiating RAG search for query: "${lastUserMessage.content.substring(0, 50)}..."`);
      try {
        const queryEmbedding = await generateEmbedding(lastUserMessage.content, openaiApiKey);
        
        const { data: chunks, error: matchError } = await supabase.rpc('match_document_chunks', {
          query_embedding: queryEmbedding,
          match_threshold: 0.3,
          match_count: 5,
          filter_file_ids: null
        });

        if (matchError) {
          console.error('[ai-agent-chat] match_document_chunks RPC failed:', matchError);
        } else if (chunks && chunks.length > 0) {
          // Fetch file names
          const matchedFileIds = [...new Set(chunks.map((c: any) => c.file_id))];
          const { data: files } = await supabase
            .from('files')
            .select('id, name')
            .in('id', matchedFileIds);

          const filesMap = new Map((files || []).map(f => [f.id, f]));

          const formattedChunks = chunks.map((chunk: any, index: number) => {
            const fileInfo = filesMap.get(chunk.file_id);
            const fileName = fileInfo ? fileInfo.name : 'Unknown File';
            
            // Add to sources citation list
            if (fileInfo && !sourcesList.some(s => s.name === fileInfo.name)) {
              sourcesList.push({ name: fileInfo.name, similarity: chunk.similarity });
            }
            
            return `--- [Source ${index + 1}: ${fileName}] ---\n${chunk.content}`;
          });

          contextText = formattedChunks.join('\n\n');
          console.log(`[ai-agent-chat] Retrieved ${chunks.length} context chunks from ${sourcesList.length} files`);
        }
      } catch (ragError) {
        console.error('[ai-agent-chat] RAG search error:', ragError);
        // Continue without RAG if it fails
      }
    }

    // 3. Formulate prompt payload
    const systemPrompt = `You are a helpful and intelligent AI agent assisting the team in a MicroDAO collaborative workspace.
Provide a clear, helpful, and technically accurate response.

${contextText ? `Use the following pieces of context from the Knowledge Base to help formulate your answer. Do not extrapolate beyond the context if it provides a specific answer. Always cite your sources in your text using brackets like "[Specs.md]" or "[manual_v1.txt]" based on the source headers provided below.

Context:
${contextText}
` : 'No context was found in the knowledge base. Answer to the best of your general knowledge.'}
`;

    // Map conversation history
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
    ];

    // 4. Generate completion
    console.log('[ai-agent-chat] Requesting OpenAI Chat Completion...');
    let assistantReply = await generateChatCompletion(apiMessages, openaiApiKey);

    // Append citation source footer if sources were found
    if (sourcesList.length > 0) {
      const sourcesFooter = `\n\n*(Джерела: ${sourcesList.map(s => s.name).join(', ')})*`;
      assistantReply += sourcesFooter;
    }

    // 5. Insert assistant message
    const { data: assistantMsgRecord, error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id: chatId,
        content: assistantReply,
        role: 'assistant',
        sender_name: 'DAO Agent',
        message_type: 'text',
        parent_id: lastUserMessage.parent_id || null // Maintain thread context if inside a thread
      })
      .select()
      .single();

    if (insertError) {
      console.error('[ai-agent-chat] Database insert failed:', insertError);
      return new Response(JSON.stringify({ error: `Failed to save assistant response: ${insertError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 6. Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);

    console.log('[ai-agent-chat] Successfully generated and stored assistant response');

    return new Response(JSON.stringify({ success: true, message: assistantMsgRecord }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[ai-agent-chat] Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
