import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { calendarCreateSchema, calendarUpdateSchema } from '../validation/calendar';
import { createEvent, listEvents, getEvent, updateEvent, deleteEvent } from '../services/calendarService';

export function list(req: AuthRequest, res: Response) {
  const events = listEvents(req.userId as number);
  return res.json(events);
}

export function get(req: AuthRequest, res: Response) {
  const event = getEvent(req.userId as number, Number(req.params.id));
  if (!event) return res.status(404).json({ message: 'Event not found' });
  return res.json(event);
}

export function create(req: AuthRequest, res: Response) {
  const parse = calendarCreateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parse.error.flatten() });
  }
  const id = createEvent(req.userId as number, parse.data);
  const created = getEvent(req.userId as number, id);
  return res.status(201).json(created);
}

export function update(req: AuthRequest, res: Response) {
  const parse = calendarUpdateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parse.error.flatten() });
  }
  const ok = updateEvent(req.userId as number, Number(req.params.id), parse.data);
  if (!ok) return res.status(404).json({ message: 'Event not found' });
  const updated = getEvent(req.userId as number, Number(req.params.id));
  return res.json(updated);
}

export function remove(req: AuthRequest, res: Response) {
  const ok = deleteEvent(req.userId as number, Number(req.params.id));
  if (!ok) return res.status(404).json({ message: 'Event not found' });
  return res.status(204).send();
}
