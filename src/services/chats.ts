import { supabase } from "@/integrations/supabase/client";

export type ChatLite = { 
  id: string; 
  name: string; 
  updatedAt?: string; 
  lastMessagePreview?: string;
  dify_conversation_id?: string;
  forked_from_chat?: string;
};

export async function fetchChats(): Promise<ChatLite[]> {
  console.log('Fetching chats directly from Supabase...');
  
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select('id, name, updated_at, created_at, dify_conversation_id')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching chats:', error);
    throw new Error(`Failed to fetch chats: ${error.message}`);
  }

  console.log('Fetched conversations:', conversations);

  return (conversations || []).map(conv => ({
    id: conv.id,
    name: conv.name,
    updatedAt: conv.updated_at,
    lastMessagePreview: '',
    dify_conversation_id: conv.dify_conversation_id,
    forked_from_chat: undefined,
  }));
}

export async function createChat(name: string): Promise<ChatLite> {
  console.log('Creating chat directly with Supabase...', { name });
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error('Authentication error:', authError);
    throw new Error('You must be logged in to create a chat');
  }

  const { data: newChat, error } = await supabase
    .from('conversations')
    .insert({
      name: name || 'Новый чат',
      user_id: user.id,
    })
    .select('id, name, created_at, updated_at')
    .single();

  if (error) {
    console.error('Error creating chat:', error);
    throw new Error(`Failed to create chat: ${error.message}`);
  }

  console.log('Created chat:', newChat);

  return {
    id: newChat.id,
    name: newChat.name,
    updatedAt: newChat.updated_at,
    lastMessagePreview: '',
    dify_conversation_id: undefined,
    forked_from_chat: undefined,
  };
}