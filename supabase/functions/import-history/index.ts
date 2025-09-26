import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TelegramMessage {
  date: string;
  from?: string;
  text: string;
  type: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (file.size > 5_000_000) {
      return new Response(JSON.stringify({ error: 'File too large (max 5MB)' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get current user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const fileContent = await file.text()
    const messages = parseTelegramExport(fileContent, file.name)

    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages found in file' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create new conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        name: `Импорт: ${file.name}`,
        user_id: user.id,
        is_group_chat: true,
        status: 'active'
      })
      .select()
      .single()

    if (convError) {
      console.error('Error creating conversation:', convError)
      return new Response(JSON.stringify({ error: 'Failed to create conversation' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Add user as participant
    await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: conversation.id,
        user_id: user.id,
        role: 'admin'
      })

    // Insert messages in batches
    const batchSize = 50
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize)
      const messagesToInsert = batch.map((msg, index) => ({
        conversation_id: conversation.id,
        content: msg.text,
        role: 'user',
        sender_name: msg.from || 'Импортированный пользователь',
        message_type: 'text',
        created_at: new Date(msg.date).toISOString()
      }))

      const { error: insertError } = await supabase
        .from('messages')
        .insert(messagesToInsert)

      if (insertError) {
        console.error('Error inserting messages batch:', insertError)
        // Continue with next batch even if one fails
      }
    }

    return new Response(JSON.stringify({
      conversationId: conversation.id,
      messagesImported: messages.length
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Import function error:', error)
    return new Response(JSON.stringify({
      error: 'Import failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function parseTelegramExport(content: string, filename: string): TelegramMessage[] {
  const messages: TelegramMessage[] = []

  try {
    // Try to parse as JSON first (Telegram JSON export)
    if (filename.endsWith('.json')) {
      const data = JSON.parse(content)
      if (data.messages && Array.isArray(data.messages)) {
        return data.messages
          .filter((msg: any) => msg.text && typeof msg.text === 'string')
          .map((msg: any) => ({
            date: msg.date,
            from: msg.from || 'Unknown',
            text: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text),
            type: msg.type || 'message'
          }))
      }
    }

    // Try to parse as HTML (Telegram HTML export)
    if (filename.endsWith('.html')) {
      const htmlMessages = parseHTMLMessages(content)
      return htmlMessages
    }

    // Parse as plain text or markdown
    const lines = content.split('\n').filter(line => line.trim())
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line) {
        // Simple text format - each non-empty line is a message
        messages.push({
          date: new Date().toISOString(),
          from: 'Импортированный пользователь',
          text: line,
          type: 'message'
        })
      }
    }

  } catch (error) {
    console.error('Error parsing file content:', error)
    // Fallback: treat as plain text
    const lines = content.split('\n').filter(line => line.trim())
    return lines.map(line => ({
      date: new Date().toISOString(),
      from: 'Импортированный пользователь',
      text: line.trim(),
      type: 'message'
    }))
  }

  return messages
}

function parseHTMLMessages(html: string): TelegramMessage[] {
  const messages: TelegramMessage[] = []
  
  try {
    // Basic HTML parsing for Telegram export format
    // This is a simplified parser - in production, you'd want a more robust HTML parser
    const messageRegex = /<div class="message.*?">.*?<div class="text">(.*?)<\/div>.*?<\/div>/gs
    const matches = html.matchAll(messageRegex)
    
    for (const match of matches) {
      const text = match[1]
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .trim()
      
      if (text) {
        messages.push({
          date: new Date().toISOString(),
          from: 'Импортированный пользователь',
          text,
          type: 'message'
        })
      }
    }
  } catch (error) {
    console.error('Error parsing HTML:', error)
  }
  
  return messages
}