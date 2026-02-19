import dotenv from 'dotenv';
import Database from 'better-sqlite3';

dotenv.config();

export type Db = Database.Database;

const dbPath = process.env.DATABASE_PATH || './data/lulus.db';

export const db = new Database(dbPath);

db.pragma('foreign_keys = ON');
