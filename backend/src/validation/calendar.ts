import { z } from 'zod';

export const calendarCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  start_date: z.string().min(1),
  end_date: z.string().optional(),
  all_day: z.boolean().optional()
});

export const calendarUpdateSchema = calendarCreateSchema.partial();
