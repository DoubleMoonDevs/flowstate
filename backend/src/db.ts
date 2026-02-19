import dotenv from 'dotenv';
import Database from 'better-sqlite3';

dotenv.config();

export type Db = Database.Database;

const dbPath = process.env.DATABASE_PATH || './data/lulus.db';

export const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

const hasUsersTable = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'")
  .get();

if (hasUsersTable) {
  db.prepare(
    `INSERT OR IGNORE INTO users (id, email, password_hash)
     VALUES (1, 'local@flowstate', 'local')`
  ).run();
}