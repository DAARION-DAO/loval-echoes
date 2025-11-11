import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS
  const corsResult = handleCors(req);
  if (corsResult instanceof Response) {
    return corsResult;
  }
  const { headers } = corsResult;

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

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...headers } }
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    if (req.method === 'GET') {
      if (pathParts.length === 3) {
        // GET /projects - list all projects for user
        console.log('Fetching projects for user:', user.id);
        
        const { data: projects, error } = await supabaseClient
          .from('conversations')
          .select(`
            id,
            name,
            description,
            avatar_url,
            created_at,
            updated_at,
            conversation_participants!inner(
              user_id,
              role,
              profiles(display_name, avatar_url)
            )
          `)
          .eq('type', 'project')
          .eq('conversation_participants.user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error fetching projects:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch projects' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...headers } }
          );
        }

        console.log('Projects fetched:', projects?.length);
        return new Response(
          JSON.stringify({ projects }),
          { headers: { 'Content-Type': 'application/json', ...headers } }
        );
      }
    }

    if (req.method === 'POST') {
      // POST /projects - create new project
      const body = await req.json();
      const { name, description, participants = [] } = body;

      if (!name) {
        return new Response(
          JSON.stringify({ error: 'Project name is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...headers } }
        );
      }

      console.log('Creating project:', { name, description, participants: participants.length });

      // Create the project
      const { data: project, error: projectError } = await supabaseClient
        .from('conversations')
        .insert({
          name,
          description,
          type: 'project',
          is_group_chat: true,
          status: 'active'
        })
        .select()
        .single();

      if (projectError) {
        console.error('Error creating project:', projectError);
        return new Response(
          JSON.stringify({ error: 'Failed to create project' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...headers } }
        );
      }

      // Add creator as admin participant
      const participantsToAdd = [
        { conversation_id: project.id, user_id: user.id, role: 'admin' },
        ...participants.map((userId: string) => ({
          conversation_id: project.id,
          user_id: userId,
          role: 'member'
        }))
      ];

      const { error: participantsError } = await supabaseClient
        .from('conversation_participants')
        .insert(participantsToAdd);

      if (participantsError) {
        console.error('Error adding participants:', participantsError);
        // Clean up project if participants failed
        await supabaseClient.from('conversations').delete().eq('id', project.id);
        return new Response(
          JSON.stringify({ error: 'Failed to add participants' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...headers } }
        );
      }

      console.log('Project created successfully:', project.id);
      return new Response(
        JSON.stringify({ project }),
        { headers: { 'Content-Type': 'application/json', ...headers } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...headers } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...headers } }
    );
  }
});