import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useTaskTelemetry() {
  const { user } = useAuth();

  const logEvent = async (
    eventType: string,
    taskId?: string,
    projectId?: string,
    metadata: Record<string, any> = {}
  ) => {
    try {
      await supabase.rpc('log_task_event', {
        p_event_type: eventType,
        p_user_id: user?.id || null,
        p_task_id: taskId || null,
        p_project_id: projectId || null,
        p_metadata: metadata,
      });
    } catch (error) {
      console.error('Error logging telemetry event:', error);
    }
  };

  return { logEvent };
}