export interface Subtask {
  id?: number;
  title: string;
  completed?: boolean;
}

export interface Task {
  id?: number;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  status?: 'open' | 'in_progress' | 'done';
  due_date?: string;
  subtasks?: Subtask[];
  created_at?: string;
}

export interface Goal {
  id?: number;
  title: string;
  target_value: number;
  current_value?: number;
  unit?: string;
}

export interface FinanceItem {
  id?: number;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

export interface CalendarEvent {
  id?: number;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  all_day?: boolean;
}

export interface ReportPoint {
  label: string;
  value: number;
}
