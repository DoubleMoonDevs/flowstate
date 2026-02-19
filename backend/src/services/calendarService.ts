import { db } from '../db';
import { CalendarEvent } from '../models/types';

export function createEvent(userId: number, data: Partial<CalendarEvent> & { title: string; start_date: string }) {
  const stmt = db.prepare(
    `INSERT INTO calendar_events (user_id, title, description, start_date, end_date, all_day)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const info = stmt.run(
    userId,
    data.title,
    data.description || null,
    data.start_date,
    data.end_date || null,
    data.all_day ? 1 : 0
  );
  return info.lastInsertRowid as number;
}

export function listEvents(userId: number): CalendarEvent[] {
  const stmt = db.prepare<CalendarEvent>('SELECT * FROM calendar_events WHERE user_id = ? ORDER BY start_date DESC');
  return stmt.all(userId);
}

export function getEvent(userId: number, eventId: number): CalendarEvent | undefined {
  const stmt = db.prepare<CalendarEvent>('SELECT * FROM calendar_events WHERE id = ? AND user_id = ?');
  return stmt.get(eventId, userId);
}

export function updateEvent(userId: number, eventId: number, data: Partial<CalendarEvent>) {
  const existing = getEvent(userId, eventId);
  if (!existing) return false;
  const stmt = db.prepare(
    `UPDATE calendar_events SET
      title = ?,
      description = ?,
      start_date = ?,
      end_date = ?,
      all_day = ?
     WHERE id = ? AND user_id = ?`
  );
  stmt.run(
    data.title ?? existing.title,
    data.description ?? existing.description,
    data.start_date ?? existing.start_date,
    data.end_date ?? existing.end_date,
    data.all_day !== undefined ? (data.all_day ? 1 : 0) : existing.all_day,
    eventId,
    userId
  );
  return true;
}

export function deleteEvent(userId: number, eventId: number) {
  const stmt = db.prepare('DELETE FROM calendar_events WHERE id = ? AND user_id = ?');
  const info = stmt.run(eventId, userId);
  return info.changes > 0;
}
