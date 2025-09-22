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

  console.log('Authenticated user for chat creation:', user.id);

  // Create conversation
  console.log('Inserting conversation into database...');
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

  console.log('Conversation created successfully:', newChat);

  // Add user as conversation participant (required for RLS policies)
  console.log('Adding participant to conversation...');
  const { error: participantError } = await supabase
    .from('conversation_participants')
    .insert({
      conversation_id: newChat.id,
      user_id: user.id,
      role: 'owner'
    });

  if (participantError) {
    console.error('Error adding user as participant:', participantError);
    // Try to clean up the conversation if participant insertion failed
    await supabase.from('conversations').delete().eq('id', newChat.id);
    throw new Error(`Failed to create chat: ${participantError.message}`);
  }

  console.log('Created chat with participant:', newChat);

  return {
    id: newChat.id,
    name: newChat.name,
    updatedAt: newChat.updated_at,
    lastMessagePreview: '',
    dify_conversation_id: undefined,
    forked_from_chat: undefined,
  };
}