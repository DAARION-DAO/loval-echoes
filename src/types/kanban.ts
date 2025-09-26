export interface KanbanCard {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  column_type: 'backlog' | 'todo' | 'progress' | 'review' | 'done';
  position: number;
  due_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  assignee?: {
    id: string;
    email: string;
  };
  created_by_profile?: {
    id: string;
    email: string;
  };
}