import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCors } from '../_shared/cors.ts';

const jsonResponse = (body: Record<string, unknown>, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

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

    if (req.method === 'GET') {
      // GET /projects-api - list all projects where the current user is a participant.
      console.log('Fetching projects for user:', user.id);

      const { data: ownParticipants, error: participantLookupError } = await supabaseClient
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (participantLookupError) {
        console.error('Error fetching user project memberships:', participantLookupError);
        return jsonResponse(
          {
            error: 'Failed to fetch projects',
            details: participantLookupError.message,
          },
          500,
          headers,
        );
      }

      const projectIds = [...new Set((ownParticipants ?? []).map((row: any) => row.conversation_id))];
      if (projectIds.length === 0) {
        return jsonResponse({ projects: [] }, 200, headers);
      }

      const { data: projects, error } = await supabaseClient
        .from('conversations')
        .select('id, name, description, avatar_url, created_at, updated_at')
        .in('id', projectIds)
        .eq('type', 'project')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        return jsonResponse(
          {
            error: 'Failed to fetch projects',
            details: error.message,
          },
          500,
          headers,
        );
      }

      const visibleProjectIds = (projects ?? []).map((project: any) => project.id);
      const { data: participants, error: participantsError } = visibleProjectIds.length > 0
        ? await supabaseClient
          .from('conversation_participants')
          .select('conversation_id, user_id, role')
          .in('conversation_id', visibleProjectIds)
        : { data: [], error: null };

      if (participantsError) {
        console.error('Error fetching project participants:', participantsError);
      }

      const userIds = [...new Set((participants ?? []).map((row: any) => row.user_id).filter(Boolean))];
      const { data: profiles, error: profilesError } = userIds.length > 0
        ? await supabaseClient.rpc('get_public_profiles', { p_user_ids: userIds })
        : { data: [], error: null };

      if (profilesError) {
        console.error('Error fetching public profiles:', profilesError);
      }

      const profileByUserId = new Map(
        (profiles ?? []).map((profile: any) => [
          profile.user_id,
          {
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
          },
        ]),
      );

      const participantsByProjectId = new Map<string, any[]>();
      for (const participant of participants ?? []) {
        const list = participantsByProjectId.get(participant.conversation_id) ?? [];
        list.push({
          user_id: participant.user_id,
          role: participant.role,
          profiles: profileByUserId.get(participant.user_id) ?? {
            display_name: 'Member',
            avatar_url: null,
          },
        });
        participantsByProjectId.set(participant.conversation_id, list);
      }

      const enrichedProjects = (projects ?? []).map((project: any) => ({
        ...project,
        conversation_participants: participantsByProjectId.get(project.id) ?? [],
      }));

      console.log('Projects fetched:', enrichedProjects.length);
      return jsonResponse({ projects: enrichedProjects }, 200, headers);
    }

    if (req.method === 'POST') {
      // POST /projects - create new project
      const body = await req.json();
      const { name, description, participants = [] } = body;
      const requestedParticipants = Array.isArray(participants) ? participants : [];

      if (!name) {
        return jsonResponse({ error: 'Project name is required' }, 400, headers);
      }

      console.log('Creating project:', { name, description, participants: requestedParticipants.length });

      // Create the project
      const { data: project, error: projectError } = await supabaseClient
        .from('conversations')
        .insert({
          name,
          description: description || null,
          type: 'project',
          is_group_chat: true,
          status: 'active',
          user_id: user.id,
          created_by: user.id,
        })
        .select()
        .single();

      if (projectError) {
        console.error('Error creating project:', projectError);
        return jsonResponse(
          {
            error: 'Failed to create project',
            details: projectError.message,
          },
          500,
          headers,
        );
      }

      // Add creator as admin participant
      const participantUserIds = [...new Set([user.id, ...requestedParticipants])];
      const participantsToAdd = participantUserIds.map((userId: string) => ({
        conversation_id: project.id,
        user_id: userId,
        role: userId === user.id ? 'admin' : 'member',
      }));

      const { error: participantsError } = await supabaseClient
        .from('conversation_participants')
        .insert(participantsToAdd);

      if (participantsError) {
        console.error('Error adding participants:', participantsError);
        // Clean up project if participants failed
        await supabaseClient.from('conversations').delete().eq('id', project.id);
        return jsonResponse(
          {
            error: 'Failed to add participants',
            details: participantsError.message,
          },
          500,
          headers,
        );
      }

      console.log('Project created successfully:', project.id);
      return jsonResponse({ project }, 201, headers);
    }

    return jsonResponse({ error: 'Method not allowed' }, 405, headers);

  } catch (error) {
    console.error('Unexpected error:', error);
    return jsonResponse(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
      headers,
    );
  }
});
