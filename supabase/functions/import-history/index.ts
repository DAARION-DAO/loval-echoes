import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCors } from '../_shared/cors.ts'

const MAX_FILE_SIZE = 5_000_000; // 5MB

interface TelegramMessage {
  date: string;
  from?: string;
  text: string;
  type: string;
}

serve(async (req) => {
  // Handle CORS
  const corsResult = handleCors(req);
  if (corsResult instanceof Response) {
    return corsResult;
  }
  const { headers } = corsResult;

  try {
    // JWT верифікація
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Відсутній токен авторизації' }),
        { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Створюємо клієнт з ANON_KEY та JWT токеном
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Верифікуємо користувача
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Невірний або прострочений токен' }),
        { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'Файл не надано' }),
        {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' }
        }
      )
    }

    // Валідація розміру файлу
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: `Файл занадто великий (максимум ${MAX_FILE_SIZE / 1_000_000}MB)` }),
        {
          status: 413,
          headers: { ...headers, 'Content-Type': 'application/json' }
        }
      )
    }

    // Валідація типу файлу
    const allowedTypes = ['.json', '.html', '.txt', '.md'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedTypes.includes(fileExtension)) {
      return new Response(
        JSON.stringify({ error: `Тип файлу не підтримується. Дозволені: ${allowedTypes.join(', ')}` }),
        {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' }
        }
      );
    }

    const fileContent = await file.text()
    const messages = parseTelegramExport(fileContent, file.name)

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Повідомлення не знайдено у файлі' }),
        {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' }
        }
      )
    }

    // Валідація кількості повідомлень
    if (messages.length > 10000) {
      return new Response(
        JSON.stringify({ error: 'Занадто багато повідомлень (максимум 10000)' }),
        {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create new conversation (з RLS захистом)
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        name: `Импорт: ${file.name.substring(0, 200)}`, // Обмежуємо довжину назви
        user_id: user.id,
        is_group_chat: true,
        status: 'active'
      })
      .select()
      .single()

    if (convError) {
      console.error('Error creating conversation:', convError)
      return new Response(
        JSON.stringify({ error: 'Не вдалося створити розмову' }),
        {
          status: 500,
          headers: { ...headers, 'Content-Type': 'application/json' }
        }
      )
    }

    // Add user as participant (з RLS захистом)
    await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: conversation.id,
        user_id: user.id,
        role: 'admin'
      })

    // Insert messages in batches (з RLS захистом)
    const batchSize = 50
    let importedCount = 0;
    
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize)
      const messagesToInsert = batch.map((msg) => ({
        conversation_id: conversation.id,
        content: (msg.text || '').substring(0, 10000), // Обмежуємо довжину повідомлення
        role: 'user',
        sender_name: (msg.from || 'Импортированный пользователь').substring(0, 200),
        message_type: 'text',
        created_at: msg.date || new Date().toISOString()
      }))

      const { error: insertError } = await supabase
        .from('messages')
        .insert(messagesToInsert)

      if (insertError) {
        console.error('Error inserting messages batch:', insertError)
        // Continue with next batch even if one fails
      } else {
        importedCount += messagesToInsert.length;
      }
    }

    return new Response(JSON.stringify({
      conversationId: conversation.id,
      messagesImported: importedCount,
      totalMessages: messages.length
    }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Import function error:', error)
    return new Response(JSON.stringify({
      error: 'Помилка імпорту',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' }
    })
  }
})

function parseTelegramExport(content: string, filename: string): TelegramMessage[] {
  const messages: TelegramMessage[] = []

  try {
    // Валідація розміру контенту
    if (content.length > 50_000_000) { // 50MB текст
      throw new Error('Файл занадто великий для обробки');
    }

    // Try to parse as JSON first (Telegram JSON export)
    if (filename.endsWith('.json')) {
      const data = JSON.parse(content)
      if (data.messages && Array.isArray(data.messages)) {
        return data.messages
          .filter((msg: any) => msg.text && typeof msg.text === 'string')
          .slice(0, 10000) // Обмежуємо кількість
          .map((msg: any) => ({
            date: msg.date || new Date().toISOString(),
            from: msg.from || 'Unknown',
            text: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text),
            type: msg.type || 'message'
          }))
      }
    }

    // Try to parse as HTML (Telegram HTML export)
    if (filename.endsWith('.html')) {
      const htmlMessages = parseHTMLMessages(content)
      return htmlMessages.slice(0, 10000); // Обмежуємо кількість
    }

    // Parse as plain text or markdown
    const lines = content.split('\n').filter(line => line.trim())
    for (let i = 0; i < Math.min(lines.length, 10000); i++) {
      const line = lines[i].trim()
      if (line) {
        messages.push({
          date: new Date().toISOString(),
          from: 'Импортированный пользователь',
          text: line.substring(0, 10000), // Обмежуємо довжину
          type: 'message'
        })
      }
    }

  } catch (error) {
    console.error('Error parsing file content:', error)
    // Fallback: treat as plain text
    const lines = content.split('\n').filter(line => line.trim())
    return lines.slice(0, 10000).map(line => ({
      date: new Date().toISOString(),
      from: 'Импортированный пользователь',
      text: line.trim().substring(0, 10000),
      type: 'message'
    }))
  }

  return messages
}

function parseHTMLMessages(html: string): TelegramMessage[] {
  const messages: TelegramMessage[] = []
  
  try {
    // Basic HTML parsing for Telegram export format
    const messageRegex = /<div class="message.*?">.*?<div class="text">(.*?)<\/div>.*?<\/div>/gs
    const matches = html.matchAll(messageRegex)
    
    let count = 0;
    for (const match of matches) {
      if (count >= 10000) break; // Обмежуємо кількість
      
      const text = match[1]
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .trim()
        .substring(0, 10000); // Обмежуємо довжину
      
      if (text) {
        messages.push({
          date: new Date().toISOString(),
          from: 'Импортированный пользователь',
          text,
          type: 'message'
        })
        count++;
      }
    }
  } catch (error) {
    console.error('Error parsing HTML:', error)
  }
  
  return messages
}
