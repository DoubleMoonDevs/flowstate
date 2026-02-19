import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { taskCreateSchema, taskUpdateSchema } from '../validation/tasks';
import {
  createTask,
  createSubtask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
  replaceSubtasks
} from '../services/taskService';

export function list(req: AuthRequest, res: Response) {
  const tasks = listTasks(req.userId as number);
  return res.json(tasks);
}

export function get(req: AuthRequest, res: Response) {
  const task = getTask(req.userId as number, Number(req.params.id));
  if (!task) return res.status(404).json({ message: 'Task not found' });
  return res.json(task);
}

export function create(req: AuthRequest, res: Response) {
  const parse = taskCreateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parse.error.flatten() });
  }

  const taskId = createTask(req.userId as number, parse.data);

  if (parse.data.subtasks?.length) {
    for (const sub of parse.data.subtasks) {
      createSubtask(taskId, sub.title, sub.completed);
    }
  }

  const created = getTask(req.userId as number, taskId);
  return res.status(201).json(created);
}

export function update(req: AuthRequest, res: Response) {
  const parse = taskUpdateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parse.error.flatten() });
  }

  const ok = updateTask(req.userId as number, Number(req.params.id), parse.data);
  if (!ok) return res.status(404).json({ message: 'Task not found' });

  if (parse.data.subtasks) {
    replaceSubtasks(Number(req.params.id), parse.data.subtasks);
  }

  const updated = getTask(req.userId as number, Number(req.params.id));
  return res.json(updated);
}

export function remove(req: AuthRequest, res: Response) {
  const ok = deleteTask(req.userId as number, Number(req.params.id));
  if (!ok) return res.status(404).json({ message: 'Task not found' });
  return res.status(204).send();
}
