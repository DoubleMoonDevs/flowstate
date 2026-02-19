import { db } from '../db';
import { User } from '../models/types';

export function createUser(email: string, passwordHash: string) {
  const stmt = db.prepare(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)'
  );
  const info = stmt.run(email, passwordHash);
  return info.lastInsertRowid as number;
}

export function findUserByEmail(email: string): User | undefined {
  const stmt = db.prepare<User>('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
}

export function findUserById(id: number): User | undefined {
  const stmt = db.prepare<User>('SELECT * FROM users WHERE id = ?');
  return stmt.get(id);
}
