import { z } from 'zod';

export const goalCreateSchema = z.object({
  title: z.string().min(1),
  target_value: z.number().positive(),
  current_value: z.number().nonnegative().optional(),
  unit: z.string().optional()
});

export const goalUpdateSchema = goalCreateSchema.partial();
