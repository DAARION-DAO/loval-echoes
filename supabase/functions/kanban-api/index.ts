import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KanbanCard {
  id?: string;
  project_id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  column_type: 'backlog' | 'todo' | 'progress' | 'review' | 'done';
  position: number;
  due_date?: string;
  created_by?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const cardId = pathParts[pathParts.length - 1];

    switch (req.method) {
      case 'GET': {
        const projectId = url.searchParams.get('project_id');
        if (!projectId) {
          return new Response(
            JSON.stringify({ error: 'project_id is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const { data: cards, error } = await supabaseClient
          .from('kanban_cards')
          .select(`
            *,
            assignee:assignee_id(id, email),
            created_by_profile:created_by(id, email)
          `)
          .eq('project_id', projectId)
          .order('position');

        if (error) {
          console.error('Error fetching kanban cards:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch cards' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({ data: cards }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'POST': {
        const body: Partial<KanbanCard> = await req.json();
        
        if (!body.project_id || !body.title) {
          return new Response(
            JSON.stringify({ error: 'project_id and title are required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // Get next position in column
        const { data: maxPositionCard } = await supabaseClient
          .from('kanban_cards')
          .select('position')
          .eq('project_id', body.project_id)
          .eq('column_type', body.column_type || 'backlog')
          .order('position', { ascending: false })
          .limit(1)
          .maybeSingle();

        const nextPosition = (maxPositionCard?.position || 0) + 1;

        const { data: newCard, error } = await supabaseClient
          .from('kanban_cards')
          .insert({
            ...body,
            position: nextPosition,
            created_by: user.id,
          })
          .select(`
            *,
            assignee:assignee_id(id, email),
            created_by_profile:created_by(id, email)
          `)
          .single();

        if (error) {
          console.error('Error creating kanban card:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to create card' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({ data: newCard }),
          { 
            status: 201, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'PATCH': {
        if (!cardId) {
          return new Response(
            JSON.stringify({ error: 'Card ID is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const body: Partial<KanbanCard> = await req.json();

        // If moving to different column, update position
        if (body.column_type) {
          const { data: maxPositionCard } = await supabaseClient
            .from('kanban_cards')
            .select('position')
            .eq('project_id', body.project_id!)
            .eq('column_type', body.column_type)
            .order('position', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (body.position === undefined) {
            body.position = (maxPositionCard?.position || 0) + 1;
          }
        }

        const { data: updatedCard, error } = await supabaseClient
          .from('kanban_cards')
          .update(body)
          .eq('id', cardId)
          .select(`
            *,
            assignee:assignee_id(id, email),
            created_by_profile:created_by(id, email)
          `)
          .single();

        if (error) {
          console.error('Error updating kanban card:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to update card' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({ data: updatedCard }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'DELETE': {
        if (!cardId) {
          return new Response(
            JSON.stringify({ error: 'Card ID is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const { error } = await supabaseClient
          .from('kanban_cards')
          .delete()
          .eq('id', cardId);

        if (error) {
          console.error('Error deleting kanban card:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to delete card' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            status: 405, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});