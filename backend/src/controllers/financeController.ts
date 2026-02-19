import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { financeCreateSchema, financeUpdateSchema } from '../validation/finance';
import { createFinance, listFinance, getFinance, updateFinance, deleteFinance } from '../services/financeService';

export function list(req: AuthRequest, res: Response) {
  const items = listFinance(req.userId as number);
  return res.json(items);
}

export function get(req: AuthRequest, res: Response) {
  const item = getFinance(req.userId as number, Number(req.params.id));
  if (!item) return res.status(404).json({ message: 'Finance item not found' });
  return res.json(item);
}

export function create(req: AuthRequest, res: Response) {
  const parse = financeCreateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parse.error.flatten() });
  }
  const id = createFinance(req.userId as number, parse.data);
  const created = getFinance(req.userId as number, id);
  return res.status(201).json(created);
}

export function update(req: AuthRequest, res: Response) {
  const parse = financeUpdateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parse.error.flatten() });
  }
  const ok = updateFinance(req.userId as number, Number(req.params.id), parse.data);
  if (!ok) return res.status(404).json({ message: 'Finance item not found' });
  const updated = getFinance(req.userId as number, Number(req.params.id));
  return res.json(updated);
}

export function remove(req: AuthRequest, res: Response) {
  const ok = deleteFinance(req.userId as number, Number(req.params.id));
  if (!ok) return res.status(404).json({ message: 'Finance item not found' });
  return res.status(204).send();
}
