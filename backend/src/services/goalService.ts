import { db } from '../db';
import { Goal } from '../models/types';

export function createGoal(userId: number, data: Partial<Goal> & { title: string; target_value: number }) {
  const stmt = db.prepare(
    `INSERT INTO goals (user_id, title, target_value, current_value, unit)
     VALUES (?, ?, ?, ?, ?)`
  );
  const info = stmt.run(
    userId,
    data.title,
    data.target_value,
    data.current_value ?? 0,
    data.unit || null
  );
  return info.lastInsertRowid as number;
}

export function listGoals(userId: number): Goal[] {
  const stmt = db.prepare<Goal>('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId);
}

export function getGoal(userId: number, goalId: number): Goal | undefined {
  const stmt = db.prepare<Goal>('SELECT * FROM goals WHERE id = ? AND user_id = ?');
  return stmt.get(goalId, userId);
}

export function updateGoal(userId: number, goalId: number, data: Partial<Goal>) {
  const existing = getGoal(userId, goalId);
  if (!existing) return false;
  const stmt = db.prepare(
    `UPDATE goals SET
      title = ?,
      target_value = ?,
      current_value = ?,
      unit = ?
     WHERE id = ? AND user_id = ?`
  );
  stmt.run(
    data.title ?? existing.title,
    data.target_value ?? existing.target_value,
    data.current_value ?? existing.current_value,
    data.unit ?? existing.unit,
    goalId,
    userId
  );
  return true;
}

export function deleteGoal(userId: number, goalId: number) {
  const stmt = db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?');
  const info = stmt.run(goalId, userId);
  return info.changes > 0;
}
