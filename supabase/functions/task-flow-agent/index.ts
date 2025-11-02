import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://pbsdsdexayzfoexjdlgb.supabase.co',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TaskCard {
  id: string;
  title: string;
  due_date: string | null;
  column_type: string;
  assignee_id: string | null;
  created_by: string | null;
  project_id: string;
  updated_at: string;
}

serve(async (req) => {
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

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role (only admins can trigger task flow agent)
    const { data: isAdmin } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);

    console.log('Task Flow Agent: Starting scan...');

    let notificationsCreated = 0;

    // 1. Check deadlines (T-24h)
    const { data: dueSoonTasks } = await supabaseClient
      .from('kanban_cards')
      .select('*')
      .lte('due_date', twentyFourHoursFromNow.toISOString())
      .gte('due_date', now.toISOString())
      .neq('column_type', 'done')
      .lt('updated_at', fortyEightHoursAgo.toISOString());

    for (const task of dueSoonTasks || []) {
      // Notify assignee
      if (task.assignee_id) {
        await supabaseClient.rpc('create_task_notification', {
          p_task_id: task.id,
          p_user_id: task.assignee_id,
          p_type: 'deadline_reminder',
          p_message: `Задача "${task.title}" должна быть выполнена в течение 24 часов`,
          p_metadata: { hours_left: 24 },
        });
        notificationsCreated++;
      }

      // Notify creator
      if (task.created_by && task.created_by !== task.assignee_id) {
        await supabaseClient.rpc('create_task_notification', {
          p_task_id: task.id,
          p_user_id: task.created_by,
          p_type: 'deadline_reminder',
          p_message: `Напоминание: задача "${task.title}" скоро должна быть выполнена`,
          p_metadata: { hours_left: 24 },
        });
        notificationsCreated++;
      }
    }

    // 2. Tasks without assignee >24h
    const { data: unassignedTasks } = await supabaseClient
      .from('kanban_cards')
      .select('*')
      .is('assignee_id', null)
      .lt('created_at', twentyFourHoursFromNow.toISOString())
      .neq('column_type', 'done');

    for (const task of unassignedTasks || []) {
      if (task.created_by) {
        await supabaseClient.rpc('create_task_notification', {
          p_task_id: task.id,
          p_user_id: task.created_by,
          p_type: 'no_assignee',
          p_message: `Задача "${task.title}" не назначена более 24 часов`,
          p_metadata: {},
        });
        notificationsCreated++;
      }
    }

    // 3. Tasks "In review" >72h
    const { data: reviewTasks } = await supabaseClient
      .from('kanban_cards')
      .select('*')
      .eq('column_type', 'review')
      .lt('updated_at', seventyTwoHoursAgo.toISOString());

    for (const task of reviewTasks || []) {
      if (task.created_by) {
        await supabaseClient.rpc('create_task_notification', {
          p_task_id: task.id,
          p_user_id: task.created_by,
          p_type: 'needs_review',
          p_message: `Задача "${task.title}" ожидает проверки более 72 часов`,
          p_metadata: {},
        });
        notificationsCreated++;
      }
    }

    // 4. Auto status transitions - overdue tasks
    const { data: overdueTasks } = await supabaseClient
      .from('kanban_cards')
      .select('*')
      .lt('due_date', now.toISOString())
      .neq('column_type', 'done');

    for (const task of overdueTasks || []) {
      // Create overdue notification
      if (task.assignee_id) {
        await supabaseClient.rpc('create_task_notification', {
          p_task_id: task.id,
          p_user_id: task.assignee_id,
          p_type: 'overdue',
          p_message: `Задача "${task.title}" просрочена`,
          p_metadata: {},
        });
        notificationsCreated++;
      }

      // Log event
      await supabaseClient.rpc('log_task_event', {
        p_event_type: 'task_overdue',
        p_task_id: task.id,
        p_project_id: task.project_id,
        p_metadata: { due_date: task.due_date },
      });
    }

    // Log admin action
    await supabaseClient.rpc('enhanced_log_security_event', {
      p_user_id: user.id,
      p_event_type: 'task_flow_agent_executed',
      p_event_data: {
        notifications_created: notificationsCreated,
        timestamp: now.toISOString()
      },
      p_severity: 'info'
    });

    console.log(`Task Flow Agent: Created ${notificationsCreated} notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        notifications_created: notificationsCreated,
        timestamp: now.toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Task Flow Agent error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
