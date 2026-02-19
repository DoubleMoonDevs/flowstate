import { z } from 'zod';

export const financeCreateSchema = z.object({
  amount: z.number(),
  category: z.string().min(1),
  description: z.string().optional(),
  date: z.string()
});

export const financeUpdateSchema = financeCreateSchema.partial();
