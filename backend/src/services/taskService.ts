import { db } from '../db';
import { Task, TaskSubtask } from '../models/types';

export function createTask(userId: number, data: Partial<Task> & { title: string }) {
  const stmt = db.prepare(
    `INSERT INTO tasks (user_id, title, description, priority, category, status, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const info = stmt.run(
    userId,
    data.title,
    data.description || null,
    data.priority || 'medium',
    data.category || null,
    data.status || 'open',
    data.due_date || null
  );
  return info.lastInsertRowid as number;
}

export function createSubtask(taskId: number, title: string, completed = false) {
  const stmt = db.prepare('INSERT INTO task_subtasks (task_id, title, completed) VALUES (?, ?, ?)');
  const info = stmt.run(taskId, title, completed ? 1 : 0);
  return info.lastInsertRowid as number;
}

export function listTasks(userId: number): Task[] {
  const stmt = db.prepare<Task>('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC');
  const tasks = stmt.all(userId);
  return tasks.map((task) => ({
    ...task,
    subtasks: listSubtasks(task.id)
  }));
}

export function getTask(userId: number, taskId: number): Task | undefined {
  const stmt = db.prepare<Task>('SELECT * FROM tasks WHERE id = ? AND user_id = ?');
  const task = stmt.get(taskId, userId);
  if (!task) return undefined;
  return { ...task, subtasks: listSubtasks(task.id) };
}

export function listSubtasks(taskId: number): TaskSubtask[] {
  const stmt = db.prepare<TaskSubtask>('SELECT * FROM task_subtasks WHERE task_id = ?');
  return stmt.all(taskId);
}

export function updateTask(userId: number, taskId: number, data: Partial<Task>) {
  const existing = getTask(userId, taskId);
  if (!existing) return false;

  const stmt = db.prepare(
    `UPDATE tasks SET
      title = ?,
      description = ?,
      priority = ?,
      category = ?,
      status = ?,
      due_date = ?,
      updated_at = datetime('now')
     WHERE id = ? AND user_id = ?`
  );

  stmt.run(
    data.title ?? existing.title,
    data.description ?? existing.description,
    data.priority ?? existing.priority,
    data.category ?? existing.category,
    data.status ?? existing.status,
    data.due_date ?? existing.due_date,
    taskId,
    userId
  );

  return true;
}

export function deleteTask(userId: number, taskId: number) {
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?');
  const info = stmt.run(taskId, userId);
  return info.changes > 0;
}

export function replaceSubtasks(taskId: number, subtasks: { title: string; completed?: boolean }[]) {
  const del = db.prepare('DELETE FROM task_subtasks WHERE task_id = ?');
  del.run(taskId);
  const insert = db.prepare('INSERT INTO task_subtasks (task_id, title, completed) VALUES (?, ?, ?)');
  const tx = db.transaction(() => {
    for (const sub of subtasks) {
      insert.run(taskId, sub.title, sub.completed ? 1 : 0);
    }
  });
  tx();
}
