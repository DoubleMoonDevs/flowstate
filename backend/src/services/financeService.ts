import { db } from '../db';
import { FinanceItem } from '../models/types';

export function createFinance(userId: number, data: Partial<FinanceItem> & { amount: number; category: string; date: string }) {
  const stmt = db.prepare(
    `INSERT INTO finance (user_id, amount, category, description, date)
     VALUES (?, ?, ?, ?, ?)`
  );
  const info = stmt.run(
    userId,
    data.amount,
    data.category,
    data.description || null,
    data.date
  );
  return info.lastInsertRowid as number;
}

export function listFinance(userId: number): FinanceItem[] {
  const stmt = db.prepare<FinanceItem>('SELECT * FROM finance WHERE user_id = ? ORDER BY date DESC');
  return stmt.all(userId);
}

export function getFinance(userId: number, financeId: number): FinanceItem | undefined {
  const stmt = db.prepare<FinanceItem>('SELECT * FROM finance WHERE id = ? AND user_id = ?');
  return stmt.get(financeId, userId);
}

export function updateFinance(userId: number, financeId: number, data: Partial<FinanceItem>) {
  const existing = getFinance(userId, financeId);
  if (!existing) return false;
  const stmt = db.prepare(
    `UPDATE finance SET
      amount = ?,
      category = ?,
      description = ?,
      date = ?
     WHERE id = ? AND user_id = ?`
  );
  stmt.run(
    data.amount ?? existing.amount,
    data.category ?? existing.category,
    data.description ?? existing.description,
    data.date ?? existing.date,
    financeId,
    userId
  );
  return true;
}

export function deleteFinance(userId: number, financeId: number) {
  const stmt = db.prepare('DELETE FROM finance WHERE id = ? AND user_id = ?');
  const info = stmt.run(financeId, userId);
  return info.changes > 0;
}
