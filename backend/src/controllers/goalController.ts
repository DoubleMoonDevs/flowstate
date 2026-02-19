import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { goalCreateSchema, goalUpdateSchema } from '../validation/goals';
import { createGoal, listGoals, getGoal, updateGoal, deleteGoal } from '../services/goalService';

export function list(req: AuthRequest, res: Response) {
  const goals = listGoals(req.userId as number);
  return res.json(goals);
}

export function get(req: AuthRequest, res: Response) {
  const goal = getGoal(req.userId as number, Number(req.params.id));
  if (!goal) return res.status(404).json({ message: 'Goal not found' });
  return res.json(goal);
}

export function create(req: AuthRequest, res: Response) {
  const parse = goalCreateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parse.error.flatten() });
  }
  const goalId = createGoal(req.userId as number, parse.data);
  const created = getGoal(req.userId as number, goalId);
  return res.status(201).json(created);
}

export function update(req: AuthRequest, res: Response) {
  const parse = goalUpdateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parse.error.flatten() });
  }
  const ok = updateGoal(req.userId as number, Number(req.params.id), parse.data);
  if (!ok) return res.status(404).json({ message: 'Goal not found' });
  const updated = getGoal(req.userId as number, Number(req.params.id));
  return res.json(updated);
}

export function remove(req: AuthRequest, res: Response) {
  const ok = deleteGoal(req.userId as number, Number(req.params.id));
  if (!ok) return res.status(404).json({ message: 'Goal not found' });
  return res.status(204).send();
}
