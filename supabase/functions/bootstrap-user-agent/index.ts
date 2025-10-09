import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentTemplate {
  name: string;
  description: string;
  scopes: string[];
  role: 'assistant' | 'observer';
}

const AGENT_TEMPLATES: Record<string, AgentTemplate> = {
  'Яромир': {
    name: 'Яромир',
    description: 'Агент співдії — контекстні підказки, синхронізація задач',
    scopes: ['read.messages', 'write.messages', 'read.tasks', 'create.tasks'],
    role: 'assistant'
  },
  'Еонарх Синергетон': {
    name: 'Еонарх Синергетон',
    description: 'Агент синергії — аналітика взаємодій, оптимізація процесів',
    scopes: ['read.messages', 'read.tasks', 'create.tasks'],
    role: 'assistant'
  }
};

// User-specific agent assignments
const USER_AGENT_ASSIGNMENTS: Record<string, string> = {
  'belkin.vic.tor.kiev@gmail.com': 'Еонарх Синергетон',
  'max.nebos@gmail.com': 'Яромир'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { userId, userEmail, displayName } = await req.json();

    if (!userId) {
      throw new Error('userId is required');
    }

    console.log(`Bootstrapping agent for user ${userId} (${userEmail})`);

    // Determine which agent template to use
    const templateName = USER_AGENT_ASSIGNMENTS[userEmail] || 'Яромир';
    const template = AGENT_TEMPLATES[templateName];

    console.log(`Assigning agent template: ${templateName}`);

    // 1. Create personal agent
    const { data: agent, error: agentError } = await supabaseClient
      .from('agents')
      .insert({
        name: `${template.name} (особистий)`,
        description: template.description,
        owner_user_id: userId,
        connection_type: 'msp',
        status: 'active',
        is_preset: false
      })
      .select()
      .single();

    if (agentError) {
      console.error('Error creating agent:', agentError);
      throw new Error(`Failed to create agent: ${agentError.message}`);
    }

    console.log('Agent created:', agent.id);

    // 2. Create personal conversation with agent
    const { data: conversation, error: convError } = await supabaseClient
      .from('conversations')
      .insert({
        name: `Особистий чат з ${template.name}`,
        user_id: userId,
        type: 'chat',
        is_group_chat: false,
        status: 'active'
      })
      .select()
      .single();

    if (convError) {
      console.error('Error creating conversation:', convError);
      throw new Error(`Failed to create conversation: ${convError.message}`);
    }

    console.log('Conversation created:', conversation.id);

    // 3. Add user as participant
    const { error: userParticipantError } = await supabaseClient
      .from('conversation_participants')
      .insert({
        conversation_id: conversation.id,
        user_id: userId,
        role: 'member'
      });

    if (userParticipantError) {
      console.error('Error adding user as participant:', userParticipantError);
      throw new Error(`Failed to add user as participant: ${userParticipantError.message}`);
    }

    console.log('User added as participant');

    // 4. Create agent membership in personal chat
    const { error: agentMembershipError } = await supabaseClient
      .from('agent_memberships')
      .insert({
        agent_id: agent.id,
        conversation_id: conversation.id,
        role: template.role,
        scopes: template.scopes,
        active: true
      });

    if (agentMembershipError) {
      console.error('Error creating agent membership:', agentMembershipError);
      throw new Error(`Failed to create agent membership: ${agentMembershipError.message}`);
    }

    console.log('Agent membership created');

    // 5. Create personal_agent_chats record
    const { error: personalChatError } = await supabaseClient
      .from('personal_agent_chats')
      .insert({
        user_id: userId,
        agent_id: agent.id,
        conversation_id: conversation.id
      });

    if (personalChatError) {
      console.error('Error creating personal chat record:', personalChatError);
      throw new Error(`Failed to create personal chat record: ${personalChatError.message}`);
    }

    console.log('Personal agent chat record created');

    // 6. Send welcome message from agent
    const { error: messageError } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        content: `Вітаю! Я ${template.name} — ваш особистий агент. ${template.description}. Готовий допомогти вам у роботі зі спільнотою!`,
        role: 'assistant',
        sender_name: template.name
      });

    if (messageError) {
      console.error('Error sending welcome message:', messageError);
      // Non-critical, continue
    }

    console.log(`Successfully bootstrapped agent for user ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        agent_id: agent.id,
        conversation_id: conversation.id,
        template_name: templateName
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in bootstrap-user-agent:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
