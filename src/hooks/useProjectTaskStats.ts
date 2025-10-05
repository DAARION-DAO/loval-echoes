import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TaskStats {
  total: number;
  backlog: number;
  todo: number;
  progress: number;
  review: number;
  done: number;
  overdue: number;
}

export function useProjectTaskStats(projectId: string) {
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    backlog: 0,
    todo: 0,
    progress: 0,
    review: 0,
    done: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();

    // Subscribe to changes
    const channel = supabase
      .channel('project-tasks-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kanban_cards',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('kanban_cards')
        .select('column_type, due_date')
        .eq('project_id', projectId);

      if (error) throw error;

      const now = new Date();
      const stats: TaskStats = {
        total: data?.length || 0,
        backlog: 0,
        todo: 0,
        progress: 0,
        review: 0,
        done: 0,
        overdue: 0,
      };

      data?.forEach((task) => {
        stats[task.column_type as keyof Omit<TaskStats, 'total' | 'overdue'>]++;
        
        if (task.due_date && new Date(task.due_date) < now && task.column_type !== 'done') {
          stats.overdue++;
        }
      });

      setStats(stats);
    } catch (error) {
      console.error('Error loading task stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading };
}
