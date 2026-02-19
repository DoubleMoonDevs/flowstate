import { z } from 'zod';

export const subtaskSchema = z.object({
  title: z.string().min(1),
  completed: z.boolean().optional()
});

export const taskCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.string().optional(),
  status: z.enum(['open', 'in_progress', 'done']).optional(),
  due_date: z.string().optional(),
  subtasks: z.array(subtaskSchema).optional()
});

export const taskUpdateSchema = taskCreateSchema.partial();
