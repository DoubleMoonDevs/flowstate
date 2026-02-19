export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string | null;
  priority: 'low' | 'medium' | 'high';
  category?: string | null;
  status: 'open' | 'in_progress' | 'done';
  due_date?: string | null;
  created_at: string;
  updated_at: string;
  subtasks?: TaskSubtask[];
}

export interface TaskSubtask {
  id: number;
  task_id: number;
  title: string;
  completed: number;
}

export interface Goal {
  id: number;
  user_id: number;
  title: string;
  target_value: number;
  current_value: number;
  unit?: string | null;
  created_at: string;
}

export interface FinanceItem {
  id: number;
  user_id: number;
  amount: number;
  category: string;
  description?: string | null;
  date: string;
  created_at: string;
}

export interface CalendarEvent {
  id: number;
  user_id: number;
  title: string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  all_day: number;
  created_at: string;
}
