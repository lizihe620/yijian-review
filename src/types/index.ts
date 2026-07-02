export interface Subject {
  id: string;
  user_id: string;
  name: string;
  short_name: string;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface Phase {
  id: string;
  user_id: string;
  name: string;
  start_date: string;
  end_date: string;
  sort_order: number;
  description: string;
}

export interface DailyTask {
  id: string;
  user_id: string;
  date: string;
  subject_id: string;
  phase_id: string;
  task_content: string;
  estimated_minutes: number;
  sort_order: number;
  is_completed: boolean;
  completed_at: string | null;
  actual_minutes: number | null;
  correct_rate: number | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  subjects?: Subject;
  phases?: Phase;
}

export interface DailyNote {
  id: string;
  user_id: string;
  date: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface DailyStats {
  date: string;
  total_estimated_minutes: number;
  total_actual_minutes: number;
  tasks_completed: number;
  tasks_total: number;
  completion_rate: number;
  avg_correct_rate: number | null;
}

export interface SubjectStats {
  subject_id: string;
  subject_name: string;
  subject_color: string;
  tasks_completed: number;
  tasks_total: number;
  completion_rate: number;
  avg_correct_rate: number | null;
  total_actual_minutes: number;
}
